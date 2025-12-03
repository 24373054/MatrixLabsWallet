/**
 * Token Service
 * 代币服务 - 处理 ERC-20 代币余额查询和转账
 */

import { ethers } from 'ethers';
import { RPCService } from './rpc';
import { Token, ERC20_ABI, getTokensForNetwork } from './tokens';
import type { Network } from './storage';

export interface TokenBalance {
  token: Token;
  balance: string; // 格式化后的余额
  balanceRaw: string; // 原始余额（wei）
  balanceUSD?: number; // USD 价值（可选）
}

export class TokenService {
  /**
   * 获取账户的所有代币余额
   */
  static async getTokenBalances(
    address: string,
    network: Network
  ): Promise<TokenBalance[]> {
    const tokens = getTokensForNetwork(network.chainId);
    const balances: TokenBalance[] = [];

    console.log(`[TokenService] Fetching balances for ${tokens.length} tokens on ${network.name}`);

    // 并行查询所有代币余额
    const balancePromises = tokens.map(token => 
      this.getTokenBalance(address, token, network)
    );

    const results = await Promise.allSettled(balancePromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        balances.push(result.value);
      } else if (result.status === 'rejected') {
        console.error(`[TokenService] Failed to fetch balance for ${tokens[index].symbol}:`, result.reason);
      }
    });

    console.log(`[TokenService] Successfully fetched ${balances.length} token balances`);
    return balances;
  }

  /**
   * 获取单个代币余额
   */
  static async getTokenBalance(
    address: string,
    token: Token,
    network: Network
  ): Promise<TokenBalance | null> {
    try {
      let balanceRaw: string;

      if (token.isNative) {
        // 原生代币（ETH, BNB 等）
        const provider = await RPCService.getProvider(network.chainId);
        const balance = await provider.getBalance(address);
        balanceRaw = balance.toString();
      } else {
        // ERC-20 代币
        const provider = await RPCService.getProvider(network.chainId);
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const balance = await contract.balanceOf(address);
        balanceRaw = balance.toString();
      }

      // 格式化余额
      const balance = ethers.formatUnits(balanceRaw, token.decimals);

      return {
        token,
        balance,
        balanceRaw
      };
    } catch (error) {
      console.error(`[TokenService] Error fetching balance for ${token.symbol}:`, error);
      return null;
    }
  }

  /**
   * 发送代币转账
   */
  static async sendToken(
    to: string,
    amount: string,
    token: Token,
    network: Network,
    privateKey: string
  ): Promise<string> {
    const provider = await RPCService.getProvider(network.chainId);
    const wallet = new ethers.Wallet(privateKey, provider);

    if (token.isNative) {
      // 原生代币转账
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseUnits(amount, token.decimals)
      });
      await tx.wait();
      return tx.hash;
    } else {
      // ERC-20 代币转账
      const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
      const tx = await contract.transfer(to, ethers.parseUnits(amount, token.decimals));
      await tx.wait();
      return tx.hash;
    }
  }

  /**
   * 准备代币转账交易（用于签名确认）
   */
  static async prepareTokenTransfer(
    from: string,
    to: string,
    amount: string,
    token: Token
  ): Promise<any> {
    if (token.isNative) {
      // 原生代币
      return {
        from,
        to,
        value: ethers.parseUnits(amount, token.decimals).toString(),
        data: '0x'
      };
    } else {
      // ERC-20 代币
      const contract = new ethers.Interface(ERC20_ABI);
      const data = contract.encodeFunctionData('transfer', [
        to,
        ethers.parseUnits(amount, token.decimals)
      ]);

      return {
        from,
        to: token.address,
        value: '0x0',
        data
      };
    }
  }

  /**
   * 估算代币转账的 gas
   */
  static async estimateTokenTransferGas(
    from: string,
    to: string,
    amount: string,
    token: Token,
    network: Network
  ): Promise<string> {
    try {
      const txData = await this.prepareTokenTransfer(from, to, amount, token);
      const provider = await RPCService.getProvider(network.chainId);
      const gasEstimate = await provider.estimateGas(txData);

      return gasEstimate.toString();
    } catch (error) {
      console.error('[TokenService] Gas estimation failed:', error);
      // 返回默认值
      return token.isNative ? '0x5208' : '0xC350'; // 21000 for ETH, 50000 for ERC-20
    }
  }

  /**
   * 检查代币授权额度
   */
  static async getAllowance(
    owner: string,
    spender: string,
    token: Token,
    network: Network
  ): Promise<string> {
    if (token.isNative) {
      return ethers.MaxUint256.toString(); // 原生代币不需要授权
    }

    try {
      const provider = await RPCService.getProvider(network.chainId);
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const allowance = await contract.allowance(owner, spender);
      return ethers.formatUnits(allowance, token.decimals);
    } catch (error) {
      console.error('[TokenService] Failed to get allowance:', error);
      return '0';
    }
  }

  /**
   * 授权代币
   */
  static async approveToken(
    spender: string,
    amount: string,
    token: Token,
    network: Network,
    privateKey: string
  ): Promise<string> {
    if (token.isNative) {
      throw new Error('Native token does not need approval');
    }

    const provider = await RPCService.getProvider(network.chainId);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);

    const tx = await contract.approve(
      spender,
      ethers.parseUnits(amount, token.decimals)
    );
    await tx.wait();
    return tx.hash;
  }
}
