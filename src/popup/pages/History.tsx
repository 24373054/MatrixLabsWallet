/**
 * Transaction History Page
 * 交易历史记录页面
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { 
  ArrowLeft, 
  ExternalLink, 
  Send, 
  ArrowDownToLine, 
  ArrowLeftRight,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Trash2,
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { 
  HistoryService, 
  TransactionRecord, 
  TransactionType, 
  TransactionStatus 
} from '../../lib/historyService';

interface HistoryProps {
  onBack: () => void;
}

export const History: React.FC<HistoryProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork, networks } = useWalletStore();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TransactionStatus>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 加载交易历史
  useEffect(() => {
    loadHistory();
  }, [currentAccount]);

  const loadHistory = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      const history = await HistoryService.getHistoryByAddress(currentAccount.address);
      setTransactions(history);
      setFilteredTransactions(history);
    } catch (error) {
      console.error('[History] Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  useEffect(() => {
    let filtered = [...transactions];

    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // 按状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, filterStatus]);

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.SEND:
        return <Send size={16} className="text-red-400" />;
      case TransactionType.RECEIVE:
        return <ArrowDownToLine size={16} className="text-green-400" />;
      case TransactionType.SWAP:
        return <ArrowLeftRight size={16} className="text-blue-400" />;
      default:
        return <Send size={16} className="text-matrix-text-muted" />;
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return <CheckCircle size={14} className="text-green-400" />;
      case TransactionStatus.PENDING:
        return <Clock size={14} className="text-yellow-400" />;
      case TransactionStatus.FAILED:
        return <XCircle size={14} className="text-red-400" />;
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return '已确认';
      case TransactionStatus.PENDING:
        return '待确认';
      case TransactionStatus.FAILED:
        return '失败';
    }
  };

  const getTypeText = (type: TransactionType) => {
    switch (type) {
      case TransactionType.SEND:
        return '发送';
      case TransactionType.RECEIVE:
        return '接收';
      case TransactionType.SWAP:
        return '兑换';
      case TransactionType.APPROVE:
        return '授权';
      case TransactionType.CONTRACT:
        return '合约';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于 1 分钟
    if (diff < 60000) {
      return '刚刚';
    }
    // 小于 1 小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    }
    // 小于 1 天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    }
    // 小于 7 天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} 天前`;
    }
    
    return date.toLocaleDateString('zh-CN');
  };

  const getExplorerUrl = (chainId: number, hash: string) => {
    const network = networks?.find(n => n.chainId === chainId);
    if (network?.explorerUrl) {
      return `${network.explorerUrl}/tx/${hash}`;
    }
    return null;
  };

  const handleViewDetails = (tx: TransactionRecord) => {
    setSelectedTx(tx);
    setShowDetails(true);
  };

  const handleClearHistory = async () => {
    if (confirm('确定要清空所有交易历史吗？此操作不可恢复。')) {
      await HistoryService.clearHistory();
      loadHistory();
    }
  };

  // 交易详情页
  if (showDetails && selectedTx) {
    const explorerUrl = getExplorerUrl(selectedTx.chainId, selectedTx.hash);
    
    return (
      <div className="flex flex-col h-full bg-matrix-bg">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b border-matrix-border">
          <button
            onClick={() => setShowDetails(false)}
            className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">交易详情</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-matrix-text-muted">状态</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTx.status)}
                  <span className="text-sm font-medium text-matrix-text-primary">
                    {getStatusText(selectedTx.status)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-matrix-text-muted">类型</span>
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedTx.type)}
                  <span className="text-sm font-medium text-matrix-text-primary">
                    {getTypeText(selectedTx.type)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Amount */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-matrix-text-primary mb-3">金额</h3>
              {selectedTx.type === TransactionType.SWAP ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-matrix-text-muted">从</span>
                    <span className="text-sm font-medium text-matrix-text-primary">
                      {selectedTx.swapFromAmount} {selectedTx.swapFromToken}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-matrix-text-muted">到</span>
                    <span className="text-sm font-medium text-matrix-text-primary">
                      {selectedTx.swapToAmount} {selectedTx.swapToToken}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-matrix-text-muted">
                    {selectedTx.tokenSymbol || '主币'}
                  </span>
                  <span className="text-sm font-medium text-matrix-text-primary">
                    {selectedTx.tokenAmount || selectedTx.value}
                  </span>
                </div>
              )}
              {selectedTx.fee && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-matrix-border">
                  <span className="text-sm text-matrix-text-muted">手续费</span>
                  <span className="text-sm text-matrix-text-primary">
                    {(parseFloat(selectedTx.fee) / 1e18).toFixed(6)} ETH
                  </span>
                </div>
              )}
            </Card>

            {/* Addresses */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-matrix-text-primary mb-3">地址</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-matrix-text-muted">从</span>
                  <p className="text-sm font-mono text-matrix-text-primary mt-1">
                    {selectedTx.from}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-matrix-text-muted">到</span>
                  <p className="text-sm font-mono text-matrix-text-primary mt-1">
                    {selectedTx.to}
                  </p>
                </div>
              </div>
            </Card>

            {/* Transaction Info */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-matrix-text-primary mb-3">交易信息</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-matrix-text-muted">网络</span>
                  <span className="text-sm text-matrix-text-primary">{selectedTx.chainName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-matrix-text-muted">时间</span>
                  <span className="text-sm text-matrix-text-primary">
                    {new Date(selectedTx.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                {selectedTx.blockNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-matrix-text-muted">区块</span>
                    <span className="text-sm text-matrix-text-primary">
                      {selectedTx.blockNumber}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-matrix-text-muted">交易哈希</span>
                  <p className="text-xs font-mono text-matrix-text-primary mt-1 break-all">
                    {selectedTx.hash}
                  </p>
                </div>
              </div>
            </Card>

            {/* Error */}
            {selectedTx.error && (
              <Card className="p-4 bg-red-500/10 border-red-500/20">
                <h3 className="text-sm font-semibold text-red-400 mb-2">错误信息</h3>
                <p className="text-sm text-red-400/80">{selectedTx.error}</p>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        {explorerUrl && (
          <div className="px-6 py-4 border-t border-matrix-border">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.open(explorerUrl, '_blank')}
              className="flex items-center justify-center gap-2"
            >
              <span>在区块浏览器中查看</span>
              <ExternalLink size={16} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 交易列表页
  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      {/* Header */}
      <div className="px-4 py-4 border-b border-matrix-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">交易历史</h2>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 text-matrix-text-muted hover:text-red-400 transition-smooth rounded-lg hover:bg-matrix-surface/50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth ${
              filterType === 'all'
                ? 'bg-matrix-accent-primary text-white'
                : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType(TransactionType.SEND)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth ${
              filterType === TransactionType.SEND
                ? 'bg-matrix-accent-primary text-white'
                : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
            }`}
          >
            发送
          </button>
          <button
            onClick={() => setFilterType(TransactionType.RECEIVE)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth ${
              filterType === TransactionType.RECEIVE
                ? 'bg-matrix-accent-primary text-white'
                : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
            }`}
          >
            接收
          </button>
          <button
            onClick={() => setFilterType(TransactionType.SWAP)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth ${
              filterType === TransactionType.SWAP
                ? 'bg-matrix-accent-primary text-white'
                : 'bg-matrix-surface text-matrix-text-secondary hover:bg-matrix-surface/80'
            }`}
          >
            兑换
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-matrix-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <Card
                key={tx.id}
                hover
                className="cursor-pointer"
                onClick={() => handleViewDetails(tx)}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-matrix-surface rounded-full flex items-center justify-center">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-matrix-text-primary">
                          {getTypeText(tx.type)}
                        </span>
                        {getStatusIcon(tx.status)}
                      </div>
                      <p className="text-xs text-matrix-text-muted mt-0.5">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.type === TransactionType.SWAP ? (
                      <>
                        <p className="text-sm font-medium text-matrix-text-primary">
                          {tx.swapFromAmount} {tx.swapFromToken}
                        </p>
                        <p className="text-xs text-matrix-text-muted">
                          → {tx.swapToAmount} {tx.swapToToken}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-matrix-text-primary">
                          {tx.type === TransactionType.SEND ? '-' : '+'}{tx.tokenAmount || tx.value}
                        </p>
                        <p className="text-xs text-matrix-text-muted">
                          {tx.tokenSymbol || tx.chainName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Filter size={48} className="mx-auto text-matrix-text-muted mb-3" />
            <p className="text-sm text-matrix-text-muted">
              {filterType !== 'all' || filterStatus !== 'all' ? '没有符合条件的交易' : '暂无交易记录'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
