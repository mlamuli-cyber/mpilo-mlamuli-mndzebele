const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAdmin, requireStaff } = require('../middleware/auth');
const { withFormatted, timeAgo } = require('../lib/format');

const router = express.Router();

const ROLES = ['admin', 'technician', 'user', 'client'];
const MIN_PASSWORD_LENGTH = 6;
const PRIORITY_ORDER = ['Urgent', 'High', 'Medium', 'Low'];

function listUsers() {
  return db
    .prepare(
      `SELECT users.*, departments.name AS department_name
       FROM users
       LEFT JOIN departments ON departments.id = users.department_id
       ORDER BY CASE users.role WHEN 'admin' THEN 0 WHEN 'technician' THEN 1 WHEN 'user' THEN 2 ELSE 3 END, users.full_name`
    )
    .all();
}

function orderedDepartments() {
  return db
    .prepare(`SELECT * FROM departments ORDER BY CASE WHEN name = 'IT Department' THEN 0 ELSE 1 END, name`)
    .all();
}

function listDepartmentsWithCounts() {
  return db
    .prepare(
      `SELECT departments.*,
         (SELECT COUNT(*) FROM users WHERE users.department_id = departments.id) AS user_count,
         (SELECT COUNT(*) FROM tickets WHERE tickets.department_id = departments.id) AS ticket_count,
         (SELECT COUNT(*) FROM users WHERE users.department_id = departments.id AND users.role = 'technician') AS technician_count
       FROM departments
       ORDER BY CASE WHEN departments.name = 'IT Department' THEN 0 ELSE 1 END, departments.name`
    )
    .all();
}

// ----- Staff overview & ticket oversight (admin + technician) -----

router.get('/admin', requireStaff, (req, res) => {
  const counts = db
    .prepare(
      `SELECT
         SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open,
         SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
         SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) AS done,
         COUNT(*) AS total
       FROM tickets`
    )
    .get();

  const unassignedCount = db
    .prepare(`SELECT COUNT(*) AS c FROM tickets WHERE assigned_to IS NULL AND status != 'Done'`)
    .get().c;

  const myOpenCount = db
    .prepare(`SELECT COUNT(*) AS c FROM tickets WHERE assigned_to = ? AND status != 'Done'`)
    .get(req.session.user.id).c;

  const departmentCount = db.prepare('SELECT COUNT(*) AS c FROM departments').get().c;
  const userCount = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE role IN ('user', 'client')`).get().c;
  const technicianCount = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE role = 'technician'`).get().c;

  const priorityRows = db
    .prepare(`SELECT priority, COUNT(*) AS c FROM tickets WHERE status != 'Done' GROUP BY priority`)
    .all();
  const priorityBreakdown = PRIORITY_ORDER.map((p) => ({
    priority: p,
    count: priorityRows.find((r) => r.priority === p)?.c || 0,
  }));
  const priorityMax = Math.max(1, ...priorityBreakdown.map((p) => p.count));

  const departmentBreakdown = db
    .prepare(
      `SELECT departments.name, COUNT(tickets.id) AS c
       FROM departments
       LEFT JOIN tickets ON tickets.department_id = departments.id AND tickets.status != 'Done'
       GROUP BY departments.id
       ORDER BY c DESC, departments.name`
    )
    .all();
  const departmentMax = Math.max(1, ...departmentBreakdown.map((d) => d.c));

  const myQueue = db
    .prepare(
      `SELECT tickets.*, departments.name AS department_name
       FROM tickets
       JOIN departments ON departments.id = tickets.department_id
       WHERE tickets.assigned_to = ? AND tickets.status != 'Done'
       ORDER BY CASE tickets.priority WHEN 'Urgent' THEN 0 WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, tickets.created_at ASC
       LIMIT 5`
    )
    .all(req.session.user.id)
    .map(withFormatted);

  const recentActivity = db
    .prepare(
      `SELECT comments.message, comments.created_at, users.full_name AS commenter_name, users.role AS commenter_role,
         tickets.id AS ticket_id, tickets.title AS ticket_title
       FROM comments
       JOIN tickets ON tickets.id = comments.ticket_id
       JOIN users ON users.id = comments.user_id
       ORDER BY comments.created_at DESC
       LIMIT 6`
    )
    .all()
    .map((row) => ({
      ...row,
      ticket_number: `HD-${String(row.ticket_id).padStart(6, '0')}`,
      age: timeAgo(row.created_at),
    }));

  const recentTickets = db
    .prepare(
      `SELECT tickets.*, departments.name AS department_name, users.full_name AS created_by_name,
         users.role AS created_by_role, users.company AS created_by_company, assignee.full_name AS assignee_name
       FROM tickets
       JOIN departments ON departments.id = tickets.department_id
       JOIN users ON users.id = tickets.created_by
       LEFT JOIN users AS assignee ON assignee.id = tickets.assigned_to
       ORDER BY tickets.created_at DESC
       LIMIT 6`
    )
    .all()
    .map(withFormatted);

  res.render('dashboard-admin', {
    counts,
    unassignedCount,
    myOpenCount,
    departmentCount,
    userCount,
    technicianCount,
    priorityBreakdown,
    priorityMax,
    departmentBreakdown,
    departmentMax,
    myQueue,
    recentActivity,
    recentTickets,
  });
});

