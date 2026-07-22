import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Reputation from './Reputation';
import { HeartIcon } from '../icons';
import { useFavorites } from '../FavoritesContext';
import { colors, radius, cardShadow } from '../theme';

export default function ProductCard({ product, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(product.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.media}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Sin foto</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={(e) => { e.stopPropagation?.(); toggleFavorite(product.id); }}
        >
          <HeartIcon size={16} color={fav ? colors.accentDark : colors.text} filled={fav} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.store}>{product.store_name}</Text>
        <Reputation avgRating={product.avg_rating} reviewCount={product.review_count} />
        <View style={styles.metaRow}>
          <Text style={styles.price}>${product.price}</Text>
          {product.store_type === 'tienda_oficial' ? (
            product.free_shipping ? (
              <View style={[styles.badge, styles.badgeShipping]}><Text style={styles.badgeShippingText}>Envío Gratis</Text></View>
            ) : null
          ) : (
            <View style={[styles.badge, styles.badgeLocal]}><Text style={styles.badgeLocalText}>Coordina entrega</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.lg, overflow: 'hidden', margin: 6, ...cardShadow },
  media: { aspectRatio: 1, backgroundColor: colors.bgAlt, position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  store: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 4 },
  price: { fontSize: 15, fontWeight: '800' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeShipping: { backgroundColor: colors.accentSoft },
  badgeShippingText: { color: colors.accentDark, fontSize: 10, fontWeight: '700' },
  badgeLocal: { backgroundColor: '#f3f4f6' },
  badgeLocalText: { color: '#374151', fontSize: 10, fontWeight: '700' },
});
