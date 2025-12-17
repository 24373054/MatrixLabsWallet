import { ethers } from 'ethers';
import { StorageService } from './storage';

export class RPCService {
  private static providers: Map<number, ethers.JsonRpcProvider> = new Map();

  /**
   * Get or create a provider for a specific chain
   */
  static async getProvider(chainId?: number): Promise<ethers.JsonRpcProvider> {
    // Get current network if chainId not specified
    if (!chainId) {
      const currentNetworkId = await StorageService.get('currentNetwork');
      const networks = await StorageService.get('networks');
      const network = networks?.find(n => n.id === currentNetworkId);
      chainId = network?.chainId || 1;
    }

    // Return cached provider if exists
    if (this.providers.has(chainId)) {
      return this.providers.get(chainId)!;
    }

    // Get network configuration
    const networks = await StorageService.get('networks');
    const network = networks?.find(n => n.chainId === chainId);
    
    if (!network) {
      throw new Error(`Network with chainId ${chainId} not found`);
    }

    // Create new provider
    const provider = new ethers.JsonRpcProvider(network.rpcUrl, {
      chainId: network.chainId,
      name: network.name,
    });

    // Cache provider
    this.providers.set(chainId, provider);
    
    return provider;
  }

  /**
   * Get balance for an address
   */
  static async getBalance(address: string, chainId?: number): Promise<string> {
    const provider = await this.getProvider(chainId);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get transaction count (nonce)
   */
  static async getTransactionCount(address: string, chainId?: number): Promise<number> {
    const provider = await this.getProvider(chainId);
    return await provider.getTransactionCount(address);
  }

  /**
   * Estimate gas for a transaction
   */
  static async estimateGas(transaction: ethers.TransactionRequest, chainId?: number): Promise<bigint> {
    const provider = await this.getProvider(chainId);
    return await provider.estimateGas(transaction);
  }

  /**
   * Get current gas price
   */
  static async getGasPrice(chainId?: number): Promise<bigint> {
    const provider = await this.getProvider(chainId);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Get fee data (for EIP-1559)
   */
  static async getFeeData(chainId?: number) {
    const provider = await this.getProvider(chainId);
    return await provider.getFeeData();
  }

  /**
   * Get block number
   */
  static async getBlockNumber(chainId?: number): Promise<number> {
    const provider = await this.getProvider(chainId);
    return await provider.getBlockNumber();
  }

  /**
   * Get block by number
   */
  static async getBlock(blockNumber: number | string, chainId?: number) {
    const provider = await this.getProvider(chainId);
    return await provider.getBlock(blockNumber);
  }

  /**
   * Call a contract method (read-only)
   */
  static async call(transaction: ethers.TransactionRequest, chainId?: number): Promise<string> {
    const provider = await this.getProvider(chainId);
    return await provider.call(transaction);
  }

  /**
   * Send a signed transaction
   */
  static async sendTransaction(signedTx: string, chainId?: number): Promise<ethers.TransactionResponse> {
    const provider = await this.getProvider(chainId);
    return await provider.broadcastTransaction(signedTx);
  }

  /**
   * Wait for transaction confirmation
   */
  static async waitForTransaction(txHash: string, confirmations: number = 1, chainId?: number) {
    const provider = await this.getProvider(chainId);
    return await provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get transaction receipt
   */
  static async getTransactionReceipt(txHash: string, chainId?: number) {
    const provider = await this.getProvider(chainId);
    return await provider.getTransactionReceipt(txHash);
  }

  /**
   * Get transaction by hash
   */
  static async getTransaction(txHash: string, chainId?: number) {
    const provider = await this.getProvider(chainId);
    return await provider.getTransaction(txHash);
  }

  /**
   * Clear cached providers
   */
  static clearProviders() {
    this.providers.clear();
  }
}
