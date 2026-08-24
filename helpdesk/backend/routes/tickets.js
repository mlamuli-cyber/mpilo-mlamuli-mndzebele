const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { withFormatted, timeAgo } = require('../lib/format');
const { pickLeastBusyTechnician } = require('../lib/assignment');
const { isStaff } = require('../lib/roles');

const router = express.Router();

const STATUSES = ['Open', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Clients only ever see departments marked "client-facing"; everyone else
// (employees, staff) sees the full list, IT Department leading.
function departmentsFor(user) {
  if (user.role === 'client') {
    return db.prepare(`SELECT * FROM departments WHERE client_facing = 1 ORDER BY name`).all();
  }
  return db
    .prepare(`SELECT * FROM departments ORDER BY CASE WHEN name = 'IT Department' THEN 0 ELSE 1 END, name`)
    .all();
}

function getTicketWithAccess(req, ticketId) {
  const ticket = db
    .prepare(
      `SELECT tickets.*, departments.name AS department_name, users.full_name AS created_by_name,
         users.role AS created_by_role, users.company AS created_by_company,
         assignee.full_name AS assignee_name, assignee.id AS assignee_id
       FROM tickets
       JOIN departments ON departments.id = tickets.department_id
       JOIN users ON users.id = tickets.created_by
       LEFT JOIN users AS assignee ON assignee.id = tickets.assigned_to
       WHERE tickets.id = ?`
    )
    .get(ticketId);

  if (!ticket) return null;
  if (!isStaff(req.session.user) && ticket.created_by !== req.session.user.id) return null;
  return ticket;
}

// Personal dashboard shared by regular employees and clients
router.get('/dashboard', requireLogin, (req, res) => {
  if (isStaff(req.session.user)) return res.redirect('/admin');

  const tickets = db
    .prepare(
      `SELECT tickets.*, departments.name AS department_name, assignee.full_name AS assignee_name
       FROM tickets
       JOIN departments ON departments.id = tickets.department_id
       LEFT JOIN users AS assignee ON assignee.id = tickets.assigned_to
       WHERE tickets.created_by = ?
       ORDER BY tickets.created_at DESC`
    )
    .all(req.session.user.id)
    .map(withFormatted);

  const counts = { Open: 0, 'In Progress': 0, Done: 0 };
  for (const t of tickets) counts[t.status]++;

  const recentActivity = db
    .prepare(
      `SELECT comments.message, comments.created_at, users.full_name AS commenter_name, users.role AS commenter_role,
         tickets.id AS ticket_id, tickets.title AS ticket_title
       FROM comments
       JOIN tickets ON tickets.id = comments.ticket_id
       JOIN users ON users.id = comments.user_id
       WHERE tickets.created_by = ?
       ORDER BY comments.created_at DESC
       LIMIT 5`
    )
    .all(req.session.user.id)
    .map((row) => ({
      ...row,
      ticket_number: `HD-${String(row.ticket_id).padStart(6, '0')}`,
      age: timeAgo(row.created_at),
    }));

  res.render('dashboard-user', { tickets, counts, recentActivity });
});

router.get('/tickets/new', requireLogin, (req, res) => {
  const departments = departmentsFor(req.session.user);
  res.render('ticket-new', { departments, priorities: PRIORITIES, error: null, form: {} });
});

router.post('/tickets', requireLogin, (req, res) => {
  const { title, description, department_id, priority } = req.body;
  const departments = departmentsFor(req.session.user);

  if (!title || !title.trim() || !description || !description.trim() || !department_id) {
    return res.status(400).render('ticket-new', {
      departments,
      priorities: PRIORITIES,
      error: 'Please fill in the title, description, and department.',
      form: req.body,
    });
  }

  const dept = departments.find((d) => String(d.id) === String(department_id));
  if (!dept) {
    return res.status(400).render('ticket-new', {
      departments,
      priorities: PRIORITIES,
      error: 'Please choose a valid department.',
      form: req.body,
    });
  }

  const finalPriority = PRIORITIES.includes(priority) ? priority : 'Medium';
  const assigneeId = pickLeastBusyTechnician(dept.id);

  const result = db
    .prepare(
      `INSERT INTO tickets (title, description, priority, department_id, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(title.trim(), description.trim(), finalPriority, dept.id, req.session.user.id, assigneeId);

  res.redirect(`/tickets/${result.lastInsertRowid}`);
});

router.get('/tickets/:id', requireLogin, (req, res) => {
  const ticket = getTicketWithAccess(req, req.params.id);
  if (!ticket) return res.status(404).render('error', { message: 'Ticket not found.' });

  const comments = db
    .prepare(
      `SELECT comments.*, users.full_name, users.role
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE ticket_id = ?
       ORDER BY comments.created_at ASC`
    )
    .all(ticket.id);

  const technicians = isStaff(req.session.user)
    ? db
        .prepare(
          `SELECT users.* FROM users WHERE role IN ('technician', 'admin') ORDER BY role DESC, full_name`
        )
        .all()
    : [];

  res.render('ticket-view', {
    ticket: withFormatted(ticket),
    comments,
    statuses: STATUSES,
    technicians,
    isStaff: isStaff(req.session.user),
  });
});

router.post('/tickets/:id/comments', requireLogin, (req, res) => {
  const ticket = getTicketWithAccess(req, req.params.id);
  if (!ticket) return res.status(404).render('error', { message: 'Ticket not found.' });

  const { message } = req.body;
  if (message && message.trim()) {
    db.prepare('INSERT INTO comments (ticket_id, user_id, message) VALUES (?, ?, ?)').run(
      ticket.id,
      req.session.user.id,
      message.trim()
    );
  }

  res.redirect(`/tickets/${ticket.id}`);
});

router.post('/tickets/:id/status', requireLogin, (req, res) => {
  if (!isStaff(req.session.user)) {
    return res.status(403).render('error', { message: 'Only help desk staff can update ticket status.' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).render('error', { message: 'Ticket not found.' });

  const { status } = req.body;
  if (STATUSES.includes(status)) {
    db.prepare(`UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, ticket.id);
  }

  res.redirect(`/tickets/${ticket.id}`);
});

