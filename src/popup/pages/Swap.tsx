/**
 * Swap Page
 * 代币兑换页面
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, ArrowDownUp, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { WalletService } from '../../lib/wallet';
import { TokenService, TokenBalance } from '../../lib/tokenService';
import { SwapService, SwapQuote } from '../../lib/swapService';
import { Token } from '../../lib/tokens';

interface SwapProps {
  onBack: () => void;
}

export const Swap: React.FC<SwapProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20); // 20分钟
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenInSelector, setShowTokenInSelector] = useState(false);
  const [showTokenOutSelector, setShowTokenOutSelector] = useState(false);

  // 检查是否支持 Swap
  const isSwapSupported = currentNetwork && SwapService.isSwapSupported(currentNetwork.chainId);

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
        
        // 默认选择原生代币作为输入
        if (balances.length > 0 && !tokenIn) {
          const nativeToken = balances.find(b => b.token.isNative);
          setTokenIn(nativeToken?.token || balances[0].token);
        }
      } catch (error) {
        console.error('[Swap] Failed to load tokens:', error);
      }
    };
    
    loadTokens();
  }, [currentAccount, currentNetwork]);

  // 获取报价
  useEffect(() => {
    const fetchQuote = async () => {
      if (!tokenIn || !tokenOut || !amountIn || !currentNetwork) {
        setQuote(null);
        setAmountOut('');
        return;
      }

      const amount = parseFloat(amountIn);
      if (isNaN(amount) || amount <= 0) {
        setQuote(null);
        setAmountOut('');
        return;
      }

      setQuoting(true);
      setError('');

      try {
        const quoteResult = await SwapService.getQuote(
          tokenIn,
          tokenOut,
          amountIn,
          currentNetwork,
          slippage
        );
        setQuote(quoteResult);
        setAmountOut(quoteResult.amountOut);
      } catch (err: any) {
        console.error('[Swap] Quote failed:', err);
        setError('获取报价失败: ' + err.message);
        setQuote(null);
        setAmountOut('');
      } finally {
        setQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [tokenIn, tokenOut, amountIn, slippage, currentNetwork]);

  const handleSwap = async () => {
    if (!currentAccount || !currentNetwork || !tokenIn || !tokenOut || !quote) return;

    setError('');
    setLoading(true);

    try {
      const privateKey = WalletService.getPrivateKey();
      if (!privateKey) {
        throw new Error('无法获取私钥');
      }

      // 检查余额
      const tokenBalance = tokenBalances.find(b => b.token.address === tokenIn.address);
      if (tokenBalance && parseFloat(amountIn) > parseFloat(tokenBalance.balance)) {
        throw new Error('余额不足');
      }

      // 检查并授权 (如果需要)
      if (!tokenIn.isNative) {
        setApproving(true);
        const approveTxHash = await SwapService.checkAndApprove(
          tokenIn,
          amountIn,
          currentNetwork,
          privateKey
        );
        if (approveTxHash) {
          console.log('[Swap] Approval tx:', approveTxHash);
        }
        setApproving(false);
      }

      // 执行兑换
      const hash = await SwapService.executeSwap(
        {
          tokenIn,
          tokenOut,
          amountIn,
          slippageTolerance: slippage,
          deadline: deadline * 60, // 转换为秒
        },
        currentNetwork,
        privateKey
      );

      setTxHash(hash);
      setSuccess(true);
      setAmountIn('');
      setAmountOut('');
      setQuote(null);
    } catch (err: any) {
      console.error('[Swap] Swap failed:', err);
      setError(err.message || '兑换失败');
    } finally {
      setLoading(false);
      setApproving(false);
    }
  };

  const handleSwitchTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn('');
    setAmountOut('');
    setQuote(null);
  };

  const handleMaxAmount = () => {
    if (!tokenIn) return;
    
    const tokenBalance = tokenBalances.find(b => b.token.address === tokenIn.address);
    if (!tokenBalance) return;
    
    const balanceValue = parseFloat(tokenBalance.balance);
    const maxAmount = tokenIn.isNative 
      ? Math.max(0, balanceValue - 0.01) // 保留 gas
      : balanceValue;
    
    setAmountIn(maxAmount.toFixed(6));
  };

  if (!isSwapSupported) {
    return (
      <div className="flex flex-col h-full bg-matrix-bg">
        <div className="flex items-center px-4 py-4 border-b border-matrix-border">
          <button onClick={onBack} className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50">
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">兑换</h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="w-full text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-lg font-semibold text-matrix-text-primary mb-2">
              当前网络不支持兑换
            </h3>
            <p className="text-sm text-matrix-text-secondary">
              请切换到支持的网络 (Ethereum, BSC, Polygon 等)
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col h-full bg-matrix-bg">
        <div className="flex items-center px-4 py-4 border-b border-matrix-border">
          <button onClick={onBack} className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50">
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">兑换成功</h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="w-full">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-matrix-accent-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-matrix-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-matrix-text-primary mb-2">兑换已提交</h3>
              <p className="text-sm text-matrix-text-secondary mb-4">您的兑换交易已成功提交到网络</p>
              <div className="bg-matrix-surface/50 rounded-lg p-3 mb-6">
                <p className="text-xs text-matrix-text-muted mb-1">交易哈希</p>
                <p className="text-xs font-mono text-matrix-text-secondary break-all">{txHash}</p>
              </div>
              <Button variant="primary" fullWidth onClick={onBack}>完成</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-matrix-border">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50">
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">兑换</h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-matrix-text-primary mb-2 block">
                  滑点容忍度 (%)
                </label>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSlippage(val)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                        slippage === val
                          ? 'bg-matrix-accent-primary text-white'
                          : 'bg-matrix-surface text-matrix-text-primary hover:bg-matrix-surface/80'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                  <Input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    className="w-20"
                    placeholder="自定义"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-matrix-text-primary mb-2 block">
                  交易截止时间 (分钟)
                </label>
                <Input
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                  placeholder="20"
                />
              </div>
            </Card>
          )}

          {/* Token In */}
          <Card className="p-4">
            <label className="text-sm font-medium text-matrix-text-primary mb-2 block">卖出</label>
            <button
              onClick={() => setShowTokenInSelector(!showTokenInSelector)}
              className="w-full p-3 bg-matrix-surface border border-matrix-border rounded-lg hover:border-matrix-accent-primary/50 transition-smooth mb-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-matrix-text-primary">{tokenIn?.symbol.charAt(0) || '?'}</span>
                  </div>
                  <span className="text-sm font-medium text-matrix-text-primary">{tokenIn?.symbol || '选择代币'}</span>
                </div>
              </div>
            </button>

            {showTokenInSelector && (
              <Card className="mb-3 max-h-48 overflow-y-auto">
                {tokenBalances.map((tb) => (
                  <button
                    key={tb.token.address}
                    onClick={() => {
                      setTokenIn(tb.token);
                      setShowTokenInSelector(false);
                    }}
                    className="w-full p-2 hover:bg-matrix-surface/50 transition-smooth text-left border-b border-matrix-border last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-matrix-text-primary">{tb.token.symbol}</span>
                      <span className="text-xs text-matrix-text-secondary">{parseFloat(tb.balance).toFixed(4)}</span>
                    </div>
                  </button>
                ))}
              </Card>
            )}

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1"
              />
              <button
                onClick={handleMaxAmount}
                className="px-3 py-2 text-xs text-matrix-accent-primary hover:text-matrix-accent-secondary transition-smooth font-medium"
              >
                最大
              </button>
            </div>
            {tokenIn && (
              <p className="text-xs text-matrix-text-secondary mt-1">
                余额: {tokenBalances.find(b => b.token.address === tokenIn.address)?.balance || '0'} {tokenIn.symbol}
              </p>
            )}
          </Card>

          {/* Switch Button */}
          <div className="flex justify-center -my-2">
            <button
              onClick={handleSwitchTokens}
              className="p-2 bg-matrix-surface border border-matrix-border rounded-lg hover:bg-matrix-surface/80 transition-smooth"
            >
              <ArrowDownUp size={20} className="text-matrix-text-secondary" />
            </button>
          </div>

          {/* Token Out */}
          <Card className="p-4">
            <label className="text-sm font-medium text-matrix-text-primary mb-2 block">买入</label>
            <button
              onClick={() => setShowTokenOutSelector(!showTokenOutSelector)}
              className="w-full p-3 bg-matrix-surface border border-matrix-border rounded-lg hover:border-matrix-accent-primary/50 transition-smooth mb-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-matrix-text-primary">{tokenOut?.symbol.charAt(0) || '?'}</span>
                  </div>
                  <span className="text-sm font-medium text-matrix-text-primary">{tokenOut?.symbol || '选择代币'}</span>
                </div>
              </div>
            </button>

            {showTokenOutSelector && (
              <Card className="mb-3 max-h-48 overflow-y-auto">
                {tokenBalances.map((tb) => (
                  <button
                    key={tb.token.address}
                    onClick={() => {
                      setTokenOut(tb.token);
                      setShowTokenOutSelector(false);
                    }}
                    className="w-full p-2 hover:bg-matrix-surface/50 transition-smooth text-left border-b border-matrix-border last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-matrix-text-primary">{tb.token.symbol}</span>
                      <span className="text-xs text-matrix-text-secondary">{parseFloat(tb.balance).toFixed(4)}</span>
                    </div>
                  </button>
                ))}
              </Card>
            )}

            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amountOut}
                readOnly
                className="pr-12"
              />
              {quoting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <RefreshCw size={16} className="text-matrix-text-muted animate-spin" />
                </div>
              )}
            </div>
          </Card>

          {/* Quote Info */}
          {quote && (
            <Card className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-matrix-text-secondary">汇率</span>
                <span className="text-matrix-text-primary">
                  1 {tokenIn?.symbol} = {quote.exchangeRate} {tokenOut?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-matrix-text-secondary">最小接收</span>
                <span className="text-matrix-text-primary">{parseFloat(quote.amountOutMin).toFixed(6)} {tokenOut?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-matrix-text-secondary">价格影响</span>
                <span className={`${quote.priceImpact > 5 ? 'text-red-500' : 'text-green-500'}`}>
                  ~{quote.priceImpact.toFixed(2)}%
                </span>
              </div>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="bg-red-500/10 border-red-500/20 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
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
          onClick={handleSwap}
          loading={loading || approving}
          disabled={!tokenIn || !tokenOut || !amountIn || !quote || loading || approving}
        >
          {approving ? '授权中...' : loading ? '兑换中...' : '兑换'}
        </Button>
      </div>
    </div>
  );
};
