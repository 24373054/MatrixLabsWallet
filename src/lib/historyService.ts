/**
 * Transaction History Service
 * 交易历史记录服务
 */

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
      history[index] = {
        ...history[index],
        status,
        ...updates,
      };
      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
      console.log('[HistoryService] Transaction status updated:', hash, status);
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

        await this.updateTransactionStatus(hash, updates.status!, updates);
        console.log('[HistoryService] Transaction updated:', hash, updates.status);
      } else {
        console.log('[HistoryService] Receipt not found yet for:', hash);
      }
    } catch (error) {
      console.error('[HistoryService] Failed to fetch transaction:', error);
    }
  }
}
