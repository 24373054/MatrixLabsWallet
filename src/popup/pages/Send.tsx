import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { WalletService } from '../../lib/wallet';
import { ProviderService } from '../../lib/provider';
import { ethers } from 'ethers';
import { TokenService, TokenBalance } from '../../lib/tokenService';
import { Token } from '../../lib/tokens';
import { PriceChart } from '../components/PriceChart';
import { HistoryService, TransactionType } from '../../lib/historyService';

interface SendProps {
  onBack: () => void;
}

export const Send: React.FC<SendProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [showTokenSelector, setShowTokenSelector] = useState(false);

  const getStablecoinId = (token: Token | null): string | null => {
    if (!token) return null;
    const symbol = token.symbol.toLowerCase();
    if (symbol === 'usdt' || symbol === 'usdc' || symbol === 'dai') {
      return symbol;
    }
    return null;
  };

  // Load token balances on mount
  useEffect(() => {
    const loadTokens = async () => {
      if (!currentAccount || !currentNetwork) return;
      
      try {
        const balances = await TokenService.getTokenBalances(
          currentAccount.address,
          currentNetwork
        );
        setTokenBalances(balances);
        
        // Set default token (native token)
        if (balances.length > 0) {
          const nativeToken = balances.find(b => b.token.isNative);
          setSelectedToken(nativeToken?.token || balances[0].token);
        }
      } catch (error) {
        console.error('[Send] Failed to load tokens:', error);
      }
    };
    
    loadTokens();
  }, [currentAccount, currentNetwork]);

  const handleSend = async () => {
    if (!currentAccount || !currentNetwork || !selectedToken) return;

    setError('');
    setLoading(true);

    try {
      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error('无效的接收地址');
      }

      // Validate amount
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('无效的金额');
      }

      // Check balance
      const tokenBalance = tokenBalances.find(b => b.token.address === selectedToken.address);
      if (tokenBalance && amountValue > parseFloat(tokenBalance.balance)) {
        throw new Error('余额不足');
      }

      // Get gas price and nonce
      const gasPrice = await ProviderService.getGasPrice(currentNetwork);
      const nonce = await ProviderService.getTransactionCount(currentAccount.address, currentNetwork);

      let tx: any;

      if (selectedToken.isNative) {
        // Native token transfer (ETH, BNB, etc.)
        tx = {
          to: recipient,
          value: ethers.parseUnits(amount, selectedToken.decimals),
          gasLimit: 21000n,
          gasPrice,
          nonce,
          chainId: currentNetwork.chainId,
          type: 0,
        };
      } else {
        // ERC-20 token transfer
        const tokenContract = new ethers.Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        const data = tokenContract.encodeFunctionData('transfer', [
          recipient,
          ethers.parseUnits(amount, selectedToken.decimals)
        ]);

        tx = {
          to: selectedToken.address,
          value: 0n,
          data,
          gasLimit: 65000n, // Higher gas limit for ERC-20
          gasPrice,
          nonce,
          chainId: currentNetwork.chainId,
          type: 0,
        };
      }

      // Sign and send transaction
      const signedTx = await WalletService.signTransaction(tx);
      const response = await ProviderService.sendTransaction(signedTx, currentNetwork);

      // Save to history
      const historyRecord = HistoryService.createRecord({
        hash: response.hash,
        type: TransactionType.SEND,
        chainId: currentNetwork.chainId,
        chainName: currentNetwork.name,
        from: currentAccount!.address,
        to: recipient,
        value: selectedToken?.isNative ? amount : '0',
        tokenSymbol: selectedToken?.symbol,
        tokenAmount: !selectedToken?.isNative ? amount : undefined,
        tokenAddress: !selectedToken?.isNative ? selectedToken?.address : undefined,
      });
      await HistoryService.saveTransaction(historyRecord);
      console.log('[Send] Transaction saved to history:', response.hash);

      // Wait for confirmation and update status
      const provider = ProviderService.getProvider(currentNetwork);
      setTimeout(async () => {
        await HistoryService.fetchAndUpdateTransaction(response.hash, provider);
        console.log('[Send] Transaction status updated');
      }, 3000); // Wait 3 seconds before checking

      setTxHash(response.hash);
      setSuccess(true);
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || '交易失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    if (!selectedToken) return;
    
    const tokenBalance = tokenBalances.find(b => b.token.address === selectedToken.address);
    if (!tokenBalance) return;
    
    // Reserve some for gas fees (only for native token)
    const balanceValue = parseFloat(tokenBalance.balance);
    const maxAmount = selectedToken.isNative 
      ? Math.max(0, balanceValue - 0.001) 
      : balanceValue;
    
    setAmount(maxAmount.toFixed(6));
  };

  if (success) {
    return (
      <div className="flex flex-col h-full bg-matrix-bg">
        <div className="flex items-center px-4 py-4 border-b border-matrix-border">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">
            交易成功
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="w-full">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-matrix-accent-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-matrix-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-matrix-text-primary mb-2">
                交易已发送
              </h3>
              <p className="text-sm text-matrix-text-secondary mb-4">
                您的交易已成功提交到网络
              </p>
              <div className="bg-matrix-surface/50 rounded-lg p-3 mb-6">
                <p className="text-xs text-matrix-text-muted mb-1">交易哈希</p>
                <p className="text-xs font-mono text-matrix-text-secondary break-all">
                  {txHash}
                </p>
              </div>
              <Button variant="primary" fullWidth onClick={onBack}>
                完成
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      <div className="flex items-center px-4 py-4 border-b border-matrix-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">
          发送
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {/* Token Selector */}
          <div>
            <label className="text-sm font-medium text-matrix-text-secondary mb-2 block">
              选择代币
            </label>
            <button
              onClick={() => setShowTokenSelector(!showTokenSelector)}
              className="w-full p-3 bg-matrix-surface border border-matrix-border rounded-lg hover:border-matrix-accent-primary/50 transition-smooth"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-matrix-text-primary">
                      {selectedToken?.symbol.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-matrix-text-primary">
                      {selectedToken?.symbol || '选择代币'}
                    </p>
                    <p className="text-xs text-matrix-text-muted">
                      {selectedToken?.name || ''}
                    </p>
                  </div>
                </div>
                <ChevronDown size={20} className="text-matrix-text-secondary" />
              </div>
            </button>

            {/* Token Selector Dropdown */}
            {showTokenSelector && (
              <Card className="mt-2 max-h-60 overflow-y-auto">
                {tokenBalances.map((tokenBalance) => (
                  <button
                    key={tokenBalance.token.address}
                    onClick={() => {
                      setSelectedToken(tokenBalance.token);
                      setShowTokenSelector(false);
                      setAmount('');
                    }}
                    className="w-full p-3 hover:bg-matrix-surface/50 transition-smooth text-left border-b border-matrix-border last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
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
                        <p className="text-sm font-medium text-matrix-text-primary">
                          {parseFloat(tokenBalance.balance).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </Card>
            )}
          </div>

          {(() => {
            const stablecoinId = getStablecoinId(selectedToken);
            if (!stablecoinId || !selectedToken) return null;
            return (
              <div className="mt-2">
                <PriceChart stablecoinId={stablecoinId} symbol={selectedToken.symbol} />
              </div>
            );
          })()}

          <Input
            label="接收地址"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-matrix-text-secondary">
                金额
              </label>
              <button
                onClick={handleMaxAmount}
                className="text-xs text-matrix-accent-primary hover:text-matrix-accent-secondary transition-smooth"
              >
                最大
              </button>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {selectedToken && (
              <p className="text-xs text-matrix-text-muted mt-1">
                可用余额: {tokenBalances.find(b => b.token.address === selectedToken.address)?.balance || '0'} {selectedToken.symbol}
              </p>
            )}
          </div>

          {error && (
            <Card className="bg-red-500/10 border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </Card>
          )}

          <div className="bg-matrix-surface/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-matrix-text-muted">网络费用</span>
              <span className="text-matrix-text-secondary">≈ 0.001 {currentNetwork?.symbol}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-matrix-text-secondary">总计</span>
              <span className="text-matrix-text-primary">
                {amount ? (parseFloat(amount) + 0.001).toFixed(6) : '0.000'} {currentNetwork?.symbol}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-matrix-border">
        <Button
          variant="primary"
          fullWidth
          onClick={handleSend}
          loading={loading}
          disabled={!recipient || !amount || loading}
        >
          发送
        </Button>
      </div>
    </div>
  );
};
