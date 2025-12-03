import { useState, useEffect } from 'react';
import { Welcome } from './pages/Welcome';
import { CreateWallet } from './pages/CreateWallet';
import { ImportWallet } from './pages/ImportWallet';
import { Unlock } from './pages/Unlock';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Swap } from './pages/Swap';
import { Bridge } from './pages/Bridge';
import { Receive } from './pages/Receive';
import { Settings } from './pages/Settings';
import { NetworkSettings } from './pages/NetworkSettings';
import { ConnectRequest } from './pages/ConnectRequest';
import { SignMessage } from './pages/SignMessage';
import SendTransaction from './pages/SendTransaction';
import { StableGuardDashboard } from './pages/StableGuardDashboard';
import { StableGuardSettings } from './pages/StableGuardSettings';
import { StorageService, DEFAULT_NETWORKS } from '../lib/storage';
import { WalletService } from '../lib/wallet';
import { useWalletStore } from '../store/wallet';

type AppState = 'loading' | 'welcome' | 'create' | 'import' | 'unlock' | 'home' | 'send' | 'swap' | 'bridge' | 'receive' | 'settings' | 'network-settings' | 'connect-request' | 'sign-message' | 'send-transaction' | 'stableguard-dashboard' | 'stableguard-settings';

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

  const handleWalletCreated = async () => {
    const account = WalletService.getCurrentAccount();
    const accounts = WalletService.getAllAccounts();
    
    if (account) {
      setCurrentAccount(account);
      setAccounts(accounts);
      setUnlocked(true);
      
      // Save session state for dApp connections
      if (chrome.storage.session) {
        await chrome.storage.session.set({
          unlocked: true,
          currentAccount: account,
        });
        console.log('[App] Session state saved after wallet creation');
      }
      
      setAppState('home');
    }
  };

  const handleWalletImported = async () => {
    const account = WalletService.getCurrentAccount();
    const accounts = WalletService.getAllAccounts();
    
    if (account) {
      setCurrentAccount(account);
      setAccounts(accounts);
      setUnlocked(true);
      
      // Save session state for dApp connections
      if (chrome.storage.session) {
        await chrome.storage.session.set({
          unlocked: true,
          currentAccount: account,
        });
        console.log('[App] Session state saved after wallet import');
      }
      
      setAppState('home');
    }
  };

  const handleUnlocked = async () => {
    console.log('[App] handleUnlocked called');
    const account = WalletService.getCurrentAccount();
    const accounts = WalletService.getAllAccounts();
    
    console.log('[App] Account:', account?.address);
    console.log('[App] Accounts count:', accounts.length);
    
    if (account) {
      setCurrentAccount(account);
      setAccounts(accounts);
      setUnlocked(true);
      console.log('[App] State updated, checking for pending requests...');
      
      // Check if there's a pending transaction request first
      const transactionResult = await chrome.storage.local.get(['pendingTransaction']);
      if (transactionResult.pendingTransaction) {
        console.log('[App] Navigating to send-transaction page');
        setAppState('send-transaction');
        return;
      }
      
      // Check if there's a pending signature request
      const signatureResult = await chrome.storage.local.get(['pendingSignature']);
      if (signatureResult.pendingSignature) {
        console.log('[App] Navigating to sign-message page');
        setAppState('sign-message');
        return;
      }
      
      // Check if there's a pending connection request
      const connectionResult = await chrome.storage.local.get(['pendingConnection']);
      console.log('[App] Pending connection:', connectionResult.pendingConnection);
      
      if (connectionResult.pendingConnection) {
        console.log('[App] Navigating to connect-request page');
        setAppState('connect-request');
      } else {
        console.log('[App] No pending requests, navigating to home');
        setAppState('home');
      }
    } else {
      console.error('[App] No account found after unlock');
    }
  };

  const handleConnectApprove = async () => {
    console.log('[App] Connection approved by user');
    try {
      // Notify background script that connection was approved
      const response = await chrome.runtime.sendMessage({
        type: 'CONNECTION_APPROVED',
        data: { approved: true }
      });
      console.log('[App] Background response:', response);
      setAppState('home');
    } catch (error) {
      console.error('[App] Error approving connection:', error);
    }
  };

  const handleConnectReject = async () => {
    console.log('[App] Connection rejected by user');
    try {
      // Notify background script that connection was rejected
      const response = await chrome.runtime.sendMessage({
        type: 'CONNECTION_REJECTED',
        data: { approved: false }
      });
      console.log('[App] Background response:', response);
      window.close();
    } catch (error) {
      console.error('[App] Error rejecting connection:', error);
      window.close();
    }
  };

  const handleSignatureApprove = async () => {
    console.log('[App] Signature approved, closing window');
    window.close();
  };

  const handleSignatureReject = async () => {
    console.log('[App] Signature rejected, closing window');
    window.close();
  };

  const handleTransactionApprove = async () => {
    console.log('[App] Transaction approved, closing window');
    window.close();
  };

  const handleTransactionReject = async () => {
    console.log('[App] Transaction rejected, closing window');
    window.close();
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

  if (appState === 'swap') {
    return <Swap onBack={() => setAppState('home')} />;
  }

  if (appState === 'bridge') {
    return <Bridge onBack={() => setAppState('home')} />;
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

  if (appState === 'connect-request') {
    return (
      <ConnectRequest
        onApprove={handleConnectApprove}
        onReject={handleConnectReject}
      />
    );
  }

  if (appState === 'sign-message') {
    return (
      <SignMessage
        onApprove={handleSignatureApprove}
        onReject={handleSignatureReject}
      />
    );
  }

  if (appState === 'send-transaction') {
    return (
      <SendTransaction
        onApprove={handleTransactionApprove}
        onReject={handleTransactionReject}
      />
    );
  }

  if (appState === 'stableguard-dashboard') {
    return <StableGuardDashboard onBack={() => setAppState('home')} />;
  }

  if (appState === 'stableguard-settings') {
    return <StableGuardSettings onBack={() => setAppState('settings')} />;
  }

  return <Home onNavigate={(page: 'send' | 'swap' | 'bridge' | 'receive' | 'settings' | 'stableguard-dashboard') => setAppState(page)} />;
}

export default App;
