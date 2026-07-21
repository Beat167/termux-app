import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import { api } from '../src/api';
import { useAuth } from '../src/AuthContext';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login');
  const [isMerchant, setIsMerchant] = useState(false);
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
          ? await api.register({ name, email, password, role, storeName })
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
            <TextInput
              style={styles.input}
              placeholder="Nombre de la tienda"
              value={storeName}
              onChangeText={setStoreName}
            />
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
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  tabs: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  tab: { fontSize: 16, color: '#666', paddingBottom: 6 },
  tabActive: { color: '#2563eb', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  error: { color: '#b91c1c', marginBottom: 10 },
});
