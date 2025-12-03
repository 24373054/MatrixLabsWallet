/**
 * Token Configuration and ERC-20 Support
 * 代币配置和 ERC-20 支持
 */

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean; // 是否为原生代币（ETH, BNB 等）
}

export interface NetworkTokens {
  [chainId: number]: Token[];
}

// ERC-20 标准 ABI（只包含我们需要的方法）
export const ERC20_ABI = [
  // balanceOf
  'function balanceOf(address owner) view returns (uint256)',
  // transfer
  'function transfer(address to, uint256 amount) returns (bool)',
  // decimals
  'function decimals() view returns (uint8)',
  // symbol
  'function symbol() view returns (string)',
  // name
  'function name() view returns (string)',
  // allowance
  'function allowance(address owner, address spender) view returns (uint256)',
  // approve
  'function approve(address spender, uint256 amount) returns (bool)'
];

// 各网络的默认代币列表
export const DEFAULT_TOKENS: NetworkTokens = {
  // Ethereum Mainnet
  1: [
    {
      address: 'native',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8
    }
  ],
  
  // BSC Mainnet
  56: [
    {
      address: 'native',
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18,
      isNative: true
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18
    },
    {
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18
    },
    {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18
    }
  ],
  
  // Polygon Mainnet
  137: [
    {
      address: 'native',
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      isNative: true
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18
    }
  ],
  
  // Arbitrum One
  42161: [
    {
      address: 'native',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18
    }
  ],
  
  // Optimism
  10: [
    {
      address: 'native',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true
    },
    {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6
    },
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18
    }
  ],
  
  // Base
  8453: [
    {
      address: 'native',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true
    },
    {
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    }
  ],
  
  // Sepolia Testnet
  11155111: [
    {
      address: 'native',
      symbol: 'ETH',
      name: 'Sepolia ETH',
      decimals: 18,
      isNative: true
    }
  ]
};

/**
 * 获取指定网络的代币列表
 */
export function getTokensForNetwork(chainId: number): Token[] {
  return DEFAULT_TOKENS[chainId] || [
    {
      address: 'native',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true
    }
  ];
}

/**
 * 根据地址查找代币
 */
export function findToken(chainId: number, address: string): Token | undefined {
  const tokens = getTokensForNetwork(chainId);
  return tokens.find(t => 
    t.address.toLowerCase() === address.toLowerCase() || 
    (address === 'native' && t.isNative)
  );
}

/**
 * 获取原生代币
 */
export function getNativeToken(chainId: number): Token {
  const tokens = getTokensForNetwork(chainId);
  return tokens.find(t => t.isNative) || tokens[0];
}
