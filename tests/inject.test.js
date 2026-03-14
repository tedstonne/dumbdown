import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const injectSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'common', 'inject.js'), 'utf-8');

describe('inject module', () => {
  test('defines selectors for all supported LLMs', () => {
    assert.ok(injectSource.includes('chatgpt'));
    assert.ok(injectSource.includes('claude'));
    assert.ok(injectSource.includes('perplexity'));
  });

  test('has ChatGPT selector for prompt-textarea', () => {
    assert.ok(injectSource.includes('#prompt-textarea'));
  });

  test('has Claude selector for ProseMirror', () => {
    assert.ok(injectSource.includes('ProseMirror'));
  });

  test('has Perplexity selector for textarea', () => {
    assert.ok(injectSource.includes('textarea[placeholder]'));
  });

  test('detects LLM from hostname', () => {
    assert.ok(injectSource.includes('chatgpt.com'));
    assert.ok(injectSource.includes('claude.ai'));
    assert.ok(injectSource.includes('perplexity.ai'));
  });

  test('reads pendingPrompt from storage', () => {
    assert.ok(injectSource.includes('pendingPrompt'));
  });

  test('removes pendingPrompt after injection', () => {
    assert.ok(injectSource.includes("remove('pendingPrompt')"));
  });

  test('dispatches input event for reactivity', () => {
    assert.ok(injectSource.includes("'input'"));
    assert.ok(injectSource.includes('bubbles: true'));
  });
});
