import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AccountPage() {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listOrders().then(setOrders).catch((e) => setError(e.message));
    api.listNotifications().then(setNotifications).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h2>Mi cuenta</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Notificaciones</h3>
        {notifications.length === 0 && <p>No tienes notificaciones.</p>}
        {notifications.map((n) => (
          <div key={n.id} className={`row ${n.read ? '' : 'unread'}`}>
            <span>{n.message}</span>
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Mis pedidos</h3>
        {orders.length === 0 && <p>No tienes pedidos todavía.</p>}
        {orders.map((o) => (
          <div key={o.id} className="row">
            <span>
              Pedido #{o.id} · ${o.total} · estado: {o.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
