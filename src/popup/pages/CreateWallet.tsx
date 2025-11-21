import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { WalletService } from '../../lib/wallet';

interface CreateWalletProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CreateWallet: React.FC<CreateWalletProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<'password' | 'mnemonic' | 'confirm'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePassword = async () => {
    if (password.length < 8) {
      setError('密码至少需要8个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const generatedMnemonic = await WalletService.createWallet(password);
      setMnemonic(generatedMnemonic);
      setStep('mnemonic');
    } catch (err) {
      setError('创建钱包失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onComplete();
  };

  if (step === 'password') {
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
            创建密码
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-sm text-matrix-text-secondary mb-6">
            此密码将用于解锁您的钱包，请务必牢记
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="密码"
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
            onClick={handleCreatePassword}
            loading={loading}
            disabled={!password || !confirmPassword}
          >
            下一步
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'mnemonic') {
    return (
      <div className="flex flex-col h-full bg-matrix-bg">
        {/* Header */}
        <div className="px-4 py-4 border-b border-matrix-border">
          <h2 className="text-lg font-semibold text-matrix-text-primary">
            备份助记词
          </h2>
          <p className="text-sm text-matrix-text-secondary mt-1">
            请按顺序抄写并妥善保管
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-4 p-4 bg-matrix-accent-danger/10 border border-matrix-accent-danger/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-matrix-accent-danger flex-shrink-0 mt-0.5" />
              <div className="text-sm text-matrix-accent-danger">
                <p className="font-medium mb-1">重要提示</p>
                <ul className="space-y-1 text-xs">
                  <li>• 助记词是恢复钱包的唯一凭证</li>
                  <li>• 请勿截图或在线保存</li>
                  <li>• 任何人获得助记词都可以控制您的资产</li>
                </ul>
              </div>
            </div>
          </div>

          <Card className="mb-4">
            <div className="grid grid-cols-3 gap-3">
              {mnemonic.split(' ').map((word, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-matrix-surface/50 rounded-lg border border-matrix-border"
                >
                  <span className="text-xs text-matrix-text-muted w-5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-matrix-text-primary font-mono">
                    {word}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleCopyMnemonic}
            className="mb-4"
          >
            {copied ? (
              <>
                <Check size={18} className="mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy size={18} className="mr-2" />
                复制助记词
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-matrix-border">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirm}
          >
            我已安全保存
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
