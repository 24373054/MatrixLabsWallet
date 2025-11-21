import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import QRCode from 'qrcode';

interface ReceiveProps {
  onBack: () => void;
}

export const Receive: React.FC<ReceiveProps> = ({ onBack }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [includeChainId, setIncludeChainId] = useState(false);

  React.useEffect(() => {
    if (currentAccount && currentNetwork) {
      // Simple address format by default for better compatibility
      const qrData = includeChainId 
        ? `ethereum:${currentAccount.address}@${currentNetwork.chainId}`
        : currentAccount.address;
      
      QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#e0e7ff',
          light: '#0a0e14',
        },
      }).then(setQrCode);
    }
  }, [currentAccount, currentNetwork, includeChainId]);

  const handleCopy = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          接收
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto">
          <div className="mb-4 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-matrix-accent-primary/10 text-matrix-accent-primary text-xs rounded-full">
              <span className="w-2 h-2 bg-matrix-accent-primary rounded-full"></span>
              当前网络: {currentNetwork?.name}
            </span>
          </div>

          <div className="mb-6 bg-matrix-accent-secondary/10 border border-matrix-accent-secondary/30 rounded-lg p-3">
            <p className="text-xs text-matrix-text-secondary text-center">
              💡 <span className="font-semibold">提示：</span>此二维码仅用于显示收款地址。
              <br />
              建议直接<span className="text-matrix-accent-secondary font-semibold">复制地址</span>到发送方钱包使用。
            </p>
          </div>

          <Card className="mb-6">
            <div className="flex items-center justify-center p-6">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="w-64 h-64 rounded-lg" />
              ) : (
                <div className="w-64 h-64 bg-matrix-surface/50 rounded-lg animate-pulse" />
              )}
            </div>
            <div className="px-4 pb-4 border-t border-matrix-border/50 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChainId}
                  onChange={(e) => setIncludeChainId(e.target.checked)}
                  className="w-4 h-4 rounded border-matrix-border bg-matrix-surface text-matrix-accent-primary focus:ring-2 focus:ring-matrix-accent-primary/50"
                />
                <span className="text-xs text-matrix-text-secondary">
                  包含网络信息 (EIP-681)
                </span>
              </label>
            </div>
          </Card>

          <Card className="mb-4">
            <div className="p-4">
              <p className="text-xs text-matrix-text-muted mb-2">您的地址</p>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-sm font-mono text-matrix-text-primary break-all">
                  {currentAccount?.address}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-smooth rounded-lg hover:bg-matrix-surface/50 flex-shrink-0"
                >
                  {copied ? (
                    <Check size={18} className="text-matrix-accent-secondary" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          </Card>

          <div className="bg-matrix-surface/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-matrix-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-matrix-accent-primary">!</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-matrix-text-secondary">
                  请确保发送方使用 <span className="font-semibold text-matrix-text-primary">{currentNetwork?.name}</span> 网络。仅发送 EVM 兼容资产到此地址，发送其他资产可能导致永久丢失。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-matrix-border">
        <Button variant="secondary" fullWidth onClick={handleCopy}>
          {copied ? '已复制!' : '复制地址'}
        </Button>
      </div>
    </div>
  );
};
