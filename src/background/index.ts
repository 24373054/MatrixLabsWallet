// Background service worker for MatrixLabs Wallet

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

    default:
      sendResponse({ error: 'Unknown request type' });
  }

  return true;
});

async function handleGetAccounts(sendResponse: (response: any) => void) {
  try {
    // Get accounts from storage
    const result = await chrome.storage.local.get(['accounts', 'currentAccount']);
    sendResponse({
      success: true,
      accounts: result.accounts || [],
      currentAccount: result.currentAccount || null,
    });
  } catch (error) {
    sendResponse({ success: false, error: 'Failed to get accounts' });
  }
}

async function handleSignTransaction(_data: any, sendResponse: (response: any) => void) {
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
}

async function handleSignMessage(_data: any, sendResponse: (response: any) => void) {
  try {
    // Check if chrome.windows API is available
    if (!chrome.windows) {
      throw new Error('Windows API not available');
    }
    
    // Open popup for user confirmation
    await chrome.windows.create({
      url: chrome.runtime.getURL('index.html#/confirm-message'),
      type: 'popup',
      width: 360,
      height: 600,
    });

    sendResponse({ success: true, message: 'Message signature requested' });
  } catch (error) {
    console.error('Failed to create window:', error);
    sendResponse({ success: false, error: 'Failed to request message signature' });
  }
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
