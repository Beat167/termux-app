const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function storeForOwner(ownerId) {
  return db.prepare('SELECT * FROM stores WHERE owner_id = ?').get(ownerId);
}

router.get('/', (req, res) => {
  const { search, category } = req.query;
  let sql = `SELECT products.*, stores.name AS store_name FROM products
             JOIN stores ON stores.id = products.store_id WHERE 1=1`;
  const params = [];
  if (search) {
    sql += ' AND products.name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category) {
    sql += ' AND products.category = ?';
    params.push(category);
  }
  sql += ' ORDER BY products.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const product = db.prepare(
    `SELECT products.*, stores.name AS store_name FROM products
     JOIN stores ON stores.id = products.store_id WHERE products.id = ?`
  ).get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

router.post('/', requireAuth, requireRole('merchant'), (req, res) => {
  const store = storeForOwner(req.user.id);
  if (!store) return res.status(400).json({ error: 'No tienes una tienda asociada' });

  const { name, description, category, price, stock, acceptsOffers } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'name y price son obligatorios' });
  }

  const info = db.prepare(
    `INSERT INTO products (store_id, name, description, category, price, stock, accepts_offers)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(store.id, name, description || null, category || null, price, stock || 0, acceptsOffers ? 1 : 0);

  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAuth, requireRole('merchant'), (req, res) => {
  const store = storeForOwner(req.user.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product || product.store_id !== store.id) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const fields = ['name', 'description', 'category', 'price', 'stock'];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (req.body.acceptsOffers !== undefined) {
    db.prepare('UPDATE products SET accepts_offers = ? WHERE id = ?')
      .run(req.body.acceptsOffers ? 1 : 0, product.id);
  }
  if (updates.length) {
    const setClause = updates.map((f) => `${f} = ?`).join(', ');
    db.prepare(`UPDATE products SET ${setClause} WHERE id = ?`)
      .run(...updates.map((f) => req.body[f]), product.id);
  }

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(product.id));
});

router.delete('/:id', requireAuth, requireRole('merchant'), (req, res) => {
  const store = storeForOwner(req.user.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product || product.store_id !== store.id) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(product.id);
  res.status(204).end();
});

module.exports = router;
