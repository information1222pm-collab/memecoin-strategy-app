import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectWallet, setWalletState, resetWalletState } from '../state/walletSlice';

// NOTE: WalletConnect integration is complex and requires a provider wrapper at the top level (App.tsx).
// For this stage, we will simulate the connection flow to build the UI.

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const { isConnected, walletAddress } = useAppSelector(selectWallet);

  // This function simulates a successful connection
  const handleConnect = () => {
    // In a real app, this would open the WalletConnect modal
    Alert.alert("Simulating Connection", "In a real app, you would be prompted to connect your wallet (e.g., Phantom).", [
        { text: "OK", onPress: () => {
            dispatch(setWalletState({
                isConnected: true,
                walletAddress: '8W...1a' // A sample truncated address
            }));
        }}
    ]);
  };

  // This function simulates disconnecting
  const handleDisconnect = () => {
    dispatch(resetWalletState());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Wallet ⚙️</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.walletSection}>
          <Text style={styles.sectionTitle}>Wallet Connection</Text>
          {isConnected ? (
            <View style={styles.connectedContainer}>
              <Text style={styles.statusText}>Status: <Text style={{color: colors.success}}>Connected</Text></Text>
              <Text style={styles.addressText}>Address: {walletAddress}</Text>
              <View style={styles.buttonContainer}>
                <Button title="Disconnect" color={colors.danger} onPress={handleDisconnect} />
              </View>
            </View>
          ) : (
            <View style={styles.disconnectedContainer}>
              <Text style={styles.statusText}>Status: <Text style={{color: colors.warning}}>Not Connected</Text></Text>
              <Text style={styles.infoText}>Connect your Solana wallet to enable auto-trading.</Text>
              <View style={styles.buttonContainer}>
                <Button title="Connect Wallet" color={colors.primary} onPress={handleConnect} />
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  content: { flex: 1, padding: 16 },
  walletSection: { backgroundColor: colors.card, padding: 20, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  connectedContainer: {},
  disconnectedContainer: {},
  statusText: { color: colors.textSecondary, fontSize: 16, marginBottom: 8 },
  addressText: { color: colors.text, fontSize: 16, marginBottom: 24, },
  infoText: { color: colors.textSecondary, fontSize: 14, marginBottom: 24, textAlign: 'center' },
  buttonContainer: { marginTop: 10 },
});

export default SettingsScreen;
