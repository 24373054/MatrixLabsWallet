/**
 * Strategy Generation Agent (策略生成智能体)
 * 负责根据风险报告生成多维度、合规的应对策略
 */

import { 
  RiskReport, 
  StrategyBundle, 
  Strategy, 
  StrategyType, 
  ActionLevel, 
  RiskLevel,
  StrategyAgentOutput 
} from './types';
import { DISPLAY_CONFIG } from './config';

export class StrategyAgent {
  /**
   * 生成策略包
   */
  async generateStrategies(reports: RiskReport[], userStrictMode: 'none' | 'warn' | 'block'): Promise<StrategyAgentOutput> {
    const startTime = Date.now();
    const bundles: StrategyBundle[] = [];

    console.log('[StrategyAgent] Generating strategies for', reports.length, 'risk reports');

    for (const report of reports) {
      try {
        const bundle = this.generateStrategyBundle(report, userStrictMode);
        bundles.push(bundle);
      } catch (error: any) {
        console.error(`[StrategyAgent] Failed to generate strategy for ${report.stablecoinId}:`, error);
      }
    }

    const generationTime = Date.now() - startTime;
    console.log(`[StrategyAgent] Strategy generation completed in ${generationTime}ms`);

    return {
      bundles,
      generationTime,
      llmUsed: false // MVP: 暂不使用大模型
    };
  }

  /**
   * 生成单个稳定币的策略包
   */
  private generateStrategyBundle(report: RiskReport, userStrictMode: 'none' | 'warn' | 'block'): StrategyBundle {
    const strategies: Strategy[] = [];

    // 根据风险等级生成策略
    strategies.push(...this.generateInformationStrategies(report));
    strategies.push(...this.generateControlStrategies(report, userStrictMode));
    
    // 生成 UI 建议
    const uiRecommendations = this.generateUIRecommendations(report);
    
    // 生成行为建议
    const behaviorRecommendations = this.generateBehaviorRecommendations(report, userStrictMode);

    return {
      stablecoinId: report.stablecoinId,
      riskLevel: report.riskLevel,
      timestamp: report.timestamp,
      strategies,
      uiRecommendations,
      behaviorRecommendations
    };
  }

  /**
   * 生成信息披露策略
   */
  private generateInformationStrategies(report: RiskReport): Strategy[] {
    const strategies: Strategy[] = [];

    // 根据风险等级决定信息披露级别
    if (report.riskLevel === RiskLevel.VERY_LOW || report.riskLevel === RiskLevel.LOW) {
      // 低风险：仅在面板显示
      strategies.push({
        id: `info-${report.stablecoinId}-status`,
        type: StrategyType.INFORMATION,
        actionLevel: ActionLevel.MONITOR,
        priority: 1,
        title: '状态正常',
        description: '当前风险等级较低，继续监控',
        actions: [{
          target: 'user',
          operation: 'display_status',
          parameters: { level: 'info', message: report.summary }
        }],
        expectedImpact: '用户了解当前状态',
        isCompliant: true
      });
    } else if (report.riskLevel === RiskLevel.MEDIUM) {
      // 中等风险：显示警告
      strategies.push({
        id: `info-${report.stablecoinId}-warning`,
        type: StrategyType.INFORMATION,
        actionLevel: ActionLevel.WARN,
        priority: 2,
        title: '风险提示',
        description: '检测到中等风险，建议谨慎操作',
        actions: [{
          target: 'user',
          operation: 'display_warning',
          parameters: { 
            level: 'warning', 
            message: report.summary,
            details: report.detailedAnalysis
          }
        }],
        expectedImpact: '提高用户风险意识',
        isCompliant: true
      });
    } else {
      // 高风险：显示严重警告
      strategies.push({
        id: `info-${report.stablecoinId}-alert`,
        type: StrategyType.INFORMATION,
        actionLevel: ActionLevel.WARN,
        priority: 3,
        title: '高风险警报',
        description: '检测到高风险，强烈建议暂停大额操作',
        actions: [{
          target: 'user',
          operation: 'display_alert',
          parameters: { 
            level: 'error', 
            message: report.summary,
            details: report.detailedAnalysis,
            urgent: true
          }
        }],
        expectedImpact: '警示用户避免高风险操作',
        potentialSideEffects: ['可能引起用户恐慌'],
        isCompliant: true
      });
    }

    return strategies;
  }

