// Content script for MatrixLabs Wallet
// Injects the inpage script into web pages

const injectScript = () => {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('inpage.js');
    scriptTag.onload = () => {
      scriptTag.remove();
    };
    container.insertBefore(scriptTag, container.children[0]);
  } catch (error) {
    console.error('MatrixLabs: Failed to inject inpage script', error);
  }
};

// Inject as early as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}

// Forward messages between inpage and background
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  // Only accept messages with matrixlabs prefix
  if (!event.data.type || !event.data.type.startsWith('MATRIXLABS_')) return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: event.data.type.replace('MATRIXLABS_', ''),
      data: event.data.data,
    });

    window.postMessage(
      {
        type: `${event.data.type}_RESPONSE`,
        data: response,
        id: event.data.id,
      },
      '*'
    );
  } catch (error) {
    window.postMessage(
      {
        type: `${event.data.type}_RESPONSE`,
        error: 'Failed to communicate with wallet',
        id: event.data.id,
      },
      '*'
    );
  }
});

console.log('MatrixLabs Wallet content script loaded');
