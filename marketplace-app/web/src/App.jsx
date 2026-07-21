import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import MerchantPage from './pages/MerchantPage';
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';

export default function App() {
  return (
    <>
      <Header />
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/merchant" element={<MerchantPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
