import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { TechIcon, FashionIcon, HomeIcon, MotorIcon, WellnessIcon } from '../icons';
import { colors, radius } from '../theme';

const CATEGORIES = [
  { key: 'tecnologia', label: 'Tecnología', Icon: TechIcon },
  { key: 'moda', label: 'Moda', Icon: FashionIcon },
  { key: 'hogar', label: 'Hogar', Icon: HomeIcon },
  { key: 'motor', label: 'Motor', Icon: MotorIcon },
  { key: 'bienestar', label: 'Bienestar', Icon: WellnessIcon },
];

export default function CategoryRail({ active, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {CATEGORIES.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity key={key} style={styles.item} onPress={() => onSelect(isActive ? '' : key)}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon size={20} color={isActive ? colors.accentDark : colors.text} />
            </View>
            <Text style={styles.label}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { gap: 18, paddingVertical: 8 },
  item: { alignItems: 'center', gap: 6, width: 62 },
  iconWrap: { width: 46, height: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  iconWrapActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  label: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
});
