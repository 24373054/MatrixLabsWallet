<div align="center">

# 🌌 MatrixLabs Wallet

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/React-18.3-61dafb.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178c6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/ethers.js-6.13-2535a0.svg" alt="ethers.js">
  <img src="https://img.shields.io/badge/Vite-5.4-646cff.svg" alt="Vite">
</p>

<p align="center">
  <strong>下一代 Web3 钱包 · 安全 · 简洁 · 强大</strong>
</p>

<p align="center">
  一个功能完整的以太坊及 EVM 兼容链钱包浏览器插件<br/>
  支持多链、DeFi、交易历史、安全防护等企业级特性
</p>

<p align="center">
  <a href="#-核心特性">核心特性</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-功能展示">功能展示</a> •
  <a href="#-安全性">安全性</a> •
  <a href="#-贡献">贡献</a>
</p>

---

</div>

## 📊 项目统计

```
📁 总文件数:        50+
📝 代码行数:        8,000+
🎨 组件数量:        25+
🔧 服务模块:        12+
🌐 支持网络:        6+
🔐 安全特性:        5+
⚡ 构建时间:        ~3.5s
📦 打包大小:        ~750KB
```

## ✨ 核心特性

### 🔐 企业级安全

<table>
<tr>
<td width="50%">

**🛡️ 多层加密保护**
- AES-GCM 256位加密存储
- PBKDF2 密钥派生（100,000次迭代）
- 助记词本地加密存储
- 私钥永不离开本地环境
- 密码强度验证

</td>
<td width="50%">

**🔒 StableGuard 安全防护**
- 实时风险评估
- 恶意合约检测
- 钓鱼网站识别
- 可疑交易警告
- 安全评分系统

</td>
</tr>
</table>

### 💼 完整的钱包功能

<table>
<tr>
<td width="33%">

**👛 钱包管理**
- ✅ 创建新钱包（12词助记词）
- ✅ 导入已有钱包
- ✅ 多账户支持
- ✅ 账户快速切换
- ✅ 账户名称自定义
- ✅ 地址一键复制

</td>
<td width="33%">

**💸 交易功能**
- ✅ 发送 ETH/代币
- ✅ 接收资产
- ✅ 代币兑换（Uniswap V2）
- ✅ 跨链桥接（集成主流桥）
- ✅ Gas 费智能估算
- ✅ 交易加速/取消

</td>
<td width="33%">

**📜 交易历史**
- ✅ 完整交易记录
- ✅ 多维度筛选
- ✅ 实时状态更新
- ✅ 详细交易信息
- ✅ 区块浏览器跳转
- ✅ 一键清空历史

</td>
</tr>
</table>

### 🌐 多链支持

支持主流 EVM 兼容链，一个钱包管理所有资产：

| 网络 | ChainID | 状态 | 特性 |
|------|---------|------|------|
| 🔷 Ethereum Mainnet | 1 | ✅ | 主网、DeFi、NFT |
| 🧪 Sepolia Testnet | 11155111 | ✅ | 测试网 |
| 🟣 Polygon | 137 | ✅ | 低费用、高速 |
| 🟡 BSC | 56 | ✅ | DeFi 生态 |
| 🔵 Arbitrum | 42161 | ✅ | L2 扩容 |
| 🔴 Optimism | 10 | ✅ | L2 扩容 |
| 🟢 Base | 8453 | ✅ | Coinbase L2 |
| ⚙️ Custom RPC | - | ✅ | 自定义网络 |

### 🚀 DeFi 集成

<table>
<tr>
<td width="50%">

**💱 代币兑换（Swap）**
- Uniswap V2 协议集成
- 多链 DEX 支持
- 实时价格查询
- 滑点保护
- 路径优化
- 交易历史记录

</td>
<td width="50%">

**🌉 跨链桥接（Bridge）**
- Stargate Finance
- Across Protocol
- Hop Protocol
- cBridge
- Synapse Protocol
- 一键跳转到桥接页面

</td>
</tr>
<tr>
<td width="50%">

**💎 质押（Staking）**
- Lido（ETH 质押）
- Rocket Pool
- Frax Finance
- Aave（借贷）
- Compound
- Curve Finance
- Convex Finance
- Yearn Finance

</td>
<td width="50%">

