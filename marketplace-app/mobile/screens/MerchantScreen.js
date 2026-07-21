import { useCallback, useState } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';

const ORDER_STATUSES = ['confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'];

export default function MerchantScreen() {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [acceptsOffers, setAcceptsOffers] = useState(false);
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
        { name, price: Number(price), stock: Number(stock), category, acceptsOffers },
        token
      );
      setMessage('Producto publicado.');
      setName(''); setPrice(''); setStock(''); setCategory(''); setAcceptsOffers(false);
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
        <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Precio" keyboardType="numeric" value={price} onChangeText={setPrice} />
        <TextInput style={styles.input} placeholder="Stock" keyboardType="numeric" value={stock} onChangeText={setStock} />
        <TextInput style={styles.input} placeholder="Categoría" value={category} onChangeText={setCategory} />
        <View style={styles.row}>
          <Text>Acepta regateo</Text>
          <Switch value={acceptsOffers} onValueChange={setAcceptsOffers} />
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
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: '#f5f6f8' },
  h2: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  h3: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  counterInput: { flex: 1, marginBottom: 0, marginRight: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8, flexWrap: 'wrap', gap: 6 },
  offerRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  statusOption: { color: '#2563eb', marginRight: 10, fontSize: 12 },
  error: { color: '#b91c1c', marginBottom: 10 },
  success: { color: '#15803d', marginBottom: 10 },
});
