// Inpage script for MatrixLabs Wallet
// Provides the window.ethereum API for dApps

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

class MatrixLabsProvider {
  public isMatrixLabs = true;
  public isMetaMask = true; // For compatibility
  private _chainId: string = '0x1';
  private _selectedAddress: string | null = null;
  private _eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
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

      default:
        throw new Error(`MatrixLabs: Method ${method} not supported`);
    }
  }

  private async _handleRequestAccounts(): Promise<string[]> {
    const response = await this._sendMessage('GET_ACCOUNTS', {});
    if (response.success && response.accounts.length > 0) {
      this._selectedAddress = response.currentAccount?.address || response.accounts[0].address;
      return [this._selectedAddress];
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

// Inject provider into window
const provider = new MatrixLabsProvider();
(window as any).ethereum = provider;
(window as any).matrixlabs = provider;

// Announce provider
window.dispatchEvent(new Event('ethereum#initialized'));

console.log('MatrixLabs Wallet provider injected');
