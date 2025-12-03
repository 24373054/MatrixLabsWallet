/**
 * StableGuard - Multi-Agent Risk Control System
 * 稳定币风险控制系统主入口
 */

export * from './types';
export * from './config';
export * from './dataAgent';
export * from './featureAgent';
export * from './riskAgent';
export * from './strategyAgent';
export * from './executionAgent';

import { dataAgent } from './dataAgent';
import { featureAgent } from './featureAgent';
import { riskAgent } from './riskAgent';
import { strategyAgent } from './strategyAgent';
import { executionAgent } from './executionAgent';
import { DEFAULT_STABLEGUARD_CONFIG, isStablecoinAddress } from './config';
import { TransactionEvaluation, StableGuardConfig, StableGuardEvent, RiskLevel } from './types';

/**
 * StableGuard 主控制器
 */
export class StableGuard {
  private config: StableGuardConfig;
  private isRunning: boolean = false;

  constructor(config?: Partial<StableGuardConfig>) {
    this.config = { ...DEFAULT_STABLEGUARD_CONFIG, ...config };
    console.log('[StableGuard] Initialized with config:', this.config);
  }

  /**
   * 启用 StableGuard
   */
  enable(): void {
    this.config.enabled = true;
    this.saveConfig();
    console.log('[StableGuard] Enabled');
  }

  /**
   * 禁用 StableGuard
   */
  disable(): void {
    this.config.enabled = false;
    this.saveConfig();
    console.log('[StableGuard] Disabled');
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<StableGuardConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    console.log('[StableGuard] Config updated');
  }

  /**
   * 获取当前配置
   */
  getConfig(): StableGuardConfig {
    return { ...this.config };
  }

