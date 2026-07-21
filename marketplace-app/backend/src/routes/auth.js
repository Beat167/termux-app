const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

function issueToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

router.post('/register', (req, res) => {
  const { name, email, password, role, storeName } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password y role son obligatorios' });
  }
  if (!['customer', 'merchant'].includes(role)) {
    return res.status(400).json({ error: 'role debe ser customer o merchant' });
  }
  if (role === 'merchant' && !storeName) {
    return res.status(400).json({ error: 'storeName es obligatorio para comerciantes' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Ese email ya está registrado' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email, passwordHash, role);
  const user = { id: info.lastInsertRowid, name, role };

  if (role === 'merchant') {
    db.prepare('INSERT INTO stores (owner_id, name) VALUES (?, ?)').run(user.id, storeName);
  }

  res.status(201).json({ token: issueToken(user), user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password || '', row.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const user = { id: row.id, name: row.name, role: row.role };
  res.json({ token: issueToken(user), user });
});

module.exports = router;
