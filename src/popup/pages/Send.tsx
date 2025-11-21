import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { WalletService } from '../../lib/wallet';
import { ProviderService } from '../../lib/provider';
import { ethers } from 'ethers';

interface SendProps {
  onBack: () => void;
}

export const Send: React.FC<SendProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork, balance } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSend = async () => {
    if (!currentAccount || !currentNetwork) return;

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

      if (amountValue > parseFloat(balance)) {
        throw new Error('余额不足');
      }

      // Get gas price and nonce
      const gasPrice = await ProviderService.getGasPrice(currentNetwork);
      const nonce = await ProviderService.getTransactionCount(currentAccount.address, currentNetwork);
      const gasLimit = 21000n;

      // Create legacy transaction (Type 0) for better compatibility
      const tx = {
        to: recipient,
        value: ethers.parseEther(amount),
        gasLimit,
        gasPrice,
        nonce,
        chainId: currentNetwork.chainId,
        type: 0, // Legacy transaction
      };

      // Sign and send transaction
      const signedTx = await WalletService.signTransaction(tx);
      const response = await ProviderService.sendTransaction(signedTx, currentNetwork);

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
    // Reserve some for gas fees
    const maxAmount = Math.max(0, parseFloat(balance) - 0.001);
    setAmount(maxAmount.toString());
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
          发送 {currentNetwork?.symbol}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
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
            <p className="text-xs text-matrix-text-muted mt-1">
              可用余额: {parseFloat(balance).toFixed(6)} {currentNetwork?.symbol}
            </p>
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
