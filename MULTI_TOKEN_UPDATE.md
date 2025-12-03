# 多代币支持更新说明

## 已完成

### 1. 代币配置 (tokens.ts)
- ✅ 定义了 6 个主流网络的代币列表
- ✅ 每个网络包含原生代币 + 主流 ERC-20 代币
- ✅ 支持 USDT, USDC, DAI, WBTC, BUSD 等

### 2. 代币服务 (tokenService.ts)
- ✅ 查询代币余额（原生 + ERC-20）
- ✅ 发送代币转账
- ✅ Gas 估算
- ✅ 代币授权管理

## 待完成

### 3. 更新 Home 页面
需要修改 `src/popup/pages/Home.tsx`:

```typescript
// 1. 导入代币服务
import { TokenService, TokenBalance } from '../../lib/tokenService';

// 2. 添加状态
const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

// 3. 加载代币余额
const loadTokenBalances = useCallback(async () => {
  if (!currentAccount || !currentNetwork) return;
  
  try {
    const balances = await TokenService.getTokenBalances(
      currentAccount.address,
      currentNetwork
    );
    setTokenBalances(balances);
  } catch (error) {
    console.error('Failed to load token balances:', error);
  }
}, [currentAccount, currentNetwork]);

// 4. 在 useEffect 中调用
useEffect(() => {
  loadTokenBalances();
}, [currentAccount?.address, currentNetwork?.id, loadTokenBalances]);

// 5. 显示代币列表（替换现有的单个 ETH 卡片）
{tokenBalances.map((tokenBalance) => (
  <Card key={tokenBalance.token.address} hover className="mb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-matrix-accent-primary/20 to-matrix-accent-secondary/20 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-matrix-text-primary">
            {tokenBalance.token.symbol.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-matrix-text-primary">
            {tokenBalance.token.symbol}
          </p>
          <p className="text-xs text-matrix-text-muted">
            {tokenBalance.token.name}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-matrix-text-primary">
          {parseFloat(tokenBalance.balance).toFixed(4)}
        </p>
        <p className="text-xs text-matrix-text-muted">
          {tokenBalance.token.symbol}
        </p>
      </div>
    </div>
  </Card>
))}
```

### 4. 更新 Send 页面
需要修改 `src/popup/pages/Send.tsx`:

1. 添加代币选择器
2. 根据选择的代币构建交易
3. 显示代币余额

### 5. 构建和测试
```bash
npm run build
```

然后重新加载扩展测试。

## 快速实现方案

如果时间紧迫，可以先实现最基本的功能：

1. **仅显示余额** - 在 Home 页面显示所有代币余额
2. **保持现有转账** - Send 页面暂时只支持原生代币
3. **后续扩展** - 有时间再添加代币转账功能

这样可以快速看到效果，满足"能看到各种主流币"的需求。
