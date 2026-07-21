import { useState } from 'react';
import { useCart } from '../cart';
import { api } from '../api/client';

export default function CartPage() {
  const { groupedByStore, removeFromCart, clearStore } = useCart();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function checkout(group) {
    setError(''); setMessage('');
    try {
      await api.createOrder({
        items: group.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        address: 'Dirección de ejemplo',
      });
      clearStore(group.storeId);
      setMessage(`Pedido confirmado con ${group.storeName}.`);
    } catch (e) {
      setError(e.message);
    }
  }

  if (groupedByStore.length === 0) {
    return (
      <div>
        <h2>Mi carrito</h2>
        <p>Tu carrito está vacío. Explora el catálogo y añade productos de tiendas oficiales.</p>
      </div>
    );
  }

  const official = groupedByStore.filter((g) => g.storeType === 'tienda_oficial');
  const local = groupedByStore.filter((g) => g.storeType === 'mercado_local');

  return (
    <div>
      <h2>Mi carrito</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {!!official.length && (
        <div className="card">
          <p className="cart-group-title">Productos gestionados por Tiendas</p>
          <p className="cart-group-sub">Paga aquí de forma segura.</p>
          {official.map((group) => (
            <div key={group.storeId} className="cart-group">
              <p style={{ fontWeight: 700 }}>{group.storeName}</p>
              {group.items.map((i) => (
                <div key={i.product.id} className="cart-line">
                  <span>{i.product.name} × {i.quantity}</span>
                  <span>
                    ${(i.product.price * i.quantity).toFixed(2)}{' '}
                    <button className="secondary" onClick={() => removeFromCart(i.product.id)}>Quitar</button>
                  </span>
                </div>
              ))}
              <div className="cart-total">
                <span>Total</span>
                <span>${group.total.toFixed(2)}</span>
              </div>
              <button onClick={() => checkout(group)} style={{ marginTop: 10, width: '100%' }}>
                Pagar pedido de {group.storeName}
              </button>
            </div>
          ))}
        </div>
      )}

      {!!local.length && (
        <div className="card">
          <p className="cart-group-title">Contactos pendientes de Marketplace</p>
          <p className="cart-group-sub">Coordina la entrega directamente con el vendedor.</p>
          {local.map((group) => (
            <div key={group.storeId} className="cart-group">
              <p style={{ fontWeight: 700 }}>{group.storeName}</p>
              {group.items.map((i) => (
                <div key={i.product.id} className="cart-line">
                  <span>{i.product.name} × {i.quantity}</span>
                  <span>
                    ${(i.product.price * i.quantity).toFixed(2)}{' '}
                    <button className="secondary" onClick={() => removeFromCart(i.product.id)}>Quitar</button>
                  </span>
                </div>
              ))}
              <div className="cart-total">
                <span>Total</span>
                <span>${group.total.toFixed(2)}</span>
              </div>
              <button onClick={() => checkout(group)} style={{ marginTop: 10, width: '100%' }}>
                Coordinar pedido con {group.storeName}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
