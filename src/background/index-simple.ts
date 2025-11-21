// Minimal background service worker for testing
console.log('MatrixLabs Wallet background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
});

// Simple message handler
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message received:', request);
  sendResponse({ success: true });
  return true;
});
