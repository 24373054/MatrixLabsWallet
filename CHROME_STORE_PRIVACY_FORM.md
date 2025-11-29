# Chrome Web Store 隐私权表单填写指南

## 📋 表单填写内容

---

### 1️⃣ **单一用途说明**

```
MatrixLabs Wallet is a non-custodial cryptocurrency wallet extension that enables users to securely store, manage, and interact with Ethereum and EVM-compatible blockchain assets. The extension's single purpose is to provide a secure interface for managing cryptocurrency wallets and connecting to decentralized applications (DApps) on Ethereum-compatible networks.
```

**中文翻译**：
MatrixLabs Wallet 是一个非托管加密货币钱包扩展程序，使用户能够安全地存储、管理以太坊和 EVM 兼容区块链资产，并与之交互。该扩展程序的单一目的是提供一个安全的界面，用于管理加密货币钱包并连接到以太坊兼容网络上的去中心化应用程序（DApps）。

---

### 2️⃣ **需请求 storage 的理由**

```
The storage permission is required to securely store encrypted wallet data (private keys, seed phrases, account information) locally on the user's device. All sensitive data is encrypted using AES-256 encryption and never leaves the user's device. This is essential for the wallet's core functionality of managing cryptocurrency accounts.
```

**中文翻译**：
需要 storage 权限来安全地将加密的钱包数据（私钥、助记词、账户信息）本地存储在用户设备上。所有敏感数据都使用 AES-256 加密，且永远不会离开用户设备。这对于钱包管理加密货币账户的核心功能至关重要。

---

### 3️⃣ **需请求 unlimitedStorage 的理由**

```
The unlimitedStorage permission is required to store transaction history and multiple wallet accounts without storage limitations. As users interact with blockchain networks over time, transaction records accumulate. This permission ensures users can maintain a complete history of their transactions and manage multiple accounts without data loss.
```

**中文翻译**：
需要 unlimitedStorage 权限来存储交易历史和多个钱包账户，而不受存储限制。随着用户与区块链网络交互，交易记录会累积。此权限确保用户可以保留完整的交易历史并管理多个账户而不会丢失数据。

---

### 4️⃣ **需请求 activeTab 的理由**

```
The activeTab permission is required to inject the Web3 provider into web pages when users visit decentralized applications (DApps). This allows the wallet to communicate with DApps and enable users to approve transactions and sign messages. The permission is only used when users actively interact with DApps.
```

**中文翻译**：
需要 activeTab 权限来在用户访问去中心化应用程序（DApps）时将 Web3 提供程序注入网页。这允许钱包与 DApps 通信，使用户能够批准交易和签署消息。该权限仅在用户主动与 DApps 交互时使用。

---

### 5️⃣ **需请求 notifications 的理由**

```
The notifications permission is required to alert users about important wallet events such as successful transactions, connection requests from DApps, and security warnings. This enhances user experience by providing timely feedback without requiring users to keep the extension popup open.
```

**中文翻译**：
需要 notifications 权限来提醒用户重要的钱包事件，例如成功的交易、来自 DApps 的连接请求和安全警告。这通过提供及时反馈来增强用户体验，而无需用户保持扩展弹出窗口打开。

---

### 6️⃣ **需请求 alarms 的理由**

```
The alarms permission is required to periodically refresh wallet balances and check for pending transactions. This ensures users always see up-to-date account information without manually refreshing. The alarm runs at reasonable intervals to minimize resource usage.
```

**中文翻译**：
需要 alarms 权限来定期刷新钱包余额并检查待处理的交易。这确保用户始终看到最新的账户信息，而无需手动刷新。警报以合理的间隔运行，以最大限度地减少资源使用。

---

### 7️⃣ **需请求主机权限的理由**

```
Host permissions (<all_urls>) are required to inject the Web3 provider into all websites that users may visit. This is essential for wallet functionality as decentralized applications (DApps) can exist on any domain - users need to interact with DApps on Uniswap, Curve, Aave, OpenSea, and thousands of other platforms across the internet.

The extension only activates when users explicitly connect their wallet to a website through a user-initiated action (clicking "Connect Wallet"). We do not collect, monitor, or transmit any browsing data. This permission model is the industry standard for cryptocurrency wallets and is used by established wallet extensions such as MetaMask and Trust Wallet.

Without this permission, the wallet would be unable to fulfill its core purpose of enabling users to interact with decentralized applications. The broad permission is necessary because:
1. DApps exist on countless domains that cannot be predicted in advance
2. New DApps are created daily on new domains
3. Users must have the freedom to connect to any legitimate DApp they choose

We are committed to user privacy and security - the extension does not access or monitor browsing activity on websites where users have not explicitly connected their wallet.
```

