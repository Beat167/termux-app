import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { SearchIcon, FilterIcon, BellIcon, CartIcon } from '../icons';

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(search)}`);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">Marketplace</Link>

        <form className="search-bar" onSubmit={handleSubmit}>
          <SearchIcon />
          <input
            placeholder="Buscar en el universo de Marketplace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="header-icons">
          <button type="button" className="icon-btn" aria-label="Filtros" onClick={handleSubmit}>
            <FilterIcon />
          </button>

          {user && (
            <>
              <Link className="icon-btn" to={user.role === 'merchant' ? '/merchant' : '/account'} aria-label="Notificaciones">
                <BellIcon />
              </Link>
              <Link className="icon-btn" to="/cart" aria-label="Carrito">
                <CartIcon />
                {items.length > 0 && <span className="icon-badge">{items.length}</span>}
              </Link>
            </>
          )}

          {user ? (
            <>
              <span className="who">Hola, {user.name}</span>
              <button className="secondary" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <Link to="/login"><button>Entrar</button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
