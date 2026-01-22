import { describe, expect, vi, beforeEach, test } from 'vitest';
import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';

describe('OnChange method', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    StrictStore.clear();
  });

  describe('test local emitter', () => {
    test('does not call listener immediately after subscription', () => {
      const callback = vi.fn();

      const unsub = StrictStore.onChange(callback, keys.stringKey);

      expect(callback).not.toHaveBeenCalled();
      unsub();
    });

    test('does not call listener after immediate unsubscription', () => {
      const callback = vi.fn();

      const unsub = StrictStore.onChange(callback, keys.stringKey);
      unsub();

      expect(callback).not.toHaveBeenCalled();
    });

    test('does not call listener when another key is modified', () => {
      const callback = vi.fn();

      const unsub = StrictStore.onChange(callback, keys.stringKey);
      StrictStore.save(keys.numberKey, 100);

      expect(callback).not.toHaveBeenCalled();
      unsub();
    });

    test('does not call listener after unsubscription even if the watched key changes', () => {
      const callback = vi.fn();

      const unsub = StrictStore.onChange(callback, keys.stringKey);
      unsub();

      StrictStore.save(keys.stringKey, 'dont watching');

      expect(callback).not.toHaveBeenCalled();
    });

    test('calls listener on first save of the watched key', () => {
      const callback = vi.fn((el) => {
        expect(el).toEqual({
          oldValue: null,
          newValue: 'new value',
          key: keys.stringKey,
          timestamp: expect.any(Number),
        });
      });

      const unsub = StrictStore.onChange(callback, keys.stringKey);
      StrictStore.save(keys.stringKey, 'new value');

      expect(callback).toHaveBeenCalled();
      unsub();
    });

    test('does not call listener when deleting a non-existent watched key', () => {
      const callback = vi.fn();

      const unsub = StrictStore.onChange(callback, keys.stringKey);
      StrictStore.delete(keys.stringKey);

      expect(callback).not.toHaveBeenCalled();
      unsub();
    });

    test('does not call listener when deleting a watched key that resolves to null and does not exist', () => {
      const callback = vi.fn();

      const unsub = StrictStore.onChange(callback, keys.nullKey);
      StrictStore.delete(keys.nullKey);

      expect(callback).not.toHaveBeenCalled();
      unsub();
    });

    test('calls listener when deleting an existing watched key', () => {
      const callback = vi.fn((el) => {
        expect(el).toEqual({
          oldValue: 'value',
          newValue: null,
          key: keys.stringKey,
          timestamp: expect.any(Number),
        });
      });

      StrictStore.save(keys.stringKey, 'value');
      const unsub = StrictStore.onChange(callback, keys.stringKey);
      StrictStore.delete(keys.stringKey);

      expect(callback).toHaveBeenCalled();
      unsub();
    });

    test('calls listener when updating an existing watched key', () => {
      const callback = vi.fn((el) => {
        expect(el).toEqual({
          oldValue: 'value',
          newValue: 'new value',
          key: keys.stringKey,
          timestamp: expect.any(Number),
        });
      });

      StrictStore.save(keys.stringKey, 'value');
      const unsub = StrictStore.onChange(callback, keys.stringKey);
      StrictStore.save(keys.stringKey, 'new value');

      expect(callback).toHaveBeenCalled();
      unsub();
    });

    test('calls listener when replacing a complex object value', () => {
      const callback = vi.fn((el) => {
        expect(el).toEqual({
          oldValue: {
            user: {
              name: 'old name',
              tags: ['a', 'b', 'c'],
              permissions: new Set<string>(['a', 'b', 'c']),
            },
          },
          newValue: {
            user: {
              name: 'new name',
              tags: ['z', 'x'],
              permissions: new Set<string>(['z', 'x']),
            },
          },
          key: keys.objectWithArrayAndSet,
          timestamp: expect.any(Number),
        });
      });

      StrictStore.save(keys.objectWithArrayAndSet, {
        user: {
          name: 'old name',
          tags: ['a', 'b', 'c'],
          permissions: new Set<string>(['a', 'b', 'c']),
        },
      });
      const unsub = StrictStore.onChange(callback, keys.objectWithArrayAndSet);
      StrictStore.save(keys.objectWithArrayAndSet, {
        user: {
          name: 'new name',
          tags: ['z', 'x'],
          permissions: new Set<string>(['z', 'x']),
        },
      });

      expect(callback).toHaveBeenCalled();
      unsub();
    });
  });

  describe('test events', () => {
    test('', () => {});
  });
});
