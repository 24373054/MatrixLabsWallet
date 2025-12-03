/**
 * Swap Service
 * 代币兑换服务 - 集成 Uniswap V2 Router
 */

import { ethers } from 'ethers';
import { ProviderService } from './provider';
import { Token } from './tokens';
import type { Network } from './storage';

// Uniswap V2 Router 地址 (各链通用或主要 DEX)
const ROUTER_ADDRESSES: Record<number, string> = {
  1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Ethereum - Uniswap V2
  56: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // BSC - PancakeSwap
  137: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // Polygon - QuickSwap
  42161: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // Arbitrum - SushiSwap
  10: '0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2', // Optimism - Velodrome (V2 compatible)
  8453: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // Base - BaseSwap
};

// Uniswap V2 Router ABI (只包含我们需要的方法)
const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
];

// WETH 地址 (各链)
const WETH_ADDRESSES: Record<number, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum
  56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BSC (WBNB)
  137: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // Polygon (WMATIC)
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Arbitrum
  10: '0x4200000000000000000000000000000000000006', // Optimism
  8453: '0x4200000000000000000000000000000000000006', // Base
};

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  amountOutMin: string; // 考虑滑点后的最小输出
  path: string[];
  priceImpact: number; // 价格影响百分比
  exchangeRate: string; // 汇率
}

export interface SwapParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  slippageTolerance: number; // 滑点容忍度 (0-100)
  deadline: number; // 交易截止时间 (秒)
}

export class SwapService {
  /**
   * 获取指定网络的 Router 地址
   */
  static getRouterAddress(chainId: number): string | undefined {
    return ROUTER_ADDRESSES[chainId];
  }

  /**
   * 获取指定网络的 WETH 地址
   */
  static getWETHAddress(chainId: number): string | undefined {
    return WETH_ADDRESSES[chainId];
  }

  /**
   * 检查网络是否支持 Swap
   */
  static isSwapSupported(chainId: number): boolean {
    return !!ROUTER_ADDRESSES[chainId];
  }

  /**
   * 构建交易路径
   */
  private static buildPath(tokenIn: Token, tokenOut: Token, chainId: number): string[] {
    const wethAddress = this.getWETHAddress(chainId);
    
    // 如果任一代币是原生代币，使用 WETH
    const tokenInAddress = tokenIn.isNative ? wethAddress! : tokenIn.address;
    const tokenOutAddress = tokenOut.isNative ? wethAddress! : tokenOut.address;

    // 简单路径：直接交易对
    // 未来可以优化为多跳路径
    return [tokenInAddress, tokenOutAddress];
  }

  /**
   * 获取兑换报价
   */
  static async getQuote(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    network: Network,
    slippageTolerance: number = 0.5
  ): Promise<SwapQuote> {
    const routerAddress = this.getRouterAddress(network.chainId);
    if (!routerAddress) {
      throw new Error(`Swap not supported on ${network.name}`);
    }

    const provider = ProviderService.getProvider(network);
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, provider);

    const path = this.buildPath(tokenIn, tokenOut, network.chainId);
    const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

    // 获取输出金额
    const amounts = await router.getAmountsOut(amountInWei, path);
    const amountOutWei = amounts[amounts.length - 1];
    const amountOut = ethers.formatUnits(amountOutWei, tokenOut.decimals);

    // 计算滑点后的最小输出
    const slippageMultiplier = 1 - slippageTolerance / 100;
    const amountOutMinWei = (amountOutWei * BigInt(Math.floor(slippageMultiplier * 10000))) / BigInt(10000);
    const amountOutMin = ethers.formatUnits(amountOutMinWei, tokenOut.decimals);

    // 计算汇率
    const exchangeRate = (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6);

    // 简化的价格影响计算 (实际应该基于储备池)
    const priceImpact = 0.1; // 占位，实际需要查询池子储备

    return {
      amountIn,
      amountOut,
      amountOutMin,
      path,
      priceImpact,
      exchangeRate,
    };
  }

  /**
   * 执行代币兑换
   */
  static async executeSwap(
    params: SwapParams,
    network: Network,
    privateKey: string
  ): Promise<string> {
    const routerAddress = this.getRouterAddress(network.chainId);
    if (!routerAddress) {
      throw new Error(`Swap not supported on ${network.name}`);
    }

    const provider = ProviderService.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, wallet);

    const path = this.buildPath(params.tokenIn, params.tokenOut, network.chainId);
    const amountInWei = ethers.parseUnits(params.amountIn, params.tokenIn.decimals);
    
    // 获取报价以计算最小输出
    const quote = await this.getQuote(
      params.tokenIn,
      params.tokenOut,
      params.amountIn,
      network,
      params.slippageTolerance
    );
    const amountOutMinWei = ethers.parseUnits(quote.amountOutMin, params.tokenOut.decimals);

    const deadline = Math.floor(Date.now() / 1000) + params.deadline;

    let tx;

    if (params.tokenIn.isNative) {
      // ETH -> Token
      tx = await router.swapExactETHForTokens(
        amountOutMinWei,
        path,
        wallet.address,
        deadline,
        { value: amountInWei }
      );
    } else if (params.tokenOut.isNative) {
      // Token -> ETH
      tx = await router.swapExactTokensForETH(
        amountInWei,
        amountOutMinWei,
        path,
        wallet.address,
        deadline
      );
    } else {
      // Token -> Token
      tx = await router.swapExactTokensForTokens(
        amountInWei,
        amountOutMinWei,
        path,
        wallet.address,
        deadline
      );
    }

    await tx.wait();
    return tx.hash;
  }

  /**
   * 检查并授权代币 (如果需要)
   */
  static async checkAndApprove(
    token: Token,
    amount: string,
    network: Network,
    privateKey: string,
    spenderAddress?: string
  ): Promise<string | null> {
    if (token.isNative) {
      return null; // 原生代币不需要授权
    }

    const routerAddress = spenderAddress || this.getRouterAddress(network.chainId);
    if (!routerAddress) {
      throw new Error('Router address not found');
    }

    const provider = ProviderService.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tokenContract = new ethers.Contract(
      token.address,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
        'function approve(address spender, uint256 amount) returns (bool)',
      ],
      wallet
    );

    const amountWei = ethers.parseUnits(amount, token.decimals);
    const allowance = await tokenContract.allowance(wallet.address, routerAddress);

    if (allowance < amountWei) {
      // 需要授权
      const approveTx = await tokenContract.approve(routerAddress, ethers.MaxUint256);
      await approveTx.wait();
      return approveTx.hash;
    }

    return null; // 已有足够授权
  }
}
