export interface StorageData {
  encryptedVault?: string;
  passwordHash?: string;
  currentNetwork?: string;
  networks?: Network[];
  settings?: WalletSettings;
  stableguard_config?: any; // StableGuard configuration
  stableguard_enabled?: boolean; // Quick access to enabled state
}

export interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  explorerUrl?: string;
}

export interface WalletSettings {
  currency: string;
  language: string;
  autoLockMinutes: number;
}

// Mock storage for development (when chrome.storage is not available)
class MockStorage {
  private data: Record<string, any> = {};

  async get(key: string | string[]): Promise<Record<string, any>> {
    if (typeof key === 'string') {
      return { [key]: this.data[key] };
    }
    const result: Record<string, any> = {};
    key.forEach(k => {
      result[k] = this.data[k];
    });
    return result;
  }

  async set(items: Record<string, any>): Promise<void> {
    Object.assign(this.data, items);
  }

  async remove(key: string | string[]): Promise<void> {
    const keys = typeof key === 'string' ? [key] : key;
    keys.forEach(k => delete this.data[k]);
  }

  async clear(): Promise<void> {
    this.data = {};
  }
}

// Use chrome.storage if available, otherwise use mock storage
const storage = typeof chrome !== 'undefined' && chrome.storage
  ? chrome.storage.local
  : new MockStorage();

export class StorageService {
  /**
   * Get data from chrome storage
   */
  static async get<K extends keyof StorageData>(
    key: K
  ): Promise<StorageData[K] | undefined> {
    const result = await storage.get(key);
    return result[key];
  }

  /**
   * Get multiple keys from storage
   */
  static async getMultiple<K extends keyof StorageData>(
    keys: K[]
  ): Promise<Partial<StorageData>> {
    return await storage.get(keys);
  }

  /**
   * Set data in chrome storage
   */
  static async set<K extends keyof StorageData>(
    key: K,
    value: StorageData[K]
  ): Promise<void> {
    await storage.set({ [key]: value });
  }

  /**
   * Set multiple values in storage
   */
  static async setMultiple(data: Partial<StorageData>): Promise<void> {
    await storage.set(data);
  }

  /**
   * Remove data from storage
   */
  static async remove(key: keyof StorageData): Promise<void> {
    await storage.remove(key);
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<void> {
    await storage.clear();
  }

  /**
   * Check if wallet is initialized
   */
  static async isInitialized(): Promise<boolean> {
    const vault = await this.get('encryptedVault');
    return !!vault;
  }
}

// Default networks
export const DEFAULT_NETWORKS: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com', // Public RPC
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
  },
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org', // Public RPC
    symbol: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com', // Public RPC
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    symbol: 'BNB',
    explorerUrl: 'https://bscscan.com',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: 10,
    symbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  {
    id: 'base',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    symbol: 'ETH',
    explorerUrl: 'https://basescan.org',
  },
  {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    symbol: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
  },
  {
    id: 'linea',
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    chainId: 59144,
    symbol: 'ETH',
    explorerUrl: 'https://lineascan.build',
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    rpcUrl: 'https://mainnet.era.zksync.io',
    chainId: 324,
    symbol: 'ETH',
    explorerUrl: 'https://explorer.zksync.io',
  },
];
