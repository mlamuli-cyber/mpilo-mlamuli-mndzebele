const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const session = require('express-session');

const db = require('./db'); // also ensures schema + seed run before the app starts
const { homeFor } = require('./lib/roles');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'helpdesk.sid',
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// Make the logged-in user available to every view
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect(homeFor(req.session.user));
  }

  const resolvedCount = db.prepare(`SELECT COUNT(*) AS c FROM tickets WHERE status = 'Done'`).get().c;
  const departmentCount = db.prepare('SELECT COUNT(*) AS c FROM departments').get().c;
  const staffCount = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE role IN ('admin', 'technician')`).get().c;

  res.render('landing', { stats: { resolvedCount, departmentCount, staffCount } });
});

app.use(authRoutes);
app.use(ticketRoutes);
app.use(adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

app.listen(PORT, () => {
  console.log(`Help Desk running at http://localhost:${PORT}`);
});
