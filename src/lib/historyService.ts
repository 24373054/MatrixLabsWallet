/**
 * Transaction History Service
 * 交易历史记录服务
 */

import { ethers } from 'ethers';

export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  SWAP = 'swap',
  APPROVE = 'approve',
  CONTRACT = 'contract',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface TransactionRecord {
  id: string; // 唯一标识
  hash: string; // 交易哈希
  type: TransactionType;
  status: TransactionStatus;
  chainId: number;
  chainName: string;
  from: string;
  to: string;
  value: string; // 主币数量
  tokenSymbol?: string; // 代币符号
  tokenAmount?: string; // 代币数量
  tokenAddress?: string; // 代币合约地址
  gasUsed?: string;
  gasPrice?: string;
  fee?: string; // 手续费
  timestamp: number;
  blockNumber?: number;
  nonce?: number;
  data?: string; // 交易数据
  error?: string; // 错误信息
  // Swap 特定字段
  swapFromToken?: string;
  swapToToken?: string;
  swapFromAmount?: string;
  swapToAmount?: string;
}

export class HistoryService {
  private static readonly STORAGE_KEY = 'transaction_history';
  private static readonly MAX_RECORDS = 1000; // 最多保存 1000 条记录

  /**
   * 保存交易记录
   */
  static async saveTransaction(record: TransactionRecord): Promise<void> {
    try {
      const history = await this.getHistory();
      
      // 检查是否已存在
      const existingIndex = history.findIndex(r => r.hash === record.hash);
      if (existingIndex >= 0) {
        // 更新现有记录
        history[existingIndex] = record;
      } else {
        // 添加新记录
        history.unshift(record); // 最新的在前面
      }

      // 限制记录数量
      if (history.length > this.MAX_RECORDS) {
        history.splice(this.MAX_RECORDS);
      }

      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
      console.log('[HistoryService] Transaction saved:', record.hash);
    } catch (error) {
      console.error('[HistoryService] Failed to save transaction:', error);
    }
  }

