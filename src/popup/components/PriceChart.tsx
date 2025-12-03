/**
 * Price Chart Component
 * 实时价格图表组件
 */

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceData {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  stablecoinId: string;
  symbol: string;
}

export function PriceChart({ stablecoinId, symbol }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(1.0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriceData();
    const interval = setInterval(loadPriceData, 30000); // 每30秒更新
    return () => clearInterval(interval);
  }, [stablecoinId]);

  const loadPriceData = async () => {
    try {
      // 从 StableGuard 存储中读取历史价格数据
      const key = `stableguard_risk_${stablecoinId}`;
      const result = await chrome.storage.local.get([key]);
      
      if (result[key]) {
        const report = result[key];
        const price = report.currentPrice || 1.0;
        const change = report.priceChange24h || 0;
        
        setCurrentPrice(price);
        setPriceChange(change);
        
        // 添加到历史记录
        setPriceHistory(prev => {
          const newHistory = [...prev, { timestamp: Date.now(), price }];
          // 保留最近20个数据点
          return newHistory.slice(-20);
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('[PriceChart] Failed to load price data:', error);
      setLoading(false);
    }
  };

  const getDeviation = () => {
    return ((currentPrice - 1.0) / 1.0 * 100).toFixed(4);
  };

  const getDeviationColor = () => {
    const dev = Math.abs(parseFloat(getDeviation()));
    if (dev < 0.1) return 'text-green-500';
    if (dev < 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderMiniChart = () => {
    if (priceHistory.length < 2) {
      return (
        <div className="flex items-center justify-center h-16 text-matrix-text-muted text-xs">
          收集数据中...
        </div>
      );
    }

    const prices = priceHistory.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 0.0001;

    const points = priceHistory.map((data, index) => {
      const x = (index / (priceHistory.length - 1)) * 100;
      const y = 100 - ((data.price - minPrice) / priceRange) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isUp = priceHistory[priceHistory.length - 1].price >= priceHistory[0].price;
    const lineColor = isUp ? '#10b981' : '#ef4444';

    return (
      <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${stablecoinId})`}
          opacity="0.2"
        />
        <defs>
          <linearGradient id={`gradient-${stablecoinId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-matrix-surface/50 rounded-lg p-4 border border-matrix-border">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-matrix-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-matrix-surface/50 rounded-lg p-4 border border-matrix-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-matrix-text-primary">{symbol}</h4>
            <Activity size={14} className="text-matrix-accent-primary" />
          </div>
          <p className="text-xs text-matrix-text-muted mt-0.5">实时价格监控</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-matrix-text-primary">
            ${currentPrice.toFixed(4)}
          </div>
          <div className={`text-xs flex items-center gap-1 justify-end ${
            priceChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {priceChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mb-3">
        {renderMiniChart()}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-matrix-bg/50 rounded p-2">
          <div className="text-matrix-text-muted mb-1">锚定偏离</div>
          <div className={`font-semibold ${getDeviationColor()}`}>
            {getDeviation()}%
          </div>
        </div>
        <div className="bg-matrix-bg/50 rounded p-2">
          <div className="text-matrix-text-muted mb-1">目标价格</div>
          <div className="font-semibold text-matrix-text-primary">
            $1.0000
          </div>
        </div>
        <div className="bg-matrix-bg/50 rounded p-2">
          <div className="text-matrix-text-muted mb-1">数据点</div>
          <div className="font-semibold text-blue-400">
            {priceHistory.length}
          </div>
        </div>
      </div>
    </div>
  );
}
