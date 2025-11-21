import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ArrowLeft, Lock, Globe, Trash2, AlertCircle } from 'lucide-react';
import { WalletService } from '../../lib/wallet';
import { StorageService } from '../../lib/storage';

interface SettingsProps {
  onBack: () => void;
  onLock: () => void;
  onNavigate?: (page: 'network-settings') => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack, onLock, onNavigate }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLock = () => {
    WalletService.lockWallet();
    onLock();
  };

  const handleReset = async () => {
    await StorageService.clear();
    window.location.reload();
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
          设置
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {/* Lock Wallet */}
          <Card hover onClick={handleLock} className="cursor-pointer">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-matrix-accent-primary/20 rounded-full flex items-center justify-center">
                <Lock size={20} className="text-matrix-accent-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-matrix-text-primary">
                  锁定钱包
                </h3>
                <p className="text-xs text-matrix-text-muted">
                  需要密码才能重新访问
                </p>
              </div>
            </div>
          </Card>

          {/* Network Settings */}
          <Card hover onClick={() => onNavigate?.('network-settings')} className="cursor-pointer">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
                <Globe size={20} className="text-matrix-accent-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-matrix-text-primary">
                  网络设置
                </h3>
                <p className="text-xs text-matrix-text-muted">
                  管理自定义网络
                </p>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-matrix-text-primary mb-2">
                关于
              </h3>
              <div className="space-y-1 text-xs text-matrix-text-secondary">
                <p>MatrixLabs Wallet</p>
                <p>版本 1.0.0</p>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20">
            <div className="p-4">
              <h3 className="text-sm font-medium text-red-400 mb-3">
                危险区域
              </h3>
              <Button
                variant="danger"
                fullWidth
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                重置钱包
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-matrix-text-primary mb-2">
                    确认重置钱包
                  </h3>
                  <p className="text-sm text-matrix-text-secondary">
                    这将删除所有数据，包括助记词、账户和设置。请确保已备份助记词。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowResetConfirm(false)}
                >
                  取消
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleReset}
                >
                  确认重置
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
