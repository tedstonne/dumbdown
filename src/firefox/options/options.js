const DEFAULT_LLM = 'perplexity';

const SHORTCUTS = {
  perplexity: { mac: '⌘⌥P', other: 'Alt+Shift+P' },
  chatgpt: { mac: '⌘⌥G', other: 'Alt+Shift+G' },
  claude: { mac: '⌘⌥C', other: 'Alt+Shift+C' }
};

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  const result = await browser.storage.sync.get(['defaultLLM']);
  const defaultLLM = result.defaultLLM || DEFAULT_LLM;

  const radio = document.querySelector(`input[value="${defaultLLM}"]`);
  if (radio) {
    radio.checked = true;
  }

  // Show shortcuts
  const shortcutList = document.getElementById('shortcut-list');
  Object.entries(SHORTCUTS).forEach(([llm, keys]) => {
    const li = document.createElement('li');
    const shortcut = isMac ? keys.mac : keys.other;
    li.innerHTML = `<span>${llm.charAt(0).toUpperCase() + llm.slice(1)}</span><code>${shortcut}</code>`;
    shortcutList.appendChild(li);
  });

  // Add default shortcut
  const defaultShortcut = isMac ? '⌘⌥S' : 'Alt+Shift+S';
  const li = document.createElement('li');
  li.innerHTML = `<span>Default LLM</span><code>${defaultShortcut}</code>`;
  shortcutList.insertBefore(li, shortcutList.firstChild);
});

// Save on change
document.querySelectorAll('input[name="defaultLLM"]').forEach((radio) => {
  radio.addEventListener('change', async (e) => {
    await browser.storage.sync.set({ defaultLLM: e.target.value });

    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    status.classList.add('show');

    setTimeout(() => {
      status.classList.remove('show');
    }, 2000);
  });
});
