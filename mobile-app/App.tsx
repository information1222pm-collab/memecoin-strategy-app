import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/state/store';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

// IMPORTANT: You must get your own projectId from https://cloud.walletconnect.com/
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID_HERE';

const providerMetadata = {
  name: 'Memecoin Radar',
  description: 'Automated memecoin trading strategy app',
  url: 'https://walletconnect.com/',
  icons: ['https://walletconnect.com/walletconnect-logo.png'],
  redirect: { native: 'yourappscheme://' }
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
        <WalletConnectModal
          projectId={projectId}
          providerMetadata={providerMetadata}
        />
      </SafeAreaProvider>
    </Provider>
  );
}
