const DEFAULT_LLM_ID = 'perplexity';

document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.sync.get(['defaultLLM']);
  const llmId = result.defaultLLM || DEFAULT_LLM_ID;

  const radio = document.querySelector(`input[value="${llmId}"]`);
  if (radio) radio.checked = true;
});

document.querySelectorAll('input[name="defaultLLM"]').forEach((radio) => {
  radio.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ defaultLLM: e.target.value });

    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    status.classList.add('show');

    setTimeout(() => status.classList.remove('show'), 2000);
  });
});
