const DEFAULT_LLM = 'perplexity';

// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  const result = await browser.storage.sync.get(['defaultLLM']);
  const defaultLLM = result.defaultLLM || DEFAULT_LLM;

  const radio = document.querySelector(`input[value="${defaultLLM}"]`);
  if (radio) {
    radio.checked = true;
  }
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
