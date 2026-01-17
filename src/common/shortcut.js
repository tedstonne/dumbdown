const shortcutDetector = (sequence = 'dd', timeout = 500) => {
  let buffer = '';
  let lastKeyTime = 0;

  return {
    processKey(key, timestamp) {
      if (timestamp - lastKeyTime > timeout) buffer = '';

      buffer += key;
      lastKeyTime = timestamp;

      if (buffer === sequence) {
        buffer = '';

        return true;
      }

      if (!sequence.startsWith(buffer)) buffer = '';

      return false;
    },

    reset() {
      buffer = '';
      lastKeyTime = 0;
    },

    buffer() {
      return buffer;
    }
  };
};

const shiftOnly = (event) =>
  event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;

const inputField = (element) => {
  if (!element || !element.tagName) return false;
  const tag = element.tagName.toUpperCase();

  return tag === 'INPUT' || tag === 'TEXTAREA' || !!element.isContentEditable;
};

export { shortcutDetector, shiftOnly, inputField };
