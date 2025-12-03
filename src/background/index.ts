// Background service worker for MatrixLabs Wallet
import { ethers } from 'ethers';
import { CryptoService } from '../lib/crypto';
import { RPCService } from '../lib/rpc';
import { getStableGuard } from '../lib/stableguard';

// Ensure chrome API is available
if (typeof chrome === 'undefined') {
  console.error('Chrome API not available');
} else {
  console.log('MatrixLabs Wallet background service worker loaded');
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('MatrixLabs Wallet installed');
    // Initialize default storage
    chrome.storage.local.set({
      accounts: [],
      networks: [],
      settings: {}
    });
  } else if (details.reason === 'update') {
    console.log('MatrixLabs Wallet updated');
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message received:', request);

  switch (request.type) {
    case 'GET_ACCOUNTS':
      handleGetAccounts(sendResponse);
      return true;

    case 'SIGN_TRANSACTION':
    case 'SEND_TRANSACTION':
      handleSendTransaction(request.data, sendResponse);
      return true;
    
    case 'TRANSACTION_APPROVED':
      handleTransactionApproved(sendResponse);
      return true;
    
    case 'TRANSACTION_REJECTED':
      handleTransactionRejected(sendResponse);
      return true;

    case 'SIGN_MESSAGE':
      handleSignMessage(request.data, sendResponse);
      return true;

    case 'CONNECTION_APPROVED':
      handleConnectionApproved(sendResponse);
      return true;

    case 'CONNECTION_REJECTED':
      handleConnectionRejected(sendResponse);
      return true;

    case 'SIGNATURE_APPROVED':
      handleSignatureApproved(sendResponse);
      return true;

    case 'SIGNATURE_REJECTED':
      handleSignatureRejected(sendResponse);
      return true;

    case 'RPC_CALL':
      handleRPCCall(request.data, sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown request type' });
  }

  return true;
});

// Store pending connection requests
let pendingConnectionResolve: ((value: any) => void) | null = null;

// Store pending signature requests
let pendingSignatureResolve: ((value: any) => void) | null = null;

// Store pending transaction requests
let pendingTransactionResolve: ((value: any) => void) | null = null;

async function handleGetAccounts(sendResponse: (response: any) => void) {
  try {
    console.log('[Background] handleGetAccounts called');
    // Get encrypted vault from storage
    const result = await chrome.storage.local.get(['encryptedVault', 'passwordHash']);
    console.log('[Background] Vault exists:', !!result.encryptedVault);
    
    // Check if wallet is initialized and unlocked
    if (!result.encryptedVault || !result.passwordHash) {
      console.log('[Background] Wallet not initialized');
      sendResponse({
        success: false,
        error: 'Wallet not initialized',
        accounts: [],
        currentAccount: null,
      });
      return;
    }
    
    // Check session state
    const sessionResult = await chrome.storage.session?.get(['unlocked', 'currentAccount']) || {};
    console.log('[Background] Session unlocked:', sessionResult.unlocked);
    console.log('[Background] Session account:', sessionResult.currentAccount?.address);
    
    if (!sessionResult.unlocked) {
      console.log('[Background] Wallet locked, requesting unlock');
      // Save pending connection request
      await chrome.storage.local.set({
        pendingConnection: {
          origin: 'dApp',
          timestamp: Date.now()
        }
      });
      
      // Open popup window to unlock
      try {
        await chrome.windows.create({
          url: chrome.runtime.getURL('index.html'),
          type: 'popup',
          width: 360,
          height: 600,
        });
        console.log('[Background] Popup window opened');
      } catch (error) {
        console.error('[Background] Failed to open popup:', error);
        sendResponse({
          success: false,
          error: 'Failed to open wallet',
          accounts: [],
          currentAccount: null,
        });
        return;
      }
      
      console.log('[Background] Waiting for user approval...');
      // Wait for user approval/rejection
      const approved = await new Promise((resolve) => {
        pendingConnectionResolve = resolve;
        // Timeout after 2 minutes
        setTimeout(() => {
          console.log('[Background] Connection request timed out');
          resolve(false);
        }, 120000);
      });
      
      console.log('[Background] User decision:', approved ? 'approved' : 'rejected');
      
      if (!approved) {
        sendResponse({
          success: false,
          error: 'User rejected the request',
          accounts: [],
          currentAccount: null,
        });
        return;
      }
      
      // Get account after approval
      const newSessionResult = await chrome.storage.session?.get(['currentAccount']) || {};
      console.log('[Background] Sending account after approval:', newSessionResult.currentAccount?.address);
      sendResponse({
        success: true,
        accounts: newSessionResult.currentAccount ? [newSessionResult.currentAccount] : [],
        currentAccount: newSessionResult.currentAccount || null,
      });
      return;
    }
    
    // Wallet is already unlocked, return account directly
    console.log('[Background] Wallet already unlocked, returning account directly');
    console.log('[Background] Sending account:', sessionResult.currentAccount?.address);
    sendResponse({
      success: true,
      accounts: sessionResult.currentAccount ? [sessionResult.currentAccount] : [],
      currentAccount: sessionResult.currentAccount || null,
    });
  } catch (error) {
    console.error('[Background] Failed to get accounts:', error);
    sendResponse({ 
      success: false, 
      error: 'Failed to get accounts',
      accounts: [],
      currentAccount: null,
    });
  }
}

