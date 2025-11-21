import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { WalletService } from '../../lib/wallet';

interface ImportWalletProps {
  onBack: () => void;
  onComplete: () => void;
}

export const ImportWallet: React.FC<ImportWalletProps> = ({ onBack, onComplete }) => {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (password.length < 8) {
      setError('密码至少需要8个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    const trimmedMnemonic = mnemonic.trim().toLowerCase();
    const words = trimmedMnemonic.split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      setError('助记词必须是12或24个单词');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await WalletService.importWallet(trimmedMnemonic, password);
      onComplete();
    } catch (err: any) {
      setError(err.message || '导入失败，请检查助记词是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-matrix-bg">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-matrix-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-2 text-lg font-semibold text-matrix-text-primary">
          导入钱包
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-sm text-matrix-text-secondary mb-6">
          输入您的12或24个单词的助记词
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-matrix-text-secondary mb-2">
              助记词
            </label>
            <textarea
              className="w-full px-4 py-3 bg-matrix-surface/50 border border-matrix-border rounded-lg text-matrix-text-primary placeholder-matrix-text-muted transition-smooth backdrop-blur-sm hover:border-matrix-accent-primary/30 focus:border-matrix-accent-primary/50 focus:bg-matrix-surface/70 focus:outline-none resize-none font-mono text-sm"
              rows={4}
              placeholder="输入助记词，用空格分隔"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="设置密码"
              placeholder="至少8个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-matrix-text-muted hover:text-matrix-text-primary transition-smooth"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            label="确认密码"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="flex items-start gap-2 p-3 bg-matrix-accent-danger/10 border border-matrix-accent-danger/30 rounded-lg">
              <AlertCircle size={18} className="text-matrix-accent-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-matrix-accent-danger">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-matrix-border">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleImport}
          loading={loading}
          disabled={!mnemonic || !password || !confirmPassword}
        >
          导入钱包
        </Button>
      </div>
    </div>
  );
};
