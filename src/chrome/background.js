import { LLM_SERVICES, buildSummaryPrompt } from '../common/config.js';

const DEFAULT_LLM = 'perplexity';

// Set the action title with keyboard shortcut
chrome.action.setTitle({ title: 'TL;DR (Shift+DD)' });

// Icon paths
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

// Pulse the icon briefly
async function pulseIcon() {
  await chrome.action.setIcon({ path: ICON_ACTIVE });
  setTimeout(() => {
    chrome.action.setIcon({ path: ICON_DEFAULT });
  }, 300);
}

// Get the default LLM from storage
async function getDefaultLLM() {
  const result = await chrome.storage.sync.get(['defaultLLM']);
  return result.defaultLLM || DEFAULT_LLM;
}

// Open LLM with the given URL
async function openLLM(llmId, pageUrl) {
  const service = LLM_SERVICES[llmId];
  if (service && pageUrl) {
    pulseIcon();
    const prompt = buildSummaryPrompt(pageUrl);
    const llmUrl = service.buildUrl(prompt);
    chrome.tabs.create({ url: llmUrl });
  }
}

// Handle extension icon click - use default LLM
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.url) {
    const defaultLLM = await getDefaultLLM();
    await openLLM(defaultLLM, tab.url);
  }
});

// Handle keyboard shortcuts from manifest commands
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.url) return;

  if (command.startsWith('summarize-')) {
    const llmId = command.replace('summarize-', '');
    await openLLM(llmId, tab.url);
  }
});

// Handle messages from content script (vim-style shortcuts)
chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'summarize') {
    const tab = sender.tab;
    if (tab?.url) {
      const defaultLLM = await getDefaultLLM();
      await openLLM(defaultLLM, tab.url);
    }
  } else if (message.action === 'summarize-llm' && message.llm) {
    const tab = sender.tab;
    if (tab?.url) {
      await openLLM(message.llm, tab.url);
    }
  }
});
