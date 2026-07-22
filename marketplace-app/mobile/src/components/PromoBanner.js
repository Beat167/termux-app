import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius } from '../theme';

export default function PromoBanner({ mode }) {
  return (
    <LinearGradient
      colors={['#059669', '#10b981', '#34d399']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <Text style={styles.title}>
        {mode === 'tienda_oficial' ? 'Ofertas de tiendas oficiales' : 'Encuentra tesoros cerca de ti'}
      </Text>
      <Text style={styles.subtitle}>
        {mode === 'tienda_oficial'
          ? 'Envío rápido y pago seguro, directo de marcas verificadas.'
          : 'Compra y vende con vecinos de tu zona. Coordina la entrega.'}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: radius.lg, padding: 20, marginBottom: 8 },
  title: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
});
