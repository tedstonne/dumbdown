// Shortcut sequence detection logic

function createShortcutDetector(sequence = 'dd', timeout = 500) {
  let buffer = '';
  let lastKeyTime = 0;

  return {
    /**
     * Process a key event and return true if the sequence is complete
     * @param {string} key - The key pressed (lowercase)
     * @param {number} timestamp - Current timestamp in ms
     * @returns {boolean} - True if sequence matched
     */
    processKey(key, timestamp) {
      // Reset buffer if too much time passed
      if (timestamp - lastKeyTime > timeout) {
        buffer = '';
      }

      buffer += key;
      lastKeyTime = timestamp;

      // Check if sequence matches
      if (buffer === sequence) {
        buffer = '';
        return true;
      }

      // Reset if buffer doesn't match sequence prefix
      if (!sequence.startsWith(buffer)) {
        buffer = '';
      }

      return false;
    },

    /**
     * Reset the detector state
     */
    reset() {
      buffer = '';
      lastKeyTime = 0;
    },

    /**
     * Get current buffer (for testing)
     */
    getBuffer() {
      return buffer;
    }
  };
}

/**
 * Check if a keyboard event has only the shift modifier
 */
function isShiftOnly(event) {
  return event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
}

/**
 * Check if an element is an input field
 */
function isInputField(element) {
  if (!element || !element.tagName) return false;
  const tag = element.tagName.toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || !!element.isContentEditable;
}

export { createShortcutDetector, isShiftOnly, isInputField };
