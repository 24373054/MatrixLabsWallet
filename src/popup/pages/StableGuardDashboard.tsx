/**
 * StableGuard Dashboard Page
 * 稳定币风险控制仪表板
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Shield, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { getStableGuard, RiskLevel, DISPLAY_CONFIG } from '../../lib/stableguard';

interface StablecoinRiskData {
  id: string;
  name: string;
  symbol: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  trend: 'improving' | 'stable' | 'deteriorating';
  lastUpdate: number;
}

interface StableGuardDashboardProps {
  onBack: () => void;
}

export function StableGuardDashboard({ onBack }: StableGuardDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stablecoins, setStablecoins] = useState<StablecoinRiskData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setError('');
      
      // 从缓存加载数据
      const cachedData = await loadCachedData();
      if (cachedData.length > 0) {
        setStablecoins(cachedData);
        setLoading(false);
      }

      // 获取最后更新时间
      const { stableguard_last_update } = await chrome.storage.local.get('stableguard_last_update');
      setLastUpdate(stableguard_last_update || 0);

    } catch (err: any) {
      console.error('[StableGuardDashboard] Failed to load data:', err);
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCachedData = async (): Promise<StablecoinRiskData[]> => {
    const stablecoinIds = ['usdt', 'usdc', 'dai'];
    const data: StablecoinRiskData[] = [];

    for (const id of stablecoinIds) {
      try {
        const key = `stableguard_risk_${id}`;
        const result = await chrome.storage.local.get(key);
        const report = result[key];

        if (report) {
          data.push({
            id: report.stablecoinId,
            name: getStablecoinName(report.stablecoinId),
            symbol: report.stablecoinId.toUpperCase(),
            riskLevel: report.riskLevel,
            riskScore: report.riskScore,
            summary: report.summary,
            trend: 'stable', // 简化版，从 feature snapshot 获取
            lastUpdate: report.timestamp
          });
        }
      } catch (err) {
        console.error(`Failed to load ${id}:`, err);
      }
    }

    return data;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');

    try {
      const stableGuard = await getStableGuard();
      const result = await stableGuard.performRiskAssessment();

      if (result.success) {
        await loadRiskData();
      } else {
        setError(result.error || '评估失败');
      }
    } catch (err: any) {
      console.error('[StableGuardDashboard] Refresh failed:', err);
      setError('刷新失败: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const getStablecoinName = (id: string): string => {
    const names: Record<string, string> = {
      usdt: 'Tether USD',
      usdc: 'USD Coin',
      dai: 'Dai Stablecoin',
      busd: 'Binance USD',
      frax: 'Frax'
    };
    return names[id] || id.toUpperCase();
  };

  const getRiskColor = (level: RiskLevel): string => {
    return DISPLAY_CONFIG.RISK_COLORS[level];
  };

  const getRiskLabel = (level: RiskLevel): string => {
    return DISPLAY_CONFIG.RISK_LABELS[level];
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'deteriorating') => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'deteriorating') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatTime = (timestamp: number): string => {
    if (!timestamp) return '未知';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    return `${days} 天前`;
  };

  return (
    <div className="flex flex-col h-screen bg-matrix-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-matrix-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-matrix-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-matrix-text-secondary" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-matrix-accent-primary" />
            <h1 className="text-lg font-semibold text-matrix-text-primary">
              StableGuard 风控中心
            </h1>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-matrix-surface rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-matrix-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Last Update Info */}
        <div className="text-xs text-matrix-text-secondary text-center">
          最后更新: {formatTime(lastUpdate)}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-matrix-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Stablecoin Risk Cards */}
        {!loading && stablecoins.length === 0 && !error && (
          <div className="text-center py-12 text-matrix-text-secondary">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无风险数据</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-matrix-accent-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              立即评估
            </button>
          </div>
        )}

        {!loading && stablecoins.map((coin) => (
          <div
            key={coin.id}
            className="p-4 bg-matrix-surface border border-matrix-border rounded-lg space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-matrix-text-primary">{coin.symbol}</h3>
                  {getTrendIcon(coin.trend)}
                </div>
                <p className="text-xs text-matrix-text-secondary mt-0.5">{coin.name}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: getRiskColor(coin.riskLevel) + '20',
                    color: getRiskColor(coin.riskLevel)
                  }}
                >
                  {getRiskLabel(coin.riskLevel)}
                </div>
                <div className="text-xs text-matrix-text-secondary">
                  评分: {coin.riskScore.toFixed(0)}/100
                </div>
              </div>
            </div>

            {/* Risk Summary */}
            <div className="p-3 bg-matrix-bg rounded-lg">
              <p className="text-sm text-matrix-text-secondary leading-relaxed">
                {coin.summary}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full transition-all duration-300"
                style={{
                  width: `${coin.riskScore}%`,
                  backgroundColor: getRiskColor(coin.riskLevel)
                }}
              />
            </div>
          </div>
        ))}

        {/* Info Footer */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 leading-relaxed">
            💡 StableGuard 通过多智能体协同分析，实时监控稳定币价格偏离、流动性、鲸鱼活动等风险因素，为您的资产安全保驾护航。
          </p>
        </div>
      </div>
    </div>
  );
}
