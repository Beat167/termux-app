import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth';

export default function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (!product) return error ? <p className="error">{error}</p> : <p>Cargando...</p>;

  async function handleReserve() {
    setError('');
    setMessage('');
    try {
      const r = await api.createReservation({ productId: product.id, quantity });
      setMessage(`Reservado hasta ${new Date(r.expires_at).toLocaleString()}.`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleOrder() {
    setError('');
    setMessage('');
    try {
      await api.createOrder({ items: [{ productId: product.id, quantity }], address: 'Dirección de ejemplo' });
      setMessage('¡Pedido creado!');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleOffer(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.createOffer({ productId: product.id, amount: Number(offerAmount) });
      setMessage('Oferta enviada al comerciante.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="card">
      <h2>{product.name}</h2>
      <p className="store">{product.store_name}</p>
      <p>{product.description}</p>
      <p className="price">${product.price} · Stock: {product.stock}</p>

      {!user && <p>Inicia sesión para comprar, reservar u ofertar.</p>}

      {user && (
        <>
          <label>
            Cantidad
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
          <div className="actions">
            <button onClick={handleOrder}>Comprar</button>
            <button onClick={handleReserve}>Reservar</button>
          </div>

          {!!product.accepts_offers && (
            <form onSubmit={handleOffer} className="offer-form">
              <label>
                Tu oferta ($)
                <input
                  type="number"
                  step="0.01"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Enviar oferta / regatear</button>
            </form>
          )}
        </>
      )}

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
