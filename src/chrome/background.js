import { LLM_SERVICES, summaryPrompt } from '../common/config.js';

const DEFAULT_LLM_ID = 'perplexity';

chrome.action.setTitle({ title: 'TL;DR (Shift+DD)' });

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
  await chrome.action.setIcon({ path: ICON_ACTIVE });
  setTimeout(() => chrome.action.setIcon({ path: ICON_DEFAULT }), 300);
};

const storedLLM = async () => {
  const result = await chrome.storage.sync.get(['defaultLLM']);

  return result.defaultLLM || DEFAULT_LLM_ID;
};

const openLLM = async (llmId, pageUrl) => {
  const service = LLM_SERVICES[llmId];
  if (!service || !pageUrl) return;

  pulseIcon();
  const prompt = summaryPrompt(pageUrl);
  const llmUrl = service.buildUrl(prompt);
  chrome.tabs.create({ url: llmUrl });
};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.url) return;

  const llmId = await storedLLM();
  await openLLM(llmId, tab.url);
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  if (command.startsWith('summarize-')) {
    const llmId = command.replace('summarize-', '');
    await openLLM(llmId, tab.url);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
  const tab = sender.tab;
  if (!tab?.url) return;

  if (message.action === 'summarize') {
    const llmId = await storedLLM();
    await openLLM(llmId, tab.url);
  } else if (message.action === 'summarize-llm' && message.llm) {
    await openLLM(message.llm, tab.url);
  }
});
