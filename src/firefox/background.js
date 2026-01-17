import { LLM_SERVICES, summaryPrompt } from '../common/config.js';

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

const openLLM = async (llmId, pageUrl) => {
  const service = LLM_SERVICES[llmId];
  if (!service || !pageUrl) return;

  pulseIcon();
  const prompt = summaryPrompt(pageUrl);
  const llmUrl = service.buildUrl(prompt);
  browser.tabs.create({ url: llmUrl });
};

browser.action.onClicked.addListener(async (tab) => {
  if (!tab?.url) return;

  const llmId = await storedLLM();
  await openLLM(llmId, tab.url);
});

browser.commands.onCommand.addListener(async (command) => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;

  if (command.startsWith('summarize-')) {
    const llmId = command.replace('summarize-', '');
    await openLLM(llmId, tabs[0].url);
  }
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  const tab = sender.tab;
  if (!tab?.url) return;

  if (message.action === 'summarize') {
    const llmId = await storedLLM();
    await openLLM(llmId, tab.url);
  } else if (message.action === 'summarize-llm' && message.llm) {
    await openLLM(message.llm, tab.url);
  }
});
