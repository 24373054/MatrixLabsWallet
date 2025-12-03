/**
 * Feature Engineering Agent (特征工程智能体)
 * 负责将原始数据转化为风险特征，并进行动态阈值异常检测
 */

import { RawDataSignal, FeatureSnapshot, RiskFeature, FeatureAgentOutput } from './types';
import { FEATURE_PARAMS } from './config';

interface HistoricalData {
  timestamps: number[];
  prices: number[];
  volumes: number[];
  priceChanges: number[];
}

export class FeatureAgent {
  private history: Map<string, HistoricalData> = new Map();
  private readonly maxHistorySize = FEATURE_PARAMS.WINDOW_SIZE;

  /**
   * 计算特征快照
   */
  async calculateFeatures(signals: RawDataSignal[]): Promise<FeatureAgentOutput> {
    const startTime = Date.now();
    const snapshots: FeatureSnapshot[] = [];

    console.log('[FeatureAgent] Calculating features for', signals.length, 'stablecoins');

    for (const signal of signals) {
      try {
        // 更新历史数据
        this.updateHistory(signal);
        
        // 计算特征快照
        const snapshot = this.calculateSnapshot(signal);
        snapshots.push(snapshot);
      } catch (error: any) {
        console.error(`[FeatureAgent] Failed to calculate features for ${signal.stablecoinId}:`, error);
      }
    }

    const calculationTime = Date.now() - startTime;
    console.log(`[FeatureAgent] Feature calculation completed in ${calculationTime}ms`);

    return {
      snapshots,
      calculationTime,
      windowSize: this.maxHistorySize
    };
  }

  /**
   * 更新历史数据
   */
  private updateHistory(signal: RawDataSignal): void {
    let history = this.history.get(signal.stablecoinId);
    
    if (!history) {
      history = {
        timestamps: [],
        prices: [],
        volumes: [],
        priceChanges: []
      };
      this.history.set(signal.stablecoinId, history);
    }

    // 添加新数据
    history.timestamps.push(signal.timestamp);
    history.prices.push(signal.price);
    history.volumes.push(signal.volume24h);
    history.priceChanges.push(signal.priceChange24h);

    // 保持窗口大小
    if (history.timestamps.length > this.maxHistorySize) {
      history.timestamps.shift();
      history.prices.shift();
      history.volumes.shift();
      history.priceChanges.shift();
    }
  }

  /**
   * 计算单个稳定币的特征快照
   */
  private calculateSnapshot(signal: RawDataSignal): FeatureSnapshot {
    const history = this.history.get(signal.stablecoinId)!;
    
    // 计算各项特征
    const priceDeviation = this.calculatePriceDeviation(signal);
    const volatility = this.calculateVolatility(history);
    const liquidityRatio = this.calculateLiquidityRatio(signal);
    const redeemPressure = this.calculateRedeemPressure(signal, history);
    const whaleActivityScore = this.calculateWhaleActivity(signal);
    const concentrationRisk = this.calculateConcentrationRisk(signal);

    // 计算综合异常评分
    const features = [priceDeviation, volatility, liquidityRatio, redeemPressure, whaleActivityScore, concentrationRisk];
    const overallAnomalyScore = this.calculateOverallScore(features);
    
    // 判断趋势
    const trendDirection = this.calculateTrend(history);

    return {
      stablecoinId: signal.stablecoinId,
      timestamp: signal.timestamp,
      priceDeviation,
      volatility,
      liquidityRatio,
      redeemPressure,
      whaleActivityScore,
      concentrationRisk,
      overallAnomalyScore,
      trendDirection
    };
  }

