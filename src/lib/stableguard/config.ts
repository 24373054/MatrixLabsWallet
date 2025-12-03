/**
 * StableGuard Configuration
 * 稳定币风控系统配置
 */

import { StablecoinConfig, StableGuardConfig } from './types';

// ============================================================================
// Supported Stablecoins
// ============================================================================

export const STABLECOINS: Record<string, StablecoinConfig> = {
  usdt: {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    addresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',      // Ethereum
      56: '0x55d398326f99059fF775485246999027B3197955',     // BSC
      137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',    // Polygon
      42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',  // Arbitrum
      10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',     // Optimism
      8453: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',   // Base
    },
    decimals: 6,
    pegTarget: 1.0,
    type: 'fiat-backed'
  },
  
  usdc: {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    addresses: {
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',      // Ethereum
      56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',     // BSC
      137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',    // Polygon (bridged)
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',  // Arbitrum
      10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',     // Optimism
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',   // Base
    },
    decimals: 6,
    pegTarget: 1.0,
    type: 'fiat-backed'
  },
  
  dai: {
    id: 'dai',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    addresses: {
      1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',      // Ethereum
      56: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',     // BSC
      137: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',    // Polygon
      42161: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',  // Arbitrum
      10: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',     // Optimism
      8453: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',   // Base
    },
    decimals: 18,
    pegTarget: 1.0,
    type: 'crypto-backed'
  },
  
  busd: {
    id: 'busd',
    name: 'Binance USD',
    symbol: 'BUSD',
    addresses: {
      1: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',      // Ethereum
      56: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',     // BSC
    },
    decimals: 18,
    pegTarget: 1.0,
    type: 'fiat-backed'
  },
  
  frax: {
    id: 'frax',
    name: 'Frax',
    symbol: 'FRAX',
    addresses: {
      1: '0x853d955aCEf822Db058eb8505911ED77F175b99e',      // Ethereum
      56: '0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40',     // BSC
      137: '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',    // Polygon
      42161: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',  // Arbitrum
      10: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',     // Optimism
    },
    decimals: 18,
    pegTarget: 1.0,
    type: 'algorithmic'
  }
};

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_STABLEGUARD_CONFIG: StableGuardConfig = {
  enabled: true,
  strictMode: 'warn',  // 默认警告模式
  
  monitoredStablecoins: ['usdt', 'usdc', 'dai'],
  
  thresholds: {
    priceDeviationWarning: 0.5,      // 0.5% 偏离开始警告
    priceDeviationCritical: 2.0,     // 2% 偏离为严重
    largeTransferUSD: 100000,        // 10万美元为大额转账
    volatilityWarning: 0.02,         // 2% 波动率警告
  },
  
  updateIntervalMinutes: 5,
  
  dataSources: {
    priceAPI: 'https://api.coingecko.com/api/v3',
    chainRPC: 'default',  // 使用钱包默认 RPC
    ragEndpoint: undefined  // MVP 阶段暂不使用
  }
};

// 开发/测试配置 - 禁用外部 API 调用
export const OFFLINE_STABLEGUARD_CONFIG: StableGuardConfig = {
  ...DEFAULT_STABLEGUARD_CONFIG,
  dataSources: {
    priceAPI: '',  // 空字符串表示不调用 API
    chainRPC: 'default',
    ragEndpoint: undefined
  }
};

// ============================================================================
// Risk Level Thresholds
// ============================================================================

export const RISK_SCORE_THRESHOLDS = {
  VERY_LOW: { min: 0, max: 20 },
  LOW: { min: 20, max: 40 },
  MEDIUM: { min: 40, max: 60 },
  HIGH: { min: 60, max: 80 },
  VERY_HIGH: { min: 80, max: 100 }
};

// ============================================================================
// Feature Calculation Parameters
// ============================================================================

export const FEATURE_PARAMS = {
  // 滑动窗口大小（数据点数量）
  WINDOW_SIZE: 20,
  
  // 动态阈值计算参数
  THRESHOLD_MULTIPLIER: 2.0,  // 标准差倍数
  THRESHOLD_MIN_SAMPLES: 5,   // 最小样本数
  
  // 异常检测敏感度
  ANOMALY_SENSITIVITY: 0.7,
  
  // 趋势判断参数
  TREND_WINDOW: 5,
  TREND_THRESHOLD: 0.1
};

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // CoinGecko API
  COINGECKO_PRICE: '/simple/price',
  COINGECKO_MARKET: '/coins/markets',
  
  // 备用价格源
  BACKUP_PRICE_API: 'https://api.coinbase.com/v2/exchange-rates',
};

// ============================================================================
// Display Configuration
// ============================================================================

export const DISPLAY_CONFIG = {
  RISK_COLORS: {
    A: '#10b981',  // green-500
    B: '#84cc16',  // lime-500
    C: '#f59e0b',  // amber-500
    D: '#f97316',  // orange-500
    E: '#ef4444'   // red-500
  },
  
  RISK_LABELS: {
    A: '极低风险',
    B: '低风险',
    C: '中等风险',
    D: '高风险',
    E: '极高风险'
  },
  
  CATEGORY_LABELS: {
    PRICE_DEVIATION: '价格偏离',
    LIQUIDITY_CRISIS: '流动性危机',
    WHALE_ACTIVITY: '鲸鱼活动',
    REDEEM_PRESSURE: '赎回压力',
    RESERVE_CONCERN: '储备担忧',
    REGULATORY_RISK: '监管风险',
    SENTIMENT_NEGATIVE: '负面舆情',
    TECHNICAL_ISSUE: '技术问题'
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 根据链 ID 获取稳定币地址
 */
export function getStablecoinAddress(stablecoinId: string, chainId: number): string | undefined {
  const config = STABLECOINS[stablecoinId];
  return config?.addresses[chainId];
}

/**
 * 检查地址是否为稳定币合约
 */
export function isStablecoinAddress(address: string, chainId: number): { isStablecoin: boolean; stablecoinId?: string } {
  const normalizedAddress = address.toLowerCase();
  
  for (const [id, config] of Object.entries(STABLECOINS)) {
    const stablecoinAddress = config.addresses[chainId]?.toLowerCase();
    if (stablecoinAddress === normalizedAddress) {
      return { isStablecoin: true, stablecoinId: id };
    }
  }
  
  return { isStablecoin: false };
}

/**
 * 获取稳定币配置
 */
export function getStablecoinConfig(stablecoinId: string): StablecoinConfig | undefined {
  return STABLECOINS[stablecoinId];
}

/**
 * 获取所有支持的稳定币 ID
 */
export function getAllStablecoinIds(): string[] {
  return Object.keys(STABLECOINS);
}
