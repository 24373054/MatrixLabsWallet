import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { NetworkSelector } from '../../components/NetworkSelector';
import { Send, ArrowDownToLine, ArrowLeftRight, GitBranch, TrendingUp, Copy, Check, Settings } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { ProviderService } from '../../lib/provider';
import { StableGuardBadge } from '../components/StableGuardBadge';
import { RiskLevel } from '../../lib/stableguard';
import { TokenService, TokenBalance } from '../../lib/tokenService';

interface HomeProps {
  onNavigate?: (page: 'send' | 'swap' | 'bridge' | 'staking' | 'receive' | 'settings' | 'stableguard-dashboard') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { currentAccount, currentNetwork, balance, setBalance } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const [overallRisk, setOverallRisk] = useState<RiskLevel>(RiskLevel.LOW);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  const loadBalance = useCallback(async () => {
    if (!currentAccount || !currentNetwork || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    console.log(`[loadBalance] Loading for ${currentAccount.address} on ${currentNetwork.name} (${currentNetwork.id})`);
    try {
      const bal = await ProviderService.getBalance(currentAccount.address, currentNetwork);
      console.log(`[loadBalance] Got balance: ${bal} ${currentNetwork.symbol}`);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentAccount, currentNetwork, setBalance]);

  const loadTokenBalances = useCallback(async () => {
    if (!currentAccount || !currentNetwork) return;
    
    console.log('[loadTokenBalances] Loading token balances...');
    try {
      const balances = await TokenService.getTokenBalances(
        currentAccount.address,
        currentNetwork
      );
      console.log(`[loadTokenBalances] Got ${balances.length} token balances`);
      setTokenBalances(balances);
    } catch (error) {
      console.error('[loadTokenBalances] Failed to load token balances:', error);
      setTokenBalances([]);
    }
  }, [currentAccount, currentNetwork]);

  const loadStableGuardRisk = useCallback(async () => {
    try {
      const stablecoinIds = ['usdt', 'usdc', 'dai'];
      const risks: RiskLevel[] = [];
      let highCount = 0;

      for (const id of stablecoinIds) {
        const key = `stableguard_risk_${id}`;
        const result = await chrome.storage.local.get(key);
        const report = result[key];
        
        if (report) {
          risks.push(report.riskLevel);
          if (report.riskLevel === 'D' || report.riskLevel === 'E') {
            highCount++;
          }
        }
      }

      // Calculate overall risk (highest among all)
      const riskOrder = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
      const maxRisk = risks.reduce((max, risk) => {
        return riskOrder[risk as keyof typeof riskOrder] > riskOrder[max as keyof typeof riskOrder] ? risk : max;
      }, RiskLevel.VERY_LOW);

      setOverallRisk(maxRisk);
      setHighRiskCount(highCount);
    } catch (error) {
      console.error('[Home] Failed to load StableGuard risk:', error);
    }
  }, []);

  useEffect(() => {
    console.log(`useEffect triggered: currentNetwork=${currentNetwork?.name}`);
    loadBalance();
    loadTokenBalances();
    loadStableGuardRisk();
  }, [currentAccount?.address, currentNetwork?.id, loadBalance, loadTokenBalances, loadStableGuardRisk]);

  const handleCopyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      {/* Header */}
      <div className="px-4 py-4 border-b border-matrix-border">
        <div className="flex items-center justify-between mb-3">
          <NetworkSelector onNetworkChange={loadBalance} />
          
          <button 
            onClick={() => onNavigate?.('settings')}
            className="p-2 glass glass-border rounded-lg hover:bg-matrix-surface/80 transition-smooth"
          >
            <Settings size={18} className="text-matrix-text-secondary" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-matrix-text-primary">
                {currentAccount?.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-matrix-text-primary">
              {currentAccount?.name}
            </span>
          </div>

          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-1.5 px-2.5 py-1.5 glass glass-border rounded-lg hover:bg-matrix-surface/80 transition-smooth"
          >
            <span className="text-xs text-matrix-text-secondary font-mono">
              {currentAccount && formatAddress(currentAccount.address)}
            </span>
            {copied ? (
              <Check size={14} className="text-matrix-accent-secondary" />
            ) : (
              <Copy size={14} className="text-matrix-text-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="px-6 py-8">
        <div className="text-center">
          <p className="text-sm text-matrix-text-secondary mb-2">总余额</p>
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-matrix-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-matrix-text-primary mb-1">
                {parseFloat(balance).toFixed(4)}
              </h1>
              <p className="text-sm text-matrix-text-muted">{currentNetwork?.symbol}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-6">
          <Button 
            variant="primary" 
            fullWidth 
            className="flex flex-col items-center justify-center gap-1 py-3"
            onClick={() => onNavigate?.('send')}
          >
            <Send size={18} />
            <span className="text-xs">发送</span>
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            className="flex flex-col items-center justify-center gap-1 py-3"
            onClick={() => onNavigate?.('receive')}
          >
            <ArrowDownToLine size={18} />
            <span className="text-xs">接收</span>
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            className="flex flex-col items-center justify-center gap-1 py-3"
            onClick={() => onNavigate?.('swap')}
          >
            <ArrowLeftRight size={18} />
            <span className="text-xs">兑换</span>
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            className="flex flex-col items-center justify-center gap-1 py-3"
            onClick={() => onNavigate?.('bridge')}
          >
            <GitBranch size={18} />
            <span className="text-xs">跨链</span>
          </Button>
        </div>

        {/* StableGuard Badge */}
        <div className="mt-4">
          <StableGuardBadge
            overallRisk={overallRisk}
            highRiskCount={highRiskCount}
            onClick={() => onNavigate?.('stableguard-dashboard')}
          />
        </div>
      </div>

      {/* Assets */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-matrix-text-secondary px-2">资产</h3>
        </div>

        {/* Token List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-matrix-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tokenBalances.length > 0 ? (
          tokenBalances.map((tokenBalance) => (
            <Card key={tokenBalance.token.address} hover className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-matrix-text-primary">
                      {tokenBalance.token.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-matrix-text-primary">
                      {tokenBalance.token.symbol}
                    </p>
                    <p className="text-xs text-matrix-text-muted">
                      {tokenBalance.token.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-matrix-text-primary">
                    {parseFloat(tokenBalance.balance).toFixed(4)}
                  </p>
                  <p className="text-xs text-matrix-text-muted">
                    {tokenBalance.token.symbol}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-matrix-text-muted">暂无资产</p>
          </div>
        )}

        {/* DeFi / Staking Card */}
        <Card 
          hover 
          className="mt-4 cursor-pointer bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20"
          onClick={() => onNavigate?.('staking')}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-matrix-text-primary">
                  质押 & DeFi
                </h3>
                <p className="text-xs text-matrix-text-muted">
                  让您的资产增值
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-400 font-semibold">APY 3-30%</p>
              <p className="text-xs text-matrix-text-muted">查看机会</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
