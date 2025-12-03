/**
 * Staking Configuration
 * 质押配置 - 支持的质押协议和产品
 */

export interface StakingProtocol {
  id: string;
  name: string;
  description: string;
  category: 'liquid-staking' | 'lending' | 'yield-farming' | 'native-staking';
  website: string;
  supportedChains: number[]; // chainId 列表
  supportedTokens: string[]; // token symbols
  apy: string; // 年化收益率范围
  features: string[];
  risks: string[];
}

export interface StakingOpportunity {
  protocolId: string;
  chainId: number;
  token: string;
  apy: string;
  tvl?: string; // Total Value Locked
  minAmount?: string;
}

// 主流质押协议
export const STAKING_PROTOCOLS: StakingProtocol[] = [
  // Liquid Staking
  {
    id: 'lido',
    name: 'Lido Finance',
    description: '领先的流动性质押协议，质押 ETH 获得 stETH',
    category: 'liquid-staking',
    website: 'https://lido.fi',
    supportedChains: [1, 137, 10, 42161],
    supportedTokens: ['ETH', 'MATIC', 'SOL'],
    apy: '3-5%',
    features: ['流动性代币', '无锁定期', '自动复利', '去中心化'],
    risks: ['智能合约风险', '验证者风险', 'stETH 脱锚风险'],
  },
  {
    id: 'rocket-pool',
    name: 'Rocket Pool',
    description: '去中心化的 ETH 质押协议',
    category: 'liquid-staking',
    website: 'https://rocketpool.net',
    supportedChains: [1, 42161, 10, 137],
    supportedTokens: ['ETH'],
    apy: '3-4.5%',
    features: ['去中心化', '流动性代币 rETH', '无需 32 ETH', '节点运营奖励'],
    risks: ['智能合约风险', '节点运营风险'],
  },
  {
    id: 'frax',
    name: 'Frax Finance',
    description: 'Frax 生态的 ETH 流动性质押',
    category: 'liquid-staking',
    website: 'https://app.frax.finance/frxeth/mint',
    supportedChains: [1],
    supportedTokens: ['ETH'],
    apy: '4-6%',
    features: ['双代币模型', 'frxETH + sfrxETH', '高收益', 'Frax 生态整合'],
    risks: ['智能合约风险', '协议风险'],
  },

  // Lending Protocols
  {
    id: 'aave',
    name: 'Aave',
    description: '去中心化借贷协议，存款赚取利息',
    category: 'lending',
    website: 'https://app.aave.com',
    supportedChains: [1, 137, 42161, 10, 8453, 43114],
    supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'],
    apy: '0.5-15%',
    features: ['多链支持', '多种资产', '闪电贷', '安全审计'],
    risks: ['清算风险', '智能合约风险', '市场波动'],
  },
  {
    id: 'compound',
    name: 'Compound',
    description: '自动化货币市场协议',
    category: 'lending',
    website: 'https://app.compound.finance',
    supportedChains: [1, 137, 42161, 8453],
    supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI'],
    apy: '0.3-10%',
    features: ['算法利率', 'cToken 代币', 'COMP 治理', '成熟协议'],
    risks: ['智能合约风险', '利率波动', '清算风险'],
  },

  // Yield Farming
  {
    id: 'curve',
    name: 'Curve Finance',
    description: '稳定币交易和流动性挖矿',
    category: 'yield-farming',
    website: 'https://curve.fi',
    supportedChains: [1, 137, 42161, 10, 8453, 43114],
    supportedTokens: ['USDC', 'USDT', 'DAI', 'FRAX'],
    apy: '2-20%',
    features: ['低滑点', '稳定币优化', 'CRV 奖励', 'veCRV 增益'],
    risks: ['无常损失', '智能合约风险', 'CRV 价格波动'],
  },
  {
    id: 'convex',
    name: 'Convex Finance',
    description: 'Curve LP 代币质押优化平台',
    category: 'yield-farming',
    website: 'https://www.convexfinance.com',
    supportedChains: [1],
    supportedTokens: ['3CRV', 'FRAXBP', 'stETH'],
    apy: '3-25%',
    features: ['Curve 收益增强', 'CVX 奖励', '无锁定', '自动复利'],
    risks: ['智能合约风险', '依赖 Curve', 'CVX 价格风险'],
  },
  {
    id: 'yearn',
    name: 'Yearn Finance',
    description: '自动化收益聚合器',
    category: 'yield-farming',
    website: 'https://yearn.finance',
    supportedChains: [1, 137, 42161, 10],
    supportedTokens: ['USDC', 'USDT', 'DAI', 'ETH'],
    apy: '1-30%',
    features: ['自动策略', '收益优化', 'yVault', '专业管理'],
    risks: ['策略风险', '智能合约风险', '收益波动'],
  },

  // Native Staking
  {
    id: 'ethereum-staking',
    name: 'Ethereum 原生质押',
    description: '直接质押 32 ETH 成为验证者',
    category: 'native-staking',
    website: 'https://ethereum.org/en/staking',
    supportedChains: [1],
    supportedTokens: ['ETH'],
    apy: '3-5%',
    features: ['网络安全', '最高去中心化', '直接奖励', '治理权'],
    risks: ['需要 32 ETH', '技术要求高', '罚没风险', '长期锁定'],
  },
];

