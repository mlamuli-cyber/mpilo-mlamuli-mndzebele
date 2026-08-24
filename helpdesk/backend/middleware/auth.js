const { isStaff } = require('../lib/roles');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') return res.status(403).render('error', { message: 'Admins only.' });
  next();
}

// Admins and technicians can triage tickets; only admins manage departments/users.
function requireStaff(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (!isStaff(req.session.user)) {
    return res.status(403).render('error', { message: 'Staff access only.' });
  }
  next();
}

module.exports = { requireLogin, requireAdmin, requireStaff };
