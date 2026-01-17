import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createShortcutDetector, isShiftOnly, isInputField } from '../src/common/shortcut.js';

describe('createShortcutDetector', () => {
  test('detects "dd" sequence', () => {
    const detector = createShortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('d', 100), true);
  });

  test('resets after successful match', () => {
    const detector = createShortcutDetector('dd', 500);
    detector.processKey('d', 0);
    detector.processKey('d', 100);
    assert.strictEqual(detector.getBuffer(), '');
  });

  test('resets on non-matching key', () => {
    const detector = createShortcutDetector('dd', 500);
    detector.processKey('d', 0);
    assert.strictEqual(detector.getBuffer(), 'd');
    detector.processKey('x', 100);
    assert.strictEqual(detector.getBuffer(), '');
  });

  test('resets after timeout', () => {
    const detector = createShortcutDetector('dd', 500);
    detector.processKey('d', 0);
    assert.strictEqual(detector.getBuffer(), 'd');
    // 600ms later (exceeds 500ms timeout)
    detector.processKey('d', 600);
    assert.strictEqual(detector.getBuffer(), 'd'); // Only the second 'd'
  });

  test('does not match with timeout between keys', () => {
    const detector = createShortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('d', 600), false); // Timeout resets
    assert.strictEqual(detector.processKey('d', 700), true); // Now matches
  });

  test('handles longer sequences', () => {
    const detector = createShortcutDetector('abc', 500);
    assert.strictEqual(detector.processKey('a', 0), false);
    assert.strictEqual(detector.processKey('b', 100), false);
    assert.strictEqual(detector.processKey('c', 200), true);
  });

  test('resets with reset()', () => {
    const detector = createShortcutDetector('dd', 500);
    detector.processKey('d', 0);
    assert.strictEqual(detector.getBuffer(), 'd');
    detector.reset();
    assert.strictEqual(detector.getBuffer(), '');
  });

  test('handles rapid key presses', () => {
    const detector = createShortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('d', 50), true);
  });

  test('does not match partial sequences', () => {
    const detector = createShortcutDetector('dd', 500);
    assert.strictEqual(detector.processKey('d', 0), false);
    assert.strictEqual(detector.processKey('a', 100), false);
    assert.strictEqual(detector.processKey('d', 200), false);
    assert.strictEqual(detector.processKey('d', 300), true);
  });
});

describe('isShiftOnly', () => {
  test('returns true when only shift is pressed', () => {
    assert.strictEqual(isShiftOnly({ shiftKey: true, ctrlKey: false, altKey: false, metaKey: false }), true);
  });

  test('returns false when no modifiers pressed', () => {
    assert.strictEqual(isShiftOnly({ shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }), false);
  });

  test('returns false when shift + ctrl pressed', () => {
    assert.strictEqual(isShiftOnly({ shiftKey: true, ctrlKey: true, altKey: false, metaKey: false }), false);
  });

  test('returns false when shift + alt pressed', () => {
    assert.strictEqual(isShiftOnly({ shiftKey: true, ctrlKey: false, altKey: true, metaKey: false }), false);
  });

  test('returns false when shift + meta pressed', () => {
    assert.strictEqual(isShiftOnly({ shiftKey: true, ctrlKey: false, altKey: false, metaKey: true }), false);
  });
});

describe('isInputField', () => {
  test('returns true for INPUT elements', () => {
    assert.strictEqual(isInputField({ tagName: 'INPUT' }), true);
    assert.strictEqual(isInputField({ tagName: 'input' }), true);
  });

  test('returns true for TEXTAREA elements', () => {
    assert.strictEqual(isInputField({ tagName: 'TEXTAREA' }), true);
    assert.strictEqual(isInputField({ tagName: 'textarea' }), true);
  });

  test('returns true for contenteditable elements', () => {
    assert.strictEqual(isInputField({ tagName: 'DIV', isContentEditable: true }), true);
  });

  test('returns false for regular elements', () => {
    assert.strictEqual(isInputField({ tagName: 'DIV', isContentEditable: false }), false);
    assert.strictEqual(isInputField({ tagName: 'SPAN' }), false);
    assert.strictEqual(isInputField({ tagName: 'P' }), false);
  });

  test('handles null/undefined', () => {
    assert.strictEqual(isInputField(null), false);
    assert.strictEqual(isInputField(undefined), false);
    assert.strictEqual(isInputField({}), false);
  });
});