async function handleConnectionApproved(sendResponse: (response: any) => void) {
  console.log('[Background] Connection approved');
  if (pendingConnectionResolve) {
    pendingConnectionResolve(true);
    pendingConnectionResolve = null;
  }
  sendResponse({ success: true });
}

async function handleConnectionRejected(sendResponse: (response: any) => void) {
  console.log('[Background] Connection rejected');
  if (pendingConnectionResolve) {
    pendingConnectionResolve(false);
    pendingConnectionResolve = null;
  }
  sendResponse({ success: true });
}

async function handleSendTransaction(data: any, sendResponse: (response: any) => void) {
  console.log('[Background] handleSendTransaction called');
  console.log('[Background] Transaction data:', data);
  
  try {
    const sessionResult = await chrome.storage.session?.get(['unlocked', 'currentAccount']) || {};
    
    if (!sessionResult.unlocked || !sessionResult.currentAccount) {
      console.log('[Background] Wallet not unlocked for transaction');
      sendResponse({ success: false, error: 'Wallet is locked. Please unlock your wallet.' });
      return;
    }

    // Extract transaction params
    const txParams = Array.isArray(data) ? data[0] : data;
    
    // StableGuard: Evaluate transaction risk
    let stableGuardEvaluation = null;
    try {
      const stableGuard = await getStableGuard();
      stableGuardEvaluation = await stableGuard.evaluateTransaction(txParams);
      
      if (stableGuardEvaluation) {
        console.log('[Background] StableGuard evaluation:', stableGuardEvaluation.decision);
        
        // If StableGuard blocks the transaction, return error immediately
        if (stableGuardEvaluation.decision === 'block') {
          console.log('[Background] Transaction blocked by StableGuard');
          sendResponse({ 
            success: false, 
            error: stableGuardEvaluation.message,
            stableGuardBlocked: true
          });
          return;
        }
      }
    } catch (error) {
      console.error('[Background] StableGuard evaluation failed:', error);
      // Continue with transaction even if StableGuard fails
    }
    
    // Save pending transaction with StableGuard evaluation
    await chrome.storage.local.set({
      pendingTransaction: {
        ...txParams,
        stableGuardEvaluation
      }
    });

    // Open popup for user confirmation
    try {
      await chrome.windows.create({
        url: chrome.runtime.getURL('index.html'),
        type: 'popup',
        width: 360,
        height: 600,
      });
      console.log('[Background] Transaction popup window opened');
    } catch (error) {
      console.error('[Background] Failed to open transaction popup:', error);
      sendResponse({ success: false, error: 'Failed to open wallet' });
      return;
    }

    console.log('[Background] Waiting for user transaction approval...');

    // Wait for user approval/rejection
    const result: any = await new Promise((resolve) => {
      pendingTransactionResolve = resolve;
      setTimeout(() => {
        console.log('[Background] Transaction request timed out');
        resolve({ approved: false });
      }, 120000); // 2 minutes timeout
    });

    console.log('[Background] Transaction decision:', result);

    if (!result.approved) {
      sendResponse({ success: false, error: 'User rejected the request' });
      return;
    }

    sendResponse({ success: true, txHash: result.txHash });
  } catch (error: any) {
    console.error('[Background] Failed to handle transaction:', error);
    sendResponse({ success: false, error: 'Failed to send transaction' });
  }
}

