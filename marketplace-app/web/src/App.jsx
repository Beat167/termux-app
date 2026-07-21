import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import MerchantPage from './pages/MerchantPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app">
      <header>
        <Link to="/" className="brand">
          Marketplace
        </Link>
        <nav>
          {user?.role === 'merchant' && <Link to="/merchant">Mi tienda</Link>}
          {user?.role === 'customer' && <Link to="/account">Mi cuenta</Link>}
          {user ? (
            <>
              <span className="who">Hola, {user.name}</span>
              <button onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/merchant" element={<MerchantPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </main>
    </div>
  );
}
