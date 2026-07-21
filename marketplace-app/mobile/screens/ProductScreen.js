import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';

export default function ProductScreen({ route }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (!product) return <Text style={styles.padded}>Cargando...</Text>;

  async function handleReserve() {
    setError(''); setMessage('');
    try {
      const r = await api.createReservation({ productId: product.id, quantity: Number(quantity) }, token);
      setMessage(`Reservado hasta ${new Date(r.expires_at).toLocaleString()}.`);
    } catch (e) { setError(e.message); }
  }

  async function handleOrder() {
    setError(''); setMessage('');
    try {
      await api.createOrder(
        { items: [{ productId: product.id, quantity: Number(quantity) }], address: 'Dirección de ejemplo' },
        token
      );
      setMessage('¡Pedido creado!');
    } catch (e) { setError(e.message); }
  }

  async function handleOffer() {
    setError(''); setMessage('');
    try {
      await api.createOffer({ productId: product.id, amount: Number(offerAmount) }, token);
      setMessage('Oferta enviada al comerciante.');
    } catch (e) { setError(e.message); }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.store}>{product.store_name}</Text>
      <Text>{product.description}</Text>
      <Text style={styles.price}>${product.price} · Stock: {product.stock}</Text>

      {!user && <Text style={{ marginTop: 12 }}>Inicia sesión para comprar, reservar u ofertar.</Text>}

      {user && (
        <>
          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <View style={styles.actions}>
            <Button title="Comprar" onPress={handleOrder} />
            <Button title="Reservar" onPress={handleReserve} />
          </View>

          {!!product.accepts_offers && (
            <View style={styles.offerBox}>
              <Text style={styles.label}>Tu oferta ($)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={offerAmount}
                onChangeText={setOfferAmount}
              />
              <Button title="Enviar oferta / regatear" onPress={handleOffer} />
            </View>
          )}
        </>
      )}

      {!!message && <Text style={styles.success}>{message}</Text>}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: '#fff' },
  padded: { padding: 16, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold' },
  store: { color: '#666', marginBottom: 8 },
  price: { fontWeight: 'bold', marginVertical: 10 },
  label: { marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  offerBox: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  success: { color: '#15803d', marginTop: 10 },
  error: { color: '#b91c1c', marginTop: 10 },
});
