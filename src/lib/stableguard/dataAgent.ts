/**
 * Data Perception Agent (数据感知智能体)
 * 负责从多源异构数据中采集、标准化和聚合风险信号
 */

import { RawDataSignal, DataAgentOutput } from './types';
import { STABLECOINS, API_ENDPOINTS } from './config';

export class DataAgent {
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1分钟缓存

  /**
   * 采集指定稳定币的数据
   */
  async collectData(stablecoinIds: string[]): Promise<DataAgentOutput> {
    const startTime = Date.now();
    const signals: RawDataSignal[] = [];
    const errors: string[] = [];

    console.log('[DataAgent] Starting data collection for:', stablecoinIds);

    for (const id of stablecoinIds) {
      try {
        const signal = await this.collectStablecoinData(id);
        signals.push(signal);
      } catch (error: any) {
        console.error(`[DataAgent] Failed to collect data for ${id}:`, error);
        errors.push(`${id}: ${error.message}`);
      }
    }

    const collectionTime = Date.now() - startTime;
    const dataQuality = this.assessDataQuality(signals, errors);

    console.log(`[DataAgent] Collection completed in ${collectionTime}ms, quality: ${dataQuality}`);

    return {
      signals,
      collectionTime,
      dataQuality,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 采集单个稳定币的数据
   */
  private async collectStablecoinData(stablecoinId: string): Promise<RawDataSignal> {
    const config = STABLECOINS[stablecoinId];
    if (!config) {
      throw new Error(`Unknown stablecoin: ${stablecoinId}`);
    }

    // 并行采集各类数据
    const [priceData, chainData] = await Promise.allSettled([
      this.fetchPriceData(stablecoinId),
      this.fetchChainData(stablecoinId)
    ]);

    // 组装信号
    const signal: RawDataSignal = {
      timestamp: Date.now(),
      stablecoinId,
      price: 1.0,
      priceChange24h: 0,
      volume24h: 0,
      marketCap: 0
    };

    // 处理价格数据
    if (priceData.status === 'fulfilled') {
      Object.assign(signal, priceData.value);
    } else {
      console.warn(`[DataAgent] Price data failed for ${stablecoinId}:`, priceData.reason);
      // 使用缓存或默认值
      const cached = this.priceCache.get(stablecoinId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL * 5) {
        signal.price = cached.price;
      }
    }

    // 处理链上数据
    if (chainData.status === 'fulfilled') {
      Object.assign(signal, chainData.value);
    } else {
      console.warn(`[DataAgent] Chain data failed for ${stablecoinId}:`, chainData.reason);
    }

    // MVP: 舆情和制度数据占位
    signal.sentimentScore = 0;
    signal.newsCount = 0;

    return signal;
  }

  /**
   * 获取价格数据（从 CoinGecko API）
   */
  private async fetchPriceData(stablecoinId: string): Promise<Partial<RawDataSignal>> {
    // 检查缓存
    const cached = this.priceCache.get(stablecoinId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[DataAgent] Using cached price for ${stablecoinId}`);
      return { price: cached.price };
    }

    try {
      // CoinGecko ID 映射
      const coinGeckoIds: Record<string, string> = {
        usdt: 'tether',
        usdc: 'usd-coin',
        dai: 'dai',
        busd: 'binance-usd',
        frax: 'frax'
      };

      const coinId = coinGeckoIds[stablecoinId];
      if (!coinId) {
        throw new Error(`No CoinGecko mapping for ${stablecoinId}`);
      }

      // 构建请求 URL
      const baseUrl = 'https://api.coingecko.com/api/v3';
      const params = new URLSearchParams({
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
        include_market_cap: 'true'
      });

      const response = await fetch(`${baseUrl}${API_ENDPOINTS.COINGECKO_PRICE}?${params}`, {
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const coinData = data[coinId];

      if (!coinData) {
        throw new Error(`No data returned for ${coinId}`);
      }

      const priceData = {
        price: coinData.usd || 1.0,
        priceChange24h: coinData.usd_24h_change || 0,
        volume24h: coinData.usd_24h_vol || 0,
        marketCap: coinData.usd_market_cap || 0
      };

      // 更新缓存
      this.priceCache.set(stablecoinId, {
        price: priceData.price,
        timestamp: Date.now()
      });

      console.log(`[DataAgent] Fetched price for ${stablecoinId}:`, priceData.price);
      return priceData;

    } catch (error: any) {
      console.warn(`[DataAgent] Price fetch failed for ${stablecoinId}:`, error.message);
      
      // 尝试使用缓存
      const cached = this.priceCache.get(stablecoinId);
      if (cached) {
        console.log(`[DataAgent] Using stale cache for ${stablecoinId}`);
        return { 
          price: cached.price,
          priceChange24h: 0,
          volume24h: 0,
          marketCap: 0
        };
      }
      
      // 返回默认值（锚定价格）- 这样不会阻止评估继续
      console.log(`[DataAgent] Using default price (1.0) for ${stablecoinId}`);
      return {
        price: 1.0,
        priceChange24h: 0,
        volume24h: 0,
        marketCap: 0
      };
    }
  }

  /**
   * 获取链上数据（MVP 简化版）
   */
  private async fetchChainData(stablecoinId: string): Promise<Partial<RawDataSignal>> {
    // MVP: 暂不实现实时链上数据采集
    // 未来可以通过 RPCService 查询：
    // - totalSupply (ERC20.totalSupply())
    // - 监听 Transfer 事件获取大额转账
    
    console.log(`[DataAgent] Chain data collection not implemented for ${stablecoinId} (MVP)`);
    
    return {
      totalSupply: undefined,
      largeTransfers: []
    };
  }

  /**
   * 评估数据质量
   */
  private assessDataQuality(signals: RawDataSignal[], errors: string[]): 'high' | 'medium' | 'low' {
    if (errors.length === 0 && signals.length > 0) {
      return 'high';
    }
    
    const successRate = signals.length / (signals.length + errors.length);
    if (successRate >= 0.8) {
      return 'high';
    } else if (successRate >= 0.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.priceCache.clear();
    console.log('[DataAgent] Cache cleared');
  }
}

// 单例实例
export const dataAgent = new DataAgent();
