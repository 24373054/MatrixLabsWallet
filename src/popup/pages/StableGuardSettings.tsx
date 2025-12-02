/**
 * StableGuard Settings Page
 * StableGuard 设置页面
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, Ban, Info } from 'lucide-react';
import { getStableGuard } from '../../lib/stableguard';

interface StableGuardSettingsProps {
  onBack: () => void;
}

export function StableGuardSettings({ onBack }: StableGuardSettingsProps) {
  const [enabled, setEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState<'none' | 'warn' | 'block'>('warn');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stableGuard = await getStableGuard();
      const config = stableGuard.getConfig();
      setEnabled(config.enabled);
      setStrictMode(config.strictMode);
    } catch (error) {
      console.error('[StableGuardSettings] Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const stableGuard = await getStableGuard();
      
      if (enabled) {
        stableGuard.enable();
      } else {
        stableGuard.disable();
      }
      
      stableGuard.updateConfig({ strictMode });
      
      // 显示成功提示
      setTimeout(() => {
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error('[StableGuardSettings] Failed to save settings:', error);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-matrix-bg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-matrix-border">
        <button
          onClick={onBack}
          className="p-2 hover:bg-matrix-surface rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-matrix-text-secondary" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-matrix-accent-primary" />
          <h1 className="text-lg font-semibold text-matrix-text-primary">
            StableGuard 设置
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Enable/Disable */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-matrix-text-primary">启用 StableGuard</h3>
              <p className="text-sm text-matrix-text-secondary mt-1">
                开启稳定币风险实时监控
              </p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${enabled ? 'bg-matrix-accent-primary' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                  ${enabled ? 'translate-x-6' : 'translate-x-0.5'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Strict Mode */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-matrix-text-primary">风控模式</h3>
            <p className="text-sm text-matrix-text-secondary mt-1">
              选择检测到高风险时的处理方式
            </p>
          </div>

          <div className="space-y-2">
            {/* None Mode */}
            <button
              onClick={() => setStrictMode('none')}
              disabled={!enabled}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${strictMode === 'none' 
                  ? 'border-matrix-accent-primary bg-blue-50' 
                  : 'border-matrix-border bg-matrix-surface hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-matrix-text-primary">仅提示</div>
                  <p className="text-sm text-matrix-text-secondary mt-1">
                    显示风险信息，但不限制操作
                  </p>
                </div>
              </div>
            </button>

            {/* Warn Mode */}
            <button
              onClick={() => setStrictMode('warn')}
              disabled={!enabled}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${strictMode === 'warn' 
                  ? 'border-matrix-accent-primary bg-blue-50' 
                  : 'border-matrix-border bg-matrix-surface hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-matrix-text-primary">警告确认（推荐）</div>
                  <p className="text-sm text-matrix-text-secondary mt-1">
                    高风险时要求二次确认后继续
                  </p>
                </div>
              </div>
            </button>

            {/* Block Mode */}
            <button
              onClick={() => setStrictMode('block')}
              disabled={!enabled}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${strictMode === 'block' 
                  ? 'border-matrix-accent-primary bg-blue-50' 
                  : 'border-matrix-border bg-matrix-surface hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Ban className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-matrix-text-primary">直接阻止</div>
                  <p className="text-sm text-matrix-text-secondary mt-1">
                    高风险时直接阻止交易，保护资产安全
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 space-y-2">
              <p className="font-medium">关于 StableGuard</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>实时监控 USDT、USDC、DAI 等主流稳定币</li>
                <li>多维度风险评估：价格、流动性、鲸鱼活动</li>
                <li>智能风控策略，保护您的资产安全</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-matrix-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-matrix-accent-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
