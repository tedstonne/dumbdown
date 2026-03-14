import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LLM_SERVICES, LLM_BASE_URLS, summaryPrompt } from '../src/common/config.js';

describe('summaryPrompt', () => {
  test('creates prompt with URL only', () => {
    assert.strictEqual(summaryPrompt('https://example.com'), 'summarize https://example.com');
  });

  test('creates prompt with URL and content', () => {
    const result = summaryPrompt('https://example.com', '# Hello\nSome content');
    assert.strictEqual(result, 'Summarize the following:\n\n# Hello\nSome content\n\nSource: https://example.com');
  });

  test('falls back to URL-only when content is empty', () => {
    assert.strictEqual(summaryPrompt('https://example.com', ''), 'summarize https://example.com');
  });

  test('falls back to URL-only when content is null', () => {
    assert.strictEqual(summaryPrompt('https://example.com', null), 'summarize https://example.com');
  });

  test('handles URLs with special characters', () => {
    assert.strictEqual(
      summaryPrompt('https://example.com/path?q=test&foo=bar'),
      'summarize https://example.com/path?q=test&foo=bar'
    );
  });
});

describe('LLM_BASE_URLS', () => {
  test('has base URL for each service', () => {
    assert.ok(LLM_BASE_URLS.perplexity);
    assert.ok(LLM_BASE_URLS.chatgpt);
    assert.ok(LLM_BASE_URLS.claude);
  });

  test('URLs point to correct domains', () => {
    assert.ok(LLM_BASE_URLS.perplexity.includes('perplexity.ai'));
    assert.ok(LLM_BASE_URLS.chatgpt.includes('chatgpt.com'));
    assert.ok(LLM_BASE_URLS.claude.includes('claude.ai'));
  });
});

describe('LLM_SERVICES', () => {
  describe('perplexity', () => {
    test('has correct id and name', () => {
      assert.strictEqual(LLM_SERVICES.perplexity.id, 'perplexity');
      assert.strictEqual(LLM_SERVICES.perplexity.name, 'Perplexity');
    });

    test('builds correct URL', () => {
      const url = LLM_SERVICES.perplexity.buildUrl('test query');
      assert.strictEqual(url, 'https://www.perplexity.ai/search/?q=test%20query');
    });

    test('encodes special characters', () => {
      const url = LLM_SERVICES.perplexity.buildUrl('summarize https://example.com?a=1&b=2');
      assert.ok(url.includes('https://www.perplexity.ai/search/?q='));
      assert.ok(url.includes(encodeURIComponent('https://example.com?a=1&b=2')));
    });
  });

  describe('chatgpt', () => {
    test('has correct id and name', () => {
      assert.strictEqual(LLM_SERVICES.chatgpt.id, 'chatgpt');
      assert.strictEqual(LLM_SERVICES.chatgpt.name, 'ChatGPT');
    });

    test('builds correct URL', () => {
      const url = LLM_SERVICES.chatgpt.buildUrl('test query');
      assert.strictEqual(url, 'https://chatgpt.com/?q=test%20query');
    });

    test('supports temporary chat option', () => {
      const url = LLM_SERVICES.chatgpt.buildUrl('test', { temporaryChat: true });
      assert.strictEqual(url, 'https://chatgpt.com/?q=test&temporary-chat=true');
    });

    test('excludes temporary chat when not specified', () => {
      const url = LLM_SERVICES.chatgpt.buildUrl('test');
      assert.ok(!url.includes('temporary-chat'));
    });
  });

  describe('claude', () => {
    test('has correct id and name', () => {
      assert.strictEqual(LLM_SERVICES.claude.id, 'claude');
      assert.strictEqual(LLM_SERVICES.claude.name, 'Claude');
    });

    test('builds correct URL', () => {
      const url = LLM_SERVICES.claude.buildUrl('test query');
      assert.strictEqual(url, 'https://claude.ai/new?q=test%20query');
    });
  });

  test('all services have required properties', () => {
    Object.values(LLM_SERVICES).forEach(service => {
      assert.ok(service.id, 'service should have id');
      assert.ok(service.name, 'service should have name');
      assert.ok(service.buildUrl, 'service should have buildUrl');
      assert.strictEqual(typeof service.buildUrl, 'function');
    });
  });
});