  /**
   * 计算价格偏离度特征
   */
  private calculatePriceDeviation(signal: RawDataSignal): RiskFeature {
    const pegTarget = 1.0;
    const deviation = Math.abs(signal.price - pegTarget);
    const deviationPercent = (deviation / pegTarget) * 100;

    // 静态阈值
    const threshold = 0.5; // 0.5%
    
    // 动态阈值（基于历史波动）
    const history = this.history.get(signal.stablecoinId);
    const dynamicThreshold = history && history.prices.length >= FEATURE_PARAMS.THRESHOLD_MIN_SAMPLES
      ? this.calculateDynamicThreshold(history.prices, pegTarget)
      : threshold;

    const isAnomalous = deviationPercent > dynamicThreshold;
    const severity = Math.min(deviationPercent / (dynamicThreshold * 2), 1.0);

    return {
      name: 'priceDeviation',
      value: deviationPercent,
      threshold,
      dynamicThreshold,
      isAnomalous,
      severity,
      description: `价格偏离锚定值 ${deviationPercent.toFixed(3)}%`
    };
  }

  /**
   * 计算波动率特征
   */
  private calculateVolatility(history: HistoricalData): RiskFeature {
    const threshold = 2.0; // 2% 波动率阈值
    
    let volatility = 0;
    if (history.prices.length >= 2) {
      const returns = [];
      for (let i = 1; i < history.prices.length; i++) {
        const ret = (history.prices[i] - history.prices[i-1]) / history.prices[i-1];
        returns.push(ret);
      }
      volatility = this.calculateStdDev(returns) * 100; // 转换为百分比
    }

    const dynamicThreshold = history.prices.length >= FEATURE_PARAMS.THRESHOLD_MIN_SAMPLES
      ? Math.max(threshold, volatility * 0.8) // 动态调整
      : threshold;

    const isAnomalous = volatility > dynamicThreshold;
    const severity = Math.min(volatility / (dynamicThreshold * 2), 1.0);

    return {
      name: 'volatility',
      value: volatility,
      threshold,
      dynamicThreshold,
      isAnomalous,
      severity,
      description: `价格波动率 ${volatility.toFixed(3)}%`
    };
  }

  /**
   * 计算流动性比率特征
   */
  private calculateLiquidityRatio(signal: RawDataSignal): RiskFeature {
    // 流动性比率 = 24h交易量 / 市值
    const ratio = signal.marketCap > 0 ? (signal.volume24h / signal.marketCap) * 100 : 0;
    
    const threshold = 5.0; // 5% 为正常流动性
    const dynamicThreshold = threshold; // MVP: 暂不动态调整

    // 流动性过低或过高都可能有问题
    const isAnomalous = ratio < threshold * 0.5 || ratio > threshold * 3;
    const severity = ratio < threshold * 0.5 
      ? Math.min((threshold * 0.5 - ratio) / (threshold * 0.5), 1.0)
      : Math.min((ratio - threshold * 3) / (threshold * 3), 1.0);

    return {
      name: 'liquidityRatio',
      value: ratio,
      threshold,
      dynamicThreshold,
      isAnomalous,
      severity,
      description: `流动性比率 ${ratio.toFixed(2)}%`
    };
  }

  /**
   * 计算赎回压力特征
   */
  private calculateRedeemPressure(signal: RawDataSignal, history: HistoricalData): RiskFeature {
    // MVP: 使用价格变化和交易量变化作为代理指标
    const priceChange = signal.priceChange24h;
    const volumeChange = history.volumes.length >= 2
      ? ((signal.volume24h - history.volumes[history.volumes.length - 2]) / history.volumes[history.volumes.length - 2]) * 100
      : 0;

    // 赎回压力 = 价格下跌 + 交易量激增
    const pressure = priceChange < 0 && volumeChange > 50 
      ? Math.abs(priceChange) * (volumeChange / 100)
      : 0;

    const threshold = 5.0;
    const dynamicThreshold = threshold;

    const isAnomalous = pressure > threshold;
    const severity = Math.min(pressure / (threshold * 2), 1.0);

    return {
      name: 'redeemPressure',
      value: pressure,
      threshold,
      dynamicThreshold,
      isAnomalous,
      severity,
      description: `赎回压力指数 ${pressure.toFixed(2)}`
    };
  }

