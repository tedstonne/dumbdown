// Vim-style shortcut: Shift+DD (hold shift, tap d twice)

import { createShortcutDetector, isShiftOnly, isInputField } from './shortcut.js';

const detector = createShortcutDetector('dd', 500);

document.addEventListener('keydown', (e) => {
  // Ignore if typing in an input field
  if (isInputField(e.target)) {
    detector.reset();
    return;
  }

  // Must hold Shift only
  if (!isShiftOnly(e)) {
    detector.reset();
    return;
  }

  const key = e.key.toLowerCase();

  if (detector.processKey(key, Date.now())) {
    e.preventDefault();
    (globalThis.browser || globalThis.chrome).runtime.sendMessage({ action: 'summarize' });
  }
});
