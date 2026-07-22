import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image } from 'react-native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';
import { useCart } from '../src/CartContext';
import Reputation from '../src/components/Reputation';
import Collapsible from '../src/components/Collapsible';
import { colors, radius } from '../src/theme';

export default function ProductScreen({ route }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [offerAmount, setOfferAmount] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function loadReviews() {
    api.listReviews(id).then(setReviews).catch(() => {});
  }

  useEffect(() => {
    api.getProduct(id, token).then(setProduct).catch((e) => setError(e.message));
    loadReviews();
  }, [id]);

  if (!product) return <Text style={styles.padded}>Cargando...</Text>;

  const isOfficial = product.store_type === 'tienda_oficial';

  function handleAddToCart() {
    addToCart(product, Number(quantity));
    setMessage('Añadido al carrito.');
  }

  async function handleReserve() {
    setError(''); setMessage('');
    try {
      const r = await api.createReservation({ productId: product.id, quantity: Number(quantity) }, token);
      setMessage(`Reservado hasta ${new Date(r.expires_at).toLocaleString()}.`);
    } catch (e) { setError(e.message); }
  }

  async function handleOffer() {
    setError(''); setMessage('');
    try {
      await api.createOffer({ productId: product.id, amount: Number(offerAmount) }, token);
      setMessage('Oferta enviada al comerciante.');
    } catch (e) { setError(e.message); }
  }

  async function handleReview() {
    setError(''); setMessage('');
    try {
      await api.createReview({ productId: product.id, rating: Number(reviewRating), comment: reviewComment }, token);
      setReviewComment('');
      setMessage('¡Gracias por tu reseña!');
      loadReviews();
      api.getProduct(id, token).then(setProduct);
    } catch (e) { setError(e.message); }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.media}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} />
          ) : (
            <Text style={{ color: colors.textMuted }}>Sin foto</Text>
          )}
        </View>

        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.store}>{product.store_name} · {isOfficial ? 'Tienda oficial' : 'Mercado local'}</Text>
        <Reputation avgRating={product.avg_rating} reviewCount={product.review_count} />
        <Text style={styles.price}>${product.price}</Text>

        {!user && <Text style={{ marginBottom: 10 }}>Inicia sesión para comprar, reservar u ofertar.</Text>}

        {user && (
          <>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

            {!isOfficial && !!product.accepts_offers && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Tu oferta ($) — regatea el precio</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={offerAmount} onChangeText={setOfferAmount} />
                <Button title="Enviar oferta" onPress={handleOffer} />
              </View>
            )}
          </>
        )}

        <Collapsible title="Detalles del producto">
          <Text style={styles.bodyText}>{product.description || 'Sin descripción adicional.'}</Text>
        </Collapsible>

        <Collapsible title={`Reseñas (${reviews.length})`} defaultOpen>
          {reviews.length === 0 && <Text style={styles.bodyText}>Todavía no hay reseñas.</Text>}
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewRow}>
              <Text style={{ fontWeight: '700' }}>★ {r.rating} — {r.user_name}</Text>
              {!!r.comment && <Text style={styles.bodyText}>{r.comment}</Text>}
            </View>
          ))}
          {user && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Calificación (1-5)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={reviewRating} onChangeText={setReviewRating} />
              <Text style={styles.label}>Comentario (opcional)</Text>
              <TextInput style={styles.input} value={reviewComment} onChangeText={setReviewComment} multiline />
              <Button title="Publicar reseña" onPress={handleReview} />
            </View>
          )}
        </Collapsible>

        <Collapsible title="Política de devolución">
          <Text style={styles.bodyText}>
            {isOfficial
              ? 'Devoluciones dentro de 30 días para productos de tiendas oficiales.'
              : 'Este producto es vendido por un vendedor local; coordina la devolución directamente con él.'}
          </Text>
        </Collapsible>

        {!!message && <Text style={styles.success}>{message}</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <View style={{ height: 80 }} />
      </ScrollView>

      {user && (
        <View style={styles.stickyBar}>
          {isOfficial ? (
            <Button title="Añadir al carrito" onPress={handleAddToCart} />
          ) : (
            <Button title="Reservar" onPress={handleReserve} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: colors.bg },
  padded: { padding: 16, paddingTop: 50 },
  media: { aspectRatio: 1, backgroundColor: colors.bgAlt, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 14 },
  image: { width: '100%', height: '100%' },
  title: { fontSize: 22, fontWeight: '800' },
  store: { color: colors.textMuted, marginBottom: 6 },
  price: { fontWeight: '800', fontSize: 22, marginVertical: 10 },
  label: { marginTop: 10, marginBottom: 4, fontWeight: '600', color: colors.textMuted, fontSize: 13 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10, marginBottom: 10, backgroundColor: colors.bg },
  bodyText: { color: colors.textMuted, fontSize: 13 },
  reviewRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  success: { color: colors.accentDark, marginTop: 10 },
  error: { color: '#b91c1c', marginTop: 10 },
  stickyBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border, padding: 14 },
});