// 质押机会（按链和代币分类）
export const STAKING_OPPORTUNITIES: StakingOpportunity[] = [
  // Ethereum
  { protocolId: 'lido', chainId: 1, token: 'ETH', apy: '3.5%', tvl: '$20B+' },
  { protocolId: 'rocket-pool', chainId: 1, token: 'ETH', apy: '3.2%', tvl: '$2B+' },
  { protocolId: 'frax', chainId: 1, token: 'ETH', apy: '5%', tvl: '$500M+' },
  { protocolId: 'aave', chainId: 1, token: 'USDC', apy: '3-5%', tvl: '$5B+' },
  { protocolId: 'aave', chainId: 1, token: 'USDT', apy: '2-4%', tvl: '$3B+' },
  { protocolId: 'compound', chainId: 1, token: 'USDC', apy: '2-4%', tvl: '$2B+' },
  { protocolId: 'curve', chainId: 1, token: 'USDC', apy: '5-10%', tvl: '$3B+' },
  { protocolId: 'yearn', chainId: 1, token: 'USDC', apy: '3-8%', tvl: '$500M+' },

  // Polygon
  { protocolId: 'lido', chainId: 137, token: 'MATIC', apy: '4-6%', tvl: '$200M+' },
  { protocolId: 'aave', chainId: 137, token: 'USDC', apy: '4-8%', tvl: '$1B+' },
  { protocolId: 'curve', chainId: 137, token: 'USDC', apy: '3-7%', tvl: '$200M+' },

  // Arbitrum
  { protocolId: 'aave', chainId: 42161, token: 'USDC', apy: '3-6%', tvl: '$500M+' },
  { protocolId: 'curve', chainId: 42161, token: 'USDC', apy: '4-8%', tvl: '$300M+' },

  // Optimism
  { protocolId: 'aave', chainId: 10, token: 'USDC', apy: '2-5%', tvl: '$300M+' },
  { protocolId: 'curve', chainId: 10, token: 'USDC', apy: '3-6%', tvl: '$150M+' },

  // Base
  { protocolId: 'aave', chainId: 8453, token: 'USDC', apy: '3-7%', tvl: '$200M+' },
];

/**
 * 获取指定链支持的质押协议
 */
export function getProtocolsByChain(chainId: number): StakingProtocol[] {
  return STAKING_PROTOCOLS.filter(p => p.supportedChains.includes(chainId));
}

/**
 * 获取指定代币的质押机会
 */
export function getOpportunitiesByToken(chainId: number, token: string): StakingOpportunity[] {
  return STAKING_OPPORTUNITIES.filter(
    o => o.chainId === chainId && o.token === token
  );
}

/**
 * 获取指定协议的详情
 */
export function getProtocolById(protocolId: string): StakingProtocol | undefined {
  return STAKING_PROTOCOLS.find(p => p.id === protocolId);
}

/**
 * 按类别获取协议
 */
export function getProtocolsByCategory(
  category: StakingProtocol['category'],
  chainId?: number
): StakingProtocol[] {
  let protocols = STAKING_PROTOCOLS.filter(p => p.category === category);
  if (chainId) {
    protocols = protocols.filter(p => p.supportedChains.includes(chainId));
  }
  return protocols;
}

/**
 * 获取推荐的质押协议
 */
export function getRecommendedProtocols(chainId: number, token: string): StakingProtocol[] {
  const opportunities = getOpportunitiesByToken(chainId, token);
  const protocolIds = opportunities.map(o => o.protocolId);
  return STAKING_PROTOCOLS.filter(p => protocolIds.includes(p.id));
}
