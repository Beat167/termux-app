const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { notify } = require('../notifications');

const router = express.Router();

const STATUS_MESSAGES = {
  confirmado: 'Tu pedido fue confirmado.',
  en_preparacion: 'Tu pedido se está preparando.',
  en_camino: 'El repartidor ya salió, tu pedido está en camino.',
  entregado: 'Tu pedido fue entregado. ¡Gracias por tu compra!',
  cancelado: 'Tu pedido fue cancelado.',
};

router.post('/', requireAuth, (req, res) => {
  const { items, address } = req.body; // items: [{ productId, quantity }]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items no puede estar vacío' });
  }

  const products = items.map(({ productId, quantity }) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) throw new Error(`Producto ${productId} no encontrado`);
    if (product.stock < quantity) throw new Error(`Stock insuficiente para "${product.name}"`);
    return { product, quantity };
  });

  const storeIds = new Set(products.map((p) => p.product.store_id));
  if (storeIds.size > 1) {
    return res.status(400).json({ error: 'Todos los productos del pedido deben ser de la misma tienda' });
  }
  const storeId = [...storeIds][0];
  const total = products.reduce((sum, p) => sum + p.product.price * p.quantity, 0);

  const insertOrder = db.prepare(
    'INSERT INTO orders (user_id, store_id, total, address) VALUES (?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );
  const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

  db.exec('BEGIN');
  let orderId;
  try {
    const info = insertOrder.run(req.user.id, storeId, total, address || null);
    orderId = info.lastInsertRowid;
    for (const { product, quantity } of products) {
      insertItem.run(orderId, product.id, quantity, product.price);
      decrementStock.run(quantity, product.id);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(storeId);
  notify(store.owner_id, 'order_created', `Nuevo pedido #${orderId} recibido.`);

  res.status(201).json(getOrderWithItems(orderId));
});

function getOrderWithItems(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare(
    `SELECT order_items.*, products.name AS product_name FROM order_items
     JOIN products ON products.id = order_items.product_id WHERE order_id = ?`
  ).all(orderId);
  return { ...order, items };
}

router.get('/', requireAuth, (req, res) => {
  let orderIds;
  if (req.user.role === 'merchant') {
    const store = db.prepare('SELECT * FROM stores WHERE owner_id = ?').get(req.user.id);
    orderIds = db.prepare('SELECT id FROM orders WHERE store_id = ? ORDER BY created_at DESC').all(store?.id || 0);
  } else {
    orderIds = db.prepare('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  }
  res.json(orderIds.map((row) => getOrderWithItems(row.id)));
});

router.put('/:id/status', requireAuth, requireRole('merchant'), (req, res) => {
  const { status } = req.body;
  if (!STATUS_MESSAGES[status]) {
    return res.status(400).json({ error: `status debe ser uno de: ${Object.keys(STATUS_MESSAGES).join(', ')}` });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(order?.store_id);
  if (!order || store.owner_id !== req.user.id) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, order.id);
  notify(order.user_id, 'order_status', STATUS_MESSAGES[status]);

  res.json(getOrderWithItems(order.id));
});

module.exports = router;
