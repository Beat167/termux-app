import { useCallback, useState } from 'react';
import { View, Text, TextInput, Button, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radius, cardShadow } from '../src/theme';

const ORDER_STATUSES = ['confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'];
const CATEGORIES = ['tecnologia', 'moda', 'hogar', 'motor', 'bienestar'];

const emptyProduct = {
  name: '', price: '', stock: '', category: '', acceptsOffers: false,
  freeShipping: false, imageUrl: '', imageUrlAlt: '',
};

export default function MerchantScreen() {
  const { token } = useAuth();
  const [product, setProduct] = useState(emptyProduct);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [counterAmounts, setCounterAmounts] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(() => {
    api.listOffers(token).then(setOffers).catch((e) => setError(e.message));
    api.listOrders(token).then(setOrders).catch((e) => setError(e.message));
  }, [token]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  async function handleCreateProduct() {
    setError(''); setMessage('');
    try {
      await api.createProduct(
        { ...product, price: Number(product.price), stock: Number(product.stock) },
        token
      );
      setMessage('Producto publicado.');
      setProduct(emptyProduct);
    } catch (e) { setError(e.message); }
  }

  async function respond(offerId, action) {
    try {
      const amount = action === 'counter' ? Number(counterAmounts[offerId]) : undefined;
      if (action === 'counter' && !amount) {
        setError('Escribe el nuevo monto antes de contraofertar.');
        return;
      }
      await api.respondOffer(offerId, action === 'counter' ? { action, amount } : { action }, token);
      refresh();
    } catch (e) { setError(e.message); }
  }

  async function changeStatus(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, token);
      refresh();
    } catch (e) { setError(e.message); }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h2}>Panel del comerciante</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!message && <Text style={styles.success}>{message}</Text>}

      <View style={styles.card}>
        <Text style={styles.h3}>Publicar producto</Text>
        <TextInput style={styles.input} placeholder="Nombre" value={product.name} onChangeText={(v) => setProduct({ ...product, name: v })} />
        <TextInput style={styles.input} placeholder="Precio" keyboardType="numeric" value={product.price} onChangeText={(v) => setProduct({ ...product, price: v })} />
        <TextInput style={styles.input} placeholder="Stock" keyboardType="numeric" value={product.stock} onChangeText={(v) => setProduct({ ...product, stock: v })} />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, product.category === c && styles.chipActive]}
              onPress={() => setProduct({ ...product, category: product.category === c ? '' : c })}
            >
              <Text style={[styles.chipText, product.category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="URL de la foto principal" value={product.imageUrl} onChangeText={(v) => setProduct({ ...product, imageUrl: v })} />
        <TextInput style={styles.input} placeholder="URL de foto secundaria (opcional)" value={product.imageUrlAlt} onChangeText={(v) => setProduct({ ...product, imageUrlAlt: v })} />

        <View style={styles.row}>
          <Text>Acepta regateo</Text>
          <Switch value={product.acceptsOffers} onValueChange={(v) => setProduct({ ...product, acceptsOffers: v })} />
        </View>
        <View style={styles.row}>
          <Text>Envío gratis</Text>
          <Switch value={product.freeShipping} onValueChange={(v) => setProduct({ ...product, freeShipping: v })} />
        </View>
        <Button title="Publicar" onPress={handleCreateProduct} />
      </View>

      <View style={styles.card}>
        <Text style={styles.h3}>Ofertas recibidas</Text>
        {offers.length === 0 && <Text>Sin ofertas todavía.</Text>}
        {offers.map((o) => (
          <View key={o.id} style={styles.offerRow}>
            <Text>{o.product_name}: ${o.amount} ({o.status})</Text>
            {o.status === 'pending' && o.last_actor === 'customer' && (
              <>
                <View style={styles.row}>
                  <Button title="Aceptar" onPress={() => respond(o.id, 'accept')} />
                  <Button title="Rechazar" onPress={() => respond(o.id, 'reject')} />
                </View>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.counterInput]}
                    placeholder="Nuevo monto"
                    keyboardType="numeric"
                    value={counterAmounts[o.id] || ''}
                    onChangeText={(v) => setCounterAmounts({ ...counterAmounts, [o.id]: v })}
                  />
                  <Button title="Contraofertar" onPress={() => respond(o.id, 'counter')} />
                </View>
              </>
            )}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.h3}>Pedidos</Text>
        {orders.length === 0 && <Text>Sin pedidos todavía.</Text>}
        {orders.map((o) => (
          <View key={o.id} style={styles.offerRow}>
            <Text>Pedido #{o.id} · ${o.total} · {o.status}</Text>
            <View style={styles.row}>
              {ORDER_STATUSES.map((s) => (
                <Text key={s} onPress={() => changeStatus(o.id, s)} style={styles.statusOption}>
                  {s}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: colors.bgAlt },
  h2: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  h3: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, padding: 14, marginBottom: 14, ...cardShadow },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10, marginBottom: 10 },
  counterInput: { flex: 1, marginBottom: 0, marginRight: 8 },
  label: { fontWeight: '600', color: colors.textMuted, fontSize: 13, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { fontSize: 12, color: colors.textMuted },
  chipTextActive: { color: colors.accentDark, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8, flexWrap: 'wrap', gap: 6 },
  offerRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  statusOption: { color: colors.accentDark, marginRight: 10, fontSize: 12 },
  error: { color: '#b91c1c', marginBottom: 10 },
  success: { color: colors.accentDark, marginBottom: 10 },
});