// Manually reassign (or unassign) a ticket to a specific technician/admin.
router.post('/tickets/:id/assign', requireLogin, (req, res) => {
  if (!isStaff(req.session.user)) {
    return res.status(403).render('error', { message: 'Only help desk staff can reassign tickets.' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).render('error', { message: 'Ticket not found.' });

  const { assigned_to } = req.body;
  if (!assigned_to) {
    db.prepare(`UPDATE tickets SET assigned_to = NULL, updated_at = datetime('now') WHERE id = ?`).run(ticket.id);
  } else {
    const target = db.prepare(`SELECT * FROM users WHERE id = ? AND role IN ('technician', 'admin')`).get(assigned_to);
    if (target) {
      db.prepare(`UPDATE tickets SET assigned_to = ?, updated_at = datetime('now') WHERE id = ?`).run(
        target.id,
        ticket.id
      );
    }
  }

  res.redirect(`/tickets/${ticket.id}`);
});

// Self-service pickup for a ticket nobody has been assigned yet.
router.post('/tickets/:id/claim', requireLogin, (req, res) => {
  if (!isStaff(req.session.user)) {
    return res.status(403).render('error', { message: 'Only help desk staff can claim tickets.' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).render('error', { message: 'Ticket not found.' });

  if (!ticket.assigned_to) {
    db.prepare(`UPDATE tickets SET assigned_to = ?, updated_at = datetime('now') WHERE id = ?`).run(
      req.session.user.id,
      ticket.id
    );
  }

  res.redirect(`/tickets/${ticket.id}`);
});

module.exports = router;
