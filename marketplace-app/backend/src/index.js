require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const reservationRoutes = require('./routes/reservations');
const offerRoutes = require('./routes/offers');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET. Copia .env.example a .env y define un valor.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Error inesperado' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Marketplace API escuchando en http://localhost:${port}`));
