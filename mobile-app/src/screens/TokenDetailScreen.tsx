import React, 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchTokenDetails, fetchTokenChart } from '../state/tokensSlice';
import { colors } from '../theme/colors';
import DataWidget from '../components/DataWidget';
import { useEffect } from 'react';

type TokenDetailScreenRouteProp = RouteProp<RootStackParamList, 'TokenDetail'>;
type Props = { route: TokenDetailScreenRouteProp };

const TokenDetailScreen = ({ route }: Props) => {
  const { tokenId } = route.params;
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { currentToken, detailStatus, currentChart, chartStatus } = useAppSelector((state) => state.tokens);

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchTokenDetails(tokenId));
      dispatch(fetchTokenChart(tokenId));
    }
  }, [tokenId, dispatch]);

  const ChartComponent = () => {
    if (chartStatus === 'loading' || !currentChart) {
        return <View style={styles.chartPlaceholder}><ActivityIndicator color={colors.primary}/></View>
    }
    return (
        <View style={styles.chartContainer}>
            <LineChart
                data={currentChart}
                width={width - 32}
                height={280}
                chartConfig={{
                    backgroundColor: colors.card, backgroundGradientFrom: colors.card, backgroundGradientTo: colors.card,
                    decimalPlaces: 2, color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
                    propsForDots: { r: "0" }
                }}
                bezier style={{ borderRadius: 16 }}
            />
        </View>
    );
  };
  
  const MetricsComponent = () => {
    // --- THIS IS THE FIX ---
    // We check if the data is loading or doesn't exist yet.
    if (detailStatus === 'loading' || !currentToken) {
        // If it's not ready, we show nothing. This prevents the crash.
        return <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>;
    }
    // --- END OF FIX ---

    // This code will now only run AFTER the data has safely arrived.
    const priceChangeColor = currentToken.priceChange24h >= 0 ? colors.success : colors.danger;
    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.widgetRow}>
          <DataWidget label="Price (USD)" value={`$${currentToken.priceUSD.toFixed(6)}`} />
          <DataWidget label="24h Change" value={`${currentToken.priceChange24h.toFixed(2)}%`} valueColor={priceChangeColor} />
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <ChartComponent />
      <MetricsComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  chartContainer: { alignItems: 'center', marginHorizontal: 16, marginTop: 16 },
  chartPlaceholder: { height: 312, justifyContent: 'center', alignItems: 'center', margin: 16 },
  metricsContainer: { paddingHorizontal: 12, paddingBottom: 24 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  widgetRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});

export default TokenDetailScreen;
