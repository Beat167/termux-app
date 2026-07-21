import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '' });
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = mode === 'register' ? { ...form, role } : { email: form.email, password: form.password };
      const result = mode === 'register' ? await api.register(payload) : await api.login(payload);
      auth.login(result.token, result.user);
      navigate(result.user.role === 'merchant' ? '/merchant' : '/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <div className="tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Iniciar sesión
        </button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          Registrarme
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <label>
              Nombre
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Soy:
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Cliente</option>
                <option value="merchant">Comerciante</option>
              </select>
            </label>
            {role === 'merchant' && (
              <label>
                Nombre de la tienda
                <input
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  required
                />
              </label>
            )}
          </>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">{mode === 'register' ? 'Crear cuenta' : 'Entrar'}</button>
      </form>
    </div>
  );
}
