import { useState, useEffect } from 'react';
import { Welcome } from './pages/Welcome';
import { CreateWallet } from './pages/CreateWallet';
import { ImportWallet } from './pages/ImportWallet';
import { Unlock } from './pages/Unlock';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { Settings } from './pages/Settings';
import { NetworkSettings } from './pages/NetworkSettings';
import { StorageService, DEFAULT_NETWORKS } from '../lib/storage';
import { WalletService } from '../lib/wallet';
import { useWalletStore } from '../store/wallet';

type AppState = 'loading' | 'welcome' | 'create' | 'import' | 'unlock' | 'home' | 'send' | 'receive' | 'settings' | 'network-settings';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const { setUnlocked, setCurrentAccount, setAccounts, setNetworks, setCurrentNetwork } = useWalletStore();

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeApp = async () => {
    try {
      console.log('[App] Initializing...');
      const isInitialized = await StorageService.isInitialized();
      console.log('[App] Is initialized:', isInitialized);
      
      // Initialize networks if not set
      let networks = await StorageService.get('networks');
      console.log('[App] Loaded networks:', networks);
      
      if (!networks || networks.length === 0) {
        console.log('[App] Initializing default networks');
        await StorageService.set('networks', DEFAULT_NETWORKS);
        await StorageService.set('currentNetwork', 'ethereum');
        networks = DEFAULT_NETWORKS;
      }
      
      setNetworks(networks);
      
      const currentNetworkId = await StorageService.get('currentNetwork') || 'ethereum';
      console.log('[App] Current network ID:', currentNetworkId);
      
      const currentNetwork = networks.find(n => n.id === currentNetworkId) || networks[0];
      console.log('[App] Current network:', currentNetwork);
      
      if (currentNetwork) {
        setCurrentNetwork(currentNetwork);
      }

      if (!isInitialized) {
        setAppState('welcome');
      } else {
        setAppState('unlock');
      }
    } catch (error) {
      console.error('[App] Failed to initialize app:', error);
      // Fallback to default networks
      setNetworks(DEFAULT_NETWORKS);
      setCurrentNetwork(DEFAULT_NETWORKS[0]);
      setAppState('welcome');
    }
  };

  const handleWalletCreated = () => {
    const account = WalletService.getCurrentAccount();
    const accounts = WalletService.getAllAccounts();
    
    if (account) {
      setCurrentAccount(account);
      setAccounts(accounts);
      setUnlocked(true);
      setAppState('home');
    }
  };

  const handleWalletImported = () => {
    const account = WalletService.getCurrentAccount();
    const accounts = WalletService.getAllAccounts();
    
    if (account) {
      setCurrentAccount(account);
      setAccounts(accounts);
      setUnlocked(true);
      setAppState('home');
    }
  };

  const handleUnlocked = () => {
    const account = WalletService.getCurrentAccount();
    const accounts = WalletService.getAllAccounts();
    
    if (account) {
      setCurrentAccount(account);
      setAccounts(accounts);
      setUnlocked(true);
      setAppState('home');
    }
  };

  if (appState === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-matrix-bg">
        <div className="w-8 h-8 border-2 border-matrix-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (appState === 'welcome') {
    return (
      <Welcome
        onCreateWallet={() => setAppState('create')}
        onImportWallet={() => setAppState('import')}
      />
    );
  }

  if (appState === 'create') {
    return (
      <CreateWallet
        onBack={() => setAppState('welcome')}
        onComplete={handleWalletCreated}
      />
    );
  }

  if (appState === 'import') {
    return (
      <ImportWallet
        onBack={() => setAppState('welcome')}
        onComplete={handleWalletImported}
      />
    );
  }

  if (appState === 'unlock') {
    return <Unlock onUnlock={handleUnlocked} />;
  }

  if (appState === 'send') {
    return <Send onBack={() => setAppState('home')} />;
  }

  if (appState === 'receive') {
    return <Receive onBack={() => setAppState('home')} />;
  }

  if (appState === 'settings') {
    return (
      <Settings
        onBack={() => setAppState('home')}
        onLock={() => setAppState('unlock')}
        onNavigate={(page) => setAppState(page)}
      />
    );
  }

  if (appState === 'network-settings') {
    return <NetworkSettings onBack={() => setAppState('settings')} />;
  }

  return <Home onNavigate={(page: 'send' | 'receive' | 'settings') => setAppState(page)} />;
}

export default App;
