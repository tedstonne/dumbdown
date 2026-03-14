import { LLM_SERVICES, LLM_BASE_URLS, summaryPrompt } from '../common/config.js';

const DEFAULT_LLM_ID = 'perplexity';

browser.action.setTitle({ title: 'TL;DR (Shift+DD)' });

const ICON_DEFAULT = {
  16: 'icons/icon16.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png'
};

const ICON_ACTIVE = {
  16: 'icons/icon16-active.png',
  48: 'icons/icon48-active.png',
  128: 'icons/icon128-active.png'
};

const pulseIcon = async () => {
  await browser.action.setIcon({ path: ICON_ACTIVE });
  setTimeout(() => browser.action.setIcon({ path: ICON_DEFAULT }), 300);
};

const storedLLM = async () => {
  const result = await browser.storage.sync.get(['defaultLLM']);

  return result.defaultLLM || DEFAULT_LLM_ID;
};

const extractAndOpen = async (tabId, llmId, pageUrl) => {
  const service = LLM_SERVICES[llmId];
  if (!service || !pageUrl) return;

  pulseIcon();

  let content = null;
  try {
    content = await browser.tabs.sendMessage(tabId, { action: 'extract' });
  } catch {
    // extraction failed, fall back to URL-only prompt
  }

  const prompt = summaryPrompt(pageUrl, content?.markdown);
  const baseUrl = LLM_BASE_URLS[llmId];

  if (baseUrl && content?.markdown) {
    await browser.storage.local.set({ pendingPrompt: { prompt, llmId } });
    await browser.tabs.create({ url: baseUrl });
  } else {
    const llmUrl = service.buildUrl(prompt);
    await browser.tabs.create({ url: llmUrl });
  }
};

browser.action.onClicked.addListener(async (tab) => {
  if (!tab?.url) return;

  const llmId = await storedLLM();
  await extractAndOpen(tab.id, llmId, tab.url);
});

browser.commands.onCommand.addListener(async (command) => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;

  if (command.startsWith('summarize-')) {
    const llmId = command.replace('summarize-', '');
    await extractAndOpen(tabs[0].id, llmId, tabs[0].url);
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  const tab = sender.tab;
  if (!tab?.url) return;

  if (message.action === 'summarize') {
    storedLLM().then((llmId) => extractAndOpen(tab.id, llmId, tab.url));
  } else if (message.action === 'summarize-llm' && message.llm) {
    extractAndOpen(tab.id, message.llm, tab.url);
  }
});
