import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MAX_FALLBACK_LENGTH } from '../src/common/extract.js';

describe('extract constants', () => {
  test('MAX_FALLBACK_LENGTH is 10000', () => {
    assert.strictEqual(MAX_FALLBACK_LENGTH, 10000);
  });
});
