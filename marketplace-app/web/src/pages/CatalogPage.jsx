import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.listProducts(search).then(setProducts).catch((e) => setError(e.message));
  }, [search]);

  return (
    <div>
      <input
        className="search"
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="product-card">
            <h3>{p.name}</h3>
            <p className="store">{p.store_name}</p>
            <p className="price">${p.price}</p>
            {!!p.accepts_offers && <span className="badge">Acepta regateo</span>}
          </Link>
        ))}
        {products.length === 0 && <p>No hay productos todavía.</p>}
      </div>
    </div>
  );
}
