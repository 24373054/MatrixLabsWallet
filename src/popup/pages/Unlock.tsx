import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Wallet, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { WalletService } from '../../lib/wallet';

interface UnlockProps {
  onUnlock: () => void;
}

export const Unlock: React.FC<UnlockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await WalletService.unlockWallet(password);
      if (success) {
        onUnlock();
      } else {
        setError('密码错误，请重试');
      }
    } catch (err) {
      setError('解锁失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password) {
      handleUnlock();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-gradient-to-b from-matrix-bg to-matrix-surface">
      {/* Logo */}
      <div className="mb-8 p-4 glass glass-border rounded-2xl">
        <Wallet size={48} className="text-matrix-accent-primary" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-matrix-text-primary mb-2">
        欢迎回来
      </h1>
      <p className="text-matrix-text-secondary text-center mb-8">
        输入密码解锁钱包
      </p>

      {/* Form */}
      <div className="w-full space-y-4">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-matrix-text-muted hover:text-matrix-text-primary transition-smooth"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-matrix-accent-danger/10 border border-matrix-accent-danger/30 rounded-lg animate-fade-in">
            <AlertCircle size={18} className="text-matrix-accent-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-matrix-accent-danger">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleUnlock}
          loading={loading}
          disabled={!password}
        >
          解锁
        </Button>
      </div>
    </div>
  );
};
