import { LLM_SERVICES, summaryPrompt } from '../../common/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  document.querySelectorAll('.btn[data-key]').forEach((btn) => {
    const key = btn.dataset.key;
    const shortcut = mac ? `⌘⌥${key}` : `Alt+Shift+${key}`;
    btn.querySelector('.shortcut').textContent = shortcut;
  });

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tabs[0]?.url || 'Unknown URL';
  document.getElementById('current-url').textContent = currentUrl;
  document.getElementById('current-url').title = currentUrl;

  document.querySelectorAll('.btn[data-llm]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const llmId = btn.dataset.llm;
      const service = LLM_SERVICES[llmId];
      if (!service || !currentUrl) return;

      const prompt = summaryPrompt(currentUrl);
      const temporaryChat = document.getElementById('temporary-chat').checked;
      const llmUrl = service.buildUrl(prompt, { temporaryChat });

      await browser.tabs.create({ url: llmUrl });
      window.close();
    });
  });

  const result = await browser.storage.local.get(['temporaryChat']);
  document.getElementById('temporary-chat').checked = result.temporaryChat || false;

  document.getElementById('temporary-chat').addEventListener('change', async (e) => {
    await browser.storage.local.set({ temporaryChat: e.target.checked });
  });
});
