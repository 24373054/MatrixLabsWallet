/**
 * Risk Assessment Agent (风险研判智能体)
 * 负责基于特征快照进行深度风险分析和等级评定
 */

import { FeatureSnapshot, RiskReport, RiskLevel, RiskFactor, RiskCategory, RiskAgentOutput } from './types';
import { RISK_SCORE_THRESHOLDS } from './config';

export class RiskAgent {
  /**
   * 分析风险并生成报告
   */
  async analyzeRisk(snapshots: FeatureSnapshot[]): Promise<RiskAgentOutput> {
    const startTime = Date.now();
    const reports: RiskReport[] = [];

    console.log('[RiskAgent] Analyzing risk for', snapshots.length, 'stablecoins');

    for (const snapshot of snapshots) {
      try {
        const report = this.generateRiskReport(snapshot);
        reports.push(report);
      } catch (error: any) {
        console.error(`[RiskAgent] Failed to analyze risk for ${snapshot.stablecoinId}:`, error);
      }
    }

    const analysisTime = Date.now() - startTime;
    console.log(`[RiskAgent] Risk analysis completed in ${analysisTime}ms`);

    return {
      reports,
      analysisTime,
      ragUsed: false // MVP: 暂不使用 RAG
    };
  }

  /**
   * 生成单个稳定币的风险报告
   */
  private generateRiskReport(snapshot: FeatureSnapshot): RiskReport {
    // 识别风险因子
    const primaryFactors = this.identifyPrimaryFactors(snapshot);
    const secondaryFactors = this.identifySecondaryFactors(snapshot);

    // 计算风险评分
    const riskScore = this.calculateRiskScore(snapshot, primaryFactors, secondaryFactors);
    
    // 确定风险等级
    const riskLevel = this.determineRiskLevel(riskScore);

    // 生成分析文本
    const summary = this.generateSummary(snapshot, riskLevel, primaryFactors);
    const detailedAnalysis = this.generateDetailedAnalysis(snapshot, primaryFactors, secondaryFactors);

    // MVP: 历史对比占位
    const historicalComparison = undefined;

    return {
      stablecoinId: snapshot.stablecoinId,
      timestamp: snapshot.timestamp,
      riskLevel,
      riskScore,
      primaryFactors,
      secondaryFactors,
      summary,
      detailedAnalysis,
      historicalComparison,
      dataSource: ['CoinGecko API', 'Feature Agent'],
      analysisMethod: 'Multi-factor weighted scoring',
      confidence: this.calculateConfidence(snapshot)
    };
  }

  /**
   * 识别主要风险因子
   */
  private identifyPrimaryFactors(snapshot: FeatureSnapshot): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // 价格偏离
    if (snapshot.priceDeviation.isAnomalous && snapshot.priceDeviation.severity > 0.5) {
      factors.push({
        category: RiskCategory.PRICE_DEVIATION,
        severity: snapshot.priceDeviation.severity,
        confidence: 0.9,
        evidence: [
          `当前价格偏离 ${snapshot.priceDeviation.value.toFixed(3)}%`,
          `超过动态阈值 ${snapshot.priceDeviation.dynamicThreshold.toFixed(3)}%`,
          `趋势: ${snapshot.trendDirection}`
        ],
        relatedFeatures: ['priceDeviation', 'volatility']
      });
    }

    // 流动性危机
    if (snapshot.liquidityRatio.isAnomalous && snapshot.liquidityRatio.severity > 0.6) {
      factors.push({
        category: RiskCategory.LIQUIDITY_CRISIS,
        severity: snapshot.liquidityRatio.severity,
        confidence: 0.75,
        evidence: [
          `流动性比率 ${snapshot.liquidityRatio.value.toFixed(2)}%`,
          `低于正常水平`,
          `可能影响大额交易执行`
        ],
        relatedFeatures: ['liquidityRatio']
      });
    }

