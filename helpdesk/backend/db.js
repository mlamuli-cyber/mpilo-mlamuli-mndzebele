const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'helpdesk.db'));

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    client_facing INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'user', 'client')),
    company TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
    status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Done')) DEFAULT 'Open',
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed a default admin account and starter departments on first run.
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  const insertDept = db.prepare('INSERT INTO departments (name, client_facing) VALUES (?, ?)');
  const itDeptId = insertDept.run('IT Department', 0).lastInsertRowid;
  insertDept.run('Facilities', 0);
  insertDept.run('Human Resources', 0);
  insertDept.run('Client Support', 1);

  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    `INSERT INTO users (username, password_hash, full_name, role, department_id) VALUES (?, ?, ?, 'admin', ?)`
  ).run('admin', hash, 'Administrator', itDeptId);

  console.log('Seeded default admin account -> username: admin / password: admin123 (please change this)');
}

module.exports = db;
