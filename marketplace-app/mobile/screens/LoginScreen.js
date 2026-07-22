import { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radius } from '../src/theme';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login');
  const [isMerchant, setIsMerchant] = useState(false);
  const [storeType, setStoreType] = useState('tienda_oficial');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();

  async function handleSubmit() {
    setError('');
    try {
      const role = isMerchant ? 'merchant' : 'customer';
      const result =
        mode === 'register'
          ? await api.register({ name, email, password, role, storeName, storeType })
          : await api.login({ email, password });
      await auth.login(result.token, result.user);
      navigation.replace(result.user.role === 'merchant' ? 'Merchant' : 'Catalog');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Text onPress={() => setMode('login')} style={[styles.tab, mode === 'login' && styles.tabActive]}>
          Iniciar sesión
        </Text>
        <Text onPress={() => setMode('register')} style={[styles.tab, mode === 'register' && styles.tabActive]}>
          Registrarme
        </Text>
      </View>

      {mode === 'register' && (
        <>
          <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
          <View style={styles.row}>
            <Text>¿Eres comerciante?</Text>
            <Switch value={isMerchant} onValueChange={setIsMerchant} />
          </View>
          {isMerchant && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la tienda"
                value={storeName}
                onChangeText={setStoreName}
              />
              <Text style={styles.label}>Tipo de vendedor</Text>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[styles.chip, storeType === 'tienda_oficial' && styles.chipActive]}
                  onPress={() => setStoreType('tienda_oficial')}
                >
                  <Text style={[styles.chipText, storeType === 'tienda_oficial' && styles.chipTextActive]}>
                    Tienda oficial
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, storeType === 'mercado_local' && styles.chipActive]}
                  onPress={() => setStoreType('mercado_local')}
                >
                  <Text style={[styles.chipText, storeType === 'mercado_local' && styles.chipTextActive]}>
                    Mercado local
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={mode === 'register' ? 'Crear cuenta' : 'Entrar'} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  tab: { fontSize: 16, color: colors.textMuted, paddingBottom: 6 },
  tabActive: { color: colors.accentDark, fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: colors.accent },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontWeight: '600', color: colors.textMuted, fontSize: 13, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { fontSize: 12, color: colors.textMuted },
  chipTextActive: { color: colors.accentDark, fontWeight: '700' },
  error: { color: '#b91c1c', marginBottom: 10 },
});