**🪙 代币管理**
- ERC-20 代币支持
- 自动代币发现
- 代币余额查询
- 代币价格显示
- 代币授权管理
- 自定义代币添加

</td>
</tr>
</table>

### 🎨 现代化 UI/UX

**设计理念：清冷、简洁、专业**

- 🌌 **Matrix 主题**：深色背景 + 低饱和度蓝绿色调
- 🌫️ **玻璃态效果**：透明度和背景模糊营造层次感
- ✨ **流畅动画**：平滑的过渡和悬停效果（transition-smooth）
- 🎯 **无边界融合**：组件自然融合，避免生硬边框
- 📱 **响应式设计**：适配不同屏幕尺寸
- ♿ **无障碍支持**：键盘导航、屏幕阅读器友好

### 🔌 dApp 集成

**完整的 Web3 Provider 实现**

- ✅ MetaMask 兼容 API
- ✅ EIP-1193 标准支持
- ✅ 自动网络切换
- ✅ 账户切换事件
- ✅ 交易确认弹窗
- ✅ 消息签名（personal_sign）
- ✅ 类型化签名（signTypedData_v4）
- ✅ 连接请求管理

## 🛠️ 技术栈

<div align="center">

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 🎨 **前端框架** | React | 18.3.1 | UI 组件库 |
| 📘 **类型系统** | TypeScript | 5.5.3 | 类型安全 |
| ⚡ **构建工具** | Vite | 5.4.21 | 快速构建 |
| 🎨 **样式方案** | TailwindCSS | 3.4.1 | 原子化 CSS |
| 🗄️ **状态管理** | Zustand | 4.5.0 | 轻量状态库 |
| ⛓️ **区块链库** | ethers.js | 6.13.0 | Web3 交互 |
| 🔐 **加密库** | Web Crypto API | - | 原生加密 |
| 🔑 **助记词** | bip39 | 3.1.0 | HD 钱包 |
| 🎭 **图标库** | lucide-react | 0.344.0 | 现代图标 |
| 📊 **图表库** | recharts | 2.12.0 | 数据可视化 |

</div>

## 📁 项目结构

```
matrixlabs-wallet/
├── 📂 src/
│   ├── 📂 popup/                    # 🎨 弹窗 UI
│   │   ├── 📂 pages/                # 页面组件
│   │   │   ├── Welcome.tsx          # 欢迎页
│   │   │   ├── CreateWallet.tsx     # 创建钱包
│   │   │   ├── ImportWallet.tsx     # 导入钱包
│   │   │   ├── Unlock.tsx           # 解锁页面
│   │   │   ├── Home.tsx             # 主页
│   │   │   ├── Send.tsx             # 发送交易
│   │   │   ├── Receive.tsx          # 接收资产
│   │   │   ├── Swap.tsx             # 代币兑换
│   │   │   ├── Bridge.tsx           # 跨链桥接
│   │   │   ├── Staking.tsx          # DeFi 质押
│   │   │   ├── History.tsx          # 交易历史
│   │   │   ├── Settings.tsx         # 设置页面
│   │   │   ├── NetworkSettings.tsx  # 网络设置
│   │   │   ├── ConnectRequest.tsx   # 连接请求
│   │   │   ├── SignMessage.tsx      # 签名请求
│   │   │   ├── SendTransaction.tsx  # 交易确认
│   │   │   ├── StableGuardDashboard.tsx  # 安全仪表板
│   │   │   └── StableGuardSettings.tsx   # 安全设置
│   │   ├── 📂 components/           # 可复用组件
│   │   │   └── PriceChart.tsx       # 价格图表
│   │   ├── App.tsx                  # 主应用
│   │   └── main.tsx                 # 入口文件
│   ├── 📂 components/               # 🧩 通用组件
│   │   ├── Button.tsx               # 按钮组件
│   │   ├── Input.tsx                # 输入框组件
│   │   ├── Card.tsx                 # 卡片组件
│   │   └── Modal.tsx                # 模态框组件
│   ├── 📂 lib/                      # 🔧 核心库
│   │   ├── crypto.ts                # 加密服务
│   │   ├── wallet.ts                # 钱包服务
│   │   ├── storage.ts               # 存储服务
│   │   ├── provider.ts              # RPC 提供者
│   │   ├── rpc.ts                   # RPC 管理
│   │   ├── tokens.ts                # 代币配置
│   │   ├── tokenService.ts          # 代币服务
│   │   ├── swapService.ts           # 兑换服务
│   │   ├── bridgeConfig.ts          # 桥接配置
│   │   ├── stakingConfig.ts         # 质押配置
│   │   ├── historyService.ts        # 历史服务
│   │   └── stableguard.ts           # 安全防护
│   ├── 📂 store/                    # 🗄️ 状态管理
│   │   └── wallet.ts                # 钱包状态
│   ├── 📂 background/               # 🔌 后台脚本
│   │   └── index.ts                 # 后台服务
│   ├── 📂 content/                  # 📄 内容脚本
│   │   └── index.ts                 # 内容注入
│   └── 📂 inpage/                   # 🌐 页面注入
│       └── index.ts                 # Provider 注入
├── 📂 public/
│   └── 📂 icons/                    # 图标资源
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── 📄 manifest.json                 # 插件配置
├── 📄 package.json                  # 依赖配置
├── 📄 vite.config.ts                # Vite 配置
├── 📄 tailwind.config.js            # Tailwind 配置
├── 📄 tsconfig.json                 # TypeScript 配置
└── 📄 README.md                     # 项目文档
```

