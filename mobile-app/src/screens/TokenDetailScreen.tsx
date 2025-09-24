import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchTokenDetails, fetchTokenChart } from '../state/tokensSlice';
import { colors } from '../theme/colors';
import DataWidget from '../components/DataWidget';

type TokenDetailScreenRouteProp = RouteProp<RootStackParamList, 'TokenDetail'>;
type Props = { route: TokenDetailScreenRouteProp };

const TokenDetailScreen = ({ route }: Props) => {
  const { tokenId } = route.params;
  const { width } = useWindowDimensions();
  const isTabletLayout = width > 700;
  const dispatch = useAppDispatch();
  const { currentToken, detailStatus, currentChart, chartStatus } = useAppSelector((state) => state.tokens);

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchTokenDetails(tokenId));
      dispatch(fetchTokenChart(tokenId));
    }
  }, [tokenId, dispatch]);

  const ChartComponent = () => {
    if (chartStatus === 'loading' || !currentChart || !currentChart.datasets[0].data.length) {
        return <View style={styles.chartPlaceholder}><ActivityIndicator color={colors.primary}/></View>
    }
    return (
        <View style={styles.chartContainer}>
            <LineChart
                data={currentChart}
                width={isTabletLayout ? (width * 0.5) - 24 : width - 32}
                height={280}
                withInnerLines={false}
                withOuterLines={false}
                chartConfig={{
                    backgroundColor: colors.card, backgroundGradientFrom: colors.card, backgroundGradientTo: colors.card,
                    decimalPlaces: 2, color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`, style: { borderRadius: 16 },
                    propsForDots: { r: "0" }
                }}
                bezier
                style={{ borderRadius: 16 }}
            />
        </View>
    );
  };
  
  const MetricsComponent = () => {
      if (detailStatus === 'loading' || !currentToken) return null;
      const priceChangeColor = currentToken.priceChange24h >= 0 ? colors.success : colors.danger;
      return (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.widgetRow}>
            <DataWidget label="Price (USD)" value={`$${currentToken.priceUSD.toFixed(6)}`} />
            <DataWidget label="24h Change" value={`${currentToken.priceChange24h.toFixed(2)}%`} valueColor={priceChangeColor} />
          </View>
          <View style={styles.widgetRow}>
            <DataWidget label="Liquidity" value={`$${Math.round(currentToken.liquidityUSD)}`} />
            <DataWidget label="Market Cap" value={`$${Math.round(currentToken.marketCap)}`} />
          </View>
          
          <Text style={styles.sectionTitle}>Holder Analysis</Text>
          <View style={styles.widgetRow}>
              <DataWidget label="Total Holders" value={String(Math.round(currentToken.holders))} />
              <DataWidget label="Bot Share (Est.)" value={`${Math.round(currentToken.botShare)}%`} />
          </View>
          
          <Text style={styles.sectionTitle}>Safety Checks</Text>
          <View style={styles.safetyCheck}>
            {currentToken.reasons.length === 0 
              ? <Text style={{color: colors.success}}>✅ All primary safety checks passed.</Text> 
              : currentToken.reasons.map(reason => <Text key={reason} style={{color: colors.danger, marginBottom: 4}}>❌ {reason}</Text>)
            }
          </View>
        </View>
      );
  };
  
  if (detailStatus === 'loading') {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
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
  leftColumn: { flex: 1.2, marginRight: 8, paddingTop: 16 },
  rightColumn: { flex: 1 },
  chartContainer: { alignItems: 'center', marginHorizontal: 16, marginTop: 16 },
  chartPlaceholder: { height: 312, justifyContent: 'center', alignItems: 'center', margin: 16 },
  metricsContainer: { paddingHorizontal: 12, paddingBottom: 24 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  widgetRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  safetyCheck: { backgroundColor: colors.card, borderRadius: 8, padding: 16, borderColor: colors.border, borderWidth: 1 }
});

export default TokenDetailScreen;