  /**
   * 获取所有交易历史
   */
  static async getHistory(): Promise<TransactionRecord[]> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error('[HistoryService] Failed to get history:', error);
      return [];
    }
  }

  /**
   * 获取指定地址的交易历史
   */
  static async getHistoryByAddress(address: string): Promise<TransactionRecord[]> {
    const history = await this.getHistory();
    const lowerAddress = address.toLowerCase();
    return history.filter(
      r => r.from.toLowerCase() === lowerAddress || r.to.toLowerCase() === lowerAddress
    );
  }

  /**
   * 获取指定链的交易历史
   */
  static async getHistoryByChain(chainId: number): Promise<TransactionRecord[]> {
    const history = await this.getHistory();
    return history.filter(r => r.chainId === chainId);
  }

  /**
   * 获取指定类型的交易历史
   */
  static async getHistoryByType(type: TransactionType): Promise<TransactionRecord[]> {
    const history = await this.getHistory();
    return history.filter(r => r.type === type);
  }

  /**
   * 获取指定状态的交易历史
   */
  static async getHistoryByStatus(status: TransactionStatus): Promise<TransactionRecord[]> {
    const history = await this.getHistory();
    return history.filter(r => r.status === status);
  }

  /**
   * 根据哈希获取交易记录
   */
  static async getTransactionByHash(hash: string): Promise<TransactionRecord | null> {
    const history = await this.getHistory();
    return history.find(r => r.hash === hash) || null;
  }

  /**
   * 更新交易状态
   */
  static async updateTransactionStatus(
    hash: string,
    status: TransactionStatus,
    updates?: Partial<TransactionRecord>
  ): Promise<void> {
    const history = await this.getHistory();
    const index = history.findIndex(r => r.hash === hash);
    
    if (index >= 0) {
      console.log('[HistoryService] Updating transaction:', hash);
      console.log('[HistoryService] Current data:', history[index]);
      console.log('[HistoryService] Updates:', updates);
      
      history[index] = {
        ...history[index],
        status,
        ...updates,
      };
      
      console.log('[HistoryService] Updated data:', history[index]);
      
      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
      console.log('[HistoryService] Transaction status updated:', hash, status);
    } else {
      console.warn('[HistoryService] Transaction not found:', hash);
    }
  }

  /**
   * 删除交易记录
   */
  static async deleteTransaction(hash: string): Promise<void> {
    const history = await this.getHistory();
    const filtered = history.filter(r => r.hash !== hash);
    await chrome.storage.local.set({ [this.STORAGE_KEY]: filtered });
    console.log('[HistoryService] Transaction deleted:', hash);
  }

  /**
   * 清空所有历史记录
   */
  static async clearHistory(): Promise<void> {
    await chrome.storage.local.remove(this.STORAGE_KEY);
    console.log('[HistoryService] History cleared');
  }

  /**
   * 创建交易记录
   */
  static createRecord(params: {
    hash: string;
    type: TransactionType;
    chainId: number;
    chainName: string;
    from: string;
    to: string;
    value?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    tokenAddress?: string;
    swapFromToken?: string;
    swapToToken?: string;
    swapFromAmount?: string;
    swapToAmount?: string;
  }): TransactionRecord {
    return {
      id: `${params.hash}_${Date.now()}`,
      hash: params.hash,
      type: params.type,
      status: TransactionStatus.PENDING,
      chainId: params.chainId,
      chainName: params.chainName,
      from: params.from,
      to: params.to,
      value: params.value || '0',
      tokenSymbol: params.tokenSymbol,
      tokenAmount: params.tokenAmount,
      tokenAddress: params.tokenAddress,
      timestamp: Date.now(),
      swapFromToken: params.swapFromToken,
      swapToToken: params.swapToToken,
      swapFromAmount: params.swapFromAmount,
      swapToAmount: params.swapToAmount,
    };
  }

  /**
   * 从区块链获取交易详情并更新记录
   */
  static async fetchAndUpdateTransaction(
    hash: string,
    provider: any
  ): Promise<void> {
    try {
      console.log('[HistoryService] Fetching transaction receipt:', hash);
      const receipt = await provider.getTransactionReceipt(hash);
      
      if (receipt) {
        console.log('[HistoryService] Receipt found:', {
          status: receipt.status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString(),
          logs: receipt.logs?.length,
        });

        const updates: Partial<TransactionRecord> = {
          status: receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString(),
        };

        // 计算手续费 - 需要获取交易详情来得到 gasPrice
        try {
          const tx = await provider.getTransaction(hash);
          if (tx && receipt.gasUsed && tx.gasPrice) {
            const fee = receipt.gasUsed * tx.gasPrice;
            updates.fee = fee.toString();
            console.log('[HistoryService] Fee calculated:', fee.toString());
          }
        } catch (feeError) {
          console.warn('[HistoryService] Failed to calculate fee:', feeError);
        }

        // 解析事件日志获取代币转账信息
        if (receipt.logs && receipt.logs.length > 0) {
          try {
            const tokenTransfers = await this.parseTokenTransfers(receipt.logs, provider);
            console.log('[HistoryService] Token transfers found:', tokenTransfers.length);
            
            if (tokenTransfers.length > 0) {
              // 获取交易发起者地址
              const tx = await provider.getTransaction(hash);
              const userAddress = tx?.from?.toLowerCase();
              
              // 分离发送和接收的代币
              const sentTokens = tokenTransfers.filter(t => t.from.toLowerCase() === userAddress);
              const receivedTokens = tokenTransfers.filter(t => t.to.toLowerCase() === userAddress);
              
              console.log('[HistoryService] User address:', userAddress);
              console.log('[HistoryService] Sent tokens:', sentTokens.length, sentTokens);
              console.log('[HistoryService] Received tokens:', receivedTokens.length, receivedTokens);
              
              // 使用第一个代币转账作为主要信息
              const transfer = tokenTransfers[0];
              updates.tokenSymbol = transfer.symbol;
              updates.tokenAmount = transfer.amount;
              updates.tokenAddress = transfer.address;
              updates.type = TransactionType.SWAP;
              
              // 为 swap 交易添加专用字段供 UI 显示
              if (sentTokens.length > 0 && receivedTokens.length > 0) {
                // 标准的 swap：用户发送一种代币，接收另一种代币
                updates.swapFromToken = sentTokens[0].symbol;
                updates.swapFromAmount = sentTokens[0].amount;
                updates.swapToToken = receivedTokens[0].symbol;
                updates.swapToAmount = receivedTokens[0].amount;
              } else if (receivedTokens.length > 0) {
                // 只接收代币（可能是购买）
                updates.swapFromToken = 'USDT'; // 假设用 USDT 购买
                updates.swapFromAmount = receivedTokens[0].amount;
                updates.swapToToken = receivedTokens[0].symbol;
                updates.swapToAmount = receivedTokens[0].amount;
              } else if (sentTokens.length > 0) {
                // 只发送代币（可能是出售）
                updates.swapFromToken = sentTokens[0].symbol;
                updates.swapFromAmount = sentTokens[0].amount;
                updates.swapToToken = 'USDT'; // 假设换成 USDT
                updates.swapToAmount = sentTokens[0].amount;
              } else {
                // 兜底：使用前两个转账
                if (tokenTransfers.length >= 2) {
                  updates.swapFromToken = tokenTransfers[0].symbol;
                  updates.swapFromAmount = tokenTransfers[0].amount;
                  updates.swapToToken = tokenTransfers[1].symbol;
                  updates.swapToAmount = tokenTransfers[1].amount;
                } else {
                  updates.swapFromToken = transfer.symbol;
                  updates.swapFromAmount = transfer.amount;
                  updates.swapToToken = transfer.symbol;
                  updates.swapToAmount = transfer.amount;
                }
              }
              
              console.log('[HistoryService] Token transfer detected:', transfer);
              console.log('[HistoryService] Swap fields:', {
                swapFromToken: updates.swapFromToken,
                swapFromAmount: updates.swapFromAmount,
                swapToToken: updates.swapToToken,
                swapToAmount: updates.swapToAmount,
              });
            } else {
              console.log('[HistoryService] No token transfers found in logs');
            }
          } catch (parseError) {
            console.error('[HistoryService] Failed to parse token transfers:', parseError);
          }
        } else {
          console.log('[HistoryService] No logs in receipt');
        }

        await this.updateTransactionStatus(hash, updates.status!, updates);
        console.log('[HistoryService] Transaction updated:', hash, updates.status);
      } else {
        console.log('[HistoryService] Receipt not found yet for:', hash);
      }
    } catch (error) {
      console.error('[HistoryService] Failed to fetch transaction:', error);
    }
  }

  /**
   * 解析代币转账事件
   */
  private static async parseTokenTransfers(logs: any[], provider: any): Promise<Array<{
    address: string;
    symbol: string;
    amount: string;
    decimals: number;
    from: string;
    to: string;
  }>> {
    const transfers: Array<{
      address: string;
      symbol: string;
      amount: string;
      decimals: number;
      from: string;
      to: string;
    }> = [];

    // ERC20 Transfer 事件签名
    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    console.log('[HistoryService] Parsing', logs.length, 'logs for token transfers');

    for (const log of logs) {
      if (log.topics && log.topics[0] === TRANSFER_TOPIC) {
        console.log('[HistoryService] Found Transfer event in log:', log.address);
        try {
          const tokenAddress = log.address;
          const value = BigInt(log.data);
          
          // 解析 from 和 to 地址（topics[1] 是 from，topics[2] 是 to）
          const from = log.topics[1] ? '0x' + log.topics[1].slice(26) : '';
          const to = log.topics[2] ? '0x' + log.topics[2].slice(26) : '';
          
          console.log('[HistoryService] Token address:', tokenAddress, 'Value:', value.toString());
          console.log('[HistoryService] Transfer from:', from, 'to:', to);

          // 获取代币信息
          const tokenContract = new ethers.Contract(
            tokenAddress,
            [
              'function symbol() view returns (string)',
              'function decimals() view returns (uint8)',
            ],
            provider
          );

          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol().catch(() => 'Unknown'),
            tokenContract.decimals().catch(() => 18),
          ]);

          const amount = ethers.formatUnits(value, decimals);

          transfers.push({
            address: tokenAddress,
            symbol,
            amount,
            decimals,
            from,
            to,
          });

          console.log('[HistoryService] Parsed transfer:', { symbol, amount, tokenAddress, from, to });
        } catch (error) {
          console.warn('[HistoryService] Failed to parse log:', error);
        }
      }
    }

    return transfers;
  }
}
