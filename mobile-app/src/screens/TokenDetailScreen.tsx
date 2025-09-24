import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator, Button, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchTokenDetails, fetchTokenChart } from '../state/tokensSlice';
import { colors } from '../theme/colors';
import DataWidget from '../components/DataWidget';
import apiClient from '../api/apiClient';

type TokenDetailScreenRouteProp = RouteProp<RootStackParamList, 'TokenDetail'>;
type Props = { route: TokenDetailScreenRouteProp };

const TokenDetailScreen = ({ route }: Props) => {
  const { tokenId } = route.params;
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { currentToken, detailStatus, currentChart, chartStatus } = useAppSelector((state) => state.tokens);
  const { isConnected, provider } = useWalletConnectModal();
  const [isTrading, setIsTrading] = useState(false);

  useEffect(() => { if (tokenId) { dispatch(fetchTokenDetails(tokenId)); dispatch(fetchTokenChart(tokenId)); } }, [tokenId, dispatch]);

  const handleTrade = async () => {
    if (!isConnected || !currentToken) return;
    setIsTrading(true);
    try {
        const { data } = await apiClient.post('/get-quote', { inputMint: 'SOL', outputMint: currentToken.address, amount: 0.01 });
        // In a real app, you would use the provider to sign and send the `data.swapTransaction`
        Alert.alert("Trade Execution", "In a real app, your wallet would now open and ask you to approve this transaction.");
    } catch (error) {
        Alert.alert("Error", "Could not get a trade quote from the server.");
    } finally {
        setIsTrading(false);
    }
  };

  const ChartComponent = () => { /* ... (omitted for brevity, no changes) ... */ };
  const MetricsComponent = () => { /* ... (omitted for brevity, no changes) ... */ };

  return (
    <ScrollView style={styles.container}>
      { /* ... Chart and Metrics components ... */ }
      <View style={styles.tradeSection}>
        <Button title={isTrading ? "Getting Quote..." : "Execute 0.01 SOL Trade"} color={colors.success} disabled={!isConnected || isTrading} onPress={handleTrade} />
        {!isConnected && <Text style={styles.connectPrompt}>Please connect your wallet in the Settings tab to trade.</Text>}
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, /* ... other styles ... */ tradeSection: { marginHorizontal: 16, marginTop: 24, marginBottom: 48 }, connectPrompt: { color: colors.warning, textAlign: 'center', marginTop: 12, fontSize: 12 } });
export default TokenDetailScreen;
