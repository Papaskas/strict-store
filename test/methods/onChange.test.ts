import { StrictStore } from 'strict-store';
import type { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key.entity';
import { keyPolicy } from '@core/policies/key.policy';
import { createKey } from '@strict-store/app/create-key';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('OnChange method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  describe('StrictStore.onChange', () => {
    // Auxiliary function for simulating StorageEvent
    const fireStorageEvent = <T extends Persistable>(
      key: StoreKey<T>,
      newValue: T,
      oldValue: T,
    ) => {
      const storageKey = keyPolicy.makeKey(key.ns, key.name);
      const storageArea = key.storeType === 'local' ? localStorage : sessionStorage;

      const serialize = (v: Persistable) =>
        v === null ? null : typeof v === 'string' ? v : JSON.stringify(v);

      const event = new StorageEvent('storage', {
        key: storageKey,
        newValue: serialize(newValue),
        oldValue: serialize(oldValue),
        storageArea,
      });

      window.dispatchEvent(event);
    };

    it('calls callback on storage event for strict-store key (no target)', () => {
      const key = createKey<{ foo: string }>('ns', 'k', 'local');
      const oldVal = { foo: 'old' };
      const newVal = { foo: 'new' };

      let called = false;
      StrictStore.save(key, oldVal);

      const unsubscribe = StrictStore.onChange((changedKey, newValue, oldValue) => {
        called = true;
        expect(changedKey).toEqual({
          ns: key.ns,
          name: key.name,
          storeType: key.storeType,
          __type: undefined,
        });
        expect(newValue).toEqual(newVal);
        expect(oldValue).toEqual(oldVal);
        expect(changedKey.storeType).toBe('local');
      });

      fireStorageEvent(key, newVal, oldVal);

      expect(called).toBe(true);
      unsubscribe();
    });

    it('does not call callback for non-strict-store key', () => {
      let called = false;
      const unsubscribe = StrictStore.onChange(() => {
        called = true;
      });

      const event = new StorageEvent('storage', {
        key: 'randomKey',
        newValue: '1',
        oldValue: '2',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(called).toBe(false);
      unsubscribe();
    });

    it('filters by namespace (string target)', () => {
      const key1 = createKey<string>('ns1', 'k1', 'local');
      const key2 = createKey<string>('ns2', 'k2', 'local');

      let called = false;
      const unsubscribe = StrictStore.onChange(
        (changedKey) => {
          expect(changedKey.ns).toBe('ns1');
          called = true;
        },
        ['ns1'],
      );

      fireStorageEvent(key2, 'foo', 'bar');
      expect(called).toBe(false);

      fireStorageEvent(key1, 'baz', 'foo');
      expect(called).toBe(true);

      unsubscribe();
    });

    it('filters by array of namespaces (string[] target)', () => {
      const key1 = createKey<string>('ns1', 'k1', 'local');
      const key2 = createKey<string>('ns2', 'k2', 'local');
      const key3 = createKey<string>('ns3', 'k3', 'local');

      const seen: string[] = [];
      const unsubscribe = StrictStore.onChange(
        (changedKey) => seen.push(changedKey.ns),
        ['ns1', 'ns3'],
      );

      fireStorageEvent(key1, 'v1', null);
      fireStorageEvent(key2, 'v2', null);
      fireStorageEvent(key3, 'v3', null);

      expect(seen).toEqual(['ns1', 'ns3']);
      unsubscribe();
    });

    it('filters by StoreKey (single key target)', () => {
      const key1 = createKey<string>('ns', 'k1', 'local');
      const key2 = createKey<string>('ns', 'k2', 'local');

      let called = false;
      const unsubscribe = StrictStore.onChange(
        (changedKey) => {
          expect(changedKey.name).toBe('k1');
          called = true;
        },
        [key1],
      );

      fireStorageEvent(key2, 'foo', 'bar');
      expect(called).toBe(false);

      fireStorageEvent(key1, 'baz', 'foo');
      expect(called).toBe(true);

      unsubscribe();
    });

    it('filters by array of StoreKeys (StoreKey[] target)', () => {
      const key1 = createKey<string>('ns', 'k1', 'local');
      const key2 = createKey<string>('ns', 'k2', 'local');
      const key3 = createKey<string>('ns', 'k3', 'local');

      const seen: string[] = [];
      const unsubscribe = StrictStore.onChange(
        (changedKey) => seen.push(changedKey.name),
        [key1, key3],
      );

      fireStorageEvent(key1, 'new1', 'v1');
      fireStorageEvent(key2, 'new2', 'v2');
      fireStorageEvent(key3, 'new3', 'v3');

      expect(seen).toEqual(['k1', 'k3']);
      unsubscribe();
    });

    it('unsubscribes correctly', () => {
      const key = createKey<string>('ns', 'k', 'local');
      let called = false;
      const unsubscribe = StrictStore.onChange(() => {
        called = true;
      }, [key]);

      unsubscribe();

      fireStorageEvent(key, 'foo', 'bar');
      expect(called).toBe(false);
    });

    it('unsubscribes correctly with namespace', () => {
      const key = createKey<string>('ns', 'k', 'local');
      let called = false;
      const unsubscribe = StrictStore.onChange(() => {
        called = true;
      }, ['ns']);

      unsubscribe();

      fireStorageEvent(key, 'foo', 'bar');
      expect(called).toBe(false);
    });

    it('does not call callback for keys not in the filter', () => {
      const key1 = createKey<string>('ns', 'k1', 'local');
      const key2 = createKey<string>('ns', 'k2', 'local');

      let called = false;
      const unsubscribe = StrictStore.onChange(() => {
        called = true;
      }, [key1]);

      fireStorageEvent(key2, 'foo', 'bar');
      expect(called).toBe(false);

      unsubscribe();
    });
  });
});
