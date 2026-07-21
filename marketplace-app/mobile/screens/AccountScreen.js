import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';

export default function AccountScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      api.listOrders(token).then(setOrders).catch((e) => setError(e.message));
      api.listNotifications(token).then(setNotifications).catch((e) => setError(e.message));
    }, [token])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h2}>Mi cuenta</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.card}>
        <Text style={styles.h3}>Notificaciones</Text>
        {notifications.length === 0 && <Text>No tienes notificaciones.</Text>}
        {notifications.map((n) => (
          <View key={n.id} style={[styles.row, !n.read && styles.unread]}>
            <Text style={{ flex: 1 }}>{n.message}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.h3}>Mis pedidos</Text>
        {orders.length === 0 && <Text>No tienes pedidos todavía.</Text>}
        {orders.map((o) => (
          <View key={o.id} style={styles.row}>
            <Text>Pedido #{o.id} · ${o.total} · {o.status}</Text>
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
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  unread: { backgroundColor: '#eff6ff' },
  error: { color: '#b91c1c', marginBottom: 10 },
});
