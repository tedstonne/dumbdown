export const LLM_SERVICES = {
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    buildUrl: (prompt) => {
      const encoded = encodeURIComponent(prompt);
      return `https://www.perplexity.ai/search/?q=${encoded}`;
    }
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    buildUrl: (prompt, options = {}) => {
      const encoded = encodeURIComponent(prompt);
      let url = `https://chatgpt.com/?q=${encoded}`;
      if (options.temporaryChat) {
        url += '&temporary-chat=true';
      }
      return url;
    }
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    buildUrl: (prompt) => {
      const encoded = encodeURIComponent(prompt);
      return `https://claude.ai/new?q=${encoded}`;
    }
  }
};

export const summaryPrompt = (url) => `summarize ${url}`;
