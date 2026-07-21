import { useNavigate } from 'react-router-dom';
import Reputation from './Reputation';
import { HeartIcon } from '../icons';
import { useFavorites } from '../favorites';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(product.id);

  function go() {
    navigate(`/products/${product.id}`);
  }

  return (
    <div className="product-card" onClick={go} role="link" tabIndex={0}>
      <div className="product-media">
        {product.image_url ? (
          <>
            <img className="main" src={product.image_url} alt={product.name} />
            <img className="alt" src={product.image_url_alt || product.image_url} alt="" />
          </>
        ) : (
          <div className="placeholder">Sin foto</div>
        )}
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          aria-label="Favorito"
        >
          <HeartIcon filled={fav} />
        </button>
        <button className="quickview-btn" onClick={(e) => { e.stopPropagation(); go(); }}>
          Vista rápida
        </button>
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <p className="product-store">{product.store_name}</p>
        <Reputation avgRating={product.avg_rating} reviewCount={product.review_count} size="0.72rem" />
        <div className="product-meta-row">
          <span className="product-price">${product.price}</span>
          {product.store_type === 'tienda_oficial' ? (
            product.free_shipping ? <span className="badge badge-shipping">Envío Gratis</span> : null
          ) : (
            <span className="badge badge-local">Coordina entrega</span>
          )}
        </div>
        {!!product.accepts_offers && (
          <span className="badge badge-offers badge-local">Acepta regateo</span>
        )}
      </div>
    </div>
  );
}