**中文翻译**：
需要主机权限（<all_urls>）来将 Web3 提供程序注入用户可能访问的所有网站。这对于钱包功能至关重要，因为去中心化应用程序（DApps）可以存在于任何域上 - 用户需要与 Uniswap、Curve、Aave、OpenSea 以及互联网上成千上万个其他平台上的 DApps 进行交互。

扩展程序仅在用户通过用户发起的操作（点击"连接钱包"）明确将其钱包连接到网站时才激活。我们不收集、监控或传输任何浏览数据。此权限模型是加密货币钱包的行业标准，并被 MetaMask 和 Trust Wallet 等成熟的钱包扩展程序使用。

如果没有此权限，钱包将无法实现其核心目的，即使用户能够与去中心化应用程序交互。广泛的权限是必要的，因为：
1. DApps 存在于无数无法预先预测的域上
2. 每天都有新的 DApps 在新域上创建
3. 用户必须有自由连接到他们选择的任何合法 DApp

我们致力于用户隐私和安全 - 扩展程序不会访问或监控用户未明确连接其钱包的网站上的浏览活动。

---

### 8️⃣ **您正在使用远程代码吗？**

**选择**: ❌ **不，我并未使用远程代码**

**理由**（留空即可，因为选择了"否"）

---

### 9️⃣ **数据使用 - 您打算收集哪些用户数据？**

**选择**: ❌ **不选择任何选项**

**重要**: 不要勾选任何数据类型，因为：
- 我们不收集个人身份信息
- 我们不收集健康信息
- 我们不收集财务和付款信息（虽然是钱包，但我们不收集用户的交易数据）
- 我们不收集身份验证信息（密码仅存储在本地）
- 我们不收集个人通讯
- 我们不收集位置
- 我们不收集网络记录
- 我们不收集用户活动
- 我们不收集网站内容

**说明**: 所有数据都存储在用户本地设备上，我们不收集或传输任何数据到服务器。

---

### 🔟 **数据披露确认**

**勾选所有 3 个复选框**：

✅ 我不会出于已获批准的用途之外的用途向第三方出售或传输用户数据

✅ 我不会为实现与我的产品的单一用途无关的目的而使用或转移用户数据

✅ 我不会为确定信用度或实现贷款而使用或转移用户数据

---

### 1️⃣1️⃣ **隐私权政策网址**

**选项 1**: 使用 GitHub（推荐）
```
https://github.com/24373054/MatrixLabsWallet/blob/main/PRIVACY_POLICY.md
```

**选项 2**: 如果你有自己的网站
```
https://your-website.com/privacy-policy
```

**选项 3**: 使用 GitHub Pages（需要先设置）
```
https://24373054.github.io/MatrixLabsWallet/privacy-policy
```

---

## 📤 发布隐私政策

### 方法 1: 提交到 GitHub（最简单）

我已经创建了 `PRIVACY_POLICY.md` 文件，现在提交到 GitHub：

```bash
cd matrixlabs-wallet
git add PRIVACY_POLICY.md
git commit -m "📄 docs: Add privacy policy for Chrome Web Store"
git push
```

然后使用这个 URL：
```
https://github.com/24373054/MatrixLabsWallet/blob/main/PRIVACY_POLICY.md
```

---

## ⚠️ 重要提示

1. **不要勾选任何数据收集选项** - 我们是非托管钱包，所有数据都在本地
2. **确保隐私政策 URL 可访问** - Chrome 会验证这个链接
3. **保持一致性** - 表单内容要与隐私政策一致
4. **诚实填写** - 不要夸大或隐瞒权限用途

---

## 🎯 快速检查清单

- ✅ 单一用途说明清晰具体
- ✅ 每个权限都有合理解释
- ✅ 不使用远程代码
- ✅ 不收集任何用户数据
- ✅ 勾选所有 3 个数据披露确认
- ✅ 提供有效的隐私政策 URL
- ✅ 隐私政策已发布到 GitHub

---

## 📝 下一步

1. 将 `PRIVACY_POLICY.md` 提交到 GitHub
2. 复制上面的内容填写表单
3. 使用 GitHub URL 作为隐私政策链接
4. 提交审核

需要我帮你提交隐私政策到 GitHub 吗？
