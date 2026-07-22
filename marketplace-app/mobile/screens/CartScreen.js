import { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useCart } from '../src/CartContext';
import { useAuth } from '../src/AuthContext';
import { api } from '../src/api';
import { colors, radius, cardShadow } from '../src/theme';

function CartGroupCard({ group, onCheckout, onRemove }) {
  return (
    <View style={styles.card}>
      <Text style={styles.storeName}>{group.storeName}</Text>
      {group.items.map((i) => (
        <View key={i.product.id} style={styles.line}>
          <Text style={{ flex: 1 }}>{i.product.name} × {i.quantity}</Text>
          <Text>${(i.product.price * i.quantity).toFixed(2)}</Text>
          <Text style={styles.remove} onPress={() => onRemove(i.product.id)}>Quitar</Text>
        </View>
      ))}
      <View style={styles.total}>
        <Text style={{ fontWeight: '800' }}>Total</Text>
        <Text style={{ fontWeight: '800' }}>${group.total.toFixed(2)}</Text>
      </View>
      <Button title={onCheckout.label} onPress={() => onCheckout.fn(group)} />
    </View>
  );
}

export default function CartScreen() {
  const { groupedByStore, removeFromCart, clearStore } = useCart();
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function checkout(group) {
    setError(''); setMessage('');
    try {
      await api.createOrder(
        { items: group.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })), address: 'Dirección de ejemplo' },
        token
      );
      clearStore(group.storeId);
      setMessage(`Pedido confirmado con ${group.storeName}.`);
    } catch (e) { setError(e.message); }
  }

  const official = groupedByStore.filter((g) => g.storeType === 'tienda_oficial');
  const local = groupedByStore.filter((g) => g.storeType === 'mercado_local');

  if (groupedByStore.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.h2}>Mi carrito</Text>
        <Text>Tu carrito está vacío. Explora el catálogo y añade productos de tiendas oficiales.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h2}>Mi carrito</Text>
      {!!message && <Text style={styles.success}>{message}</Text>}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {!!official.length && (
        <>
          <Text style={styles.sectionTitle}>Productos gestionados por Tiendas</Text>
          <Text style={styles.sectionSub}>Paga aquí de forma segura.</Text>
          {official.map((g) => (
            <CartGroupCard
              key={g.storeId}
              group={g}
              onRemove={removeFromCart}
              onCheckout={{ label: `Pagar pedido de ${g.storeName}`, fn: checkout }}
            />
          ))}
        </>
      )}

      {!!local.length && (
        <>
          <Text style={styles.sectionTitle}>Contactos pendientes de Marketplace</Text>
          <Text style={styles.sectionSub}>Coordina la entrega directamente con el vendedor.</Text>
          {local.map((g) => (
            <CartGroupCard
              key={g.storeId}
              group={g}
              onRemove={removeFromCart}
              onCheckout={{ label: `Coordinar pedido con ${g.storeName}`, fn: checkout }}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: colors.bgAlt },
  h2: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  sectionTitle: { fontWeight: '800', fontSize: 15, marginTop: 8 },
  sectionSub: { color: colors.textMuted, fontSize: 12, marginBottom: 10 },
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, padding: 14, marginBottom: 14, ...cardShadow },
  storeName: { fontWeight: '700', marginBottom: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  remove: { color: '#b91c1c', fontSize: 12 },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 10 },
  success: { color: colors.accentDark, marginBottom: 10 },
  error: { color: '#b91c1c', marginBottom: 10 },
});
