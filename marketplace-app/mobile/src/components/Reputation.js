import { Text, View } from 'react-native';
import { colors } from '../theme';

export default function Reputation({ avgRating, reviewCount }) {
  if (!reviewCount) {
    return <Text style={{ color: colors.textMuted, fontSize: 12 }}>Sin reseñas todavía</Text>;
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ color: colors.accent }}>★</Text>
      <Text style={{ fontWeight: '700', fontSize: 12 }}>{Number(avgRating).toFixed(1)}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>({reviewCount} reseñas)</Text>
    </View>
  );
}
