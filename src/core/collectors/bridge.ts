(function () {
  console.log('[AI Copilot Bridge] Content Script Bridge active.');

  // --- 1. Inject the Collector Script into the Page's MAIN world ---
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('collector.js');
    script.onload = function () {
      script.remove(); // Clean up the tag immediately from DOM to maintain clean tree
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (err) {
    console.error('[AI Copilot Bridge] Script injection failed:', err);
  }

  // --- 2. Listen to postMessages from Collector and Forward to Service Worker ---
  window.addEventListener('message', (event) => {
    // Only accept postMessages originating from our own tab window
    if (event.source !== window) return;

    const data = event.data;
    if (data && data.source === 'ai-debugging-collector') {
      const payload = data.payload;

      // Safe guard checking if extension context is valid/loaded before sending message
      try {
        if (chrome.runtime && chrome.runtime.id) {
          chrome.runtime.sendMessage({
            type: 'TELEMETRY_EVENT',
            payload
          });
        }
      } catch (err) {
        // Suppress extension context invalidated errors silently during reloads/updates
      }
    }
  });
})();
