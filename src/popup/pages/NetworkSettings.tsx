import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { StorageService, Network } from '../../lib/storage';

interface NetworkSettingsProps {
  onBack: () => void;
}

export const NetworkSettings: React.FC<NetworkSettingsProps> = ({ onBack }) => {
  const { networks, currentNetwork, setNetworks, setCurrentNetwork } = useWalletStore();
  const [showAddNetwork, setShowAddNetwork] = useState(false);
  const [newNetwork, setNewNetwork] = useState<Partial<Network>>({
    name: '',
    rpcUrl: '',
    chainId: 0,
    symbol: '',
    explorerUrl: '',
  });
  const [error, setError] = useState('');

  const handleAddNetwork = async () => {
    setError('');

    if (!newNetwork.name || !newNetwork.rpcUrl || !newNetwork.chainId || !newNetwork.symbol) {
      setError('请填写所有必填字段');
      return;
    }

    const network: Network = {
      id: newNetwork.name.toLowerCase().replace(/\s+/g, '-'),
      name: newNetwork.name,
      rpcUrl: newNetwork.rpcUrl,
      chainId: newNetwork.chainId,
      symbol: newNetwork.symbol,
      explorerUrl: newNetwork.explorerUrl,
    };

    const updatedNetworks = [...networks, network];
    setNetworks(updatedNetworks);
    await StorageService.set('networks', updatedNetworks);

    setShowAddNetwork(false);
    setNewNetwork({
      name: '',
      rpcUrl: '',
      chainId: 0,
      symbol: '',
      explorerUrl: '',
    });
  };

  const handleDeleteNetwork = async (networkId: string) => {
    // Prevent deleting the current network
    if (currentNetwork?.id === networkId) {
      setError('无法删除当前使用的网络');
      return;
    }

    const updatedNetworks = networks.filter(n => n.id !== networkId);
    setNetworks(updatedNetworks);
    await StorageService.set('networks', updatedNetworks);
  };

  const isDefaultNetwork = (networkId: string) => {
    return ['ethereum', 'sepolia', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base', 'avalanche', 'linea', 'zksync'].includes(networkId);
  };

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
          网络设置
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <Card className="mb-4 bg-red-500/10 border-red-500/20">
            <p className="text-sm text-red-400 p-3">{error}</p>
          </Card>
        )}

        <div className="space-y-3 mb-4">
          {networks.map((network) => (
            <Card key={network.id} hover>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      network.id === currentNetwork?.id
                        ? 'bg-matrix-accent-secondary'
                        : 'bg-matrix-text-muted/30'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-matrix-text-primary">
                      {network.name}
                    </p>
                    <p className="text-xs text-matrix-text-muted">
                      Chain ID: {network.chainId} • {network.symbol}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {network.id === currentNetwork?.id && (
                    <Check size={16} className="text-matrix-accent-secondary" />
                  )}
                  {!isDefaultNetwork(network.id) && (
                    <button
                      onClick={() => handleDeleteNetwork(network.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-smooth rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!showAddNetwork ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowAddNetwork(true)}
            className="flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            添加自定义网络
          </Button>
        ) : (
          <Card>
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-medium text-matrix-text-primary mb-3">
                添加自定义网络
              </h3>

              <Input
                label="网络名称 *"
                placeholder="例如: My Custom Network"
                value={newNetwork.name || ''}
                onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
              />

              <Input
                label="RPC URL *"
                placeholder="https://..."
                value={newNetwork.rpcUrl || ''}
                onChange={(e) => setNewNetwork({ ...newNetwork, rpcUrl: e.target.value })}
              />

              <Input
                label="Chain ID *"
                type="number"
                placeholder="1"
                value={newNetwork.chainId || ''}
                onChange={(e) => setNewNetwork({ ...newNetwork, chainId: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="货币符号 *"
                placeholder="ETH"
                value={newNetwork.symbol || ''}
                onChange={(e) => setNewNetwork({ ...newNetwork, symbol: e.target.value })}
              />

              <Input
                label="区块浏览器 URL (可选)"
                placeholder="https://..."
                value={newNetwork.explorerUrl || ''}
                onChange={(e) => setNewNetwork({ ...newNetwork, explorerUrl: e.target.value })}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowAddNetwork(false);
                    setError('');
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleAddNetwork}
                >
                  添加
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
