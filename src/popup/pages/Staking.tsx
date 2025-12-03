/**
 * Staking Page
 * 质押页面
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ArrowLeft, ExternalLink, TrendingUp, Shield, AlertTriangle, Info } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { TokenService, TokenBalance } from '../../lib/tokenService';
import {
  STAKING_PROTOCOLS,
  StakingProtocol,
  StakingOpportunity,
  getProtocolsByChain,
  getOpportunitiesByToken,
  getProtocolById,
  getProtocolsByCategory,
} from '../../lib/stakingConfig';

interface StakingProps {
  onBack: () => void;
}

export const Staking: React.FC<StakingProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [availableProtocols, setAvailableProtocols] = useState<StakingProtocol[]>([]);
  const [opportunities, setOpportunities] = useState<StakingOpportunity[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<StakingProtocol | null>(null);
  const [showProtocolDetails, setShowProtocolDetails] = useState(false);

  const categories = [
    { id: 'all', name: '全部', icon: '🌟' },
    { id: 'liquid-staking', name: '流动性质押', icon: '💧' },
    { id: 'lending', name: '借贷', icon: '🏦' },
    { id: 'yield-farming', name: '流动性挖矿', icon: '🌾' },
    { id: 'native-staking', name: '原生质押', icon: '⚡' },
  ];

  // 加载代币余额
  useEffect(() => {
    const loadTokens = async () => {
      if (!currentAccount || !currentNetwork) return;
      
      try {
        const balances = await TokenService.getTokenBalances(
          currentAccount.address,
          currentNetwork
        );
        setTokenBalances(balances);
      } catch (error) {
        console.error('[Staking] Failed to load tokens:', error);
      }
    };
    
    loadTokens();
  }, [currentAccount, currentNetwork]);

  // 更新可用协议
  useEffect(() => {
    if (!currentNetwork) return;
    
    let protocols: StakingProtocol[] = [];
    
    if (selectedCategory === 'all') {
      protocols = getProtocolsByChain(currentNetwork.chainId);
    } else {
      protocols = getProtocolsByCategory(
        selectedCategory as StakingProtocol['category'],
        currentNetwork.chainId
      );
    }
    
    // 如果选择了代币，进一步筛选
    if (selectedToken) {
      const tokenOpportunities = getOpportunitiesByToken(currentNetwork.chainId, selectedToken);
      const protocolIds = tokenOpportunities.map(o => o.protocolId);
      protocols = protocols.filter(p => protocolIds.includes(p.id));
      setOpportunities(tokenOpportunities);
    } else {
      setOpportunities([]);
    }
    
    setAvailableProtocols(protocols);
  }, [currentNetwork, selectedCategory, selectedToken]);

  const handleProtocolClick = (protocol: StakingProtocol) => {
    setSelectedProtocol(protocol);
    setShowProtocolDetails(true);
  };

  const handleStake = (protocol: StakingProtocol) => {
    window.open(protocol.website, '_blank');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'liquid-staking':
        return 'text-blue-400';
      case 'lending':
        return 'text-green-400';
      case 'yield-farming':
        return 'text-yellow-400';
      case 'native-staking':
        return 'text-purple-400';
      default:
        return 'text-matrix-text-secondary';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'liquid-staking':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'lending':
        return 'bg-green-500/10 border-green-500/20';
      case 'yield-farming':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'native-staking':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-matrix-surface border-matrix-border';
    }
  };

  if (showProtocolDetails && selectedProtocol) {
    return (
      <div className="flex flex-col h-full bg-matrix-bg">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b border-matrix-border">
          <button
            onClick={() => setShowProtocolDetails(false)}
            className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">
            {selectedProtocol.name}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* Protocol Info */}
            <Card className={`p-4 ${getCategoryBg(selectedProtocol.category)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-matrix-text-primary mb-1">
                    {selectedProtocol.name}
                  </h3>
                  <p className="text-sm text-matrix-text-secondary">
                    {selectedProtocol.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-matrix-text-muted">APY:</span>
                  <span className="text-green-400 font-semibold">{selectedProtocol.apy}</span>
                </div>
              </div>
            </Card>

            {/* Features */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-matrix-text-primary mb-3 flex items-center gap-2">
                <Shield size={16} className="text-blue-400" />
                特性优势
              </h4>
              <div className="space-y-2">
                {selectedProtocol.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-sm text-matrix-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risks */}
            <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
              <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                风险提示
              </h4>
              <div className="space-y-2">
                {selectedProtocol.risks.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    <span className="text-sm text-yellow-400/80">{risk}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Supported Tokens */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-matrix-text-primary mb-3">
                支持的代币
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProtocol.supportedTokens.map((token, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-matrix-surface border border-matrix-border rounded-lg text-sm text-matrix-text-secondary"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </Card>

            {/* Opportunities for current chain */}
            {opportunities.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-matrix-text-primary mb-3">
                  当前网络的质押机会
                </h4>
                <div className="space-y-2">
                  {opportunities
                    .filter(o => o.protocolId === selectedProtocol.id)
                    .map((opp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-matrix-surface/50 rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium text-matrix-text-primary">
                            {opp.token}
                          </span>
                          {opp.tvl && (
                            <span className="ml-2 text-xs text-matrix-text-muted">
                              TVL: {opp.tvl}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-green-400 font-semibold">
                          {opp.apy}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 py-4 border-t border-matrix-border">
          <Button
            variant="primary"
            fullWidth
            onClick={() => handleStake(selectedProtocol)}
            className="flex items-center justify-center gap-2"
          >
            <span>前往质押</span>
            <ExternalLink size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-matrix-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">质押 & DeFi</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {/* Info Banner */}
          <Card className="bg-blue-500/10 border-blue-500/20 p-3">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-400 leading-relaxed">
                通过质押和 DeFi 协议让您的资产增值。选择合适的协议，点击"前往质押"跳转到官方网站完成操作。
              </p>
            </div>
          </Card>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedToken('');
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
                  selectedCategory === cat.id
                    ? 'bg-matrix-accent-primary text-white'
                    : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Token Filter */}
          {tokenBalances.length > 0 && (
            <Card className="p-3">
              <label className="text-xs font-medium text-matrix-text-muted mb-2 block">
                按代币筛选（可选）
              </label>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedToken('')}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-smooth ${
                    selectedToken === ''
                      ? 'bg-matrix-accent-primary text-white'
                      : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
                  }`}
                >
                  全部
                </button>
                {tokenBalances.slice(0, 5).map((tb) => (
                  <button
                    key={tb.token.address}
                    onClick={() => setSelectedToken(tb.token.symbol)}
                    className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-smooth ${
                      selectedToken === tb.token.symbol
                        ? 'bg-matrix-accent-primary text-white'
                        : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
                    }`}
                  >
                    {tb.token.symbol}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Protocol List */}
          {availableProtocols.length > 0 ? (
            <div className="space-y-3">
              {availableProtocols.map((protocol) => {
                const protocolOpps = opportunities.filter(o => o.protocolId === protocol.id);
                const hasOpps = protocolOpps.length > 0;
                
                return (
                  <Card
                    key={protocol.id}
                    className={`p-4 cursor-pointer hover:border-matrix-accent-primary/50 transition-smooth ${
                      getCategoryBg(protocol.category)
                    }`}
                    onClick={() => handleProtocolClick(protocol)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-matrix-text-primary">
                            {protocol.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(protocol.category)}`}>
                            {categories.find(c => c.id === protocol.category)?.icon}
                          </span>
                        </div>
                        <p className="text-xs text-matrix-text-secondary mb-2">
                          {protocol.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-green-400" />
                            <span className="text-matrix-text-muted">APY:</span>
                            <span className="text-green-400 font-semibold">{protocol.apy}</span>
                          </div>
                          {hasOpps && (
                            <span className="text-matrix-text-muted">
                              {protocolOpps.length} 个机会
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-matrix-text-muted flex-shrink-0 ml-2" />
                    </div>
                    
                    {/* Features Preview */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {protocol.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-matrix-surface/50 text-matrix-text-muted rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {protocol.features.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-matrix-text-muted">
                          +{protocol.features.length - 3}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-matrix-text-muted">
                当前网络暂无可用的质押协议
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