router.get('/admin/tickets', requireStaff, (req, res) => {
  const { status, department_id, assigned } = req.query;

  let query = `
    SELECT tickets.*, departments.name AS department_name, users.full_name AS created_by_name,
      users.role AS created_by_role, users.company AS created_by_company, assignee.full_name AS assignee_name
    FROM tickets
    JOIN departments ON departments.id = tickets.department_id
    JOIN users ON users.id = tickets.created_by
    LEFT JOIN users AS assignee ON assignee.id = tickets.assigned_to
    WHERE 1 = 1
  `;
  const params = [];

  if (status && ['Open', 'In Progress', 'Done'].includes(status)) {
    query += ' AND tickets.status = ?';
    params.push(status);
  }
  if (department_id) {
    query += ' AND tickets.department_id = ?';
    params.push(department_id);
  }
  if (assigned === 'me') {
    query += ' AND tickets.assigned_to = ?';
    params.push(req.session.user.id);
  } else if (assigned === 'unassigned') {
    query += ' AND tickets.assigned_to IS NULL';
  }
  query += ' ORDER BY tickets.created_at DESC';

  const tickets = db.prepare(query).all(...params).map(withFormatted);
  const departments = orderedDepartments();

  res.render('admin-tickets', {
    tickets,
    departments,
    filters: { status: status || '', department_id: department_id || '', assigned: assigned || '' },
  });
});

// ----- Departments (admin only) -----

router.get('/admin/departments', requireAdmin, (req, res) => {
  res.render('admin-departments', { departments: listDepartmentsWithCounts(), error: null });
});

router.post('/admin/departments', requireAdmin, (req, res) => {
  const { name, client_facing } = req.body;
  if (!name || !name.trim()) {
    return res.redirect('/admin/departments');
  }
  try {
    db.prepare('INSERT INTO departments (name, client_facing) VALUES (?, ?)').run(
      name.trim(),
      client_facing ? 1 : 0
    );
  } catch (err) {
    return res.status(400).render('admin-departments', {
      departments: listDepartmentsWithCounts(),
      error: 'A department with that name already exists.',
    });
  }
  res.redirect('/admin/departments');
});

router.post('/admin/departments/:id/toggle-client-facing', requireAdmin, (req, res) => {
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (dept) {
    db.prepare('UPDATE departments SET client_facing = ? WHERE id = ?').run(dept.client_facing ? 0 : 1, dept.id);
  }
  res.redirect('/admin/departments');
});

router.post('/admin/departments/:id/delete', requireAdmin, (req, res) => {
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  const renderError = (message) =>
    res.status(400).render('admin-departments', { departments: listDepartmentsWithCounts(), error: message });

  if (!dept) return renderError('Department not found.');

  try {
    db.prepare('DELETE FROM departments WHERE id = ?').run(dept.id);
  } catch (err) {
    return renderError(
      `Cannot delete "${dept.name}" while it still has users or tickets assigned to it. Reassign or remove those first.`
    );
  }

  res.redirect('/admin/departments');
});

// ----- Users (admin only) -----

router.get('/admin/users', requireAdmin, (req, res) => {
  res.render('admin-users', { users: listUsers(), departments: orderedDepartments(), error: null, created: null });
});

router.post('/admin/users', requireAdmin, (req, res) => {
  const { full_name, username, password, role, department_id, company } = req.body;
  const departments = orderedDepartments();
  const fail = (error) =>
    res.status(400).render('admin-users', { users: listUsers(), departments, error, created: null });

  if (!full_name || !full_name.trim() || !username || !username.trim() || !ROLES.includes(role)) {
    return fail('Please fill in full name, username, and role.');
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Please set a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare(
      `INSERT INTO users (username, password_hash, full_name, role, company, department_id) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(username.trim(), hash, full_name.trim(), role, role === 'client' ? (company || '').trim() || null : null, department_id || null);
  } catch (err) {
    return fail('That username is already taken.');
  }

  res.render('admin-users', {
    users: listUsers(),
    departments,
    error: null,
    created: { username: username.trim(), full_name: full_name.trim() },
  });
});

router.post('/admin/users/:id/delete', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  const departments = orderedDepartments();
  const renderError = (message) =>
    res.status(400).render('admin-users', { users: listUsers(), departments, error: message, created: null });

  if (!user) return renderError('User not found.');
  if (user.id === req.session.user.id) return renderError('You cannot delete your own account while logged in.');

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  } catch (err) {
    return renderError(
      `Cannot delete "${user.full_name}" while they still have tickets on record. Their ticket history must be preserved.`
    );
  }

  res.redirect('/admin/users');
});

router.post('/admin/users/:id/reset-password', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  const departments = orderedDepartments();
  const fail = (error) =>
    res.status(400).render('admin-users', { users: listUsers(), departments, error, created: null });

  if (!user) return fail('User not found.');

  const { password } = req.body;
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Please set a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);

  res.render('admin-users', {
    users: listUsers(),
    departments,
    error: null,
    created: { username: user.username, full_name: user.full_name, passwordReset: true },
  });
});

module.exports = router;
