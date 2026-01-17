import { LLM_SERVICES, buildSummaryPrompt } from '../../common/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Detect OS and set shortcut labels
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  document.querySelectorAll('.btn[data-key]').forEach((btn) => {
    const key = btn.dataset.key;
    const shortcut = isMac ? `⌘⌥${key}` : `Alt+Shift+${key}`;
    btn.querySelector('.shortcut').textContent = shortcut;
  });

  // Get current tab URL
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const currentUrl = tab?.url || 'Unknown URL';
  document.getElementById('current-url').textContent = currentUrl;
  document.getElementById('current-url').title = currentUrl;

  // Handle button clicks
  document.querySelectorAll('.btn[data-llm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const llmId = btn.dataset.llm;
      const service = LLM_SERVICES[llmId];

      if (service && currentUrl) {
        const prompt = buildSummaryPrompt(currentUrl);
        const temporaryChat = document.getElementById('temporary-chat').checked;
        const llmUrl = service.buildUrl(prompt, { temporaryChat });

        chrome.tabs.create({ url: llmUrl });
        window.close();
      }
    });
  });

  // Load saved preferences
  chrome.storage.local.get(['temporaryChat'], (result) => {
    document.getElementById('temporary-chat').checked =
      result.temporaryChat || false;
  });

  // Save preferences on change
  document.getElementById('temporary-chat').addEventListener('change', (e) => {
    chrome.storage.local.set({ temporaryChat: e.target.checked });
  });
});
