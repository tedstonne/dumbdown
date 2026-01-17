import { test, describe } from 'node:test';
import assert from 'node:assert';
import { shortcutDetector, shiftOnly, inputField } from '../src/common/shortcut.js';

describe('shortcutDetector', () => {
  test('detects "dd" sequence', () => {
    const detector = shortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('d', 100), true);
  });

  test('resets after successful match', () => {
    const detector = shortcutDetector('dd', 500);
    detector.processKey('d', 0);
    detector.processKey('d', 100);
    assert.strictEqual(detector.buffer(), '');
  });

  test('resets on non-matching key', () => {
    const detector = shortcutDetector('dd', 500);
    detector.processKey('d', 0);
    assert.strictEqual(detector.buffer(), 'd');
    detector.processKey('x', 100);
    assert.strictEqual(detector.buffer(), '');
  });

  test('resets after timeout', () => {
    const detector = shortcutDetector('dd', 500);
    detector.processKey('d', 0);
    assert.strictEqual(detector.buffer(), 'd');
    detector.processKey('d', 600);
    assert.strictEqual(detector.buffer(), 'd');
  });

  test('does not match with timeout between keys', () => {
    const detector = shortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('d', 600), false);
    assert.strictEqual(detector.processKey('d', 700), true);
  });

  test('handles longer sequences', () => {
    const detector = shortcutDetector('abc', 500);
    assert.strictEqual(detector.processKey('a', 0), false);
    assert.strictEqual(detector.processKey('b', 100), false);
    assert.strictEqual(detector.processKey('c', 200), true);
  });

  test('resets with reset()', () => {
    const detector = shortcutDetector('dd', 500);
    detector.processKey('d', 0);
    assert.strictEqual(detector.buffer(), 'd');
    detector.reset();
    assert.strictEqual(detector.buffer(), '');
  });

  test('handles rapid key presses', () => {
    const detector = shortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('d', 50), true);
  });

  test('does not match partial sequences', () => {
    const detector = shortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('a', 100), false);
    assert.strictEqual(detector.processKey('d', 200), false);
    assert.strictEqual(detector.processKey('d', 300), true);
  });
});

describe('shiftOnly', () => {
  test('returns true when only shift is pressed', () => {
    assert.strictEqual(shiftOnly({ shiftKey: true, ctrlKey: false, altKey: false, metaKey: false }), true);
  });

  test('returns false when no modifiers pressed', () => {
    assert.strictEqual(shiftOnly({ shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }), false);
  });

  test('returns false when shift + ctrl pressed', () => {
    assert.strictEqual(shiftOnly({ shiftKey: true, ctrlKey: true, altKey: false, metaKey: false }), false);
  });

  test('returns false when shift + alt pressed', () => {
    assert.strictEqual(shiftOnly({ shiftKey: true, ctrlKey: false, altKey: true, metaKey: false }), false);
  });

  test('returns false when shift + meta pressed', () => {
    assert.strictEqual(shiftOnly({ shiftKey: true, ctrlKey: false, altKey: false, metaKey: true }), false);
  });
});

describe('inputField', () => {
  test('returns true for INPUT elements', () => {
    assert.strictEqual(inputField({ tagName: 'INPUT' }), true);
    assert.strictEqual(inputField({ tagName: 'input' }), true);
  });

  test('returns true for TEXTAREA elements', () => {
    assert.strictEqual(inputField({ tagName: 'TEXTAREA' }), true);
    assert.strictEqual(inputField({ tagName: 'textarea' }), true);
  });

  test('returns true for contenteditable elements', () => {
    assert.strictEqual(inputField({ tagName: 'DIV', isContentEditable: true }), true);
  });

  test('returns false for regular elements', () => {
    assert.strictEqual(inputField({ tagName: 'DIV', isContentEditable: false }), false);
    assert.strictEqual(inputField({ tagName: 'SPAN' }), false);
    assert.strictEqual(inputField({ tagName: 'P' }), false);
  });

  test('handles null/undefined', () => {
    assert.strictEqual(inputField(null), false);
    assert.strictEqual(inputField(undefined), false);
    assert.strictEqual(inputField({}), false);
  });
});
