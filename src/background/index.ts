// Background service worker for MatrixLabs Wallet
import { ethers } from 'ethers';
import { CryptoService } from '../lib/crypto';

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
      handleSignTransaction(request.data, sendResponse);
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

    default:
      sendResponse({ error: 'Unknown request type' });
  }

  return true;
});

// Store pending connection requests
let pendingConnectionResolve: ((value: any) => void) | null = null;

// Store pending signature requests
let pendingSignatureResolve: ((value: any) => void) | null = null;

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

async function handleSignTransaction(data: any, sendResponse: (response: any) => void) {
  console.log('[Background] handleSignTransaction called');
  console.log('[Background] Transaction data:', data);
  
  // For now, return an error since transaction UI is not fully implemented
  sendResponse({ 
    success: false, 
    error: 'User rejected the request'
  });
  
  /* TODO: Implement transaction confirmation UI
  try {
    // Check if chrome.windows API is available
    if (!chrome.windows) {
      throw new Error('Windows API not available');
    }
    
    // Open popup for user confirmation
    await chrome.windows.create({
      url: chrome.runtime.getURL('index.html#/confirm-transaction'),
      type: 'popup',
      width: 360,
      height: 600,
    });

    sendResponse({ success: true, message: 'Transaction confirmation requested' });
  } catch (error) {
    console.error('Failed to create window:', error);
    sendResponse({ success: false, error: 'Failed to request transaction confirmation' });
  }
  */
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

// Keep service worker alive
if (chrome.alarms) {
  chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
      console.log('Service worker keep-alive ping');
    }
  });
}
