/**
 * Bridge Page
 * 跨链桥页面
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, ArrowDownUp, AlertCircle, ExternalLink, Clock, Shield, Zap } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { TokenService, TokenBalance } from '../../lib/tokenService';
import { Token } from '../../lib/tokens';
import { DEFAULT_NETWORKS, Network } from '../../lib/storage';
import {
  BRIDGE_PROTOCOLS,
  BridgeProtocol,
  getSupportedDestinations,
  getSupportedTokensForRoute,
  getRecommendedBridge,
  getAvailableBridges,
  isRouteSupported,
} from '../../lib/bridgeConfig';

interface BridgeProps {
  onBack: () => void;
}

export const Bridge: React.FC<BridgeProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [sourceChain, setSourceChain] = useState<Network | null>(null);
  const [destinationChain, setDestinationChain] = useState<Network | null>(null);
  const [availableDestinations, setAvailableDestinations] = useState<Network[]>([]);
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [recommendedBridge, setRecommendedBridge] = useState<BridgeProtocol | null>(null);
  const [availableBridges, setAvailableBridges] = useState<BridgeProtocol[]>([]);
  const [selectedBridge, setSelectedBridge] = useState<BridgeProtocol | null>(null);
  const [showDestinationSelector, setShowDestinationSelector] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showBridgeSelector, setShowBridgeSelector] = useState(false);

  // 初始化源链
  useEffect(() => {
    if (currentNetwork) {
      setSourceChain(currentNetwork);
    }
  }, [currentNetwork]);

  // 加载代币余额
  useEffect(() => {
    const loadTokens = async () => {
      if (!currentAccount || !sourceChain) return;
      
      try {
        const balances = await TokenService.getTokenBalances(
          currentAccount.address,
          sourceChain
        );
        setTokenBalances(balances);
      } catch (error) {
        console.error('[Bridge] Failed to load tokens:', error);
      }
    };
    
    loadTokens();
  }, [currentAccount, sourceChain]);

  // 更新可用目标链
  useEffect(() => {
    if (!sourceChain) return;
    
    const destChainIds = getSupportedDestinations(sourceChain.chainId);
    const destinations = DEFAULT_NETWORKS.filter(n => destChainIds.includes(n.chainId));
    setAvailableDestinations(destinations);
    
    // 如果当前目标链不在可用列表中，清空
    if (destinationChain && !destChainIds.includes(destinationChain.chainId)) {
      setDestinationChain(null);
    }
  }, [sourceChain]);

  // 更新支持的代币和推荐桥
  useEffect(() => {
    if (!sourceChain || !destinationChain) {
      setSupportedTokens([]);
      setRecommendedBridge(null);
      setAvailableBridges([]);
      setSelectedBridge(null);
      return;
    }
    
    const tokens = getSupportedTokensForRoute(sourceChain.chainId, destinationChain.chainId);
    setSupportedTokens(tokens);
    
    const recommended = getRecommendedBridge(sourceChain.chainId, destinationChain.chainId);
    setRecommendedBridge(recommended);
    setSelectedBridge(recommended);
    
    const bridges = getAvailableBridges(sourceChain.chainId, destinationChain.chainId);
    setAvailableBridges(bridges);
    
    // 如果当前选择的代币不在支持列表中，清空
    if (selectedToken && !tokens.includes(selectedToken.symbol)) {
      setSelectedToken(null);
    }
  }, [sourceChain, destinationChain]);

  const handleMaxAmount = () => {
    if (!selectedToken) return;
    
    const tokenBalance = tokenBalances.find(b => b.token.address === selectedToken.address);
    if (!tokenBalance) return;
    
    const balanceValue = parseFloat(tokenBalance.balance);
    const maxAmount = selectedToken.isNative 
      ? Math.max(0, balanceValue - 0.01) // 保留 gas
      : balanceValue;
    
    setAmount(maxAmount.toFixed(6));
  };

  const handleBridge = () => {
    if (!selectedBridge) return;
    
    // 打开桥协议网站
    window.open(selectedBridge.website, '_blank');
  };

  const handleSwitchChains = () => {
    const temp = sourceChain;
    setSourceChain(destinationChain);
    setDestinationChain(temp);
  };

  const isRouteValid = sourceChain && destinationChain && 
    isRouteSupported(sourceChain.chainId, destinationChain.chainId);

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
        <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">跨链桥</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {/* Source Chain */}
          <Card className="p-4">
            <label className="text-sm font-medium text-matrix-text-secondary mb-2 block">
              源链
            </label>
            <div className="p-3 bg-matrix-surface border border-matrix-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-matrix-text-primary">
                      {sourceChain?.name || '未选择'}
                    </p>
                    <p className="text-xs text-matrix-text-muted">
                      {sourceChain?.symbol}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Switch Button */}
          <div className="flex justify-center -my-2">
            <button
              onClick={handleSwitchChains}
              disabled={!destinationChain}
              className="p-2 bg-matrix-surface border border-matrix-border rounded-lg hover:bg-matrix-surface/80 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownUp size={20} className="text-matrix-text-secondary" />
            </button>
          </div>

          {/* Destination Chain */}
          <Card className="p-4">
            <label className="text-sm font-medium text-matrix-text-secondary mb-2 block">
              目标链
            </label>
            <button
              onClick={() => setShowDestinationSelector(!showDestinationSelector)}
              className="w-full p-3 bg-matrix-surface border border-matrix-border rounded-lg hover:border-matrix-accent-primary/50 transition-smooth"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-matrix-text-primary">
                      {destinationChain?.name || '选择目标链'}
                    </p>
                    {destinationChain && (
                      <p className="text-xs text-matrix-text-muted">
                        {destinationChain.symbol}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {showDestinationSelector && (
              <Card className="mt-2 max-h-48 overflow-y-auto">
                {availableDestinations.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => {
                      setDestinationChain(network);
                      setShowDestinationSelector(false);
                    }}
                    className="w-full p-3 hover:bg-matrix-surface/50 transition-smooth text-left border-b border-matrix-border last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-matrix-text-primary">
                          {network.name}
                        </p>
                        <p className="text-xs text-matrix-text-muted">{network.symbol}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {availableDestinations.length === 0 && (
                  <div className="p-4 text-center text-sm text-matrix-text-muted">
                    当前链暂无可用跨链路由
                  </div>
                )}
              </Card>
            )}
          </Card>

          {/* Token Selection */}
          {isRouteValid && (
            <Card className="p-4">
              <label className="text-sm font-medium text-matrix-text-secondary mb-2 block">
                代币
              </label>
              <button
                onClick={() => setShowTokenSelector(!showTokenSelector)}
                className="w-full p-3 bg-matrix-surface border border-matrix-border rounded-lg hover:border-matrix-accent-primary/50 transition-smooth mb-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {selectedToken?.symbol.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {selectedToken?.symbol || '选择代币'}
                    </span>
                  </div>
                </div>
              </button>

              {showTokenSelector && (
                <Card className="mb-3 max-h-48 overflow-y-auto">
                  {tokenBalances
                    .filter(tb => supportedTokens.includes(tb.token.symbol))
                    .map((tb) => (
                      <button
                        key={tb.token.address}
                        onClick={() => {
                          setSelectedToken(tb.token);
                          setShowTokenSelector(false);
                        }}
                        className="w-full p-2 hover:bg-matrix-surface/50 transition-smooth text-left border-b border-matrix-border last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{tb.token.symbol}</span>
                          <span className="text-xs text-matrix-text-muted">
                            {parseFloat(tb.balance).toFixed(4)}
                          </span>
                        </div>
                      </button>
                    ))}
                  {tokenBalances.filter(tb => supportedTokens.includes(tb.token.symbol)).length === 0 && (
                    <div className="p-4 text-center text-sm text-matrix-text-muted">
                      该路由暂无支持的代币
                    </div>
                  )}
                </Card>
              )}

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={handleMaxAmount}
                  className="px-3 py-2 text-xs text-matrix-accent-primary hover:text-matrix-accent-secondary transition-smooth font-medium"
                >
                  最大
                </button>
              </div>
              {selectedToken && (
                <p className="text-xs text-matrix-text-muted mt-1">
                  余额: {tokenBalances.find(b => b.token.address === selectedToken.address)?.balance || '0'} {selectedToken.symbol}
                </p>
              )}
            </Card>
          )}

          {/* Bridge Protocol Selection */}
          {isRouteValid && recommendedBridge && (
            <Card className="p-4">
              <label className="text-sm font-medium text-matrix-text-secondary mb-2 block">
                跨链协议
              </label>
              
              {/* Recommended Bridge */}
              <div className="p-3 bg-gradient-to-r from-matrix-accent-primary/10 to-matrix-accent-secondary/10 border border-matrix-accent-primary/30 rounded-lg mb-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-matrix-text-primary">
                        {selectedBridge?.name || recommendedBridge.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-matrix-accent-secondary/20 text-matrix-accent-secondary text-xs rounded">
                        推荐
                      </span>
                    </div>
                    <p className="text-xs text-matrix-text-secondary mb-2">
                      {selectedBridge?.description || recommendedBridge.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedBridge?.features || recommendedBridge.features).map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-matrix-surface/50 text-xs text-matrix-text-muted rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-matrix-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{selectedBridge?.estimatedTime || recommendedBridge.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={12} />
                    <span>安全可靠</span>
                  </div>
                </div>
              </div>

              {/* Other Available Bridges */}
              {availableBridges.length > 1 && (
                <button
                  onClick={() => setShowBridgeSelector(!showBridgeSelector)}
                  className="w-full text-xs text-matrix-accent-primary hover:text-matrix-accent-secondary transition-smooth text-center py-2"
                >
                  查看其他 {availableBridges.length - 1} 个可用协议
                </button>
              )}

              {showBridgeSelector && (
                <Card className="mt-2 max-h-60 overflow-y-auto">
                  {availableBridges
                    .filter(b => b.id !== recommendedBridge.id)
                    .map((bridge) => (
                      <button
                        key={bridge.id}
                        onClick={() => {
                          setSelectedBridge(bridge);
                          setShowBridgeSelector(false);
                        }}
                        className="w-full p-3 hover:bg-matrix-surface/50 transition-smooth text-left border-b border-matrix-border last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-matrix-text-primary">
                            {bridge.name}
                          </span>
                          <span className="text-xs text-matrix-text-muted">
                            {bridge.estimatedTime}
                          </span>
                        </div>
                        <p className="text-xs text-matrix-text-secondary">
                          {bridge.description}
                        </p>
                      </button>
                    ))}
                </Card>
              )}
            </Card>
          )}

          {/* Route Not Supported Warning */}
          {sourceChain && destinationChain && !isRouteValid && (
            <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400 mb-1">
                    暂不支持此跨链路由
                  </p>
                  <p className="text-xs text-yellow-400/80">
                    {sourceChain.name} → {destinationChain.name} 的跨链路由暂未配置，请选择其他目标链或使用外部跨链桥。
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-blue-500/10 border-blue-500/20 p-3">
            <div className="flex items-start gap-2">
              <Zap size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-400 leading-relaxed">
                跨链桥将帮助您在不同区块链之间转移资产。点击"开始跨链"将跳转到所选协议的官方网站完成操作。
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 py-4 border-t border-matrix-border">
        <Button
          variant="primary"
          fullWidth
          onClick={handleBridge}
          disabled={!isRouteValid || !selectedToken || !amount || !selectedBridge}
          className="flex items-center justify-center gap-2"
        >
          <span>开始跨链</span>
          <ExternalLink size={16} />
        </Button>
      </div>
    </div>
  );
};
