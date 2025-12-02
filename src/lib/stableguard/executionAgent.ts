/**
 * Execution Agent (验证与执行智能体)
 * 负责验证策略合规性、执行风控措施并记录存证
 */

import { 
  StrategyBundle, 
  ExecutionRecord, 
  ExecutionAgentOutput,
  TransactionContext,
  TransactionEvaluation
} from './types';
import { isStablecoinAddress } from './config';

export class ExecutionAgent {
  /**
   * 评估交易风险
   */
  async evaluateTransaction(
    txParams: any,
    strategyBundle: StrategyBundle
  ): Promise<TransactionEvaluation> {
    console.log('[ExecutionAgent] Evaluating transaction');

    // 解析交易上下文
    const context = this.parseTransactionContext(txParams);

    // 获取风险报告（从 bundle 中提取）
    const riskReport = {
      stablecoinId: strategyBundle.stablecoinId,
      timestamp: strategyBundle.timestamp,
      riskLevel: strategyBundle.riskLevel,
      riskScore: 0, // 简化版，从 bundle 推断
      primaryFactors: [],
      secondaryFactors: [],
      summary: strategyBundle.uiRecommendations.alertMessage,
      detailedAnalysis: '',
      dataSource: [],
      analysisMethod: '',
      confidence: 0.8
    };

    // 根据策略建议做出决策
    const { allowTransaction, requireConfirmation, blockReason } = strategyBundle.behaviorRecommendations;

    let decision: 'allow' | 'warn' | 'block';
    let message: string;
    let details: string;

    if (!allowTransaction) {
      decision = 'block';
      message = blockReason || '交易被风控系统阻止';
      details = strategyBundle.uiRecommendations.alertMessage;
    } else if (requireConfirmation) {
      decision = 'warn';
      message = '检测到风险，需要您确认后继续';
      details = strategyBundle.behaviorRecommendations.confirmationMessage || '';
    } else {
      decision = 'allow';
      message = '风险可控，可以继续';
      details = strategyBundle.uiRecommendations.alertMessage;
    }

    return {
      context,
      riskReport,
      strategyBundle,
      decision,
      message,
      details,
      timestamp: Date.now()
    };
  }

  /**
   * 执行策略并记录
   */
  async executeStrategies(
    strategyBundle: StrategyBundle,
    triggerType: 'transaction' | 'scheduled' | 'manual',
    triggerData?: any
  ): Promise<ExecutionAgentOutput> {
    const startTime = Date.now();
    const records: ExecutionRecord[] = [];

    console.log('[ExecutionAgent] Executing strategies for', strategyBundle.stablecoinId);

    const record: ExecutionRecord = {
      id: `exec-${Date.now()}-${strategyBundle.stablecoinId}`,
      timestamp: Date.now(),
      stablecoinId: strategyBundle.stablecoinId,
      triggerType,
      triggerData,
      executedStrategies: strategyBundle.strategies,
      success: true,
      actions: []
    };

    // 执行每个策略
    for (const strategy of strategyBundle.strategies) {
      for (const action of strategy.actions) {
        try {
          const result = await this.executeAction(action);
          record.actions.push({
            type: action.operation,
            target: action.target,
            result: result ? 'success' : 'failed',
            message: result ? '执行成功' : '执行失败'
          });
        } catch (error: any) {
          console.error('[ExecutionAgent] Action execution failed:', error);
          record.actions.push({
            type: action.operation,
            target: action.target,
            result: 'failed',
            message: error.message
          });
          record.success = false;
        }
      }
    }

    records.push(record);

    // 存储执行记录
    await this.storeExecutionRecord(record);

    const executionTime = Date.now() - startTime;
    console.log(`[ExecutionAgent] Execution completed in ${executionTime}ms`);

    return {
      records,
      executionTime,
      totalActionsExecuted: record.actions.length
    };
  }

  /**
   * 解析交易上下文
   */
  private parseTransactionContext(txParams: any): TransactionContext {
    const from = txParams.from || '';
    const to = txParams.to || '';
    const value = txParams.value || '0x0';
    const data = txParams.data;
    const chainId = txParams.chainId || 1;

    // 检查是否为稳定币相关交易
    const { isStablecoin, stablecoinId } = isStablecoinAddress(to, chainId);

    // 简单解析操作类型（MVP）
    let operation: 'transfer' | 'approve' | 'swap' | 'redeem' | 'unknown' = 'unknown';
    if (isStablecoin) {
      if (data && data.startsWith('0xa9059cbb')) {
        operation = 'transfer';
      } else if (data && data.startsWith('0x095ea7b3')) {
        operation = 'approve';
      }
    }

    return {
      from,
      to,
      value,
      data,
      chainId,
      isStablecoinRelated: isStablecoin,
      stablecoinId,
      operation
    };
  }

  /**
   * 执行单个动作
   */
  private async executeAction(action: any): Promise<boolean> {
    console.log('[ExecutionAgent] Executing action:', action.operation);

    // MVP: 大部分动作由前端 UI 处理，这里只做标记
    switch (action.operation) {
      case 'display_status':
      case 'display_warning':
      case 'display_alert':
      case 'require_confirmation':
      case 'suggest_limit':
      case 'block':
        // 这些动作由前端 UI 执行
        return true;

      default:
        console.warn('[ExecutionAgent] Unknown action:', action.operation);
        return false;
    }
  }

  /**
   * 存储执行记录
   */
  private async storeExecutionRecord(record: ExecutionRecord): Promise<void> {
    try {
      // 存储到 chrome.storage.local
      const key = `stableguard_record_${record.id}`;
      await chrome.storage.local.set({ [key]: record });
      
      // 维护记录索引
      const { stableguard_record_index } = await chrome.storage.local.get('stableguard_record_index');
      const index = stableguard_record_index || [];
      index.push(record.id);
      
      // 只保留最近 100 条记录
      if (index.length > 100) {
        const removed = index.shift();
        await chrome.storage.local.remove(`stableguard_record_${removed}`);
      }
      
      await chrome.storage.local.set({ stableguard_record_index: index });
      
      console.log('[ExecutionAgent] Record stored:', record.id);
    } catch (error) {
      console.error('[ExecutionAgent] Failed to store record:', error);
    }
  }

  /**
   * 获取历史记录
   */
  async getExecutionHistory(limit: number = 20): Promise<ExecutionRecord[]> {
    try {
      const { stableguard_record_index } = await chrome.storage.local.get('stableguard_record_index');
      const index = stableguard_record_index || [];
      
      const recentIds = index.slice(-limit);
      const records: ExecutionRecord[] = [];
      
      for (const id of recentIds) {
        const key = `stableguard_record_${id}`;
        const result = await chrome.storage.local.get(key);
        if (result[key]) {
          records.push(result[key]);
        }
      }
      
      return records.reverse(); // 最新的在前
    } catch (error) {
      console.error('[ExecutionAgent] Failed to get history:', error);
      return [];
    }
  }
}

// 单例实例
export const executionAgent = new ExecutionAgent();