    // 赎回压力
    if (snapshot.redeemPressure.isAnomalous && snapshot.redeemPressure.severity > 0.5) {
      factors.push({
        category: RiskCategory.REDEEM_PRESSURE,
        severity: snapshot.redeemPressure.severity,
        confidence: 0.7,
        evidence: [
          `赎回压力指数 ${snapshot.redeemPressure.value.toFixed(2)}`,
          `价格下行 + 交易量激增`,
          `可能存在挤兑风险`
        ],
        relatedFeatures: ['redeemPressure', 'volatility']
      });
    }

    // 鲸鱼活动
    if (snapshot.whaleActivityScore.isAnomalous) {
      factors.push({
        category: RiskCategory.WHALE_ACTIVITY,
        severity: snapshot.whaleActivityScore.severity,
        confidence: 0.8,
        evidence: [
          `检测到大额转账活动`,
          `鲸鱼活动评分 ${snapshot.whaleActivityScore.value}`,
          `可能引发市场波动`
        ],
        relatedFeatures: ['whaleActivityScore']
      });
    }

    // 按严重程度排序
    factors.sort((a, b) => b.severity - a.severity);

    return factors;
  }

  /**
   * 识别次要风险因子
   */
  private identifySecondaryFactors(snapshot: FeatureSnapshot): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // 波动率异常（作为次要因子）
    if (snapshot.volatility.isAnomalous && snapshot.volatility.severity <= 0.5) {
      factors.push({
        category: RiskCategory.PRICE_DEVIATION,
        severity: snapshot.volatility.severity,
        confidence: 0.6,
        evidence: [
          `价格波动率 ${snapshot.volatility.value.toFixed(3)}%`,
          `略高于正常水平`
        ],
        relatedFeatures: ['volatility']
      });
    }

    // 集中度风险（MVP 占位）
    if (snapshot.concentrationRisk.isAnomalous) {
      factors.push({
        category: RiskCategory.RESERVE_CONCERN,
        severity: snapshot.concentrationRisk.severity,
        confidence: 0.5,
        evidence: ['持仓集中度数据待完善'],
        relatedFeatures: ['concentrationRisk']
      });
    }

    return factors;
  }

  /**
   * 计算风险评分 (0-100)
   */
  private calculateRiskScore(
    snapshot: FeatureSnapshot,
    primaryFactors: RiskFactor[],
    secondaryFactors: RiskFactor[]
  ): number {
    // 基础分数：综合异常评分
    let score = snapshot.overallAnomalyScore;

    // 主要因子加权
    for (const factor of primaryFactors) {
      score += factor.severity * factor.confidence * 20;
    }

    // 次要因子加权
    for (const factor of secondaryFactors) {
      score += factor.severity * factor.confidence * 10;
    }

    // 趋势调整
    if (snapshot.trendDirection === 'deteriorating') {
      score *= 1.2;
    } else if (snapshot.trendDirection === 'improving') {
      score *= 0.8;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * 确定风险等级
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= RISK_SCORE_THRESHOLDS.VERY_HIGH.min) {
      return RiskLevel.VERY_HIGH;
    } else if (score >= RISK_SCORE_THRESHOLDS.HIGH.min) {
      return RiskLevel.HIGH;
    } else if (score >= RISK_SCORE_THRESHOLDS.MEDIUM.min) {
      return RiskLevel.MEDIUM;
    } else if (score >= RISK_SCORE_THRESHOLDS.LOW.min) {
      return RiskLevel.LOW;
    } else {
      return RiskLevel.VERY_LOW;
    }
  }

  /**
   * 生成简要总结
   */
  private generateSummary(
    snapshot: FeatureSnapshot,
    riskLevel: RiskLevel,
    primaryFactors: RiskFactor[]
  ): string {
    const levelText = this.getRiskLevelText(riskLevel);
    
    if (primaryFactors.length === 0) {
      return `${snapshot.stablecoinId.toUpperCase()} 当前处于 ${levelText}，各项指标正常。`;
    }

    const mainIssue = this.getCategoryText(primaryFactors[0].category);
    const trend = snapshot.trendDirection === 'deteriorating' ? '，且趋势恶化' : '';
    
    return `${snapshot.stablecoinId.toUpperCase()} 当前处于 ${levelText}，主要风险来自${mainIssue}${trend}。`;
  }

  /**
   * 生成详细分析
   */
  private generateDetailedAnalysis(
    snapshot: FeatureSnapshot,
    primaryFactors: RiskFactor[],
    secondaryFactors: RiskFactor[]
  ): string {
    const parts: string[] = [];

    // 整体评估
    parts.push(`综合异常评分: ${snapshot.overallAnomalyScore.toFixed(1)}/100`);
    parts.push(`趋势方向: ${this.getTrendText(snapshot.trendDirection)}`);

    // 主要风险
    if (primaryFactors.length > 0) {
      parts.push('\n【主要风险因子】');
      for (const factor of primaryFactors) {
        parts.push(`• ${this.getCategoryText(factor.category)} (严重度: ${(factor.severity * 100).toFixed(0)}%)`);
        parts.push(`  ${factor.evidence.join('; ')}`);
      }
    }

    // 次要风险
    if (secondaryFactors.length > 0) {
      parts.push('\n【次要风险因子】');
      for (const factor of secondaryFactors) {
        parts.push(`• ${this.getCategoryText(factor.category)}: ${factor.evidence[0]}`);
      }
    }

    // 特征详情
    parts.push('\n【关键特征】');
    parts.push(`• ${snapshot.priceDeviation.description}`);
    parts.push(`• ${snapshot.volatility.description}`);
    parts.push(`• ${snapshot.liquidityRatio.description}`);

    return parts.join('\n');
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(snapshot: FeatureSnapshot): number {
    // 基于数据完整性和特征一致性
    let confidence = 0.8; // 基础置信度

    // 如果多个特征都指向同一风险方向，提高置信度
    const anomalousCount = [
      snapshot.priceDeviation,
      snapshot.volatility,
      snapshot.liquidityRatio,
      snapshot.redeemPressure,
      snapshot.whaleActivityScore
    ].filter(f => f.isAnomalous).length;

    if (anomalousCount >= 3) {
      confidence = 0.95;
    } else if (anomalousCount >= 2) {
      confidence = 0.85;
    }

    return confidence;
  }

  /**
   * 获取风险等级文本
   */
  private getRiskLevelText(level: RiskLevel): string {
    const texts: Record<RiskLevel, string> = {
      [RiskLevel.VERY_LOW]: '极低风险',
      [RiskLevel.LOW]: '低风险',
      [RiskLevel.MEDIUM]: '中等风险',
      [RiskLevel.HIGH]: '高风险',
      [RiskLevel.VERY_HIGH]: '极高风险'
    };
    return texts[level];
  }

  /**
   * 获取风险类别文本
   */
  private getCategoryText(category: RiskCategory): string {
    const texts: Record<RiskCategory, string> = {
      [RiskCategory.PRICE_DEVIATION]: '价格偏离',
      [RiskCategory.LIQUIDITY_CRISIS]: '流动性危机',
      [RiskCategory.WHALE_ACTIVITY]: '鲸鱼活动',
      [RiskCategory.REDEEM_PRESSURE]: '赎回压力',
      [RiskCategory.RESERVE_CONCERN]: '储备担忧',
      [RiskCategory.REGULATORY_RISK]: '监管风险',
      [RiskCategory.SENTIMENT_NEGATIVE]: '负面舆情',
      [RiskCategory.TECHNICAL_ISSUE]: '技术问题'
    };
    return texts[category];
  }

  /**
   * 获取趋势文本
   */
  private getTrendText(trend: 'improving' | 'stable' | 'deteriorating'): string {
    const texts = {
      improving: '改善中 ↗',
      stable: '稳定 →',
      deteriorating: '恶化中 ↘'
    };
    return texts[trend];
  }
}

// 单例实例
export const riskAgent = new RiskAgent();
