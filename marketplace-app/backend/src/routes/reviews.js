const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', (req, res) => {
  const rows = db.prepare(
    `SELECT reviews.*, users.name AS user_name FROM reviews
     JOIN users ON users.id = reviews.user_id
     WHERE product_id = ? ORDER BY reviews.created_at DESC`
  ).all(req.params.productId);
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { productId, rating, comment } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating debe estar entre 1 y 5' });
  }

  const info = db.prepare(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)'
  ).run(product.id, req.user.id, rating, comment || null);

  res.status(201).json(db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
