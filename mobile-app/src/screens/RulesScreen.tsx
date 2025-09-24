import React from 'react';
import { View, Text, StyleSheet, Switch, TextInput, ScrollView, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectRules, updateRule, TradingRules } from '../state/rulesSlice';

// A reusable component for each rule input
const RuleInputRow = ({
  label,
  value,
  onValueChange,
  isSwitch = false,
  keyboardType = 'numeric',
}: {
  label: string;
  value: any;
  onValueChange: (value: any) => void;
  isSwitch?: boolean;
  keyboardType?: 'numeric' | 'decimal-pad';
}) => (
  <View style={styles.inputRow}>
    <Text style={styles.inputLabel}>{label}</Text>
    {isSwitch ? (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.textSecondary, true: colors.primary }}
        thumbColor={colors.white}
      />
    ) : (
      <TextInput
        style={styles.input}
        value={String(value)}
        onChangeText={(text) => onValueChange(Number(text))}
        keyboardType={keyboardType}
      />
    )}
  </View>
);

const RulesScreen = () => {
  const { width } = useWindowDimensions();
  const contentPadding = width > 700 ? 48 : 16;
  const dispatch = useAppDispatch();
  const rules = useAppSelector(selectRules);

  const handleUpdate = <K extends keyof TradingRules>(key: K, value: TradingRules[K]) => {
    dispatch(updateRule({ key, value }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Auto-Trade Rules 📜</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: contentPadding }]}>
        <View style={styles.mainToggleRow}>
          <Text style={styles.mainToggleLabel}>Enable Auto-Trading</Text>
          <Switch
            value={rules.isAutoTradingEnabled}
            onValueChange={(value) => handleUpdate('isAutoTradingEnabled', value)}
            trackColor={{ false: '#767577', true: colors.success }}
            thumbColor={colors.white}
          />
        </View>

        <Text style={styles.sectionTitle}>Entry Rules</Text>
        <RuleInputRow label="Min. Momentum Score" value={rules.minMomentumScore} onValueChange={(v) => handleUpdate('minMomentumScore', v)} />
        <RuleInputRow label="Min. LP (USD)" value={rules.minLiquidityUSD} onValueChange={(v) => handleUpdate('minLiquidityUSD', v)} />

        <Text style={styles.sectionTitle}>Risk Management</Text>
        <RuleInputRow label="Size (% of Bankroll)" value={rules.sizePercentOfBankroll} onValueChange={(v) => handleUpdate('sizePercentOfBankroll', v)} keyboardType="decimal-pad" />
        <RuleInputRow label="Hard Stop Loss (%)" value={rules.hardStopLossPercent} onValueChange={(v) => handleUpdate('hardStopLossPercent', v)} />
        <RuleInputRow label="Daily Loss Cap (%)" value={rules.dailyLossCapPercent} onValueChange={(v) => handleUpdate('dailyLossCapPercent', v)} />
        
        <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
                Disclaimer: Auto-trading is extremely risky. These settings are not financial advice. You could lose your entire investment. Use at your own risk.
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  content: { paddingVertical: 16 },
  mainToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  mainToggleLabel: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  inputRow: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  inputLabel: { color: colors.textSecondary, fontSize: 16 },
  input: { color: colors.text, fontSize: 16, fontWeight: 'bold', width: 100, textAlign: 'right', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 4 },
  disclaimerBox: { marginTop: 32, padding: 16, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.warning },
  disclaimerText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
});

export default RulesScreen;
