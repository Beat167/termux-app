import { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';
import ProductCard from '../src/components/ProductCard';
import CategoryRail from '../src/components/CategoryRail';
import PromoBanner from '../src/components/PromoBanner';
import { SearchIcon, BellIcon, CartIcon } from '../src/icons';
import { useCart } from '../src/CartContext';
import { colors, radius } from '../src/theme';

export default function CatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('tienda_oficial');
  const [category, setCategory] = useState('');
  const { user, token, logout } = useAuth();
  const { items } = useCart();

  const load = useCallback(() => {
    api.listProducts({ search, category, mode }, token).then(setProducts).catch(() => {});
    if (user) api.listRecommended(token).then(setRecommended).catch(() => {});
  }, [search, category, mode, token, user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Marketplace</Text>
        <View style={styles.headerIcons}>
          {user ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate(user.role === 'merchant' ? 'Merchant' : 'Account')}
              >
                <BellIcon size={18} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
                <CartIcon size={18} />
                {items.length > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{items.length}</Text></View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}><Text style={styles.link}>Salir</Text></TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.searchBar}>
        <SearchIcon size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en el universo de Marketplace..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'tienda_oficial' && styles.modeBtnActive]}
          onPress={() => setMode('tienda_oficial')}
        >
          <Text style={[styles.modeText, mode === 'tienda_oficial' && styles.modeTextActive]}>Tiendas Oficiales</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'mercado_local' && styles.modeBtnActive]}
          onPress={() => setMode('mercado_local')}
        >
          <Text style={[styles.modeText, mode === 'mercado_local' && styles.modeTextActive]}>Mercado Local</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={
          <>
            <CategoryRail active={category} onSelect={setCategory} />
            <PromoBanner mode={mode} />
          </>
        }
        ListEmptyComponent={<Text style={{ marginTop: 12 }}>No hay productos todavía en este modo/categoría.</Text>}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('Product', { id: item.id })} />
        )}
        ListFooterComponent={
          recommended.length ? (
            <View>
              <Text style={styles.sectionTitle}>Inspirado en tus últimas búsquedas</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {recommended.map((p) => (
                  <View key={`rec-${p.id}`} style={{ width: '50%' }}>
                    <ProductCard product={p} onPress={() => navigation.navigate('Product', { id: p.id })} />
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 50, backgroundColor: colors.bgAlt },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brand: { fontSize: 20, fontWeight: '800' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.accent, borderRadius: 999, minWidth: 15, height: 15, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '700' },
  link: { color: colors.accentDark, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14 },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.pill, padding: 4, marginBottom: 12, alignSelf: 'flex-start' },
  modeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  modeBtnActive: { backgroundColor: colors.text },
  modeText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  modeTextActive: { color: 'white' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginVertical: 12 },
});
