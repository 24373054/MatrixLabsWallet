# MatrixLabs Wallet - 调试指南

## 🔍 开发模式已启动

开发服务器运行在：http://localhost:5173/

## 📊 控制台日志说明

### **日志前缀含义：**

- `[App]` - popup/App.tsx 的日志
- `[Unlock]` - popup/pages/Unlock.tsx 的日志  
- `[Background]` - background/index.ts 的日志
- `[Content]` - content/index.ts 的日志
- `[Inpage]` - inpage/index.ts 的日志

### **关键日志点：**

#### **1. dApp 请求连接**
```
[Inpage] Request: eth_requestAccounts
[Content] Forwarding message to background
[Background] handleGetAccounts called
[Background] Vault exists: true
[Background] Session unlocked: false
[Background] Wallet locked, requesting unlock
[Background] Waiting for user approval...
```

#### **2. 用户解锁钱包**
```
[Unlock] Attempting to unlock wallet...
[Unlock] Wallet unlocked successfully
[Unlock] Current account: 0x...
[Unlock] Session state saved
[Unlock] Calling onUnlock callback
```

#### **3. App 处理解锁**
```
[App] handleUnlocked called
[App] Account: 0x...
[App] Accounts count: 1
[App] State updated, checking for pending connection...
[App] Pending connection: { origin: 'dApp', timestamp: ... }
[App] Navigating to connect-request page
```

#### **4. 用户批准连接**
```
[App] Connection approved by user
[App] Background response: { success: true }
[Background] Connection approved
[Background] User decision: approved
[Background] Sending account after approval: 0x...
```

#### **5. dApp 收到响应**
```
[Inpage] Response: { success: true, accounts: [...], currentAccount: {...} }
```

## 🐛 调试步骤

### **步骤 1：打开浏览器控制台**

1. 访问测试网站（如 https://app.uniswap.org）
2. 按 F12 打开开发者工具
3. 切换到 Console 标签

### **步骤 2：打开扩展控制台**

1. 访问 `chrome://extensions/`
2. 找到 MatrixLabs Wallet
3. 点击"Service Worker"旁边的"inspect"链接
4. 这会打开 background.js 的控制台

### **步骤 3：打开 Popup 控制台**

1. 点击浏览器工具栏的钱包图标
2. 在弹出的钱包窗口上右键
3. 选择"检查"
4. 这会打开 popup 的控制台

### **步骤 4：测试连接流程**

1. 在测试网站点击"连接钱包"
2. 观察各个控制台的日志输出
3. 记录问题发生的位置

## 🔧 常见问题排查

### **问题 1：点击连接后没有反应**

**检查点：**
- [ ] 网页控制台是否有 `[Inpage]` 日志？
- [ ] Background 控制台是否有 `[Background] handleGetAccounts called`？
- [ ] 是否弹出钱包窗口？

**可能原因：**
- inpage.js 未正确注入
- content.js 未正确转发消息
- background.js 未正确处理消息

### **问题 2：解锁后又弹出解锁窗口**

**检查点：**
- [ ] `[Unlock] Session state saved` 是否出现？
- [ ] `[App] Pending connection` 的值是什么？
- [ ] `[App] Navigating to connect-request page` 是否出现？

**可能原因：**
- Session storage 未正确保存
- pendingConnection 未正确设置
- 状态导航逻辑错误

### **问题 3：批准连接后网站仍未登录**

**检查点：**
- [ ] `[App] Connection approved by user` 是否出现？
- [ ] `[Background] User decision: approved` 是否出现？
- [ ] `[Background] Sending account after approval` 的地址是否正确？
- [ ] 网页控制台是否收到响应？

**可能原因：**
- Promise resolve 未正确调用
- 响应未正确发送回 dApp
- dApp 未正确处理响应

## 📝 日志示例

### **正常流程的完整日志：**

```
# 网页控制台
[Inpage] window.ethereum initialized
[Inpage] Request: eth_requestAccounts

# Background 控制台
[Background] handleGetAccounts called
[Background] Vault exists: true
[Background] Session unlocked: false
[Background] Wallet locked, requesting unlock
[Background] Waiting for user approval...

# Popup 控制台
[Unlock] Attempting to unlock wallet...
[Unlock] Wallet unlocked successfully
[Unlock] Current account: 0xB14FCc3e51815f2c86a8B60ef0987ff810eaA66A
[Unlock] Session state saved
[Unlock] Calling onUnlock callback
[App] handleUnlocked called
[App] Account: 0xB14FCc3e51815f2c86a8B60ef0987ff810eaA66A
[App] Accounts count: 1
[App] State updated, checking for pending connection...
[App] Pending connection: { origin: 'dApp', timestamp: 1732501234567 }
[App] Navigating to connect-request page
[App] Connection approved by user
[App] Background response: { success: true }

# Background 控制台
[Background] Connection approved
[Background] User decision: approved
[Background] Sending account after approval: 0xB14FCc3e51815f2c86a8B60ef0987ff810eaA66A

# 网页控制台
[Inpage] Response: { success: true, accounts: ['0xB14FCc3e51815f2c86a8B60ef0987ff810eaA66A'], ... }
```

## 🎯 下一步

1. 按照上述步骤打开所有控制台
2. 测试连接流程
3. 复制所有相关日志
4. 告诉我在哪一步出现了问题
5. 我会根据日志定位并修复问题

## 💡 提示

- 使用 Ctrl+F 在控制台搜索特定日志
- 可以右键点击日志选择"Save as..." 保存完整日志
- 时间戳可以帮助确定事件顺序
- 红色的错误日志最重要
