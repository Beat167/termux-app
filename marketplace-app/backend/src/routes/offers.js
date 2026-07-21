const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { notify } = require('../notifications');

const router = express.Router();

function isMerchantOwner(userId, productId) {
  const row = db.prepare(
    `SELECT stores.owner_id FROM products
     JOIN stores ON stores.id = products.store_id WHERE products.id = ?`
  ).get(productId);
  return row && row.owner_id === userId;
}

router.post('/', requireAuth, (req, res) => {
  const { productId, amount } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  if (!product.accepts_offers) {
    return res.status(400).json({ error: 'Este producto no acepta regateo' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount debe ser mayor a 0' });
  }

  const info = db.prepare(
    `INSERT INTO offers (product_id, user_id, amount, last_actor) VALUES (?, ?, ?, 'customer')`
  ).run(product.id, req.user.id, amount);

  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(product.store_id);
  notify(store.owner_id, 'offer_created', `Nueva oferta de $${amount} por "${product.name}".`);

  res.status(201).json(db.prepare('SELECT * FROM offers WHERE id = ?').get(info.lastInsertRowid));
});

// Ofertas que el usuario hizo (customer) o que recibió en sus productos (merchant)
router.get('/', requireAuth, (req, res) => {
  if (req.user.role === 'merchant') {
    const rows = db.prepare(
      `SELECT offers.*, products.name AS product_name FROM offers
       JOIN products ON products.id = offers.product_id
       JOIN stores ON stores.id = products.store_id
       WHERE stores.owner_id = ? ORDER BY offers.updated_at DESC`
    ).all(req.user.id);
    return res.json(rows);
  }
  const rows = db.prepare(
    `SELECT offers.*, products.name AS product_name FROM offers
     JOIN products ON products.id = offers.product_id
     WHERE offers.user_id = ? ORDER BY offers.updated_at DESC`
  ).all(req.user.id);
  res.json(rows);
});

router.put('/:id', requireAuth, (req, res) => {
  const { action, amount } = req.body; // action: accept | reject | counter
  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Oferta no encontrada' });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(offer.product_id);
  const merchantOwns = isMerchantOwner(req.user.id, offer.product_id);
  const isCustomerOwner = offer.user_id === req.user.id;

  if (!merchantOwns && !isCustomerOwner) {
    return res.status(403).json({ error: 'No autorizado sobre esta oferta' });
  }
  if (offer.status !== 'pending') {
    return res.status(400).json({ error: `La oferta ya está en estado ${offer.status}` });
  }

  let newStatus = offer.status;
  let newAmount = offer.amount;
  let newActor = offer.last_actor;

  if (action === 'accept') {
    if (offer.last_actor === (merchantOwns ? 'merchant' : 'customer')) {
      return res.status(400).json({ error: 'Espera la respuesta de la otra parte antes de aceptar' });
    }
    newStatus = 'accepted';
  } else if (action === 'reject') {
    newStatus = 'rejected';
  } else if (action === 'counter') {
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount es obligatorio para contraofertar' });
    newAmount = amount;
    newActor = merchantOwns ? 'merchant' : 'customer';
  } else {
    return res.status(400).json({ error: 'action debe ser accept, reject o counter' });
  }

  db.prepare(
    `UPDATE offers SET status = ?, amount = ?, last_actor = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(newStatus, newAmount, newActor, offer.id);

  const updated = db.prepare('SELECT * FROM offers WHERE id = ?').get(offer.id);

  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(product.store_id);
  const notifyUserId = merchantOwns ? offer.user_id : store.owner_id;
  const label = { accept: 'aceptada', reject: 'rechazada', counter: 'contraofertada' }[action];
  notify(notifyUserId, `offer_${action}`, `Tu oferta por "${product.name}" fue ${label}.`);

  res.json(updated);
});

module.exports = router;