  /**
   * 执行完整的风险评估流程
   */
  async performRiskAssessment(): Promise<{
    success: boolean;
    timestamp: number;
    stablecoins: Array<{
      id: string;
      riskLevel: RiskLevel;
      riskScore: number;
      summary: string;
    }>;
    error?: string;
  }> {
    if (!this.config.enabled) {
      return {
        success: false,
        timestamp: Date.now(),
        stablecoins: [],
        error: 'StableGuard is disabled'
      };
    }

    if (this.isRunning) {
      console.warn('[StableGuard] Assessment already running');
      return {
        success: false,
        timestamp: Date.now(),
        stablecoins: [],
        error: 'Assessment already in progress'
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const metrics: any = {};

    try {
      console.log('[StableGuard] Starting risk assessment...');

      // 1. 数据感知
      const dataStart = Date.now();
      const dataOutput = await dataAgent.collectData(this.config.monitoredStablecoins);
      metrics.dataAgent = {
        duration: Date.now() - dataStart,
        dataPoints: dataOutput.signals.length,
        quality: dataOutput.dataQuality
      };
      if (dataOutput.dataQuality === 'low') {
        console.warn('[StableGuard] Low data quality detected');
      }

      // 2. 特征工程
      const featureStart = Date.now();
      const featureOutput = await featureAgent.calculateFeatures(dataOutput.signals);
      metrics.featureAgent = {
        duration: Date.now() - featureStart,
        dataPoints: featureOutput.snapshots.length * 6 // 6 features per stablecoin
      };

      // 3. 风险研判
      const riskStart = Date.now();
      const riskOutput = await riskAgent.analyzeRisk(featureOutput.snapshots);
      metrics.riskAgent = {
        duration: Date.now() - riskStart,
        dataPoints: riskOutput.reports.length
      };

      // 4. 策略生成
      const strategyStart = Date.now();
      const strategyOutput = await strategyAgent.generateStrategies(
        riskOutput.reports,
        this.config.strictMode
      );
      metrics.strategyAgent = {
        duration: Date.now() - strategyStart,
        dataPoints: strategyOutput.bundles.length
      };

      // 5. 存储结果
      const executionStart = Date.now();
      await this.storeAssessmentResults(riskOutput.reports, strategyOutput.bundles, dataOutput.signals);
      metrics.executionAgent = {
        duration: Date.now() - executionStart,
        dataPoints: riskOutput.reports.length
      };

      // 存储性能指标
      await chrome.storage.local.set({
        stableguard_metrics: metrics,
        stableguard_metrics_timestamp: Date.now()
      });

      const duration = Date.now() - startTime;
      console.log(`[StableGuard] Assessment completed in ${duration}ms`);
      console.log('[StableGuard] Metrics:', metrics);

      // 返回简化结果
      const stablecoins = riskOutput.reports.map(report => ({
        id: report.stablecoinId,
        riskLevel: report.riskLevel,
        riskScore: report.riskScore,
        summary: report.summary
      }));

      return {
        success: true,
        timestamp: Date.now(),
        stablecoins
      };

    } catch (error: any) {
      console.error('[StableGuard] Assessment failed:', error);
      return {
        success: false,
        timestamp: Date.now(),
        stablecoins: [],
        error: error.message
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 评估单笔交易
   */
  async evaluateTransaction(txParams: any): Promise<TransactionEvaluation | null> {
    if (!this.config.enabled) {
      console.log('[StableGuard] Disabled, skipping transaction evaluation');
      return null;
    }

    try {
      console.log('[StableGuard] Evaluating transaction');

      // 检查是否为稳定币相关交易
      const chainId = txParams.chainId || 1;
      const { isStablecoin, stablecoinId } = isStablecoinAddress(txParams.to, chainId);

      if (!isStablecoin || !stablecoinId) {
        console.log('[StableGuard] Not a stablecoin transaction, skipping');
        return null;
      }

      // 获取该稳定币的最新风险评估
      const cachedReport = await this.getCachedRiskReport(stablecoinId);
      
      if (!cachedReport) {
        console.log('[StableGuard] No cached risk report, performing fresh assessment');
        await this.performRiskAssessment();
        const freshReport = await this.getCachedRiskReport(stablecoinId);
        if (!freshReport) {
          console.warn('[StableGuard] Failed to get risk report');
          return null;
        }
      }

      // 获取策略包
      const cachedBundle = await this.getCachedStrategyBundle(stablecoinId);
      if (!cachedBundle) {
        console.warn('[StableGuard] No strategy bundle found');
        return null;
      }

      // 执行交易评估
      const evaluation = await executionAgent.evaluateTransaction(txParams, cachedBundle);

      // 记录事件
      await this.recordEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        stablecoinId,
        eventType: 'transaction_evaluated',
        severity: cachedBundle.riskLevel,
        title: '交易风险评估',
        description: evaluation.message
      });

      return evaluation;

    } catch (error: any) {
      console.error('[StableGuard] Transaction evaluation failed:', error);
      return null;
    }
  }

  /**
   * 获取缓存的风险报告
   */
  private async getCachedRiskReport(stablecoinId: string): Promise<any> {
    try {
      const key = `stableguard_risk_${stablecoinId}`;
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      console.error('[StableGuard] Failed to get cached report:', error);
      return null;
    }
  }

  /**
   * 获取缓存的策略包
   */
  private async getCachedStrategyBundle(stablecoinId: string): Promise<any> {
    try {
      const key = `stableguard_strategy_${stablecoinId}`;
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      console.error('[StableGuard] Failed to get cached bundle:', error);
      return null;
    }
  }

  /**
   * 存储评估结果
   */
  private async storeAssessmentResults(reports: any[], bundles: any[], signals?: any[]): Promise<void> {
    try {
      const data: Record<string, any> = {};

      // 存储每个稳定币的报告和策略
      for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        const bundle = bundles[i];
        
        // 添加当前价格数据（用于价格图表）
        const signal = signals?.find(s => s.stablecoinId === report.stablecoinId);
        if (signal) {
          report.currentPrice = signal.price;
          report.priceChange24h = signal.priceChange24h;
        }
        
        data[`stableguard_risk_${report.stablecoinId}`] = report;
        data[`stableguard_strategy_${report.stablecoinId}`] = bundle;
      }

      // 存储最后更新时间
      data.stableguard_last_update = Date.now();

      await chrome.storage.local.set(data);
      console.log('[StableGuard] Assessment results stored');
    } catch (error) {
      console.error('[StableGuard] Failed to store results:', error);
    }
  }

  /**
   * 记录事件
   */
  private async recordEvent(event: StableGuardEvent): Promise<void> {
    try {
      const { stableguard_events } = await chrome.storage.local.get('stableguard_events');
      const events = stableguard_events || [];
      
      events.push(event);
      
      // 只保留最近 50 条事件
      if (events.length > 50) {
        events.shift();
      }
      
      await chrome.storage.local.set({ stableguard_events: events });
    } catch (error) {
      console.error('[StableGuard] Failed to record event:', error);
    }
  }

  /**
   * 获取事件历史
   */
  async getEventHistory(limit: number = 20): Promise<StableGuardEvent[]> {
    try {
      const { stableguard_events } = await chrome.storage.local.get('stableguard_events');
      const events = stableguard_events || [];
      return events.slice(-limit).reverse();
    } catch (error) {
      console.error('[StableGuard] Failed to get event history:', error);
      return [];
    }
  }

  /**
   * 保存配置
   */
  private async saveConfig(): Promise<void> {
    try {
      await chrome.storage.local.set({ stableguard_config: this.config });
    } catch (error) {
      console.error('[StableGuard] Failed to save config:', error);
    }
  }

  /**
   * 加载配置
   */
  static async loadConfig(): Promise<StableGuardConfig> {
    try {
      const { stableguard_config } = await chrome.storage.local.get('stableguard_config');
      return stableguard_config || DEFAULT_STABLEGUARD_CONFIG;
    } catch (error) {
      console.error('[StableGuard] Failed to load config:', error);
      return DEFAULT_STABLEGUARD_CONFIG;
    }
  }
}

// 创建全局实例
let stableGuardInstance: StableGuard | null = null;

/**
 * 获取 StableGuard 实例
 */
export async function getStableGuard(): Promise<StableGuard> {
  if (!stableGuardInstance) {
    const config = await StableGuard.loadConfig();
    stableGuardInstance = new StableGuard(config);
  }
  return stableGuardInstance;
}
