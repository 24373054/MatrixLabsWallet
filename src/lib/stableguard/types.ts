/**
 * StableGuard Multi-Agent Risk Control System
 * Type Definitions
 */

// ============================================================================
// Core Risk Levels
// ============================================================================

export enum RiskLevel {
  VERY_LOW = 'A',    // 极低风险
  LOW = 'B',         // 低风险
  MEDIUM = 'C',      // 中等风险
  HIGH = 'D',        // 高风险
  VERY_HIGH = 'E'    // 极高风险
}

export enum RiskCategory {
  PRICE_DEVIATION = 'PRICE_DEVIATION',           // 价格偏离
  LIQUIDITY_CRISIS = 'LIQUIDITY_CRISIS',         // 流动性危机
  WHALE_ACTIVITY = 'WHALE_ACTIVITY',             // 鲸鱼活动
  REDEEM_PRESSURE = 'REDEEM_PRESSURE',           // 赎回压力
  RESERVE_CONCERN = 'RESERVE_CONCERN',           // 储备担忧
  REGULATORY_RISK = 'REGULATORY_RISK',           // 监管风险
  SENTIMENT_NEGATIVE = 'SENTIMENT_NEGATIVE',     // 负面舆情
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE'            // 技术问题
}

// ============================================================================
// Stablecoin Configuration
// ============================================================================

export interface StablecoinConfig {
  id: string;                    // 唯一标识 (e.g., 'usdt', 'usdc')
  name: string;                  // 显示名称
  symbol: string;                // 代币符号
  addresses: {                   // 各链合约地址
    [chainId: number]: string;
  };
  decimals: number;              // 精度
  pegTarget: number;             // 锚定目标 (通常是 1.0 USD)
  type: 'fiat-backed' | 'crypto-backed' | 'algorithmic';
}

// ============================================================================
// Data Agent Types
// ============================================================================

export interface RawDataSignal {
  timestamp: number;
  stablecoinId: string;
  
  // 行情数据
  price: number;                 // 当前价格 (USD)
  priceChange24h: number;        // 24h 价格变化百分比
  volume24h: number;             // 24h 交易量 (USD)
  marketCap: number;             // 市值
  
  // 链上数据
  totalSupply?: string;          // 总供应量
  largeTransfers?: {             // 大额转账
    txHash: string;
    from: string;
    to: string;
    amount: string;
    timestamp: number;
  }[];
  
  // 舆情数据 (MVP 占位)
  sentimentScore?: number;       // -1 到 1，负面到正面
  newsCount?: number;            // 相关新闻数量
  
  // 制度数据 (MVP 占位)
  regulatoryEvents?: {
    type: string;
    description: string;
    timestamp: number;
  }[];
}

export interface DataAgentOutput {
  signals: RawDataSignal[];
  collectionTime: number;
  dataQuality: 'high' | 'medium' | 'low';
  errors?: string[];
}

// ============================================================================
// Feature Agent Types
// ============================================================================

export interface RiskFeature {
  name: string;
  value: number;
  threshold: number;
  dynamicThreshold: number;      // 动态计算的阈值
  isAnomalous: boolean;
  severity: number;              // 0-1，异常严重程度
  description: string;
}

export interface FeatureSnapshot {
  stablecoinId: string;
  timestamp: number;
  
  // 核心特征
  priceDeviation: RiskFeature;         // 价格偏离度
  volatility: RiskFeature;             // 波动率
  liquidityRatio: RiskFeature;         // 流动性比率
  redeemPressure: RiskFeature;         // 赎回压力
  whaleActivityScore: RiskFeature;     // 鲸鱼活动评分
  concentrationRisk: RiskFeature;      // 集中度风险
  
  // 聚合指标
  overallAnomalyScore: number;   // 综合异常评分 0-100
  trendDirection: 'improving' | 'stable' | 'deteriorating';
}

export interface FeatureAgentOutput {
  snapshots: FeatureSnapshot[];
  calculationTime: number;
  windowSize: number;            // 使用的时间窗口大小（分钟）
}

// ============================================================================
// Risk Agent Types
// ============================================================================

export interface RiskFactor {
  category: RiskCategory;
  severity: number;              // 0-1
  confidence: number;            // 0-1，判断的置信度
  evidence: string[];            // 证据链
  relatedFeatures: string[];     // 相关特征名称
}

export interface RiskReport {
  stablecoinId: string;
  timestamp: number;
  
  // 风险评级
  riskLevel: RiskLevel;
  riskScore: number;             // 0-100 数值评分
  
  // 风险因子
  primaryFactors: RiskFactor[];  // 主要风险因子
  secondaryFactors: RiskFactor[]; // 次要风险因子
  
  // 分析结论
  summary: string;               // 简要总结
  detailedAnalysis: string;      // 详细分析
  historicalComparison?: {       // 历史对比
    similarEvent: string;
    similarity: number;
    outcome: string;
  };
  
