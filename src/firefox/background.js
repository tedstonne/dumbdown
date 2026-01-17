import { LLM_SERVICES, buildSummaryPrompt } from '../common/config.js';

const DEFAULT_LLM = 'perplexity';

// Set the action title with keyboard shortcut on startup
async function updateActionTitle() {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const shortcut = isMac ? '⌘⌥S' : 'Alt+Shift+S';
  browser.action.setTitle({ title: `TL;DR as a shortcut (${shortcut})` });
}

updateActionTitle();

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
  await browser.action.setIcon({ path: ICON_ACTIVE });
  setTimeout(() => {
    browser.action.setIcon({ path: ICON_DEFAULT });
  }, 300);
}

// Get the default LLM from storage
async function getDefaultLLM() {
  const result = await browser.storage.sync.get(['defaultLLM']);
  return result.defaultLLM || DEFAULT_LLM;
}

// Open LLM with the given URL
async function openLLM(llmId, pageUrl) {
  const service = LLM_SERVICES[llmId];
  if (service && pageUrl) {
    pulseIcon();
    const prompt = buildSummaryPrompt(pageUrl);
    const llmUrl = service.buildUrl(prompt);
    browser.tabs.create({ url: llmUrl });
  }
}

// Handle extension icon click - use default LLM
browser.action.onClicked.addListener(async (tab) => {
  if (tab?.url) {
    const defaultLLM = await getDefaultLLM();
    await openLLM(defaultLLM, tab.url);
  }
});

// Handle keyboard shortcuts
browser.commands.onCommand.addListener(async (command) => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tabs[0]?.url) return;

  if (command.startsWith('summarize-')) {
    const llmId = command.replace('summarize-', '');
    await openLLM(llmId, tabs[0].url);
  }
});