## 🚀 快速开始

### 📋 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Chrome/Edge 浏览器

### 📦 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/matrixlabs-wallet.git
cd matrixlabs-wallet

# 安装依赖
npm install
```

### 🔨 开发模式

```bash
# 启动开发服务器
npm run dev

# 监听文件变化并自动重新构建
npm run watch
```

### 🏗️ 构建生产版本

```bash
# 构建生产版本
npm run build

# 构建产物输出到 dist/ 目录
# ✓ dist/index.html
# ✓ dist/background.js
# ✓ dist/content.js
# ✓ dist/inpage.js
# ✓ dist/assets/
# ✓ dist/manifest.json
```

### 🌐 加载到浏览器

#### Chrome / Edge

1. 打开浏览器
2. 访问 `chrome://extensions/` 或 `edge://extensions/`
3. 开启右上角的 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择项目的 `dist/` 目录
6. 🎉 完成！钱包图标将出现在浏览器工具栏

#### 首次使用

1. 点击钱包图标打开弹窗
2. 选择 **"创建新钱包"** 或 **"导入钱包"**
3. 设置安全密码（至少 8 位）
4. 备份助记词（**务必安全保存**）
5. 开始使用！

## 🎯 功能展示

### 📱 核心页面

<table>
<tr>
<td width="33%" align="center">
<strong>🏠 主页</strong><br/>
资产总览 · 快速操作<br/>
多链切换 · 代币列表
</td>
<td width="33%" align="center">
<strong>💸 发送</strong><br/>
ETH/代币发送<br/>
Gas 费估算 · 地址验证
</td>
<td width="33%" align="center">
<strong>📥 接收</strong><br/>
地址展示 · 二维码<br/>
一键复制 · 多账户
</td>
</tr>
<tr>
<td width="33%" align="center">
<strong>🔄 兑换</strong><br/>
Uniswap V2 集成<br/>
实时报价 · 滑点保护
</td>
<td width="33%" align="center">
<strong>🌉 跨链桥</strong><br/>
主流桥接协议<br/>
一键跳转 · 快速桥接
</td>
<td width="33%" align="center">
<strong>💎 质押</strong><br/>
DeFi 协议集成<br/>
Lido · Aave · Curve
</td>
</tr>
<tr>
<td width="33%" align="center">
<strong>📜 历史</strong><br/>
交易记录 · 状态追踪<br/>
筛选 · 详情查看
</td>
<td width="33%" align="center">
<strong>🛡️ 安全</strong><br/>
StableGuard 防护<br/>
风险评估 · 威胁检测
</td>
<td width="33%" align="center">
<strong>⚙️ 设置</strong><br/>
网络管理 · 账户管理<br/>
安全设置 · 清除数据
</td>
</tr>
</table>

### 🔐 StableGuard 安全防护

**实时保护您的资产安全**

