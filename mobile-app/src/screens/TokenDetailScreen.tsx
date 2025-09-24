import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchTokenDetails } from '../state/tokensSlice';
import { colors } from '../theme/colors';
import DataWidget from '../components/DataWidget';

type TokenDetailScreenRouteProp = RouteProp<RootStackParamList, 'TokenDetail'>;
type Props = { route: TokenDetailScreenRouteProp };

const TokenDetailScreen = ({ route }: Props) => {
  const { tokenId } = route.params;
  const { width } = useWindowDimensions();
  const isTabletLayout = width > 700;
  const dispatch = useAppDispatch();
  const { currentToken, detailStatus } = useAppSelector((state) => state.tokens);

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchTokenDetails(tokenId));
    }
  }, [tokenId, dispatch]);

  const formatPrice = (price: number) => `$${price.toFixed(6)}`;
  const formatPercent = (p: number) => `${p.toFixed(2)}%`;
  const formatNumber = (n: number) => Intl.NumberFormat().format(Math.round(n));

  const ChartComponent = () => (
    <View style={styles.chartPlaceholder}><Text style={styles.placeholderText}>Live Chart Area</Text></View>
  );

  const MetricsComponent = () => {
      if (!currentToken) return null;
      const priceChangeColor = currentToken.priceChange24h >= 0 ? colors.success : colors.danger;
      return (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.widgetRow}>
            <DataWidget label="Price (USD)" value={formatPrice(currentToken.priceUSD)} />
            <DataWidget label="24h Change" value={formatPercent(currentToken.priceChange24h)} valueColor={priceChangeColor} />
          </View>
          <View style={styles.widgetRow}>
            <DataWidget label="Liquidity" value={`$${formatNumber(currentToken.liquidityUSD)}`} />
            <DataWidget label="Market Cap" value={`$${formatNumber(currentToken.marketCap)}`} />
          </View>
          <Text style={styles.sectionTitle}>Holder Analysis</Text>
          <View style={styles.widgetRow}>
            <DataWidget label="Total Holders" value={formatNumber(currentToken.holders)} />
            <DataWidget label="Bot Share (Est.)" value={`${formatNumber(currentToken.botShare)}%`} />
          </View>
          <Text style={styles.sectionTitle}>Safety Checks</Text>
          <View style={styles.safetyCheck}>
            {currentToken.reasons.length === 0 ? <Text style={{color: colors.success}}>✅ All safety checks passed.</Text> : currentToken.reasons.map(reason => <Text key={reason} style={{color: colors.danger}}>❌ {reason}</Text>)}
          </View>
        </View>
      );
  };
  
  if (detailStatus === 'loading') {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (detailStatus === 'failed') {
    return <View style={styles.centered}><Text style={{color: colors.danger}}>Failed to load token details.</Text></View>;
  }

  if (isTabletLayout) {
    return (
      <View style={styles.tabletContainer}>
        <View style={styles.leftColumn}><ChartComponent /></View>
        <ScrollView style={styles.rightColumn}><MetricsComponent /></ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ChartComponent />
      <MetricsComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  tabletContainer: { flex: 1, flexDirection: 'row', backgroundColor: colors.background, padding: 8 },
  leftColumn: { flex: 1.2, marginRight: 8 },
  rightColumn: { flex: 1 },
  chartPlaceholder: { height: 300, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: colors.border, margin: 16 },
  placeholderText: { color: colors.textSecondary },
  metricsContainer: { paddingHorizontal: 12 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  widgetRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  safetyCheck: { backgroundColor: colors.card, borderRadius: 8, padding: 16, borderColor: colors.border, borderWidth: 1, marginBottom: 24 }
});
export default TokenDetailScreen;
