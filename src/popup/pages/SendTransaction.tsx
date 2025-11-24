import { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, Fuel } from 'lucide-react';
import { ethers } from 'ethers';

interface TransactionData {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
  chainId?: number;
}

interface SendTransactionProps {
  onApprove: () => void;
  onReject: () => void;
}

export default function SendTransaction({ onApprove, onReject }: SendTransactionProps) {
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string>('');

  useEffect(() => {
    loadTransaction();
  }, []);

  const loadTransaction = async () => {
    const result = await chrome.storage.local.get(['pendingTransaction']);
    if (result.pendingTransaction) {
      setTransaction(result.pendingTransaction);
      
      // Calculate estimated gas cost
      if (result.pendingTransaction.gas && result.pendingTransaction.maxFeePerGas) {
        const gas = BigInt(result.pendingTransaction.gas);
        const maxFee = BigInt(result.pendingTransaction.maxFeePerGas);
        const gasCost = gas * maxFee;
        setEstimatedGas(ethers.formatEther(gasCost));
      }
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await chrome.runtime.sendMessage({ type: 'TRANSACTION_APPROVED' });
      onApprove();
    } catch (error) {
      console.error('Failed to approve transaction:', error);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await chrome.runtime.sendMessage({ type: 'TRANSACTION_REJECTED' });
      onReject();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-matrix-text-muted">Loading transaction...</div>
      </div>
    );
  }

  const valueInEth = transaction.value ? ethers.formatEther(transaction.value) : '0';

  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      {/* Header */}
      <div className="px-4 py-4 border-b border-matrix-border">
        <h2 className="text-lg font-semibold text-matrix-text-primary">
          Confirm Transaction
        </h2>
        <p className="text-sm text-matrix-text-muted mt-1">
          Review the transaction details carefully
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Value */}
        {parseFloat(valueInEth) > 0 && (
          <div className="bg-matrix-surface rounded-lg p-4 border border-matrix-border">
            <div className="text-sm text-matrix-text-muted mb-1">Amount</div>
            <div className="text-2xl font-bold text-matrix-text-primary">
              {parseFloat(valueInEth).toFixed(6)} ETH
            </div>
          </div>
        )}

        {/* From/To */}
        <div className="bg-matrix-surface rounded-lg p-4 border border-matrix-border space-y-3">
          <div>
            <div className="text-sm text-matrix-text-muted mb-1">From</div>
            <div className="text-sm font-mono text-matrix-text-primary break-all">
              {transaction.from}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight size={20} className="text-matrix-text-muted" />
          </div>

          <div>
            <div className="text-sm text-matrix-text-muted mb-1">To</div>
            <div className="text-sm font-mono text-matrix-text-primary break-all">
              {transaction.to}
            </div>
          </div>
        </div>

        {/* Gas */}
        <div className="bg-matrix-surface rounded-lg p-4 border border-matrix-border">
          <div className="flex items-center gap-2 mb-3">
            <Fuel size={16} className="text-matrix-text-muted" />
            <div className="text-sm font-medium text-matrix-text-primary">
              Gas Estimate
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {transaction.gas && (
              <div className="flex justify-between">
                <span className="text-matrix-text-muted">Gas Limit</span>
                <span className="text-matrix-text-primary font-mono">
                  {parseInt(transaction.gas, 16).toLocaleString()}
                </span>
              </div>
            )}

            {transaction.maxFeePerGas && (
              <div className="flex justify-between">
                <span className="text-matrix-text-muted">Max Fee</span>
                <span className="text-matrix-text-primary font-mono">
                  {(parseInt(transaction.maxFeePerGas, 16) / 1e9).toFixed(2)} Gwei
                </span>
              </div>
            )}

            {estimatedGas && (
              <div className="flex justify-between pt-2 border-t border-matrix-border">
                <span className="text-matrix-text-muted font-medium">Total Gas Cost</span>
                <span className="text-matrix-text-primary font-mono font-medium">
                  ~{parseFloat(estimatedGas).toFixed(6)} ETH
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Data (if contract interaction) */}
        {transaction.data && transaction.data !== '0x' && (
          <div className="bg-matrix-surface rounded-lg p-4 border border-matrix-border">
            <div className="text-sm text-matrix-text-muted mb-2">Contract Data</div>
            <div className="text-xs font-mono text-matrix-text-primary break-all bg-matrix-bg p-2 rounded">
              {transaction.data.slice(0, 100)}...
            </div>
            <div className="text-xs text-matrix-text-muted mt-2">
              This is a contract interaction
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-matrix-accent-warning/10 border border-matrix-accent-warning/30 rounded-lg">
          <AlertCircle size={18} className="text-matrix-accent-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm text-matrix-accent-warning">
            <div className="font-medium mb-1">Double check before confirming</div>
            <div className="text-xs opacity-90">
              Transactions cannot be reversed once confirmed
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-matrix-border space-y-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="w-full py-3 px-4 bg-matrix-accent-primary text-white rounded-lg font-medium hover:bg-matrix-accent-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Confirming...' : 'Confirm Transaction'}
        </button>

        <button
          onClick={handleReject}
          disabled={loading}
          className="w-full py-3 px-4 bg-matrix-surface text-matrix-text-primary rounded-lg font-medium hover:bg-matrix-surface/80 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed border border-matrix-border"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
