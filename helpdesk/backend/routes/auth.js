const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { homeFor } = require('../lib/roles');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(homeFor(req.session.user));
  }
  // Prevent the browser from serving a stale, previously-filled copy of this
  // page from history/back-button cache after a user logs out.
  res.set('Cache-Control', 'no-store');
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get((username || '').trim());

  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    res.set('Cache-Control', 'no-store');
    return res.status(401).render('login', { error: 'Invalid username or password.' });
  }

  req.session.regenerate((err) => {
    if (err) {
      res.set('Cache-Control', 'no-store');
      return res.status(500).render('login', { error: 'Something went wrong. Please try again.' });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      company: user.company,
      department_id: user.department_id,
    };
    res.redirect(homeFor(req.session.user));
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