```
🛡️ 安全评分系统
├─ 🟢 安全 (90-100分)   - 可信任的交易
├─ 🟡 警告 (70-89分)    - 需要谨慎
├─ 🟠 危险 (50-69分)    - 高风险操作
└─ 🔴 禁止 (0-49分)     - 已知恶意行为

🔍 检测能力
├─ ✅ 恶意合约识别
├─ ✅ 钓鱼网站检测
├─ ✅ 可疑交易分析
├─ ✅ 授权风险评估
└─ ✅ 价格操纵预警
```

### 📊 交易历史系统

**完整的交易记录管理**

- **自动记录**：所有交易自动保存
- **实时更新**：状态自动同步（Pending → Confirmed）
- **多维筛选**：按类型、状态、链筛选
- **详细信息**：Gas费、区块号、时间戳
- **一键复制**：地址、哈希快速复制
- **区块浏览器**：直接跳转查看详情

## 🔒 安全性

### 🛡️ 多层安全防护

<table>
<tr>
<td width="50%">

**🔐 加密存储**
```typescript
// AES-GCM 256位加密
const encrypted = await crypto.subtle.encrypt(
  {
    name: 'AES-GCM',
    iv: iv,
    tagLength: 128
  },
  key,
  data
);

// PBKDF2 密钥派生
const key = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: salt,
    iterations: 100000,
    hash: 'SHA-256'
  },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

</td>
<td width="50%">

**🔒 安全实践**

✅ **助记词保护**
- 本地加密存储
- 永不上传到服务器
- 导出时二次确认

✅ **私钥管理**
- 内存中临时使用
- 使用后立即清除
- 永不明文存储

✅ **交易签名**
- 本地签名
- 用户确认
- 详细信息展示

</td>
</tr>
</table>

### ⚠️ 安全建议

| 级别 | 建议 | 说明 |
|------|------|------|
| 🔴 **必须** | 备份助记词 | 写在纸上，存放在安全的地方 |
| 🔴 **必须** | 使用强密码 | 至少 12 位，包含大小写字母、数字、符号 |
| 🟠 **重要** | 验证网站 | 确认 URL 正确，避免钓鱼网站 |
| 🟠 **重要** | 小额测试 | 首次使用先发送小额测试 |
| 🟡 **建议** | 定期检查 | 检查授权和交易记录 |
| 🟡 **建议** | 分散存储 | 不要把所有资产放在一个钱包 |

### 🚨 永远不要

- ❌ 分享助记词或私钥给任何人
- ❌ 在不安全的网络输入助记词
- ❌ 截图或拍照助记词
- ❌ 将助记词存储在云端
- ❌ 在未验证的网站连接钱包
- ❌ 授权不明来源的合约

## 📚 API 文档

### WalletService

**钱包核心服务**

```typescript
class WalletService {
  // 创建新钱包
  static async createWallet(password: string): Promise<string>
  
  // 导入钱包
  static async importWallet(mnemonic: string, password: string): Promise<void>
  
  // 解锁钱包
  static async unlockWallet(password: string): Promise<boolean>
  
  // 签名交易
  static async signTransaction(tx: TransactionRequest): Promise<string>
  
  // 签名消息
  static async signMessage(message: string): Promise<string>
  
  // 添加账户
  static async addAccount(name?: string): Promise<Account>
  
  // 切换账户
  static async switchAccount(index: number): Promise<void>
}
```

### ProviderService

**RPC 提供者服务**

```typescript
class ProviderService {
  // 获取 Provider
  static getProvider(network: Network): JsonRpcProvider
  
  // 获取余额
  static async getBalance(address: string, network: Network): Promise<string>
  
  // 发送交易
  static async sendTransaction(
    signedTx: string, 
    network: Network
  ): Promise<TransactionResponse>
  
  // 获取 Gas 价格
  static async getGasPrice(network: Network): Promise<bigint>
  
  // 估算 Gas
  static async estimateGas(
    tx: TransactionRequest, 
    network: Network
  ): Promise<bigint>
}
```

### HistoryService

**交易历史服务**

```typescript
class HistoryService {
  // 保存交易
  static async saveTransaction(record: TransactionRecord): Promise<void>
  
  // 获取历史
  static async getHistory(): Promise<TransactionRecord[]>
  
  // 按地址筛选
  static async getHistoryByAddress(address: string): Promise<TransactionRecord[]>
  
