import { ethers } from 'ethers';
import { Network } from './storage';

export class ProviderService {
  private static providers: Map<string, ethers.JsonRpcProvider> = new Map();

  /**
   * Get or create provider for network
   */
  static getProvider(network: Network): ethers.JsonRpcProvider {
    // Use network ID + RPC URL as key to handle RPC changes
    const key = `${network.chainId}-${network.rpcUrl}`;
    if (!this.providers.has(key)) {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      this.providers.set(key, provider);
    }
    return this.providers.get(key)!;
  }

  /**
   * Clear provider cache
   */
  static clearCache(): void {
    this.providers.clear();
  }

  /**
   * Get balance for address
   */
  static async getBalance(address: string, network: Network): Promise<string> {
    const provider = this.getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get transaction count (nonce)
   */
  static async getTransactionCount(address: string, network: Network): Promise<number> {
    const provider = this.getProvider(network);
    return await provider.getTransactionCount(address);
  }

  /**
   * Estimate gas for transaction
   */
  static async estimateGas(
    transaction: ethers.TransactionRequest,
    network: Network
  ): Promise<bigint> {
    const provider = this.getProvider(network);
    return await provider.estimateGas(transaction);
  }

  /**
   * Get gas price
   */
  static async getGasPrice(network: Network): Promise<bigint> {
    const provider = this.getProvider(network);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Get fee data (EIP-1559)
   */
  static async getFeeData(network: Network) {
    const provider = this.getProvider(network);
    return await provider.getFeeData();
  }

  /**
   * Send transaction
   */
  static async sendTransaction(
    signedTransaction: string,
    network: Network
  ): Promise<ethers.TransactionResponse> {
    const provider = this.getProvider(network);
    return await provider.broadcastTransaction(signedTransaction);
  }

  /**
   * Get transaction receipt
   */
  static async getTransactionReceipt(
    txHash: string,
    network: Network
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(network);
    return await provider.getTransactionReceipt(txHash);
  }

  /**
   * Get transaction
   */
  static async getTransaction(
    txHash: string,
    network: Network
  ): Promise<ethers.TransactionResponse | null> {
    const provider = this.getProvider(network);
    return await provider.getTransaction(txHash);
  }

  /**
   * Get current block number
   */
  static async getBlockNumber(network: Network): Promise<number> {
    const provider = this.getProvider(network);
    return await provider.getBlockNumber();
  }

  /**
   * Get ERC20 token balance
   */
  static async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    network: Network
  ): Promise<string> {
    const provider = this.getProvider(network);
    const abi = ['function balanceOf(address) view returns (uint256)'];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await contract.balanceOf(walletAddress);
    return balance.toString();
  }

  /**
   * Get ERC20 token info
   */
  static async getTokenInfo(tokenAddress: string, network: Network) {
    const provider = this.getProvider(network);
    const abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
    ];
    const contract = new ethers.Contract(tokenAddress, abi, provider);

    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    return { name, symbol, decimals: Number(decimals) };
  }
}
