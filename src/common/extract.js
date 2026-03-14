import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

const LOG = '[dumbdown]';
const MAX_FALLBACK_LENGTH = 10000;

const extract = () => {
  console.log(LOG, 'extracting content from', window.location.href);

  const clonedDoc = document.cloneNode(true);
  const article = new Readability(clonedDoc).parse();

  console.log(LOG, 'readability result:', article ? { title: article.title, contentLength: article.content?.length, textLength: article.textContent?.length } : null);

  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

  let title = document.title;
  let markdown;

  if (article && article.content) {
    title = article.title || title;
    markdown = turndown.turndown(article.content);
    console.log(LOG, 'readability HTML content (first 500 chars):', article.content.slice(0, 500));
    console.log(LOG, 'markdown output (first 500 chars):', markdown.slice(0, 500));
    console.log(LOG, 'markdown total length:', markdown.length);
  } else {
    console.log(LOG, 'readability failed, falling back to innerText');
    const text = document.body.innerText.slice(0, MAX_FALLBACK_LENGTH);
    markdown = text;
    console.log(LOG, 'fallback text (first 500 chars):', text.slice(0, 500));
    console.log(LOG, 'fallback text length:', text.length);
  }

  return { title, markdown, url: window.location.href };
};

export { extract, MAX_FALLBACK_LENGTH };
