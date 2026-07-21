import { useEffect, useState } from 'react';
import { api } from '../api/client';

const ORDER_STATUSES = ['confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'];

export default function MerchantPage() {
  const [product, setProduct] = useState({
    name: '', price: '', stock: '', category: '', acceptsOffers: false,
    freeShipping: false, imageUrl: '', imageUrlAlt: '',
  });
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function refresh() {
    api.listOffers().then(setOffers).catch((e) => setError(e.message));
    api.listOrders().then(setOrders).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function handleCreateProduct(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.createProduct({
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      });
      setMessage('Producto publicado.');
      setProduct({ name: '', price: '', stock: '', category: '', acceptsOffers: false, freeShipping: false, imageUrl: '', imageUrlAlt: '' });
    } catch (e) {
      setError(e.message);
    }
  }

  async function respond(offerId, action) {
    try {
      await api.respondOffer(offerId, action === 'counter' ? { action, amount: prompt('Nuevo monto:') } : { action });
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeStatus(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Panel del comerciante</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        <h3>Publicar producto</h3>
        <form onSubmit={handleCreateProduct}>
          <label>
            Nombre
            <input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required />
          </label>
          <label>
            Precio
            <input
              type="number"
              step="0.01"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              required
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: e.target.value })}
              required
            />
          </label>
          <label>
            Categoría
            <select value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })}>
              <option value="">Sin categoría</option>
              <option value="tecnologia">Tecnología</option>
              <option value="moda">Moda</option>
              <option value="hogar">Hogar</option>
              <option value="motor">Motor</option>
              <option value="bienestar">Bienestar</option>
            </select>
          </label>
          <label>
            URL de la foto principal
            <input
              placeholder="https://..."
              value={product.imageUrl}
              onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
            />
          </label>
          <label>
            URL de foto secundaria (se muestra al pasar el cursor)
            <input
              placeholder="https://..."
              value={product.imageUrlAlt}
              onChange={(e) => setProduct({ ...product, imageUrlAlt: e.target.value })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={product.acceptsOffers}
              onChange={(e) => setProduct({ ...product, acceptsOffers: e.target.checked })}
            />
            Acepta regateo
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={product.freeShipping}
              onChange={(e) => setProduct({ ...product, freeShipping: e.target.checked })}
            />
            Envío gratis
          </label>
          <button type="submit">Publicar</button>
        </form>
      </div>

      <div className="card">
        <h3>Ofertas recibidas</h3>
        {offers.length === 0 && <p>Sin ofertas todavía.</p>}
        {offers.map((o) => (
          <div key={o.id} className="row">
            <span>
              {o.product_name}: ${o.amount} ({o.status}, último en mover: {o.last_actor})
            </span>
            {o.status === 'pending' && o.last_actor === 'customer' && (
              <span className="actions">
                <button onClick={() => respond(o.id, 'accept')}>Aceptar</button>
                <button onClick={() => respond(o.id, 'counter')}>Contraofertar</button>
                <button onClick={() => respond(o.id, 'reject')}>Rechazar</button>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Pedidos</h3>
        {orders.length === 0 && <p>Sin pedidos todavía.</p>}
        {orders.map((o) => (
          <div key={o.id} className="row">
            <span>
              Pedido #{o.id} · ${o.total} · estado: {o.status}
            </span>
            <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
              <option value={o.status} disabled>
                {o.status}
              </option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
