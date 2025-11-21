import { create } from 'zustand';
import { Account } from '../lib/wallet';
import { Network } from '../lib/storage';

interface WalletState {
  isUnlocked: boolean;
  currentAccount: Account | null;
  accounts: Account[];
  currentNetwork: Network | null;
  networks: Network[];
  balance: string;
  
  setUnlocked: (unlocked: boolean) => void;
  setCurrentAccount: (account: Account | null) => void;
  setAccounts: (accounts: Account[]) => void;
  setCurrentNetwork: (network: Network) => void;
  setNetworks: (networks: Network[]) => void;
  setBalance: (balance: string) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isUnlocked: false,
  currentAccount: null,
  accounts: [],
  currentNetwork: null,
  networks: [],
  balance: '0',

  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  setCurrentAccount: (account) => set({ currentAccount: account }),
  setAccounts: (accounts) => set({ accounts }),
  setCurrentNetwork: (network) => set({ currentNetwork: network }),
  setNetworks: (networks) => set({ networks }),
  setBalance: (balance) => set({ balance }),
  reset: () =>
    set({
      isUnlocked: false,
      currentAccount: null,
      accounts: [],
      balance: '0',
    }),
}));