  /**
   * 生成控制措施策略
   */
  private generateControlStrategies(report: RiskReport, userStrictMode: 'none' | 'warn' | 'block'): Strategy[] {
    const strategies: Strategy[] = [];

    // 仅在中高风险时生成控制策略
    if (report.riskLevel === RiskLevel.MEDIUM || 
        report.riskLevel === RiskLevel.HIGH || 
        report.riskLevel === RiskLevel.VERY_HIGH) {
      
      // 根据用户设置的严格模式决定控制级别
      if (userStrictMode === 'block' && report.riskLevel >= RiskLevel.HIGH) {
        // 阻止模式：高风险时直接阻止交易
        strategies.push({
          id: `control-${report.stablecoinId}-block`,
          type: StrategyType.CONTROL,
          actionLevel: ActionLevel.BLOCK,
          priority: 5,
          title: '阻止交易',
          description: '风险过高，暂时阻止相关交易',
          actions: [{
            target: 'transaction',
            operation: 'block',
            parameters: { 
              reason: '当前风险等级过高，为保护资产安全已暂停交易',
              riskLevel: report.riskLevel
            }
          }],
          expectedImpact: '防止用户在高风险时期遭受损失',
          potentialSideEffects: ['用户可能无法及时止损'],
          isCompliant: true,
          complianceNotes: '基于用户预授权的风控设置'
        });
      } else if (userStrictMode === 'warn' || report.riskLevel === RiskLevel.MEDIUM) {
        // 警告模式：要求二次确认
        strategies.push({
          id: `control-${report.stablecoinId}-confirm`,
          type: StrategyType.CONTROL,
          actionLevel: ActionLevel.RESTRICT,
          priority: 3,
          title: '二次确认',
          description: '要求用户确认风险后继续',
          actions: [{
            target: 'transaction',
            operation: 'require_confirmation',
            parameters: { 
              message: `当前 ${report.stablecoinId.toUpperCase()} 处于${this.getRiskLevelText(report.riskLevel)}，确认继续？`,
              details: report.summary
            }
          }],
          expectedImpact: '确保用户知情决策',
          isCompliant: true
        });

        // 建议限额
        if (report.riskLevel >= RiskLevel.HIGH) {
          strategies.push({
            id: `control-${report.stablecoinId}-limit`,
            type: StrategyType.CONTROL,
            actionLevel: ActionLevel.RESTRICT,
            priority: 4,
            title: '建议限额',
            description: '建议降低单笔交易金额',
            actions: [{
              target: 'transaction',
              operation: 'suggest_limit',
              parameters: { 
                suggestedMaxUSD: 1000,
                reason: '高风险时期建议分散操作'
              }
            }],
            expectedImpact: '降低单笔损失风险',
            isCompliant: true
          });
        }
      }
    }

    return strategies;
  }

  /**
   * 生成 UI 建议
   */
  private generateUIRecommendations(report: RiskReport) {
    const colorMap: Record<RiskLevel, 'green' | 'yellow' | 'orange' | 'red'> = {
      [RiskLevel.VERY_LOW]: 'green',
      [RiskLevel.LOW]: 'green',
      [RiskLevel.MEDIUM]: 'yellow',
      [RiskLevel.HIGH]: 'orange',
      [RiskLevel.VERY_HIGH]: 'red'
    };

    const messageMap: Record<RiskLevel, string> = {
      [RiskLevel.VERY_LOW]: '风险极低，可正常操作',
      [RiskLevel.LOW]: '风险较低，可正常操作',
      [RiskLevel.MEDIUM]: '存在中等风险，请谨慎操作',
      [RiskLevel.HIGH]: '风险较高，建议暂缓大额操作',
      [RiskLevel.VERY_HIGH]: '风险极高，强烈建议暂停操作'
    };

    return {
      displayColor: colorMap[report.riskLevel],
      alertMessage: messageMap[report.riskLevel],
      showWarningBadge: report.riskLevel >= RiskLevel.MEDIUM
    };
  }

  /**
   * 生成行为建议
   */
  private generateBehaviorRecommendations(report: RiskReport, userStrictMode: 'none' | 'warn' | 'block') {
    // 默认允许交易
    let allowTransaction = true;
    let requireConfirmation = false;
    let confirmationMessage: string | undefined;
    let suggestedAmountLimit: string | undefined;
    let blockReason: string | undefined;

    // 根据风险等级和用户设置决定行为
    if (report.riskLevel >= RiskLevel.HIGH && userStrictMode === 'block') {
      // 高风险 + 阻止模式 = 直接阻止
      allowTransaction = false;
      blockReason = `${report.stablecoinId.toUpperCase()} 当前处于${this.getRiskLevelText(report.riskLevel)}，为保护您的资产安全，已暂停相关交易。\n\n${report.summary}`;
    } else if (report.riskLevel >= RiskLevel.MEDIUM) {
      // 中高风险 = 需要确认
      requireConfirmation = true;
      confirmationMessage = `⚠️ 风险提示\n\n${report.summary}\n\n请确认您了解当前风险并愿意继续操作。`;
      
      if (report.riskLevel >= RiskLevel.HIGH) {
        suggestedAmountLimit = '1000'; // 建议限额 1000 USD
      }
    }

    return {
      allowTransaction,
      requireConfirmation,
      confirmationMessage,
      suggestedAmountLimit,
      blockReason
    };
  }

  /**
   * 获取风险等级文本
   */
  private getRiskLevelText(level: RiskLevel): string {
    return DISPLAY_CONFIG.RISK_LABELS[level];
  }
}

// 单例实例
export const strategyAgent = new StrategyAgent();
