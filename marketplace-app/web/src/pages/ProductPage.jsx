import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import Reputation from '../components/Reputation';

export default function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [offerAmount, setOfferAmount] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function loadReviews() {
    api.listReviews(id).then(setReviews).catch(() => {});
  }

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch((e) => setError(e.message));
    loadReviews();
  }, [id]);

  if (!product) return error ? <p className="error">{error}</p> : <p>Cargando...</p>;

  const isOfficial = product.store_type === 'tienda_oficial';

  async function handleAddToCart() {
    addToCart(product, quantity);
    setMessage('Añadido al carrito.');
    setError('');
  }

  async function handleReserve() {
    setError(''); setMessage('');
    try {
      const r = await api.createReservation({ productId: product.id, quantity });
      setMessage(`Reservado hasta ${new Date(r.expires_at).toLocaleString()}.`);
    } catch (e) { setError(e.message); }
  }

  async function handleOffer(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.createOffer({ productId: product.id, amount: Number(offerAmount) });
      setMessage('Oferta enviada al comerciante.');
    } catch (e) { setError(e.message); }
  }

  async function handleReview(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.createReview({ productId: product.id, rating: Number(reviewRating), comment: reviewComment });
      setReviewComment('');
      setMessage('¡Gracias por tu reseña!');
      loadReviews();
      api.getProduct(id).then(setProduct);
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="product-detail">
      <div className="detail-media">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="placeholder" style={{ height: '100%' }}>Sin foto</div>
        )}
      </div>

      <div>
        <h1 className="detail-title">{product.name}</h1>
        <p className="product-store">{product.store_name} · {isOfficial ? 'Tienda oficial' : 'Mercado local'}</p>
        <Reputation avgRating={product.avg_rating} reviewCount={product.review_count} />
        <p className="detail-price">${product.price}</p>

        {user && (
          <label style={{ maxWidth: 120 }}>
            Cantidad
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </label>
        )}

        {!user && <p>Inicia sesión para comprar, reservar u ofertar.</p>}

        {user && !isOfficial && (
          <div className="actions">
            <button className="secondary" onClick={handleReserve}>Reservar</button>
          </div>
        )}

        {user && !isOfficial && !!product.accepts_offers && (
          <form onSubmit={handleOffer} className="offer-form">
            <label>
              Tu oferta ($) — regatea el precio
              <input type="number" step="0.01" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} required />
            </label>
            <button type="submit" className="secondary">Enviar oferta</button>
          </form>
        )}

        <details className="collapsible">
          <summary>Detalles del producto</summary>
          <div className="collapsible-body">{product.description || 'Sin descripción adicional.'}</div>
        </details>

        <details className="collapsible" open>
          <summary>Reseñas ({reviews.length})</summary>
          <div className="collapsible-body">
            {reviews.length === 0 && <p>Todavía no hay reseñas.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="review-row">
                <strong>★ {r.rating}</strong> — {r.user_name}
                {r.comment && <p style={{ margin: '4px 0 0' }}>{r.comment}</p>}
              </div>
            ))}
            {user && (
              <form onSubmit={handleReview} style={{ marginTop: 12 }}>
                <label>
                  Calificación
                  <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrellas</option>)}
                  </select>
                </label>
                <label>
                  Comentario (opcional)
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={2} />
                </label>
                <button type="submit" className="secondary">Publicar reseña</button>
              </form>
            )}
          </div>
        </details>

        <details className="collapsible">
          <summary>Política de devolución</summary>
          <div className="collapsible-body">
            {isOfficial
              ? 'Devoluciones dentro de 30 días para productos de tiendas oficiales.'
              : 'Este producto es vendido por un vendedor local; coordina la devolución directamente con él.'}
          </div>
        </details>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      {user && (
        <div className="sticky-action-bar">
          {isOfficial ? (
            <button onClick={handleAddToCart}>Añadir al carrito</button>
          ) : (
            <button onClick={handleReserve}>Reservar</button>
          )}
        </div>
      )}
    </div>
  );
}