async function handleTransactionApproved(sendResponse: (response: any) => void) {
  console.log('[Background] Transaction approved');
  
  try {
    const result = await chrome.storage.local.get(['pendingTransaction', 'encryptedVault']);
    const transaction = result.pendingTransaction;
    const encryptedVault = result.encryptedVault;

    if (!transaction) {
      console.error('[Background] No pending transaction found');
      sendResponse({ success: false, error: 'No pending transaction' });
      return;
    }

    if (!encryptedVault) {
      console.error('[Background] No encrypted vault found');
      sendResponse({ success: false, error: 'Wallet not initialized' });
      return;
    }

    const sessionResult = await chrome.storage.session?.get(['currentAccount', 'password']) || {};
    const currentAccount = sessionResult.currentAccount;
    const password = sessionResult.password;

    if (!currentAccount) {
      console.error('[Background] No current account found in session');
      sendResponse({ success: false, error: 'Account not found' });
      return;
    }

    if (!password) {
      console.error('[Background] No password found in session');
      sendResponse({ success: false, error: 'Password not found' });
      return;
    }

    console.log('[Background] Decrypting vault to get private key...');

    // Decrypt vault to get mnemonic
    const vaultJson = await CryptoService.decrypt(encryptedVault, password);
    const vaultData = JSON.parse(vaultJson);

    console.log('[Background] Vault decrypted, deriving wallet...');

    // Derive wallet from mnemonic
    const wallet = await CryptoService.deriveWallet(vaultData.mnemonic, currentAccount.index || 0);

    console.log('[Background] Wallet derived, connecting to provider...');

    // Connect wallet to provider
    const provider = await RPCService.getProvider(transaction.chainId);
    const connectedWallet = wallet.connect(provider);

    console.log('[Background] Wallet connected, signing and sending transaction...');

    // Sign and send transaction
    const tx = await connectedWallet.sendTransaction(transaction);
    console.log('[Background] Transaction sent:', tx.hash);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('[Background] Transaction mined:', receipt);

    // Clear pending transaction
    await chrome.storage.local.remove(['pendingTransaction']);

    if (pendingTransactionResolve) {
      pendingTransactionResolve({ approved: true, txHash: tx.hash });
      pendingTransactionResolve = null;
    }

    sendResponse({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error('[Background] Failed to send transaction:', error);
    
    if (pendingTransactionResolve) {
      pendingTransactionResolve({ approved: false });
      pendingTransactionResolve = null;
    }
    
    sendResponse({ success: false, error: error.message || 'Failed to send transaction' });
  }
}

async function handleTransactionRejected(sendResponse: (response: any) => void) {
  console.log('[Background] Transaction rejected');
  
  // Clear pending transaction
  await chrome.storage.local.remove(['pendingTransaction']);
  
  if (pendingTransactionResolve) {
    pendingTransactionResolve({ approved: false });
    pendingTransactionResolve = null;
  }
  
  sendResponse({ success: true });
}

async function handleSignMessage(data: any, sendResponse: (response: any) => void) {
  console.log('[Background] handleSignMessage called');
  console.log('[Background] Sign message data:', data);
  
  try {
    // Get session to check if wallet is unlocked
    const sessionResult = await chrome.storage.session?.get(['unlocked', 'currentAccount']) || {};
    
    if (!sessionResult.unlocked || !sessionResult.currentAccount) {
      console.log('[Background] Wallet not unlocked for signing');
      sendResponse({ 
        success: false, 
        error: 'Wallet is locked. Please unlock your wallet.'
      });
      return;
    }

    // Extract message from data (format: [message, address])
    const message = Array.isArray(data) ? data[0] : data.message;
    const address = Array.isArray(data) ? data[1] : data.address;
    
    console.log('[Background] Message to sign:', message);
    console.log('[Background] Address:', address);
    
    // Save pending signature request
    await chrome.storage.local.set({
      pendingSignature: {
        message,
        address,
        origin: 'dApp',
        timestamp: Date.now()
      }
    });
    
    // Open popup window for signature confirmation
    try {
      await chrome.windows.create({
        url: chrome.runtime.getURL('index.html'),
        type: 'popup',
        width: 360,
        height: 600,
      });
      console.log('[Background] Signature popup window opened');
    } catch (error) {
      console.error('[Background] Failed to open signature popup:', error);
      sendResponse({
        success: false,
        error: 'Failed to open wallet',
      });
      return;
    }
    
    console.log('[Background] Waiting for user signature approval...');
    // Wait for user approval/rejection
    const result: any = await new Promise((resolve) => {
      pendingSignatureResolve = resolve;
      setTimeout(() => {
        console.log('[Background] Signature request timed out');
        resolve({ approved: false });
      }, 120000);
    });
    
    console.log('[Background] Signature decision:', result);
    
    if (!result.approved) {
      sendResponse({
        success: false,
        error: 'User rejected the request',
      });
      return;
    }
    
    // Return the signature
    sendResponse({
      success: true,
      signature: result.signature,
    });
  } catch (error) {
    console.error('[Background] Failed to handle sign message:', error);
    sendResponse({ 
      success: false, 
      error: 'Failed to sign message'
    });
  }
}

async function handleSignatureApproved(sendResponse: (response: any) => void) {
  console.log('[Background] Signature approved');
  
  try {
    // Get pending signature request
    const storageResult = await chrome.storage.local.get(['pendingSignature', 'encryptedVault']);
    const pendingSignature = storageResult.pendingSignature;
    const encryptedVault = storageResult.encryptedVault;
    
    if (!pendingSignature) {
      console.error('[Background] No pending signature found');
      sendResponse({ success: false, error: 'No pending signature' });
      return;
    }
    
    if (!encryptedVault) {
      console.error('[Background] No encrypted vault found');
      sendResponse({ success: false, error: 'Wallet not initialized' });
      return;
    }
    
    // Get current account from session
    const sessionResult = await chrome.storage.session?.get(['currentAccount', 'password']) || {};
    const currentAccount = sessionResult.currentAccount;
    const password = sessionResult.password;
    
    if (!currentAccount) {
      console.error('[Background] No current account found in session');
      sendResponse({ success: false, error: 'Account not found' });
      return;
    }
    
    if (!password) {
      console.error('[Background] No password found in session');
      sendResponse({ success: false, error: 'Password not found' });
      return;
    }
    
    console.log('[Background] Decrypting vault to get private key...');
    
    // Decrypt vault to get mnemonic
    const vaultJson = await CryptoService.decrypt(encryptedVault, password);
    const vaultData = JSON.parse(vaultJson);
    
    console.log('[Background] Vault decrypted, deriving wallet...');
    
    // Derive wallet from mnemonic
    const wallet = await CryptoService.deriveWallet(vaultData.mnemonic, currentAccount.index || 0);
    
    console.log('[Background] Wallet derived, signing message...');
    
    // Sign the message
    const signature = await wallet.signMessage(pendingSignature.message);
    
    console.log('[Background] Message signed:', signature);
    
    // Clear pending signature
    await chrome.storage.local.remove(['pendingSignature']);
    
    // Resolve the pending promise
    if (pendingSignatureResolve) {
      pendingSignatureResolve({ approved: true, signature });
      pendingSignatureResolve = null;
    }
    
    sendResponse({ success: true, signature });
  } catch (error) {
    console.error('[Background] Failed to sign message:', error);
    if (pendingSignatureResolve) {
      pendingSignatureResolve({ approved: false });
      pendingSignatureResolve = null;
    }
    sendResponse({ success: false, error: 'Failed to sign message' });
  }
}

async function handleSignatureRejected(sendResponse: (response: any) => void) {
  console.log('[Background] Signature rejected');
  
  // Clear pending signature
  await chrome.storage.local.remove(['pendingSignature']);
  
  if (pendingSignatureResolve) {
    pendingSignatureResolve({ approved: false });
    pendingSignatureResolve = null;
  }
  
  sendResponse({ success: true });
}

async function handleRPCCall(data: any, sendResponse: (response: any) => void) {
  const { method, params } = data;
  console.log('[Background] RPC call:', method, params);
  
  try {
    let result;
    
    switch (method) {
      case 'eth_blockNumber':
        const blockNumber = await RPCService.getBlockNumber();
        result = '0x' + blockNumber.toString(16);
        break;
      
      case 'eth_getBlockByNumber':
        const block = await RPCService.getBlock(params[0] || 'latest');
        result = block;
        break;
      
      case 'eth_gasPrice':
        const gasPrice = await RPCService.getGasPrice();
        result = '0x' + gasPrice.toString(16);
        break;
      
      case 'eth_maxPriorityFeePerGas':
        const feeData = await RPCService.getFeeData();
        result = feeData.maxPriorityFeePerGas ? '0x' + feeData.maxPriorityFeePerGas.toString(16) : '0x59682f00';
        break;
      
      case 'eth_estimateGas':
        const estimatedGas = await RPCService.estimateGas(params[0]);
        result = '0x' + estimatedGas.toString(16);
        break;
      
      case 'eth_getBalance':
        const balance = await RPCService.getBalance(params[0]);
        result = '0x' + BigInt(Math.floor(parseFloat(balance) * 1e18)).toString(16);
        break;
      
      case 'eth_getTransactionCount':
        const nonce = await RPCService.getTransactionCount(params[0]);
        result = '0x' + nonce.toString(16);
        break;
      
      case 'eth_call':
        result = await RPCService.call(params[0]);
        break;
      
      case 'eth_getTransactionReceipt':
        result = await RPCService.getTransactionReceipt(params[0]);
        break;
      
      case 'eth_getCode':
        const provider = await RPCService.getProvider();
        result = await provider.getCode(params[0]);
        break;
      
      case 'eth_getLogs':
        const provider2 = await RPCService.getProvider();
        result = await provider2.getLogs(params[0]);
        break;
      
      default:
        throw new Error(`RPC method ${method} not supported`);
    }
    
    console.log('[Background] RPC result:', result);
    sendResponse({ success: true, result });
  } catch (error: any) {
    console.error('[Background] RPC call failed:', error);
    sendResponse({ success: false, error: error.message || 'RPC call failed' });
  }
}

// Keep service worker alive and run StableGuard periodic assessment
if (chrome.alarms) {
  chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
  chrome.alarms.create('stableGuardAssessment', { periodInMinutes: 5 }); // Every 5 minutes
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'keepAlive') {
      console.log('Service worker keep-alive ping');
    } else if (alarm.name === 'stableGuardAssessment') {
      console.log('[StableGuard] Running periodic risk assessment');
      try {
        const stableGuard = await getStableGuard();
        const result = await stableGuard.performRiskAssessment();
        if (result.success) {
          console.log('[StableGuard] Assessment completed:', result.stablecoins.length, 'stablecoins');
          
          // Check for high risk and create notification if needed
          const highRiskCoins = result.stablecoins.filter(c => 
            c.riskLevel === 'D' || c.riskLevel === 'E'
          );
          
          if (highRiskCoins.length > 0) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.svg',
              title: 'StableGuard 风险警报',
              message: `检测到 ${highRiskCoins.length} 个稳定币存在高风险，请查看详情。`,
              priority: 2
            });
          }
        }
      } catch (error) {
        console.error('[StableGuard] Periodic assessment failed:', error);
      }
    }
  });
}
