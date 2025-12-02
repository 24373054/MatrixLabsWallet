/**
 * StableGuard Risk Badge Component
 * 显示整体风险状态的徽章组件
 */

import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { RiskLevel } from '../../lib/stableguard';

interface StableGuardBadgeProps {
  overallRisk: RiskLevel;
  highRiskCount: number;
  onClick?: () => void;
}

const RISK_CONFIG = {
  A: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Shield,
    label: '安全'
  },
  B: {
    color: 'bg-lime-500',
    textColor: 'text-lime-700',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    icon: Shield,
    label: '良好'
  },
  C: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
    label: '注意'
  },
  D: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    label: '警告'
  },
  E: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: '高危'
  }
};

export function StableGuardBadge({ overallRisk, highRiskCount, onClick }: StableGuardBadgeProps) {
  const config = RISK_CONFIG[overallRisk];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer
        transition-all hover:shadow-md
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <div className={`p-1.5 rounded-full ${config.color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">StableGuard</span>
          <span className={`text-xs font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        
        {highRiskCount > 0 && (
          <div className="text-xs text-gray-500 mt-0.5">
            {highRiskCount} 个稳定币存在风险
          </div>
        )}
      </div>

      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );
}
