/**
 * Agent Visualization Component
 * 五智能体系统可视化组件
 */

import { useState, useEffect } from 'react';
import { 
  Database, 
  Cpu, 
  Shield, 
  Lightbulb, 
  CheckCircle, 
  Activity,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AgentStatus {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastRun?: number;
  duration?: number;
  dataPoints?: number;
}

interface AgentVisualizationProps {
  stablecoinId?: string;
}

export function AgentVisualization({ stablecoinId = 'usdt' }: AgentVisualizationProps) {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { name: 'DataAgent', status: 'idle' },
    { name: 'FeatureAgent', status: 'idle' },
    { name: 'RiskAgent', status: 'idle' },
    { name: 'StrategyAgent', status: 'idle' },
    { name: 'ExecutionAgent', status: 'idle' }
  ]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadAgentStatus();
    const interval = setInterval(loadAgentStatus, 2000);
    return () => clearInterval(interval);
  }, [stablecoinId]);

  const loadAgentStatus = async () => {
    try {
      // 从存储中读取真实的性能指标
      const result = await chrome.storage.local.get([
        `stableguard_risk_${stablecoinId}`,
        'stableguard_last_update',
        'stableguard_metrics'
      ]);
      
      const report = result[`stableguard_risk_${stablecoinId}`];
      const realMetrics = result.stableguard_metrics;
      
      if (report && realMetrics) {
        // 使用真实的执行指标
        setAgents([
          { 
            name: 'DataAgent', 
            status: 'completed', 
            duration: realMetrics.dataAgent?.duration || 0,
            dataPoints: realMetrics.dataAgent?.dataPoints || 0
          },
          { 
            name: 'FeatureAgent', 
            status: 'completed', 
            duration: realMetrics.featureAgent?.duration || 0,
            dataPoints: realMetrics.featureAgent?.dataPoints || 0
          },
          { 
            name: 'RiskAgent', 
            status: 'completed', 
            duration: realMetrics.riskAgent?.duration || 0,
            dataPoints: realMetrics.riskAgent?.dataPoints || 0
          },
          { 
            name: 'StrategyAgent', 
            status: 'completed', 
            duration: realMetrics.strategyAgent?.duration || 0,
            dataPoints: realMetrics.strategyAgent?.dataPoints || 0
          },
          { 
            name: 'ExecutionAgent', 
            status: 'completed', 
            duration: realMetrics.executionAgent?.duration || 0,
            dataPoints: realMetrics.executionAgent?.dataPoints || 0
          }
        ]);
        
        setMetrics({
          riskLevel: report.riskLevel,
          riskScore: report.riskScore,
          features: report.evidence?.length || 0,
          lastUpdate: result.stableguard_last_update
        });
      }
    } catch (error) {
      console.error('[AgentVisualization] Failed to load status:', error);
    }
  };

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'DataAgent': return Database;
      case 'FeatureAgent': return Cpu;
      case 'RiskAgent': return Shield;
      case 'StrategyAgent': return Lightbulb;
      case 'ExecutionAgent': return CheckCircle;
      default: return Activity;
    }
  };

  const getAgentColor = (name: string) => {
    switch (name) {
      case 'DataAgent': return 'text-blue-500';
      case 'FeatureAgent': return 'text-purple-500';
      case 'RiskAgent': return 'text-red-500';
      case 'StrategyAgent': return 'text-yellow-500';
      case 'ExecutionAgent': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getAgentDescription = (name: string) => {
    switch (name) {
      case 'DataAgent': return '数据感知 - 采集价格、交易量等数据';
      case 'FeatureAgent': return '特征工程 - 计算偏离度、波动率等特征';
      case 'RiskAgent': return '风险研判 - 分析风险等级和评分';
      case 'StrategyAgent': return '策略生成 - 制定风控措施';
      case 'ExecutionAgent': return '验证执行 - 执行策略并记录';
      default: return '';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-green-400';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'E': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-matrix-text-primary">
            多智能体系统
          </h3>
          <p className="text-xs text-matrix-text-muted mt-1">
            五智能体协同推理架构
          </p>
        </div>
        {metrics && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${getRiskColor(metrics.riskLevel)}`}>
              {metrics.riskLevel}
            </div>
            <div className="text-xs text-matrix-text-muted">
              评分: {metrics.riskScore}/100
            </div>
          </div>
        )}
      </div>

      {/* Agent Pipeline */}
      <div className="bg-matrix-surface/50 rounded-lg p-4 border border-matrix-border">
        <div className="space-y-3">
          {agents.map((agent, index) => {
            const Icon = getAgentIcon(agent.name);
            const colorClass = getAgentColor(agent.name);
            
            return (
              <div key={agent.name}>
                <div className="flex items-center gap-3">
                  {/* Agent Icon */}
                  <div className={`w-10 h-10 rounded-full bg-matrix-surface border-2 border-current ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-matrix-text-primary text-sm">
                        {agent.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        agent.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                        agent.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.status === 'completed' ? '✓ 完成' :
                         agent.status === 'running' ? '⟳ 运行中' :
                         agent.status === 'error' ? '✗ 错误' :
                         '○ 就绪'}
                      </span>
                    </div>
                    <p className="text-xs text-matrix-text-muted mt-0.5">
                      {getAgentDescription(agent.name)}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col items-end gap-0.5">
                    {agent.duration !== undefined && (
                      <div className="text-xs text-matrix-text-muted">
                        {agent.duration}ms
                      </div>
                    )}
                    {agent.dataPoints !== undefined && (
                      <div className="text-xs text-blue-400">
                        {agent.dataPoints} 数据点
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow between agents */}
                {index < agents.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight size={16} className="text-matrix-text-muted" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-3 gap-3">
          {/* Last Update */}
          <div className="bg-matrix-surface/50 rounded-lg p-3 border border-matrix-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-500" />
              <span className="text-xs text-matrix-text-muted">最后更新</span>
            </div>
            <div className="text-sm font-medium text-matrix-text-primary">
              {metrics.lastUpdate ? new Date(metrics.lastUpdate).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : '--:--'}
            </div>
          </div>

          {/* Features Count */}
          <div className="bg-matrix-surface/50 rounded-lg p-3 border border-matrix-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-purple-500" />
              <span className="text-xs text-matrix-text-muted">特征数量</span>
            </div>
            <div className="text-sm font-medium text-matrix-text-primary">
              {metrics.features} 个
            </div>
          </div>

          {/* Risk Score */}
          <div className="bg-matrix-surface/50 rounded-lg p-3 border border-matrix-border">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-red-500" />
              <span className="text-xs text-matrix-text-muted">风险评分</span>
            </div>
            <div className={`text-sm font-medium ${getRiskColor(metrics.riskLevel)}`}>
              {metrics.riskScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-medium">实时协同推理</p>
            <p>五个智能体按顺序执行，每个智能体的输出作为下一个智能体的输入，形成完整的风险评估链。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
