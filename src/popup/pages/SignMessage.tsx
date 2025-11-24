import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FileText, AlertCircle, Shield } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';

interface SignMessageProps {
  onApprove: (signature: string) => void;
  onReject: () => void;
}

export const SignMessage: React.FC<SignMessageProps> = ({ onApprove, onReject }) => {
  const { currentAccount, currentNetwork } = useWalletStore();
  const [message, setMessage] = useState('');
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get the pending signature request from storage
    chrome.storage.local.get(['pendingSignature'], (result) => {
      if (result.pendingSignature) {
        setMessage(result.pendingSignature.message || '');
        setOrigin(result.pendingSignature.origin || 'Unknown Site');
      }
    });
  }, []);

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Send approval to background script
      const response = await chrome.runtime.sendMessage({
        type: 'SIGNATURE_APPROVED',
        data: { approved: true }
      });
      
      if (response.success && response.signature) {
        onApprove(response.signature);
      } else {
        console.error('Failed to sign message:', response.error);
        onReject();
      }
    } catch (error) {
      console.error('Error approving signature:', error);
      onReject();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // Send rejection to background script
    await chrome.runtime.sendMessage({
      type: 'SIGNATURE_REJECTED',
      data: { approved: false }
    });
    onReject();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-matrix-bg to-matrix-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-matrix-border/50">
        <h2 className="text-lg font-semibold text-matrix-text-primary">
          签名请求
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Site Info */}
          <Card className="text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-matrix-accent-secondary/10 flex items-center justify-center">
                <FileText size={32} className="text-matrix-accent-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-matrix-text-primary mb-2">
                {origin}
              </h3>
              <p className="text-sm text-matrix-text-secondary">
                请求签名消息
              </p>
            </div>
          </Card>

          {/* Account Info */}
          <Card>
            <div className="p-4">
              <p className="text-xs text-matrix-text-muted mb-3">签名账户</p>
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

          {/* Message Content */}
          <Card>
            <div className="p-4">
              <p className="text-xs text-matrix-text-muted mb-3">消息内容</p>
              <div className="p-4 bg-matrix-surface rounded-lg border border-matrix-border/30">
                <pre className="text-sm text-matrix-text-primary whitespace-pre-wrap break-words font-mono">
                  {message}
                </pre>
              </div>
            </div>
          </Card>

          {/* Security Info */}
          <div className="flex items-start gap-3 p-4 bg-matrix-accent-secondary/10 border border-matrix-accent-secondary/30 rounded-lg">
            <Shield size={20} className="text-matrix-accent-secondary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-matrix-text-primary mb-1">
                签名不会花费 Gas
              </p>
              <p className="text-xs text-matrix-text-secondary">
                签名消息是免费的，不会发送交易或花费任何费用。
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-matrix-accent-warning/10 border border-matrix-accent-warning/30 rounded-lg">
            <AlertCircle size={20} className="text-matrix-accent-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-matrix-text-secondary">
                只签名你理解和信任的消息。签名可能授权网站代表你执行操作。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-matrix-border/50 space-y-3">
        <Button 
          onClick={handleApprove} 
          className="w-full"
          disabled={loading}
        >
          {loading ? '签名中...' : '签名'}
        </Button>
        <Button 
          onClick={handleReject} 
          variant="secondary" 
          className="w-full"
          disabled={loading}
        >
          取消
        </Button>
      </div>
    </div>
  );
};
