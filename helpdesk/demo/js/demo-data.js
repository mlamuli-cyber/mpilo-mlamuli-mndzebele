/**
 * Help Desk — Standalone Demo Data Layer
 * ---------------------------------------
 * This file stands in for the real backend (server.js + db.js + routes/*.js)
 * so the whole app can run as static files on Netlify with no server.
 *
 * Everything persists to localStorage in the visitor's own browser — nobody
 * else's demo session is affected, and "Reset demo data" restores the
 * original seed at any time. Passwords here are plain strings for the demo
 * only; the real app (see /backend in this repo) hashes them with bcrypt and
 * uses server-side sessions.
 *
 * The logic below intentionally mirrors the real backend 1:1:
 *   - lib/roles.js       -> isStaff(), homeFor()
 *   - lib/assignment.js  -> pickLeastBusyTechnician()
 *   - lib/format.js      -> ticketNumber(), timeAgo()
 *   - db.js              -> schema/seed shape
 *   - routes/auth.js     -> login()/logout()
 *   - routes/tickets.js  -> ticket CRUD + access rules
 *   - routes/admin.js    -> department/user management
 */
(function (window) {
  'use strict';

  var STORAGE_KEY = 'hdDemo_v1';
  var ROLES = ['admin', 'technician', 'user', 'client'];
  var STATUSES = ['Open', 'In Progress', 'Done'];
  var PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
  var STAFF_ROLES = ['admin', 'technician'];
  var MIN_PASSWORD_LENGTH = 6;

  // ---------------------------------------------------------------------
  // Storage plumbing
  // ---------------------------------------------------------------------

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Help Desk demo: could not save to localStorage.', e);
    }
  }

  function minutesAgoISO(minutes) {
    return new Date(Date.now() - minutes * 60000).toISOString();
  }

  function nextId(state, kind) {
    state.counters[kind] += 1;
    return state.counters[kind];
  }

  // ---------------------------------------------------------------------
  // Seed data — mirrors db.js's default admin + departments, plus a
  // populated cast of demo users/tickets/comments so every role's
  // dashboard has something real to look at.
  // ---------------------------------------------------------------------

  function seed() {
    var state = {
      counters: { department: 0, user: 0, ticket: 0, comment: 0 },
      departments: [],
      users: [],
      tickets: [],
      comments: [],
      session: null,
    };

    function addDept(name, clientFacing) {
      var d = { id: nextId(state, 'department'), name: name, client_facing: clientFacing ? 1 : 0 };
      state.departments.push(d);
      return d;
    }

    var itDept = addDept('IT Department', 0);
    var facilitiesDept = addDept('Facilities', 0);
    var hrDept = addDept('Human Resources', 0);
    var clientSupportDept = addDept('Client Support', 1);

    function addUser(u) {
      u.id = nextId(state, 'user');
      u.created_at = u.created_at || minutesAgoISO(u.ageMinutes || 0);
      delete u.ageMinutes;
      state.users.push(u);
      return u;
    }

    var admin = addUser({
      username: 'admin',
      password: 'admin123',
      full_name: 'Administrator',
      role: 'admin',
      company: null,
      department_id: itDept.id,
      ageMinutes: 60 * 24 * 40,
    });

    var techSipho = addUser({
      username: 'sipho.t',
      password: 'demo123',
      full_name: 'Sipho Dlamini',
      role: 'technician',
      company: null,
      department_id: itDept.id,
      ageMinutes: 60 * 24 * 35,
    });

    var techNomsa = addUser({
      username: 'nomsa.k',
      password: 'demo123',
      full_name: 'Nomsa Khumalo',
      role: 'technician',
      company: null,
      department_id: itDept.id,
      ageMinutes: 60 * 24 * 30,
    });

    var techLindiwe = addUser({
      username: 'lindiwe.m',
      password: 'demo123',
      full_name: 'Lindiwe Mabuza',
      role: 'technician',
      company: null,
      department_id: clientSupportDept.id,
      ageMinutes: 60 * 24 * 20,
    });

    var userThabo = addUser({
      username: 'thabo.s',
      password: 'demo123',
      full_name: 'Thabo Simelane',
      role: 'user',
      company: null,
      department_id: null,
      ageMinutes: 60 * 24 * 25,
    });

    var userLungile = addUser({
      username: 'lungile.n',
      password: 'demo123',
      full_name: 'Lungile Nkambule',
      role: 'user',
      company: null,
      department_id: null,
      ageMinutes: 60 * 24 * 18,
    });

    var clientAmanda = addUser({
      username: 'amanda.client',
      password: 'demo123',
      full_name: 'Amanda Shongwe',
      role: 'client',
      company: 'Acme Logistics',
      department_id: null,
      ageMinutes: 60 * 24 * 15,
    });

    function addTicket(t) {
      t.id = nextId(state, 'ticket');
      t.priority = t.priority || 'Medium';
      t.status = t.status || 'Open';
      var created = minutesAgoISO(t.ageMinutes || 0);
      t.created_at = created;
      t.updated_at = t.updatedAgeMinutes != null ? minutesAgoISO(t.updatedAgeMinutes) : created;
      delete t.ageMinutes;
      delete t.updatedAgeMinutes;
      state.tickets.push(t);
      return t;
    }

    function addComment(ticketId, userId, message, ageMinutes) {
      state.comments.push({
        id: nextId(state, 'comment'),
        ticket_id: ticketId,
        user_id: userId,
        message: message,
        created_at: minutesAgoISO(ageMinutes),
      });
    }

    var t1 = addTicket({
      title: "Can't connect to the office VPN",
      description:
        "I keep getting 'authentication failed' when I try to connect to the VPN from home. Worked fine last week. I've double-checked my password.",
      priority: 'High',
      status: 'In Progress',
      department_id: itDept.id,
      created_by: userThabo.id,
      assigned_to: techSipho.id,
      ageMinutes: 60 * 5,
      updatedAgeMinutes: 40,
    });
    addComment(t1.id, techSipho.id, "Looking into it now — can you tell me which VPN client version you're on?", 60 * 3);
    addComment(t1.id, userThabo.id, "It's the latest one, auto-updated last week. Version 5.2.1.", 60 * 2);
    addComment(t1.id, techSipho.id, "Found it — your certificate expired. Reissuing now, should be fixed within the hour.", 40);

    var t2 = addTicket({
      title: 'New laptop request for starting employee',
      description: 'We have a new hire starting Monday and need a laptop provisioned with the standard software image.',
      priority: 'Medium',
      status: 'Open',
      department_id: itDept.id,
      created_by: userLungile.id,
      assigned_to: techNomsa.id,
      ageMinutes: 60 * 26,
    });

    var t3 = addTicket({
      title: 'Printer on 3rd floor jamming constantly',
      description: 'The printer near the east stairwell jams almost every print job. Might need a new roller kit.',
      priority: 'Low',
      status: 'Open',
      department_id: facilitiesDept.id,
      created_by: userThabo.id,
      assigned_to: null,
      ageMinutes: 60 * 10,
    });

    var t4 = addTicket({
      title: 'Payroll portal showing wrong leave balance',
      description: 'My leave balance dropped by 3 days after a public holiday that should not have counted against it.',
      priority: 'Medium',
      status: 'Done',
      department_id: hrDept.id,
      created_by: userLungile.id,
      assigned_to: techSipho.id,
      ageMinutes: 60 * 24 * 4,
      updatedAgeMinutes: 60 * 24 * 2,
    });
    addComment(t4.id, techSipho.id, 'Confirmed the holiday calendar had the wrong date loaded. Corrected and reissued the balance.', 60 * 24 * 2);
    addComment(t4.id, userLungile.id, 'Balance looks right now, thank you!', 60 * 24 * 2 - 20);

    var t5 = addTicket({
      title: 'Unable to log in to the client billing portal',
      description: 'Our finance team gets "invalid session" every time they try to view this month\'s invoice.',
      priority: 'Urgent',
      status: 'Open',
      department_id: clientSupportDept.id,
      created_by: clientAmanda.id,
      assigned_to: techLindiwe.id,
      ageMinutes: 90,
    });
    addComment(t5.id, techLindiwe.id, "Escalating this now — I can reproduce it on our side too. Update coming shortly.", 45);

    var t6 = addTicket({
      title: 'Request: extra login seat for new analyst',
      description: 'We just hired a new analyst and need an additional seat added to our account.',
      priority: 'Low',
      status: 'In Progress',
      department_id: clientSupportDept.id,
      created_by: clientAmanda.id,
      assigned_to: techLindiwe.id,
      ageMinutes: 60 * 24 * 3,
      updatedAgeMinutes: 60 * 20,
    });

    var t7 = addTicket({
      title: 'Conference room projector has no signal',
      description: 'HDMI and the wireless dongle both show "no signal" in the main conference room.',
      priority: 'Medium',
      status: 'Open',
      department_id: facilitiesDept.id,
      created_by: userLungile.id,
      assigned_to: null,
      ageMinutes: 35,
    });

    var t8 = addTicket({
      title: 'Password reset for shared finance mailbox',
      description: "Nobody on the team can remember the password for finance@ and we're locked out.",
      priority: 'High',
      status: 'Done',
      department_id: itDept.id,
      created_by: userThabo.id,
      assigned_to: techNomsa.id,
      ageMinutes: 60 * 24 * 7,
      updatedAgeMinutes: 60 * 24 * 6,
    });
    addComment(t8.id, techNomsa.id, 'Reset and shared the new password with you securely — let me know if it still fails.', 60 * 24 * 6);

    return state;
  }

  var state = load();
  if (!state) {
    state = seed();
    save(state);
  }

  function persist() {
    save(state);
  }

  // ---------------------------------------------------------------------
  // Formatting helpers (lib/format.js)
  // ---------------------------------------------------------------------

  function ticketNumber(id) {
    return 'HD-' + String(id).padStart(6, '0');
  }

  function timeAgo(isoTimestamp) {
    var diffMs = Date.now() - new Date(isoTimestamp).getTime();
    var minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.round(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.round(hours / 24);
    if (days < 30) return days + 'd ago';
    var months = Math.round(days / 30);
    if (months < 12) return months + 'mo ago';
    var years = Math.round(months / 12);
    return years + 'y ago';
  }

  function withFormatted(ticket) {
    var copy = Object.assign({}, ticket);
    copy.number = ticketNumber(ticket.id);
    copy.age = timeAgo(ticket.created_at);
    return copy;
  }

  function initials(fullName) {
    return fullName
      .trim()
      .split(/\s+/)
      .map(function (p) {
        return p[0];
      })
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------------------------------------------------------------------
  // Roles (lib/roles.js)
  // ---------------------------------------------------------------------

  function isStaff(user) {
    return STAFF_ROLES.indexOf(user.role) !== -1;
  }

  function homeFor(user) {
    return isStaff(user) ? 'admin.html' : 'dashboard.html';
  }

  // ---------------------------------------------------------------------
  // Session / auth (routes/auth.js)
  // ---------------------------------------------------------------------

  function getUserById(id) {
    id = Number(id);
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i].id === id) return state.users[i];
    }
    return null;
  }

  function getSession() {
    if (!state.session) return null;
    var user = getUserById(state.session.userId);
    return user || null;
  }

  function login(username, password) {
    var trimmed = (username || '').trim();
    var user = state.users.find(function (u) {
      return u.username === trimmed;
    });
    if (!user || user.password !== (password || '')) {
      return { ok: false, error: 'Invalid username or password.' };
    }
    state.session = { userId: user.id };
    persist();
    return { ok: true, user: user };
  }

  function logout() {
    state.session = null;
    persist();
  }

  // ---------------------------------------------------------------------
  // Departments (routes/tickets.js departmentsFor, routes/admin.js)
  // ---------------------------------------------------------------------

  function orderedDepartments() {
    return state.departments.slice().sort(function (a, b) {
      var aFirst = a.name === 'IT Department' ? 0 : 1;
      var bFirst = b.name === 'IT Department' ? 0 : 1;
      if (aFirst !== bFirst) return aFirst - bFirst;
      return a.name.localeCompare(b.name);
    });
  }

  function departmentsFor(user) {
    if (user.role === 'client') {
      return orderedDepartments().filter(function (d) {
        return d.client_facing;
      });
    }
    return orderedDepartments();
  }

  function getDepartmentById(id) {
    id = Number(id);
    return state.departments.find(function (d) {
      return d.id === id;
    }) || null;
  }

  function listDepartmentsWithCounts() {
    return orderedDepartments().map(function (d) {
      var user_count = state.users.filter(function (u) {
        return u.department_id === d.id;
      }).length;
      var ticket_count = state.tickets.filter(function (t) {
        return t.department_id === d.id;
      }).length;
      var technician_count = state.users.filter(function (u) {
        return u.department_id === d.id && u.role === 'technician';
      }).length;
      return Object.assign({}, d, { user_count: user_count, ticket_count: ticket_count, technician_count: technician_count });
    });
  }

  function addDepartment(name, clientFacing) {
    name = (name || '').trim();
    if (!name) return { ok: false, error: 'Please enter a department name.' };
    var exists = state.departments.some(function (d) {
      return d.name.toLowerCase() === name.toLowerCase();
    });
    if (exists) return { ok: false, error: 'A department with that name already exists.' };
    var d = { id: nextId(state, 'department'), name: name, client_facing: clientFacing ? 1 : 0 };
    state.departments.push(d);
    persist();
    return { ok: true, department: d };
  }

  function toggleClientFacing(id) {
    var d = getDepartmentById(id);
    if (d) {
      d.client_facing = d.client_facing ? 0 : 1;
      persist();
    }
    return { ok: true };
  }

  function deleteDepartment(id) {
    var d = getDepartmentById(id);
    if (!d) return { ok: false, error: 'Department not found.' };
    var inUse =
      state.users.some(function (u) {
        return u.department_id === d.id;
      }) ||
      state.tickets.some(function (t) {
        return t.department_id === d.id;
      });
    if (inUse) {
      return {
        ok: false,
        error:
          'Cannot delete "' + d.name + '" while it still has users or tickets assigned to it. Reassign or remove those first.',
      };
    }
    state.departments = state.departments.filter(function (x) {
      return x.id !== d.id;
    });
    persist();
    return { ok: true };
  }

  // ---------------------------------------------------------------------
  // Users (routes/admin.js)
  // ---------------------------------------------------------------------

  function listUsers() {
    var order = { admin: 0, technician: 1, user: 2, client: 3 };
    return state.users
      .slice()
      .sort(function (a, b) {
        if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
        return a.full_name.localeCompare(b.full_name);
      })
      .map(function (u) {
        var dept = u.department_id ? getDepartmentById(u.department_id) : null;
        return Object.assign({}, u, { department_name: dept ? dept.name : null });
      });
  }

  function createUser(input) {
    var full_name = (input.full_name || '').trim();
    var username = (input.username || '').trim();
    var role = input.role;
    var password = input.password || '';

    if (!full_name || !username || ROLES.indexOf(role) === -1) {
      return { ok: false, error: 'Please fill in full name, username, and role.' };
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: 'Please set a password of at least ' + MIN_PASSWORD_LENGTH + ' characters.' };
    }
    var taken = state.users.some(function (u) {
      return u.username === username;
    });
    if (taken) return { ok: false, error: 'That username is already taken.' };

    var user = {
      id: nextId(state, 'user'),
      username: username,
      password: password,
      full_name: full_name,
      role: role,
      company: role === 'client' ? (input.company || '').trim() || null : null,
      department_id: input.department_id ? Number(input.department_id) : null,
      created_at: new Date().toISOString(),
    };
    state.users.push(user);
    persist();
    return { ok: true, user: user };
  }

  function deleteUser(id, currentUserId) {
    id = Number(id);
    var user = getUserById(id);
    if (!user) return { ok: false, error: 'User not found.' };
    if (id === Number(currentUserId)) return { ok: false, error: 'You cannot delete your own account while logged in.' };
    var hasTickets = state.tickets.some(function (t) {
      return t.created_by === id || t.assigned_to === id;
    });
    if (hasTickets) {
      return {
        ok: false,
        error: 'Cannot delete "' + user.full_name + '" while they still have tickets on record. Their ticket history must be preserved.',
      };
    }
    state.users = state.users.filter(function (u) {
      return u.id !== id;
    });
    persist();
    return { ok: true };
  }

  function resetPassword(id, password) {
    var user = getUserById(id);
    if (!user) return { ok: false, error: 'User not found.' };
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: 'Please set a password of at least ' + MIN_PASSWORD_LENGTH + ' characters.' };
    }
    user.password = password;
    persist();
    return { ok: true, user: user };
  }

  // ---------------------------------------------------------------------
  // Ticket assignment (lib/assignment.js)
  // ---------------------------------------------------------------------

  function pickLeastBusyTechnician(departmentId) {
    departmentId = Number(departmentId);
    var techs = state.users.filter(function (u) {
      return u.role === 'technician' && u.department_id === departmentId;
    });
    if (techs.length === 0) return null;

    var loadFor = {};
    techs.forEach(function (t) {
      loadFor[t.id] = 0;
    });
    state.tickets.forEach(function (t) {
      if (t.assigned_to != null && loadFor.hasOwnProperty(t.assigned_to) && t.status !== 'Done') {
        loadFor[t.assigned_to] += 1;
      }
    });

    techs.sort(function (a, b) {
      if (loadFor[a.id] !== loadFor[b.id]) return loadFor[a.id] - loadFor[b.id];
      return a.id - b.id;
    });
    return techs[0].id;
  }

  // ---------------------------------------------------------------------
  // Tickets (routes/tickets.js)
  // ---------------------------------------------------------------------

  function decorateTicket(t) {
    var dept = getDepartmentById(t.department_id);
    var creator = getUserById(t.created_by);
    var assignee = t.assigned_to != null ? getUserById(t.assigned_to) : null;
    return Object.assign({}, t, {
      department_name: dept ? dept.name : '—',
      created_by_name: creator ? creator.full_name : 'Unknown',
      created_by_role: creator ? creator.role : null,
      created_by_company: creator ? creator.company : null,
      assignee_name: assignee ? assignee.full_name : null,
      assignee_id: assignee ? assignee.id : null,
    });
  }

  function getTicketsForUser(userId) {
    return state.tickets
      .filter(function (t) {
        return t.created_by === Number(userId);
      })
      .sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .map(decorateTicket)
      .map(withFormatted);
  }

  function getCountsForUser(userId) {
    var counts = { Open: 0, 'In Progress': 0, Done: 0 };
    getTicketsForUser(userId).forEach(function (t) {
      counts[t.status]++;
    });
    return counts;
  }

  function getAllTickets(filters) {
    filters = filters || {};
    var list = state.tickets.slice();
    if (filters.status && STATUSES.indexOf(filters.status) !== -1) {
      list = list.filter(function (t) {
        return t.status === filters.status;
      });
    }
    if (filters.department_id) {
      list = list.filter(function (t) {
        return String(t.department_id) === String(filters.department_id);
      });
    }
    if (filters.assigned === 'me' && filters.currentUserId) {
      list = list.filter(function (t) {
        return t.assigned_to === Number(filters.currentUserId);
      });
    } else if (filters.assigned === 'unassigned') {
      list = list.filter(function (t) {
        return t.assigned_to == null;
      });
    }
    list.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return list.map(decorateTicket).map(withFormatted);
  }

  function getTicketWithAccess(ticketId, currentUser) {
    var t = state.tickets.find(function (x) {
      return x.id === Number(ticketId);
    });
    if (!t) return null;
    if (!isStaff(currentUser) && t.created_by !== currentUser.id) return null;
    return decorateTicket(t);
  }

  function createTicket(input) {
    var title = (input.title || '').trim();
    var description = (input.description || '').trim();
    if (!title || !description || !input.department_id) {
      return { ok: false, error: 'Please fill in the title, description, and department.' };
    }
    var dept = getDepartmentById(input.department_id);
    if (!dept) return { ok: false, error: 'Please choose a valid department.' };

    var priority = PRIORITIES.indexOf(input.priority) !== -1 ? input.priority : 'Medium';
    var assigneeId = pickLeastBusyTechnician(dept.id);
    var now = new Date().toISOString();

    var ticket = {
      id: nextId(state, 'ticket'),
      title: title,
      description: description,
      priority: priority,
      status: 'Open',
      department_id: dept.id,
      created_by: input.userId,
      assigned_to: assigneeId,
      created_at: now,
      updated_at: now,
    };
    state.tickets.push(ticket);
    persist();
    return { ok: true, ticket: ticket };
  }

  function addComment(ticketId, userId, message) {
    message = (message || '').trim();
    if (!message) return { ok: false };
    state.comments.push({
      id: nextId(state, 'comment'),
      ticket_id: Number(ticketId),
      user_id: userId,
      message: message,
      created_at: new Date().toISOString(),
    });
    persist();
    return { ok: true };
  }

  function getCommentsForTicket(ticketId) {
    return state.comments
      .filter(function (c) {
        return c.ticket_id === Number(ticketId);
      })
      .sort(function (a, b) {
        return new Date(a.created_at) - new Date(b.created_at);
      })
      .map(function (c) {
        var u = getUserById(c.user_id);
        return Object.assign({}, c, { full_name: u ? u.full_name : 'Unknown', role: u ? u.role : null });
      });
  }

  function updateTicketStatus(ticketId, status) {
    var t = state.tickets.find(function (x) {
      return x.id === Number(ticketId);
    });
    if (!t) return { ok: false, error: 'Ticket not found.' };
    if (STATUSES.indexOf(status) !== -1) {
      t.status = status;
      t.updated_at = new Date().toISOString();
      persist();
    }
    return { ok: true };
  }

  function assignTicket(ticketId, assignedTo) {
    var t = state.tickets.find(function (x) {
      return x.id === Number(ticketId);
    });
    if (!t) return { ok: false, error: 'Ticket not found.' };
    if (!assignedTo) {
      t.assigned_to = null;
    } else {
      var target = getUserById(assignedTo);
      if (target && (target.role === 'technician' || target.role === 'admin')) {
        t.assigned_to = target.id;
      }
    }
    t.updated_at = new Date().toISOString();
    persist();
    return { ok: true };
  }

  function claimTicket(ticketId, userId) {
    var t = state.tickets.find(function (x) {
      return x.id === Number(ticketId);
    });
    if (!t) return { ok: false, error: 'Ticket not found.' };
    if (!t.assigned_to) {
      t.assigned_to = userId;
      t.updated_at = new Date().toISOString();
      persist();
    }
    return { ok: true };
  }

  // ---------------------------------------------------------------------
  // Admin overview stats (routes/admin.js '/admin')
  // ---------------------------------------------------------------------

  var PRIORITY_ORDER = ['Urgent', 'High', 'Medium', 'Low'];

  function getAdminOverview(currentUser) {
    var counts = { open: 0, inProgress: 0, done: 0, total: state.tickets.length };
    state.tickets.forEach(function (t) {
      if (t.status === 'Open') counts.open++;
      else if (t.status === 'In Progress') counts.inProgress++;
      else if (t.status === 'Done') counts.done++;
    });

    var unassignedCount = state.tickets.filter(function (t) {
      return t.assigned_to == null && t.status !== 'Done';
    }).length;

    var myOpenCount = state.tickets.filter(function (t) {
      return t.assigned_to === currentUser.id && t.status !== 'Done';
    }).length;

    var departmentCount = state.departments.length;
    var userCount = state.users.filter(function (u) {
      return u.role === 'user' || u.role === 'client';
    }).length;
    var technicianCount = state.users.filter(function (u) {
      return u.role === 'technician';
    }).length;

    var priorityBreakdown = PRIORITY_ORDER.map(function (p) {
      var count = state.tickets.filter(function (t) {
        return t.status !== 'Done' && t.priority === p;
      }).length;
      return { priority: p, count: count };
    });
    var priorityMax = Math.max.apply(
      Math,
      [1].concat(
        priorityBreakdown.map(function (p) {
          return p.count;
        })
      )
    );

    var departmentBreakdown = orderedDepartments()
      .map(function (d) {
        var c = state.tickets.filter(function (t) {
          return t.department_id === d.id && t.status !== 'Done';
        }).length;
        return { name: d.name, c: c };
      })
      .sort(function (a, b) {
        return b.c - a.c;
      });
    var departmentMax = Math.max.apply(
      Math,
      [1].concat(
        departmentBreakdown.map(function (d) {
          return d.c;
        })
      )
    );

    var priorityRank = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    var myQueue = state.tickets
      .filter(function (t) {
        return t.assigned_to === currentUser.id && t.status !== 'Done';
      })
      .sort(function (a, b) {
        if (priorityRank[a.priority] !== priorityRank[b.priority]) return priorityRank[a.priority] - priorityRank[b.priority];
        return new Date(a.created_at) - new Date(b.created_at);
      })
      .slice(0, 5)
      .map(decorateTicket)
      .map(withFormatted);

    var recentActivity = state.comments
      .slice()
      .sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, 6)
      .map(function (c) {
        var u = getUserById(c.user_id);
        var t = state.tickets.find(function (x) {
          return x.id === c.ticket_id;
        });
        return {
          message: c.message,
          created_at: c.created_at,
          commenter_name: u ? u.full_name : 'Unknown',
          commenter_role: u ? u.role : '',
          ticket_id: c.ticket_id,
          ticket_title: t ? t.title : '',
          ticket_number: ticketNumber(c.ticket_id),
          age: timeAgo(c.created_at),
        };
      });

    var recentTickets = state.tickets
      .slice()
      .sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, 6)
      .map(decorateTicket)
      .map(withFormatted);

    return {
      counts: counts,
      unassignedCount: unassignedCount,
      myOpenCount: myOpenCount,
      departmentCount: departmentCount,
      userCount: userCount,
      technicianCount: technicianCount,
      priorityBreakdown: priorityBreakdown,
      priorityMax: priorityMax,
      departmentBreakdown: departmentBreakdown,
      departmentMax: departmentMax,
      myQueue: myQueue,
      recentActivity: recentActivity,
      recentTickets: recentTickets,
    };
  }

  function getRecentActivityForUser(userId, limit) {
    var myTicketIds = state.tickets
      .filter(function (t) {
        return t.created_by === Number(userId);
      })
      .map(function (t) {
        return t.id;
      });
    return state.comments
      .filter(function (c) {
        return myTicketIds.indexOf(c.ticket_id) !== -1;
      })
      .sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, limit || 5)
      .map(function (c) {
        var u = getUserById(c.user_id);
        var t = state.tickets.find(function (x) {
          return x.id === c.ticket_id;
        });
        return {
          message: c.message,
          created_at: c.created_at,
          commenter_name: u ? u.full_name : 'Unknown',
          commenter_role: u ? u.role : '',
          ticket_id: c.ticket_id,
          ticket_title: t ? t.title : '',
          ticket_number: ticketNumber(c.ticket_id),
          age: timeAgo(c.created_at),
        };
      });
  }

  // ---------------------------------------------------------------------
  // Page guards
  // ---------------------------------------------------------------------

  function requireLogin() {
    var user = getSession();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  function requireStaff() {
    var user = requireLogin();
    if (!user) return null;
    if (!isStaff(user)) {
      window.location.href = 'error.html?message=' + encodeURIComponent('Staff access only.');
      return null;
    }
    return user;
  }

  function requireAdmin() {
    var user = requireLogin();
    if (!user) return null;
    if (user.role !== 'admin') {
      window.location.href = 'error.html?message=' + encodeURIComponent('Admins only.');
      return null;
    }
    return user;
  }

  function resetDemoData() {
    state = seed();
    save(state);
    window.location.href = 'index.html';
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  window.HD = {
    ROLES: ROLES,
    STATUSES: STATUSES,
    PRIORITIES: PRIORITIES,

    // auth/session
    getSession: getSession,
    login: login,
    logout: logout,
    isStaff: isStaff,
    homeFor: homeFor,
    requireLogin: requireLogin,
    requireStaff: requireStaff,
    requireAdmin: requireAdmin,

    // departments
    departmentsFor: departmentsFor,
    orderedDepartments: orderedDepartments,
    getDepartmentById: getDepartmentById,
    listDepartmentsWithCounts: listDepartmentsWithCounts,
    addDepartment: addDepartment,
    toggleClientFacing: toggleClientFacing,
    deleteDepartment: deleteDepartment,

    // users
    listUsers: listUsers,
    getUserById: getUserById,
    createUser: createUser,
    deleteUser: deleteUser,
    resetPassword: resetPassword,

    // tickets
    getTicketsForUser: getTicketsForUser,
    getCountsForUser: getCountsForUser,
    getAllTickets: getAllTickets,
    getTicketWithAccess: getTicketWithAccess,
    createTicket: createTicket,
    addComment: addComment,
    getCommentsForTicket: getCommentsForTicket,
    updateTicketStatus: updateTicketStatus,
    assignTicket: assignTicket,
    claimTicket: claimTicket,
    pickLeastBusyTechnician: pickLeastBusyTechnician,
    getAdminOverview: getAdminOverview,
    getRecentActivityForUser: getRecentActivityForUser,

    // formatting
    ticketNumber: ticketNumber,
    timeAgo: timeAgo,
    withFormatted: withFormatted,
    initials: initials,
    escapeHtml: escapeHtml,

    // demo utilities
    resetDemoData: resetDemoData,
  };
})(window);
