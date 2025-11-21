import React from 'react';
import { Button } from '../../components/Button';
import { Wallet } from 'lucide-react';

interface WelcomeProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onCreateWallet, onImportWallet }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-gradient-to-b from-matrix-bg to-matrix-surface">
      {/* Logo */}
      <div className="mb-8 p-4 glass glass-border rounded-2xl">
        <Wallet size={48} className="text-matrix-accent-primary" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-matrix-text-primary mb-2">
        MatrixLabs Wallet
      </h1>
      <p className="text-matrix-text-secondary text-center mb-12 max-w-xs">
        安全的去中心化数字资产钱包，支持以太坊及兼容链
      </p>

      {/* Actions */}
      <div className="w-full space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onCreateWallet}
        >
          创建新钱包
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onImportWallet}
        >
          导入已有钱包
        </Button>
      </div>

      {/* Footer */}
      <p className="mt-auto text-xs text-matrix-text-muted text-center">
        请妥善保管您的助记词和私钥
      </p>
    </div>
  );
};