  /**
   * 计算鲸鱼活动评分
   */
  private calculateWhaleActivity(signal: RawDataSignal): RiskFeature {
    // MVP: 基于大额转账数量
    const largeTransferCount = signal.largeTransfers?.length || 0;
    const score = largeTransferCount * 10; // 每笔大额转账贡献10分

    const threshold = 20;
    const dynamicThreshold = threshold;

    const isAnomalous = score > threshold;
    const severity = Math.min(score / (threshold * 2), 1.0);

    return {
      name: 'whaleActivityScore',
      value: score,
      threshold,
      dynamicThreshold,
      isAnomalous,
      severity,
      description: `鲸鱼活动评分 ${score}`
    };
  }

  /**
   * 计算集中度风险
   */
  private calculateConcentrationRisk(signal: RawDataSignal): RiskFeature {
    // MVP: 占位，未来可基于链上地址分布计算
    const risk = 0;
    
    const threshold = 50;
    const dynamicThreshold = threshold;

    return {
      name: 'concentrationRisk',
      value: risk,
      threshold,
      dynamicThreshold,
      isAnomalous: false,
      severity: 0,
      description: '集中度风险 (未实现)'
    };
  }

  /**
   * 计算综合异常评分
   */
  private calculateOverallScore(features: RiskFeature[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    // 权重配置
    const weights: Record<string, number> = {
      priceDeviation: 3.0,
      volatility: 2.5,
      liquidityRatio: 2.0,
      redeemPressure: 2.5,
      whaleActivityScore: 1.5,
      concentrationRisk: 1.0
    };

    for (const feature of features) {
      const weight = weights[feature.name] || 1.0;
      if (feature.isAnomalous) {
        totalScore += feature.severity * weight * 100;
      }
      totalWeight += weight;
    }

    return Math.min(totalScore / totalWeight, 100);
  }

  /**
   * 计算趋势方向
   */
  private calculateTrend(history: HistoricalData): 'improving' | 'stable' | 'deteriorating' {
    if (history.prices.length < FEATURE_PARAMS.TREND_WINDOW) {
      return 'stable';
    }

    const recentPrices = history.prices.slice(-FEATURE_PARAMS.TREND_WINDOW);
    const avgRecent = this.calculateMean(recentPrices);
    const targetPrice = 1.0;

    const deviation = Math.abs(avgRecent - targetPrice);
    const previousDeviation = history.prices.length > FEATURE_PARAMS.TREND_WINDOW
      ? Math.abs(history.prices[history.prices.length - FEATURE_PARAMS.TREND_WINDOW - 1] - targetPrice)
      : deviation;

    if (deviation < previousDeviation * (1 - FEATURE_PARAMS.TREND_THRESHOLD)) {
      return 'improving';
    } else if (deviation > previousDeviation * (1 + FEATURE_PARAMS.TREND_THRESHOLD)) {
      return 'deteriorating';
    } else {
      return 'stable';
    }
  }

  /**
   * 计算动态阈值
   */
  private calculateDynamicThreshold(values: number[], target: number): number {
    const deviations = values.map(v => Math.abs(v - target));
    const mean = this.calculateMean(deviations);
    const stdDev = this.calculateStdDev(deviations);
    
    return (mean + stdDev * FEATURE_PARAMS.THRESHOLD_MULTIPLIER) * 100;
  }

  /**
   * 计算均值
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * 计算标准差
   */
  private calculateStdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.history.clear();
    console.log('[FeatureAgent] History cleared');
  }

  /**
   * 获取历史数据（用于调试）
   */
  getHistory(stablecoinId: string): HistoricalData | undefined {
    return this.history.get(stablecoinId);
  }
}

// 单例实例
export const featureAgent = new FeatureAgent();
