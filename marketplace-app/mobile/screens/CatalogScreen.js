import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';

export default function CatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const load = useCallback(() => {
    api.listProducts(search).then(setProducts).catch(() => {});
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        {user ? (
          <Button title="Salir" onPress={logout} />
        ) : (
          <Button title="Entrar" onPress={() => navigation.navigate('Login')} />
        )}
      </View>
      {user?.role === 'merchant' && (
        <Button title="Ir a mi tienda" onPress={() => navigation.navigate('Merchant')} />
      )}
      {user?.role === 'customer' && (
        <Button title="Mi cuenta" onPress={() => navigation.navigate('Account')} />
      )}

      <TextInput
        style={styles.search}
        placeholder="Buscar productos..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>No hay productos todavía.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Product', { id: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.store}>{item.store_name}</Text>
            <Text style={styles.price}>${item.price}</Text>
            {!!item.accepts_offers && <Text style={styles.badge}>Acepta regateo</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: '#f5f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 12, backgroundColor: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold' },
  store: { color: '#666', fontSize: 13 },
  price: { fontWeight: 'bold', marginTop: 4 },
  badge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#fef3c7', color: '#92400e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 12 },
});
