import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Globe, AlertCircle, Check } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';

interface ConnectRequestProps {
  onApprove: () => void;
  onReject: () => void;
}

export const ConnectRequest: React.FC<ConnectRequestProps> = ({ onApprove, onReject }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // Get the requesting site origin from storage
    chrome.storage.local.get(['pendingConnection'], (result) => {
      if (result.pendingConnection) {
        setOrigin(result.pendingConnection.origin || 'Unknown Site');
      }
    });
  }, []);

  const handleApprove = async () => {
    if (currentAccount) {
      // Save approved connection
      const result = await chrome.storage.local.get(['approvedSites']);
      const approvedSites = result.approvedSites || [];
      if (!approvedSites.includes(origin)) {
        approvedSites.push(origin);
        await chrome.storage.local.set({ approvedSites });
      }
      
      // Clear pending connection
      await chrome.storage.local.remove(['pendingConnection']);
      
      onApprove();
    }
  };

  const handleReject = async () => {
    // Clear pending connection
    await chrome.storage.local.remove(['pendingConnection']);
    onReject();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-matrix-bg to-matrix-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-matrix-border/50">
        <h2 className="text-lg font-semibold text-matrix-text-primary">
          连接请求
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Site Info */}
          <Card className="text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-matrix-accent-primary/10 flex items-center justify-center">
                <Globe size={32} className="text-matrix-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold text-matrix-text-primary mb-2">
                {origin}
              </h3>
              <p className="text-sm text-matrix-text-secondary">
                请求连接到你的钱包
              </p>
            </div>
          </Card>

          {/* Account Info */}
          <Card>
            <div className="p-4">
              <p className="text-xs text-matrix-text-muted mb-3">将要连接的账户</p>
              <div className="flex items-center gap-3 p-3 bg-matrix-surface rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-matrix-accent-primary to-matrix-accent-secondary flex items-center justify-center text-white font-bold">
                  {currentAccount?.address.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-matrix-text-primary truncate">
                    {currentAccount?.address}
                  </p>
                  <p className="text-xs text-matrix-text-secondary">
                    {currentNetwork?.name}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card>
            <div className="p-4">
              <p className="text-xs text-matrix-text-muted mb-3">此网站将能够</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-matrix-accent-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-matrix-text-secondary">查看你的账户地址和余额</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-matrix-accent-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-matrix-text-secondary">请求交易批准</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-matrix-accent-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-matrix-text-secondary">请求消息签名</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-matrix-accent-warning/10 border border-matrix-accent-warning/30 rounded-lg">
            <AlertCircle size={20} className="text-matrix-accent-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-matrix-text-secondary">
                只连接你信任的网站。恶意网站可能会尝试窃取你的资产。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-matrix-border/50 space-y-3">
        <Button onClick={handleApprove} className="w-full">
          连接
        </Button>
        <Button onClick={handleReject} variant="secondary" className="w-full">
          取消
        </Button>
      </div>
    </div>
  );
};
