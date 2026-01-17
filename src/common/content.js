import { shortcutDetector, shiftOnly, inputField } from './shortcut.js';

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
    (globalThis.browser || globalThis.chrome).runtime.sendMessage({ action: 'summarize' });
  }
});
