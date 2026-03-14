import { LLM_SERVICES, LLM_BASE_URLS, summaryPrompt } from '../common/config.js';

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

const extractAndOpen = async (tabId, llmId, pageUrl) => {
  const service = LLM_SERVICES[llmId];
  if (!service || !pageUrl) return;

  console.log('[dumbdown] extractAndOpen:', { tabId, llmId, pageUrl });
  pulseIcon();

  let content = null;
  try {
    content = await chrome.tabs.sendMessage(tabId, { action: 'extract' });
    console.log('[dumbdown] extraction result:', content ? { title: content.title, markdownLength: content.markdown?.length } : null);
  } catch (err) {
    console.log('[dumbdown] extraction failed:', err.message);
  }

  const prompt = summaryPrompt(pageUrl, content?.markdown);
  const baseUrl = LLM_BASE_URLS[llmId];

  if (baseUrl && content?.markdown) {
    console.log('[dumbdown] storing pendingPrompt, opening:', baseUrl);
    await chrome.storage.local.set({ pendingPrompt: { prompt, llmId } });
    chrome.tabs.create({ url: baseUrl });
  } else {
    const llmUrl = service.buildUrl(prompt);
    console.log('[dumbdown] no content, falling back to URL query:', llmUrl.slice(0, 100));
    chrome.tabs.create({ url: llmUrl });
  }
};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.url) return;

  const llmId = await storedLLM();
  await extractAndOpen(tab.id, llmId, tab.url);
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  if (command.startsWith('summarize-')) {
    const llmId = command.replace('summarize-', '');
    await extractAndOpen(tab.id, llmId, tab.url);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tab = sender.tab;
  if (!tab?.url) return;

  if (message.action === 'summarize') {
    storedLLM().then((llmId) => extractAndOpen(tab.id, llmId, tab.url));
  } else if (message.action === 'summarize-llm' && message.llm) {
    extractAndOpen(tab.id, message.llm, tab.url);
  }
});
