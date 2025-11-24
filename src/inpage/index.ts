// Inpage script for MatrixLabs Wallet
// Provides the window.ethereum API for dApps

// Wrap in IIFE to avoid variable conflicts
(function() {
  'use strict';

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

// Simple EventEmitter implementation
class EventEmitter {
  protected _eventListeners: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    this._eventListeners.get(event)!.add(callback);
  }

  removeListener(event: string, callback: Function): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }
}

class MatrixLabsProvider extends EventEmitter {
  public isMatrixLabs = true;
  public isMetaMask = true; // Pretend to be MetaMask for compatibility
  private _selectedAddress: string | null = null;
  private _chainId = '0x1'; // Ethereum Mainnet

  constructor() {
    super();
    this._initialize();
  }

  private async _initialize() {
    try {
      const accounts = await this.request({ method: 'eth_accounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        this._selectedAddress = accounts[0];
      }
    } catch (error) {
      console.error('MatrixLabs: Failed to initialize', error);
    }
  }

  async request(args: RequestArguments): Promise<any> {
    const { method, params } = args;

    switch (method) {
      case 'eth_requestAccounts':
        return this._handleRequestAccounts();

      case 'eth_accounts':
        return this._handleAccounts();

      case 'eth_chainId':
        return this._chainId;

      case 'eth_sendTransaction':
        return this._handleSendTransaction(params);

      case 'personal_sign':
        return this._handlePersonalSign(params);

      case 'eth_signTypedData_v4':
        return this._handleSignTypedData(params);

      case 'wallet_switchEthereumChain':
        return this._handleSwitchChain(params);

      case 'wallet_addEthereumChain':
        return this._handleAddChain(params);

      // RPC passthrough methods - return mock data for now
      case 'eth_blockNumber':
        return '0x' + Math.floor(Date.now() / 1000).toString(16);
      
      case 'eth_getBlockByNumber':
        const blockNum = '0x' + Math.floor(Date.now() / 1000).toString(16);
        return {
          number: blockNum,
          timestamp: blockNum,
          hash: '0x' + '1'.repeat(64),
          parentHash: '0x' + '0'.repeat(64),
          nonce: '0x0000000000000000',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          logsBloom: '0x' + '0'.repeat(512),
          transactionsRoot: '0x' + '0'.repeat(64),
          stateRoot: '0x' + '0'.repeat(64),
          receiptsRoot: '0x' + '0'.repeat(64),
          miner: '0x0000000000000000000000000000000000000000',
          difficulty: '0x0',
          totalDifficulty: '0x0',
          extraData: '0x',
          size: '0x0',
          gasLimit: '0x1c9c380',
          gasUsed: '0x0',
          transactions: [],
          uncles: [],
          baseFeePerGas: '0x3b9aca00',
        };
      
      case 'eth_gasPrice':
        return '0x3b9aca00'; // 1 Gwei
      
      case 'eth_maxPriorityFeePerGas':
        return '0x59682f00'; // 1.5 Gwei
      
      case 'eth_estimateGas':
        return '0x5208'; // 21000
      
      case 'eth_getBalance':
        return '0x0'; // 0 ETH for now
      
      case 'eth_getTransactionCount':
        return '0x0';
      
      case 'eth_call':
        return '0x'; // Empty response
      
      case 'net_version':
        return '1'; // Mainnet
      
      case 'wallet_requestPermissions':
        return [{ parentCapability: 'eth_accounts' }];

      default:
        console.warn(`MatrixLabs: Method ${method} not implemented, returning null`);
        return null;
    }
  }

  private async _handleRequestAccounts(): Promise<string[]> {
    const response = await this._sendMessage('GET_ACCOUNTS', {});
    if (response.success && response.accounts.length > 0) {
      this._selectedAddress = response.currentAccount?.address || response.accounts[0].address;
      return [this._selectedAddress!];
    }
    throw new Error('User rejected the request');
  }

  private async _handleAccounts(): Promise<string[]> {
    if (this._selectedAddress) {
      return [this._selectedAddress];
    }
    return [];
  }

  private async _handleSendTransaction(params: any): Promise<string> {
    const response = await this._sendMessage('SIGN_TRANSACTION', params);
    if (response.success) {
      return response.txHash;
    }
    throw new Error(response.error || 'Transaction failed');
  }

  private async _handlePersonalSign(params: any): Promise<string> {
    const response = await this._sendMessage('SIGN_MESSAGE', params);
    if (response.success) {
      return response.signature;
    }
    throw new Error(response.error || 'Signature failed');
  }

  private async _handleSignTypedData(params: any): Promise<string> {
    const response = await this._sendMessage('SIGN_TYPED_DATA', params);
    if (response.success) {
      return response.signature;
    }
    throw new Error(response.error || 'Signature failed');
  }

  private async _handleSwitchChain(params: any): Promise<null> {
    const chainId = Array.isArray(params) ? params[0]?.chainId : params?.chainId;
    console.log('[Inpage] Switch chain request:', chainId);
    
    // For now, just update the chainId and return success
    // In a real implementation, this would communicate with the wallet
    if (chainId) {
      this._chainId = chainId;
      this.emit('chainChanged', chainId);
    }
    return null;
  }

  private async _handleAddChain(params: any): Promise<null> {
    const chainParams = Array.isArray(params) ? params[0] : params;
    console.log('[Inpage] Add chain request:', chainParams);
    
    // For now, just accept the chain and update chainId
    // In a real implementation, this would show a confirmation dialog
    if (chainParams?.chainId) {
      this._chainId = chainParams.chainId;
      this.emit('chainChanged', chainParams.chainId);
    }
    return null;
  }

  private _sendMessage(type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === `MATRIXLABS_${type}_RESPONSE` && event.data.id === id) {
          window.removeEventListener('message', handleResponse);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.data);
          }
        }
      };

      window.addEventListener('message', handleResponse);

      window.postMessage(
        {
          type: `MATRIXLABS_${type}`,
          data,
          id,
        },
        '*'
      );

      // Timeout after 60 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 60000);
    });
  }
}

// Inject provider into window
const provider = new MatrixLabsProvider();
(window as any).ethereum = provider;
(window as any).matrixlabs = provider;

// Also set as web3.currentProvider for legacy dApps
if (typeof (window as any).web3 === 'undefined') {
  (window as any).web3 = {
    currentProvider: provider,
  };
}

// Announce provider - multiple events for compatibility
window.dispatchEvent(new Event('ethereum#initialized'));
window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
  detail: {
    info: {
      uuid: 'matrixlabs-wallet-uuid',
      name: 'MatrixLabs Wallet',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%234F46E5"/></svg>',
      rdns: 'com.matrixlabs.wallet'
    },
    provider: provider
  }
}));

console.log('MatrixLabs Wallet provider injected');

})(); // End of IIFE
