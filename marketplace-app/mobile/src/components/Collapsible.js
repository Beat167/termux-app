import { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.header} onPress={() => setOpen(!open)}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.toggle}>{open ? '−' : '+'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderTopColor: colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  title: { fontWeight: '700', fontSize: 14 },
  toggle: { fontSize: 18, color: colors.textMuted },
  body: { paddingBottom: 16 },
});
