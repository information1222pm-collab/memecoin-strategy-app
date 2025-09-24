import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { colors } from '../theme/colors';

const SettingsScreen = () => {
  const { open, isConnected, address, provider } = useWalletConnectModal();

  const handleConnect = () => { open(); };
  const handleDisconnect = () => { provider?.disconnect(); };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}><Text style={styles.title}>Settings & Wallet ⚙️</Text></View>
      <View style={styles.content}>
        <View style={styles.walletSection}>
          <Text style={styles.sectionTitle}>Wallet Connection</Text>
          {isConnected ? (
            <View>
              <Text style={styles.statusText}>Status: <Text style={{color: colors.success}}>Connected</Text></Text>
              <Text style={styles.addressText} numberOfLines={1}>Address: {address}</Text>
              <Button title="Disconnect" color={colors.danger} onPress={handleDisconnect} />
            </View>
          ) : (
            <View>
              <Text style={styles.statusText}>Status: <Text style={{color: colors.warning}}>Not Connected</Text></Text>
              <Text style={styles.infoText}>Connect your Solana wallet to enable trading.</Text>
              <Button title="Connect Wallet" color={colors.primary} onPress={handleConnect} />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, header: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' }, title: { fontSize: 24, fontWeight: 'bold', color: colors.text }, content: { flex: 1, padding: 16 }, walletSection: { backgroundColor: colors.card, padding: 20, borderRadius: 8, borderWidth: 1, borderColor: colors.border }, sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }, statusText: { color: colors.textSecondary, fontSize: 16, marginBottom: 8 }, addressText: { color: colors.text, fontSize: 14, marginBottom: 24 }, infoText: { color: colors.textSecondary, fontSize: 14, marginBottom: 24, textAlign: 'center' }});
export default SettingsScreen;
