const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { notify } = require('../notifications');

const router = express.Router();
const RESERVATION_MINUTES = Number(process.env.RESERVATION_MINUTES || 30);

router.post('/', requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const qty = quantity || 1;
  if (product.stock < qty) {
    return res.status(400).json({ error: 'No hay suficiente stock para reservar' });
  }

  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60_000).toISOString();
  const info = db.prepare(
    `INSERT INTO reservations (product_id, user_id, quantity, expires_at) VALUES (?, ?, ?, ?)`
  ).run(product.id, req.user.id, qty, expiresAt);

  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(product.store_id);
  notify(store.owner_id, 'reservation_created', `Nueva reserva de "${product.name}" (x${qty}).`);

  res.status(201).json(db.prepare('SELECT * FROM reservations WHERE id = ?').get(info.lastInsertRowid));
});

router.get('/', requireAuth, (req, res) => {
  res.json(
    db.prepare('SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  );
});

router.post('/:id/cancel', requireAuth, (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation || reservation.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }
  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(reservation.id);
  res.json(db.prepare('SELECT * FROM reservations WHERE id = ?').get(reservation.id));
});

module.exports = router;
