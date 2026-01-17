import { LLM_SERVICES, summaryPrompt } from '../../common/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  document.querySelectorAll('.btn[data-key]').forEach((btn) => {
    const key = btn.dataset.key;
    const shortcut = mac ? `⌘⌥${key}` : `Alt+Shift+${key}`;
    btn.querySelector('.shortcut').textContent = shortcut;
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab?.url || 'Unknown URL';
  document.getElementById('current-url').textContent = currentUrl;
  document.getElementById('current-url').title = currentUrl;

  document.querySelectorAll('.btn[data-llm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const llmId = btn.dataset.llm;
      const service = LLM_SERVICES[llmId];
      if (!service || !currentUrl) return;

      const prompt = summaryPrompt(currentUrl);
      const temporaryChat = document.getElementById('temporary-chat').checked;
      const llmUrl = service.buildUrl(prompt, { temporaryChat });

      chrome.tabs.create({ url: llmUrl });
      window.close();
    });
  });

  chrome.storage.local.get(['temporaryChat'], (result) => {
    document.getElementById('temporary-chat').checked = result.temporaryChat || false;
  });

  document.getElementById('temporary-chat').addEventListener('change', (e) => {
    chrome.storage.local.set({ temporaryChat: e.target.checked });
  });
});
