import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';
import { describe, test, expect, beforeEach } from 'vitest';

describe('StrictStore', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  describe('StrictStore basic operations', () => {
    test('returns null for non-existent key', () => {
      expect(StrictStore.get(keys.stringKey)).toBe(null);
    });

    test('saves and retrieves a string value', () => {
      StrictStore.save(keys.stringKey, 'save and get test');
      expect(StrictStore.get(keys.stringKey)).toBe('save and get test');
    });

    test('overwrites existing value', () => {
      StrictStore.save(keys.stringKey, 'first');
      StrictStore.save(keys.stringKey, 'second');
      expect(StrictStore.get(keys.stringKey)).toBe('second');
    });

    test('removes a key and returns null after removal', () => {
      StrictStore.save(keys.stringKey, 'to be removed');
      StrictStore.delete([keys.stringKey]);
      expect(StrictStore.get(keys.stringKey)).toBe(null);
    });

    test('works with different types: number', () => {
      StrictStore.save(keys.numberKey, 123);
      expect(StrictStore.get(keys.numberKey)).toBe(123);
    });

    test('works with different types: boolean', () => {
      StrictStore.save(keys.booleanKey, true);
      expect(StrictStore.get(keys.booleanKey)).toBe(true);
      StrictStore.save(keys.booleanKey, false);
      expect(StrictStore.get(keys.booleanKey)).toBe(false);
    });

    test('works with null value', () => {
      StrictStore.save(keys.nullKey, null);
      expect(StrictStore.get(keys.nullKey)).toBe(null);
    });

    test('does not affect other keys when saving', () => {
      StrictStore.save(keys.stringKey, 'one');
      StrictStore.save(keys.numberKey, 2);
      expect(StrictStore.get(keys.stringKey)).toBe('one');
      expect(StrictStore.get(keys.numberKey)).toBe(2);
    });

    test('does not affect other keys when removing', () => {
      StrictStore.save(keys.stringKey, 'one');
      StrictStore.save(keys.numberKey, 2);
      StrictStore.delete([keys.stringKey]);
      expect(StrictStore.get(keys.stringKey)).toBe(null);
      expect(StrictStore.get(keys.numberKey)).toBe(2);
    });

    test('does not throw when removing non-existent key', () => {
      expect(() => StrictStore.delete([keys.stringKey])).not.toThrow();
    });

    test('does not throw when getting non-existent key', () => {
      expect(() => StrictStore.get(keys.stringKey)).not.toThrow();
    });
  });
});
