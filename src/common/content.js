import { shortcutDetector, shiftOnly, inputField } from './shortcut.js';
import { extract } from './extract.js';

const api = globalThis.browser || globalThis.chrome;
const detector = shortcutDetector('dd', 500);

document.addEventListener('keydown', (e) => {
  if (inputField(e.target)) {
    detector.reset();

    return;
  }

  if (!shiftOnly(e)) {
    detector.reset();

    return;
  }

  const key = e.key.toLowerCase();

  if (detector.processKey(key, Date.now())) {
    e.preventDefault();
    api.runtime.sendMessage({ action: 'summarize' });
  }
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'extract') {
    const result = extract();
    sendResponse(result);
  }

  return false;
});
