import { describe, expect, vi, beforeEach, test } from 'vitest';
import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';
import { keyPolicy } from '@src/domain/policies/key.policy';
import { SuperJSON } from 'superjson';
import { StoreEvent } from '@src/domain/entities/on-change/store-event.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { Persistable } from '@src/domain/entities/core/persistable.entity';

describe('OnChange method', () => {
  const dispatchEvent = (
    key: StoreKey<Persistable>,
    newValue: Persistable,
    oldValue: Persistable = null
  ) => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: keyPolicy.makeKey(key.ns, key.name, key.persistenceType),
        newValue: SuperJSON.stringify(newValue),
        oldValue: SuperJSON.stringify(oldValue),
        url: window.location.href,
      }),
    );
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    StrictStore.clear();
  });

  test('should not invoke the callback immediately upon subscription for a string key', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.stringKey);

    expect(callback).not.toHaveBeenCalled();
    unsub();
  });

  test('should not invoke the callback immediately upon subscription for a null key', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.nullKey);

    expect(callback).not.toHaveBeenCalled();
    unsub();
  });

  test('should ignore dispatched storage events that do not match the subscribed key', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.nullKey);

    dispatchEvent(keys.stringKey, 'someValue');

    expect(callback).not.toHaveBeenCalled();
    unsub();
  });

  test('should trigger the callback when a storage event with a matching null key is detected', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.nullKey);

    dispatchEvent(keys.nullKey, null);

    expect(callback).toHaveBeenCalled();
    unsub();
  });

  test('should trigger the callback when a storage event with a matching string key is detected', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.stringKey);

    dispatchEvent(keys.stringKey, 'new val');

    expect(callback).toHaveBeenCalled();
    unsub();
  });

  test('should cease callback execution for a null key after the unsubscription function is called', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.nullKey);
    unsub();

    dispatchEvent(keys.nullKey, 'new val');

    expect(callback).not.toHaveBeenCalled();
  });

  test('should cease callback execution for a string key after the unsubscription function is called', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.stringKey);
    unsub();

    dispatchEvent(keys.stringKey, 'new val');

    expect(callback).not.toHaveBeenCalled();
  });

  test('should provide a correctly mapped StoreEvent object for primitive value updates', () => {
    const callback = vi.fn((ev: StoreEvent) => {
      expect(ev).toEqual({
        oldValue: null,
        newValue: 'new val',
        url: expect.any(String),
        key: keys.stringKey,
        isTrusted: false,
        timestamp: expect.any(Number),
      });
    });

    const unsub = StrictStore.onChange(callback, keys.stringKey);

    dispatchEvent(keys.stringKey, 'new val');

    expect(callback).toHaveBeenCalled();
    unsub()
  });

  test('should provide a correctly mapped StoreEvent object with deserialized complex data structures', () => {
    const callback = vi.fn((ev: StoreEvent) => {
      expect(ev).toEqual({
        oldValue: null,
        newValue: {
          name: 'StrictStore',
          tags: ['storage', 'area'],
        },
        url: expect.any(String),
        key: keys.objectWithArray,
        isTrusted: false,
        timestamp: expect.any(Number),
      });
    });

    const unsub = StrictStore.onChange(callback, keys.objectWithArray);

    dispatchEvent(keys.objectWithArray, {
      name: 'StrictStore',
      tags: ['storage', 'area'],
    });

    expect(callback).toHaveBeenCalled();
    unsub()
  });

  test('should provide accurate state transitions and metadata when updating complex objects', () => {
    const callback = vi.fn();

    const unsub = StrictStore.onChange(callback, keys.objectWithArray);

    dispatchEvent(keys.objectWithArray, {
      name: 'old val',
      tags: ['old', 'val'],
    });

    dispatchEvent(
      keys.objectWithArray,
      {
        name: 'new val',
        tags: ['new val'],
      },
      {
        name: 'old val',
        tags: ['old', 'val'],
      },
    );

    expect(callback).toHaveBeenCalled();

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: keys.objectWithArray,
        oldValue: {
          name: 'old val',
          tags: ['old', 'val'],
        },
        newValue: {
          name: 'new val',
          tags: ['new val'],
        },
        isTrusted: false,
        timestamp: expect.any(Number),
        url: expect.any(String),
      }),
    );

    unsub();
  });
});
