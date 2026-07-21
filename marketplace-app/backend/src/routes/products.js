const express = require('express');
const db = require('../db');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const PRODUCT_SELECT = `
  SELECT products.*, stores.name AS store_name, stores.type AS store_type,
    COALESCE(reviews_agg.avg_rating, 0) AS avg_rating,
    COALESCE(reviews_agg.review_count, 0) AS review_count
  FROM products
  JOIN stores ON stores.id = products.store_id
  LEFT JOIN (
    SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count
    FROM reviews GROUP BY product_id
  ) reviews_agg ON reviews_agg.product_id = products.id
`;

function storeForOwner(ownerId) {
  return db.prepare('SELECT * FROM stores WHERE owner_id = ?').get(ownerId);
}

router.get('/', (req, res) => {
  const { search, category, mode } = req.query;
  let sql = `${PRODUCT_SELECT} WHERE 1=1`;
  const params = [];
  if (search) {
    sql += ' AND products.name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category) {
    sql += ' AND products.category = ?';
    params.push(category);
  }
  if (mode && ['tienda_oficial', 'mercado_local'].includes(mode)) {
    sql += ' AND stores.type = ?';
    params.push(mode);
  }
  sql += ' ORDER BY products.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Debe ir antes de "/:id" para que Express no la confunda con un id de producto.
router.get('/recommended', optionalAuth, (req, res) => {
  let categories = [];
  if (req.user) {
    categories = db.prepare(
      `SELECT products.category AS category, COUNT(*) AS hits
       FROM product_views
       JOIN products ON products.id = product_views.product_id
       WHERE product_views.user_id = ? AND products.category IS NOT NULL
       GROUP BY products.category
       ORDER BY hits DESC
       LIMIT 3`
    ).all(req.user.id).map((r) => r.category);
  }

  let rows;
  if (categories.length) {
    const placeholders = categories.map(() => '?').join(', ');
    rows = db.prepare(
      `${PRODUCT_SELECT} WHERE products.category IN (${placeholders})
       ORDER BY products.created_at DESC LIMIT 12`
    ).all(...categories);
  } else {
    rows = db.prepare(`${PRODUCT_SELECT} ORDER BY products.created_at DESC LIMIT 12`).all();
  }
  res.json(rows);
});

router.get('/:id', optionalAuth, (req, res) => {
  const product = db.prepare(`${PRODUCT_SELECT} WHERE products.id = ?`).get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  if (req.user) {
    db.prepare('INSERT INTO product_views (user_id, product_id) VALUES (?, ?)').run(req.user.id, product.id);
  }

  res.json(product);
});

router.post('/', requireAuth, requireRole('merchant'), (req, res) => {
  const store = storeForOwner(req.user.id);
  if (!store) return res.status(400).json({ error: 'No tienes una tienda asociada' });

  const { name, description, category, price, stock, acceptsOffers, freeShipping, imageUrl, imageUrlAlt } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'name y price son obligatorios' });
  }

  const info = db.prepare(
    `INSERT INTO products
       (store_id, name, description, category, price, stock, accepts_offers, free_shipping, image_url, image_url_alt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    store.id, name, description || null, category || null, price, stock || 0,
    acceptsOffers ? 1 : 0, freeShipping ? 1 : 0, imageUrl || null, imageUrlAlt || null
  );

  res.status(201).json(db.prepare(`${PRODUCT_SELECT} WHERE products.id = ?`).get(info.lastInsertRowid));
});

router.put('/:id', requireAuth, requireRole('merchant'), (req, res) => {
  const store = storeForOwner(req.user.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product || product.store_id !== store.id) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const fields = ['name', 'description', 'category', 'price', 'stock', 'image_url', 'image_url_alt'];
  const bodyKeyByField = { image_url: 'imageUrl', image_url_alt: 'imageUrlAlt' };
  const updates = fields.filter((f) => req.body[bodyKeyByField[f] || f] !== undefined);
  if (req.body.acceptsOffers !== undefined) {
    db.prepare('UPDATE products SET accepts_offers = ? WHERE id = ?')
      .run(req.body.acceptsOffers ? 1 : 0, product.id);
  }
  if (req.body.freeShipping !== undefined) {
    db.prepare('UPDATE products SET free_shipping = ? WHERE id = ?')
      .run(req.body.freeShipping ? 1 : 0, product.id);
  }
  if (updates.length) {
    const setClause = updates.map((f) => `${f} = ?`).join(', ');
    db.prepare(`UPDATE products SET ${setClause} WHERE id = ?`)
      .run(...updates.map((f) => req.body[bodyKeyByField[f] || f]), product.id);
  }

  res.json(db.prepare(`${PRODUCT_SELECT} WHERE products.id = ?`).get(product.id));
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
