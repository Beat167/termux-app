const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json(
    db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  );
});

router.post('/:id/read', requireAuth, (req, res) => {
  const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  if (!notification || notification.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Notificación no encontrada' });
  }
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(notification.id);
  res.json({ ...notification, read: 1 });
});

module.exports = router;