  // 按链筛选
  static async getHistoryByChain(chainId: number): Promise<TransactionRecord[]>
  
  // 更新状态
  static async updateTransactionStatus(
    hash: string,
    status: TransactionStatus,
    updates?: Partial<TransactionRecord>
  ): Promise<void>
  
  // 从区块链更新
  static async fetchAndUpdateTransaction(
    hash: string,
    provider: any
  ): Promise<void>
}
```

### SwapService

**代币兑换服务**

```typescript
class SwapService {
  // 获取报价
  static async getQuote(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    network: Network,
    slippageTolerance?: number
  ): Promise<SwapQuote>
  
  // 执行兑换
  static async executeSwap(
    params: SwapParams,
    network: Network,
    privateKey: string
  ): Promise<string>
  
  // 检查并授权
  static async checkAndApprove(
    token: Token,
    amount: string,
    network: Network,
    privateKey: string
  ): Promise<string | null>
}
```

## 🗺️ 开发路线图

### ✅ 已完成（v1.0.0）

- [x] 钱包创建和导入
- [x] 多账户管理
- [x] 多链支持（8+ 网络）
- [x] 发送/接收功能
- [x] 代币兑换（Uniswap V2）
- [x] 跨链桥接集成
- [x] DeFi 质押集成
- [x] 交易历史记录
- [x] StableGuard 安全防护
- [x] dApp 连接支持
- [x] 现代化 UI/UX

### 🚧 进行中（v1.1.0）

- [ ] NFT 展示和管理
- [ ] 地址簿功能
- [ ] 交易加速/取消
- [ ] 硬件钱包支持（Ledger/Trezor）
- [ ] 多语言支持（英文、中文）
- [ ] 移动端适配

### 🔮 计划中（v2.0.0）

- [ ] Layer 2 原生支持
- [ ] zkSync、StarkNet 集成
- [ ] DEX 聚合器
- [ ] 批量交易
- [ ] 社交恢复
- [ ] 账户抽象（ERC-4337）
- [ ] Gas 费优化建议
- [ ] 投资组合分析

## 🤝 贡献

欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启 Pull Request**

### 贡献指南

- 📝 遵循现有代码风格
- ✅ 添加必要的测试
- 📚 更新相关文档
- 💬 清晰的提交信息
- 🔍 确保代码通过 TypeScript 检查

### 报告问题

发现 Bug？有新想法？

- 🐛 [报告 Bug](https://github.com/your-username/matrixlabs-wallet/issues/new?labels=bug)
- 💡 [功能建议](https://github.com/your-username/matrixlabs-wallet/issues/new?labels=enhancement)
- 💬 [讨论](https://github.com/your-username/matrixlabs-wallet/discussions)

## 📄 许可证

本项目采用 **MIT License** 开源协议。

详见 [LICENSE](LICENSE) 文件。

## 👥 团队

**MatrixLabs Team**

- 核心开发者
- 安全审计
- UI/UX 设计
- 社区支持

## 🙏 致谢

感谢以下开源项目：

- [ethers.js](https://github.com/ethers-io/ethers.js) - 以太坊库
- [React](https://github.com/facebook/react) - UI 框架
- [Vite](https://github.com/vitejs/vite) - 构建工具
- [TailwindCSS](https://github.com/tailwindlabs/tailwindcss) - CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Lucide](https://github.com/lucide-icons/lucide) - 图标库

## 📞 联系方式

- 📧 Email: contact@matrixlabs.io
- 🐦 Twitter: [@MatrixLabsWallet](https://twitter.com/MatrixLabsWallet)
- 💬 Discord: [加入社区](https://discord.gg/matrixlabs)
- 🌐 Website: [matrixlabs.io](https://matrixlabs.io)

## ⭐ Star History

如果这个项目对你有帮助，请给我们一个 ⭐ Star！

---

<div align="center">

**⚠️ 免责声明**

本钱包是一个开源项目，仅供学习和研究使用。

使用前请确保理解区块链和加密货币的风险。

开发者不对任何资产损失承担责任。

请务必备份助记词并妥善保管！

---

Made with ❤️ by MatrixLabs Team

Copyright © 2024 MatrixLabs. All rights reserved.

</div>
