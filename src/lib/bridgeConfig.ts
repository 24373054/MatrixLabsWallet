/**
 * Bridge Configuration
 * 跨链桥配置 - 支持的桥协议和路由
 */

export interface BridgeProtocol {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  website: string;
  supportedChains: number[]; // chainId 列表
  estimatedTime: string; // 预估时间
  features: string[];
}

export interface BridgeRoute {
  fromChainId: number;
  toChainId: number;
  supportedTokens: string[]; // token symbols
  recommendedBridge: string; // bridge protocol id
}

// 主流跨链桥协议
export const BRIDGE_PROTOCOLS: BridgeProtocol[] = [
  {
    id: 'stargate',
    name: 'Stargate Finance',
    description: '基于 LayerZero 的全链流动性传输协议',
    website: 'https://stargate.finance/transfer',
    supportedChains: [1, 56, 137, 42161, 10, 8453, 43114],
    estimatedTime: '1-5 分钟',
    features: ['低费用', '深度流动性', '稳定币优化'],
  },
  {
    id: 'across',
    name: 'Across Protocol',
    description: '快速且低成本的跨链桥',
    website: 'https://across.to',
    supportedChains: [1, 137, 42161, 10, 8453],
    estimatedTime: '2-4 分钟',
    features: ['极速到账', '资本高效', 'UMA 保障'],
  },
  {
    id: 'hop',
    name: 'Hop Protocol',
    description: '快速跨 Rollup 资产桥',
    website: 'https://app.hop.exchange',
    supportedChains: [1, 137, 42161, 10, 8453],
    estimatedTime: '5-15 分钟',
    features: ['无需等待', 'AMM 流动性', '支持多种代币'],
  },
  {
    id: 'celer',
    name: 'cBridge',
    description: 'Celer Network 跨链桥',
    website: 'https://cbridge.celer.network',
    supportedChains: [1, 56, 137, 42161, 10, 8453, 43114, 59144, 324],
    estimatedTime: '5-20 分钟',
    features: ['多链支持', '低费用', '高安全性'],
  },
  {
    id: 'synapse',
    name: 'Synapse Protocol',
    description: '通用跨链通信网络',
    website: 'https://synapseprotocol.com',
    supportedChains: [1, 56, 137, 42161, 10, 8453, 43114],
    estimatedTime: '3-10 分钟',
    features: ['广泛支持', '灵活路由', '统一流动性'],
  },
];

// 常见跨链路由配置
export const BRIDGE_ROUTES: BridgeRoute[] = [
  // Ethereum <-> L2s
  {
    fromChainId: 1,
    toChainId: 42161,
    supportedTokens: ['ETH', 'USDT', 'USDC', 'DAI'],
    recommendedBridge: 'across',
  },
  {
    fromChainId: 1,
    toChainId: 10,
    supportedTokens: ['ETH', 'USDT', 'USDC', 'DAI'],
    recommendedBridge: 'across',
  },
  {
    fromChainId: 1,
    toChainId: 8453,
    supportedTokens: ['ETH', 'USDC'],
    recommendedBridge: 'across',
  },
  {
    fromChainId: 1,
    toChainId: 137,
    supportedTokens: ['ETH', 'USDT', 'USDC', 'DAI'],
    recommendedBridge: 'stargate',
  },
  
  // L2 <-> L2
  {
    fromChainId: 42161,
    toChainId: 10,
    supportedTokens: ['ETH', 'USDC'],
    recommendedBridge: 'hop',
  },
  {
    fromChainId: 42161,
    toChainId: 8453,
    supportedTokens: ['ETH', 'USDC'],
    recommendedBridge: 'across',
  },
  
  // BSC <-> Others
  {
    fromChainId: 56,
    toChainId: 1,
    supportedTokens: ['USDT', 'USDC'],
    recommendedBridge: 'stargate',
  },
  {
    fromChainId: 56,
    toChainId: 137,
    supportedTokens: ['USDT', 'USDC'],
    recommendedBridge: 'celer',
  },
];

/**
 * 获取支持的目标链
 */
export function getSupportedDestinations(fromChainId: number): number[] {
  const routes = BRIDGE_ROUTES.filter(r => r.fromChainId === fromChainId);
  return [...new Set(routes.map(r => r.toChainId))];
}

/**
 * 获取路由支持的代币
 */
export function getSupportedTokensForRoute(fromChainId: number, toChainId: number): string[] {
  const route = BRIDGE_ROUTES.find(
    r => r.fromChainId === fromChainId && r.toChainId === toChainId
  );
  return route?.supportedTokens || [];
}

/**
 * 获取推荐的桥协议
 */
export function getRecommendedBridge(fromChainId: number, toChainId: number): BridgeProtocol | null {
  const route = BRIDGE_ROUTES.find(
    r => r.fromChainId === fromChainId && r.toChainId === toChainId
  );
  
  if (!route) return null;
  
  return BRIDGE_PROTOCOLS.find(b => b.id === route.recommendedBridge) || null;
}

/**
 * 获取支持特定路由的所有桥协议
 */
export function getAvailableBridges(fromChainId: number, toChainId: number): BridgeProtocol[] {
  return BRIDGE_PROTOCOLS.filter(
    bridge => 
      bridge.supportedChains.includes(fromChainId) && 
      bridge.supportedChains.includes(toChainId)
  );
}

/**
 * 检查路由是否支持
 */
export function isRouteSupported(fromChainId: number, toChainId: number): boolean {
  return BRIDGE_ROUTES.some(
    r => r.fromChainId === fromChainId && r.toChainId === toChainId
  );
}
