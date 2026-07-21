import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import CategoryRail from '../components/CategoryRail';
import { useAuth } from '../auth';

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const { user } = useAuth();

  const [mode, setMode] = useState('tienda_oficial');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listProducts({ search, category, mode }).then(setProducts).catch((e) => setError(e.message));
  }, [search, category, mode]);

  useEffect(() => {
    if (user) {
      api.listRecommended().then(setRecommended).catch(() => {});
    }
  }, [user]);

  return (
    <div>
      <div className="mode-toggle">
        <button className={mode === 'tienda_oficial' ? 'active' : ''} onClick={() => setMode('tienda_oficial')}>
          Tiendas Oficiales
        </button>
        <button className={mode === 'mercado_local' ? 'active' : ''} onClick={() => setMode('mercado_local')}>
          Mercado Local
        </button>
      </div>

      <CategoryRail active={category} onSelect={setCategory} />
      <PromoBanner mode={mode} />

      {error && <p className="error">{error}</p>}

      <h3 className="section-title">
        {search ? `Resultados para "${search}"` : mode === 'tienda_oficial' ? 'Tiendas oficiales' : 'Cerca de ti'}
      </h3>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && <p>No hay productos todavía en este modo/categoría.</p>}
      </div>

      {!!recommended.length && (
        <>
          <h3 className="section-title">Inspirado en tus últimas búsquedas</h3>
          <div className="grid">
            {recommended.map((p) => (
              <ProductCard key={`rec-${p.id}`} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
