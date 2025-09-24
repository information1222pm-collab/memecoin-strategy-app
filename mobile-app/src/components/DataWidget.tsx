import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
type Props = { label: string; value: string | number; valueColor?: string; };
const DataWidget = ({ label, value, valueColor = colors.text }: Props) => (
  <View style={styles.widget}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
  </View>
);
const styles = StyleSheet.create({
  widget: { backgroundColor: colors.card, borderRadius: 8, borderColor: colors.border, borderWidth: 1, padding: 12, flexGrow: 1, flexBasis: '40%', margin: 4, alignItems: 'center' },
  label: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: 'bold' },
});
export default DataWidget;
