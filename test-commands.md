# StableGuard 测试命令

## 在 Background DevTools Console 中执行

### 1. 测试 StableGuard 初始化
```javascript
// 导入并初始化 StableGuard
import('./lib/stableguard/index.js').then(async (module) => {
  const stableGuard = await module.getStableGuard();
  console.log('StableGuard 实例:', stableGuard);
  console.log('配置:', stableGuard.getConfig());
});
```

### 2. 手动触发风险评估
```javascript
import('./lib/stableguard/index.js').then(async (module) => {
  const stableGuard = await module.getStableGuard();
  console.log('开始风险评估...');
  const result = await stableGuard.performRiskAssessment();
  console.log('评估结果:', result);
});
```

### 3. 查看存储的风险数据
```javascript
chrome.storage.local.get([
  'stableguard_risk_usdt',
  'stableguard_risk_usdc',
  'stableguard_risk_dai',
  'stableguard_last_update',
  'stableguard_config'
], (result) => {
  console.log('=== StableGuard 存储数据 ===');
  console.log('USDT 风险:', result.stableguard_risk_usdt);
  console.log('USDC 风险:', result.stableguard_risk_usdc);
  console.log('DAI 风险:', result.stableguard_risk_dai);
  console.log('最后更新:', new Date(result.stableguard_last_update));
  console.log('配置:', result.stableguard_config);
});
```

### 4. 查看事件历史
```javascript
chrome.storage.local.get('stableguard_events', (result) => {
  console.log('=== StableGuard 事件历史 ===');
  const events = result.stableguard_events || [];
  console.log(`共 ${events.length} 条事件`);
  events.forEach((event, index) => {
    console.log(`\n事件 ${index + 1}:`, {
      时间: new Date(event.timestamp).toLocaleString(),
      类型: event.eventType,
      稳定币: event.stablecoinId,
      风险等级: event.severity,
      标题: event.title,
      描述: event.description
    });
  });
});
```

### 5. 测试单个稳定币评估
```javascript
import('./lib/stableguard/dataAgent.js').then(async (module) => {
  const dataAgent = module.dataAgent;
  console.log('测试数据采集...');
  const result = await dataAgent.collectData(['usdt']);
  console.log('数据采集结果:', result);
});
```

### 6. 清除所有 StableGuard 数据（重置）
```javascript
chrome.storage.local.get(null, (items) => {
  const keysToRemove = Object.keys(items).filter(key => key.startsWith('stableguard_'));
  chrome.storage.local.remove(keysToRemove, () => {
    console.log('已清除 StableGuard 数据:', keysToRemove);
  });
});
```

### 7. 启用 StableGuard
```javascript
import('./lib/stableguard/index.js').then(async (module) => {
  const stableGuard = await module.getStableGuard();
  stableGuard.enable();
  console.log('StableGuard 已启用');
});
```

### 8. 禁用 StableGuard
```javascript
import('./lib/stableguard/index.js').then(async (module) => {
  const stableGuard = await module.getStableGuard();
  stableGuard.disable();
  console.log('StableGuard 已禁用');
});
```

### 9. 修改风控模式
```javascript
import('./lib/stableguard/index.js').then(async (module) => {
  const stableGuard = await module.getStableGuard();
  // 可选: 'none', 'warn', 'block'
  stableGuard.updateConfig({ strictMode: 'warn' });
  console.log('风控模式已更新为: warn');
});
```

### 10. 模拟交易评估
```javascript
import('./lib/stableguard/index.js').then(async (module) => {
  const stableGuard = await module.getStableGuard();
  
  // 模拟 USDT 转账
  const txParams = {
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
    value: '0x0',
    chainId: 1
  };
  
  console.log('评估交易...');
  const evaluation = await stableGuard.evaluateTransaction(txParams);
  console.log('评估结果:', evaluation);
});
```

## 快速测试流程

### 完整测试（复制整段执行）
```javascript
(async () => {
  console.log('=== StableGuard 完整测试 ===\n');
  
  try {
    // 1. 导入模块
    const { getStableGuard } = await import('./lib/stableguard/index.js');
    const stableGuard = await getStableGuard();
    
    // 2. 显示配置
    console.log('1. 当前配置:');
    console.log(stableGuard.getConfig());
    console.log('');
    
    // 3. 执行评估
    console.log('2. 开始风险评估...');
    const result = await stableGuard.performRiskAssessment();
    console.log('评估完成:', result);
    console.log('');
    
    // 4. 查看存储数据
    console.log('3. 查看存储数据...');
    chrome.storage.local.get([
      'stableguard_risk_usdt',
      'stableguard_risk_usdc',
      'stableguard_risk_dai',
      'stableguard_last_update'
    ], (data) => {
      console.log('USDT:', data.stableguard_risk_usdt?.riskLevel, '-', data.stableguard_risk_usdt?.summary);
      console.log('USDC:', data.stableguard_risk_usdc?.riskLevel, '-', data.stableguard_risk_usdc?.summary);
      console.log('DAI:', data.stableguard_risk_dai?.riskLevel, '-', data.stableguard_risk_dai?.summary);
      console.log('更新时间:', new Date(data.stableguard_last_update).toLocaleString());
      console.log('\n=== 测试完成 ===');
    });
    
  } catch (error) {
    console.error('测试失败:', error);
  }
})();
```

## 预期输出示例

```
=== StableGuard 完整测试 ===

1. 当前配置:
{
  enabled: true,
  strictMode: "warn",
  monitoredStablecoins: ["usdt", "usdc", "dai"],
  thresholds: {...},
  ...
}

2. 开始风险评估...
[StableGuard] Starting risk assessment...
[DataAgent] Starting data collection for: ["usdt", "usdc", "dai"]
[DataAgent] Fetched price for usdt: 1.0001
[DataAgent] Fetched price for usdc: 0.9999
[DataAgent] Fetched price for dai: 1.0002
[FeatureAgent] Calculating features for 3 stablecoins
[RiskAgent] Analyzing risk for 3 stablecoins
[StrategyAgent] Generating strategies for 3 risk reports
[StableGuard] Assessment completed in 1523ms
评估完成: {
  success: true,
  timestamp: 1701234567890,
  stablecoins: [
    { id: "usdt", riskLevel: "B", riskScore: 15, summary: "..." },
    { id: "usdc", riskLevel: "A", riskScore: 8, summary: "..." },
    { id: "dai", riskLevel: "B", riskScore: 12, summary: "..." }
  ]
}

3. 查看存储数据...
USDT: B - USDT 当前处于 低风险，各项指标正常。
USDC: A - USDC 当前处于 极低风险，各项指标正常。
DAI: B - DAI 当前处于 低风险，各项指标正常。
更新时间: 2023/11/29 11:22:47

=== 测试完成 ===
```

## 故障排查

### 如果看到 "Cannot find module"
```javascript
// 检查文件是否存在
console.log('检查文件...');
fetch(chrome.runtime.getURL('lib/stableguard/index.js'))
  .then(r => console.log('文件存在:', r.ok))
  .catch(e => console.error('文件不存在:', e));
```

### 如果 API 调用失败
```javascript
// 测试 CoinGecko API
fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
  .then(r => r.json())
  .then(data => console.log('API 测试成功:', data))
  .catch(e => console.error('API 失败:', e));
```

### 如果存储为空
```javascript
// 检查所有存储的键
chrome.storage.local.get(null, (items) => {
  console.log('所有存储的键:', Object.keys(items));
  console.log('StableGuard 相关键:', Object.keys(items).filter(k => k.includes('stable')));
});
```