  // 溯源信息
  dataSource: string[];
  analysisMethod: string;
  confidence: number;            // 整体置信度
}

export interface RiskAgentOutput {
  reports: RiskReport[];
  analysisTime: number;
  ragUsed: boolean;              // 是否使用了 RAG 知识库
}

// ============================================================================
// Strategy Agent Types
// ============================================================================

export enum StrategyType {
  INFORMATION = 'INFORMATION',   // 信息披露
  RESOURCE = 'RESOURCE',         // 资源调配
  CONTROL = 'CONTROL',           // 控制措施
  COLLABORATION = 'COLLABORATION' // 协作响应
}

export enum ActionLevel {
  MONITOR = 'MONITOR',           // 仅监控
  WARN = 'WARN',                 // 警告提示
  RESTRICT = 'RESTRICT',         // 限制操作
  BLOCK = 'BLOCK'                // 阻止操作
}

export interface Strategy {
  id: string;
  type: StrategyType;
  actionLevel: ActionLevel;
  priority: number;              // 1-5，优先级
  
  // 策略内容
  title: string;
  description: string;
  actions: {
    target: 'user' | 'system' | 'transaction';
    operation: string;
    parameters?: Record<string, any>;
  }[];
  
  // 预期效果
  expectedImpact: string;
  potentialSideEffects?: string[];
  
  // 合规性
  isCompliant: boolean;
  complianceNotes?: string;
}

export interface StrategyBundle {
  stablecoinId: string;
  riskLevel: RiskLevel;
  timestamp: number;
  
  strategies: Strategy[];
  
  // UI 层面的建议
  uiRecommendations: {
    displayColor: 'green' | 'yellow' | 'orange' | 'red';
    alertMessage: string;
    detailsUrl?: string;
    showWarningBadge: boolean;
  };
  
  // 行为层面的建议
  behaviorRecommendations: {
    allowTransaction: boolean;
    requireConfirmation: boolean;
    confirmationMessage?: string;
    suggestedAmountLimit?: string;
    blockReason?: string;
  };
}

export interface StrategyAgentOutput {
  bundles: StrategyBundle[];
  generationTime: number;
  llmUsed: boolean;              // 是否使用了大模型
}

// ============================================================================
// Execution Agent Types
// ============================================================================

export interface ExecutionRecord {
  id: string;
  timestamp: number;
  stablecoinId: string;
  
  // 触发信息
  triggerType: 'transaction' | 'scheduled' | 'manual';
  triggerData?: any;
  
  // 执行的策略
  executedStrategies: Strategy[];
  
  // 执行结果
  success: boolean;
  actions: {
    type: string;
    target: string;
    result: 'success' | 'failed' | 'skipped';
    message?: string;
  }[];
  
  // 用户反馈
  userApproved?: boolean;
  userFeedback?: string;
  
  // 链上存证 (未来)
  onChainTxHash?: string;
  onChainEventId?: string;
}

export interface ExecutionAgentOutput {
  records: ExecutionRecord[];
  executionTime: number;
  totalActionsExecuted: number;
}

// ============================================================================
// Transaction Evaluation Types
// ============================================================================

export interface TransactionContext {
  from: string;
  to: string;
  value: string;
  data?: string;
  chainId: number;
  
  // 解析后的信息
  isStablecoinRelated: boolean;
  stablecoinId?: string;
  operation?: 'transfer' | 'approve' | 'swap' | 'redeem' | 'unknown';
  amount?: string;
  amountUSD?: number;
}

export interface TransactionEvaluation {
  context: TransactionContext;
  riskReport: RiskReport;
  strategyBundle: StrategyBundle;
  
  // 最终决策
  decision: 'allow' | 'warn' | 'block';
  message: string;
  details: string;
  
  timestamp: number;
}

// ============================================================================
// System Configuration
// ============================================================================

export interface StableGuardConfig {
  enabled: boolean;
  strictMode: 'none' | 'warn' | 'block';
  
  // 监控的稳定币
  monitoredStablecoins: string[];
  
  // 阈值配置
  thresholds: {
    priceDeviationWarning: number;    // 价格偏离警告阈值 (%)
    priceDeviationCritical: number;   // 价格偏离严重阈值 (%)
    largeTransferUSD: number;         // 大额转账定义 (USD)
    volatilityWarning: number;        // 波动率警告阈值
  };
  
  // 更新频率
  updateIntervalMinutes: number;
  
  // 数据源
  dataSources: {
    priceAPI: string;
    chainRPC: string;
    ragEndpoint?: string;
  };
}

// ============================================================================
// Event History Types
// ============================================================================

export interface StableGuardEvent {
  id: string;
  timestamp: number;
  stablecoinId: string;
  eventType: 'risk_detected' | 'strategy_executed' | 'transaction_evaluated' | 'system_alert';
  
  severity: RiskLevel;
  title: string;
  description: string;
  
  relatedData?: any;
  userAction?: 'approved' | 'rejected' | 'ignored';
}
