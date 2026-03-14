const LOG = '[dumbdown]';

const SELECTORS = {
  chatgpt: ['#prompt-textarea', 'div[contenteditable="true"]'],
  claude: ['div.ProseMirror[contenteditable="true"]', 'div[contenteditable="true"]'],
  perplexity: ['div.ProseMirror[contenteditable="true"]', 'div[contenteditable="true"]', 'textarea[placeholder]', 'textarea'],
};

const TEXTAREA_TIMEOUT = 10000;

const detectLLM = () => {
  const host = window.location.hostname;
  if (host.includes('chatgpt.com')) return 'chatgpt';
  if (host.includes('claude.ai')) return 'claude';
  if (host.includes('perplexity.ai')) return 'perplexity';

  return null;
};

const findElement = (selectors) => {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      console.log(LOG, 'found element with selector:', selector);

      return el;
    }
  }

  return null;
};

const waitForElement = (selectors) =>
  new Promise((resolve) => {
    console.log(LOG, 'waiting for element with selectors:', selectors);
    const existing = findElement(selectors);
    if (existing) {
      resolve(existing);

      return;
    }

    console.log(LOG, 'element not found yet, observing DOM...');

    const timeout = setTimeout(() => {
      console.log(LOG, 'timed out waiting for element');
      observer.disconnect();
      resolve(null);
    }, TEXTAREA_TIMEOUT);

    const observer = new MutationObserver(() => {
      const el = findElement(selectors);
      if (el) {
        observer.disconnect();
        clearTimeout(timeout);
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

const setContent = (element, text) => {
  console.log(LOG, 'setting content on', element.tagName, '- length:', text.length);
  element.focus();

  if (element.tagName === 'TEXTAREA') {
    element.value = text;
    element.dispatchEvent(new InputEvent('input', { bubbles: true }));
  } else {
    // For contenteditable / ProseMirror: use clipboard API to simulate paste
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    });

    const pasted = element.dispatchEvent(pasteEvent);
    console.log(LOG, 'paste event dispatched, default prevented:', !pasted);

    if (!pasted) return;

    // paste wasn't handled by the framework, fall back to execCommand
    console.log(LOG, 'paste not handled, trying execCommand insertText');
    document.execCommand('insertText', false, text);
  }
};

const api = globalThis.browser || globalThis.chrome;

const run = async () => {
  console.log(LOG, 'inject.js loaded on', window.location.href);

  const result = await api.storage.local.get(['pendingPrompt']);
  const pending = result.pendingPrompt;
  if (!pending) {
    console.log(LOG, 'no pendingPrompt in storage, exiting');

    return;
  }

  console.log(LOG, 'found pendingPrompt for', pending.llmId, '- prompt length:', pending.prompt.length);

  const llmId = detectLLM();
  if (!llmId) {
    console.log(LOG, 'could not detect LLM from hostname:', window.location.hostname);

    return;
  }

  console.log(LOG, 'detected LLM:', llmId);

  const selectors = SELECTORS[llmId];
  if (!selectors) return;

  const element = await waitForElement(selectors);
  if (!element) {
    console.log(LOG, 'gave up waiting for textarea');

    return;
  }

  setContent(element, pending.prompt);
  await api.storage.local.remove('pendingPrompt');
  console.log(LOG, 'injection complete, cleared pendingPrompt');

  // Auto-submit after a short delay to let the UI process the pasted content
  setTimeout(() => {
    console.log(LOG, 'auto-submitting via Enter key');
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
  }, 500);
};

run();
