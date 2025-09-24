import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { TokenData } from '../state/tokensSlice';
import { colors } from '../theme/colors';

type NavProp = StackNavigationProp<RootStackParamList, 'TokenDetail'>;

const getScoreColor = (score: number = 0) => {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.warning;
  return colors.danger;
};

const getSafetyColor = (status: TokenData['safetyStatus']) => {
  if (status === 'Pass') return colors.success;
  return colors.danger;
};

// This is our new, more robust component
const TokenCard = ({ token }: { token: TokenData }) => {
  const navigation = useNavigation<NavProp>();

  // --- Defensive Programming: Use default values if data is missing ---
  const name = token.name || 'Unnamed Token';
  const score = token.score ?? 0; // Use 0 if score is null or undefined
  const safetyStatus = token.safetyStatus || 'Fail';
  const tokenId = token.id || 'unknown';
  // ---

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('TokenDetail', { tokenId: tokenId, tokenName: name })}
    >
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={[styles.safety, { color: getSafetyColor(safetyStatus) }]}>
          {safetyStatus}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.score, { color: getScoreColor(score) }]}>
          {score}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  left: { flex: 1, marginRight: 10 },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  safety: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  right: { alignItems: 'flex-end' },
  score: { fontSize: 28, fontWeight: 'bold' },
});

export default TokenCard;
