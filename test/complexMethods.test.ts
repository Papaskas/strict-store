import { StrictStore, createKey } from '@src/strict-store';
import { StoreKey, Serializable } from '@src/types';
import { getFullName } from '@src/utils';

describe('Complex methods', () => {
  beforeEach(() => {
    StrictStore.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('merge method', () => {
    test('should merge partial object into existing object', () => {
      const userKey = createKey<{ name: string; age: number; email?: string }>('test-ns', 'user');
      StrictStore.save(userKey, { name: 'Ivan', age: 30 });

      StrictStore.merge(userKey, { age: 31, email: 'ivan@example.com' });

      expect(StrictStore.get(userKey)).toEqual({
        name: 'Ivan',
        age: 31,
        email: 'ivan@example.com'
      });
    });

    test('should set value if no value exists', () => {
      const userKey = createKey<{ name: string; age: number }>('test-ns', 'user2');
      expect(StrictStore.get(userKey)).toBe(null);

      expect(() => {
        StrictStore.merge(userKey, { name: 'Ivan' });
      }).toThrow('StrictStore.merge: Cannot initialize the object. Use StrictStore.save for initial value.');
    });

    test('should throw if trying to merge into non-object', () => {
      const numberKey = createKey<number>('test-ns', 'num');
      StrictStore.save(numberKey, 123);

      expect(() => {
        // @ts-expect-error
        StrictStore.merge(numberKey, { foo: 'bar' });
      }).toThrow('StrictStore.merge: Can only merge into plain objects');
    });

    test('should merge only provided fields (shallow merge)', () => {
      const objKey = createKey<{ a: number; b: { c: number; d: number } }>('test-ns', 'shallow');
      StrictStore.save(objKey, { a: 1, b: { c: 2, d: 3 } });

      StrictStore.merge(objKey, { b: { c: 99 } });

      expect(StrictStore.get(objKey)).toEqual({ a: 1, b: { c: 99, d: 3 } });
    });

    test('should merge object with array property', () => {
      const arrKey = createKey<{ name: string; tags: string[] }>('test-ns', 'arr');
      StrictStore.save(arrKey, { name: 'Alex', tags: ['ts', 'storage'] });

      StrictStore.merge(arrKey, { tags: ['typescript', 'store', 'util'] });

      expect(StrictStore.get(arrKey)).toEqual({ name: 'Alex', tags: ['typescript', 'store', 'util'] });
    });

    test('should merge object with Set property', () => {
      const setKey = createKey<{ name: string; roles: Set<string> }>('test-ns', 'set');
      StrictStore.save(setKey, { name: 'Bob', roles: new Set(['admin', 'user']) });

      StrictStore.merge(setKey, { roles: new Set(['editor']) });

      const result = StrictStore.get(setKey);
      expect(result?.name).toBe('Bob');
      expect(result?.roles instanceof Set).toBe(true);
      expect(Array.from(result!.roles)).toEqual(['editor']);
    });

    test('should merge object with Map property', () => {
      const mapKey = createKey<{ name: string; scores: Map<string, number> }>('test-ns', 'map');
      StrictStore.save(mapKey, { name: 'Carl', scores: new Map([['math', 5], ['eng', 4]]) });

      StrictStore.merge(mapKey, { scores: new Map([['fr', 4], ['sci', 3]]) });

      const result = StrictStore.get(mapKey);
      expect(result?.name).toBe('Carl');
      expect(result?.scores instanceof Map).toBe(true);
      expect(Array.from(result!.scores.entries())).toEqual([
        ['fr', 4],
        ['sci', 3]
      ]);
    });

    test('should merge deeply nested object with array and set', () => {
      const complexKey = createKey<{
        user: {
          name: string;
          tags: string[];
          permissions: Set<string>;
        }
      }>('test-ns', 'complex');

      StrictStore.save(complexKey, {
        user: {
          name: 'Dina',
          tags: ['a', 'b'],
          permissions: new Set(['read'])
        }
      });

      StrictStore.merge(complexKey, {
        user: {
          tags: ['c'],
          permissions: new Set(['write'])
        }
      });

      const result = StrictStore.get(complexKey);
      expect(result?.user.name).toBe('Dina');
      expect(result?.user.tags).toEqual(['c']);
      expect(result?.user.permissions instanceof Set).toBe(true);
      expect(Array.from(result!.user.permissions)).toEqual(['write']);
    });

  });

  describe('forEach method', () => {
    test('should iterate over all StrictStore-managed keys in both storages', () => {
      const key1 = createKey<string>('ns1', 'k1', 'local');
      const key2 = createKey<number>('ns2', 'k2', 'session');
      const key3 = createKey<boolean>('ns1', 'k3', 'local');

      StrictStore.save(key1, 'foo');
      StrictStore.save(key2, 42);
      StrictStore.save(key3, true);

      const seen: Array<{ key: string; value: unknown; storageType: string }> = [];
      StrictStore.forEach((key, value, storageType) => {
        seen.push({ key, value, storageType });
      });

      // We check that all the keys are found
      expect(seen).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: expect.stringContaining('/ns1:k1'), value: 'foo', storageType: 'local' }),
          expect.objectContaining({ key: expect.stringContaining('/ns2:k2'), value: 42, storageType: 'session' }),
          expect.objectContaining({ key: expect.stringContaining('/ns1:k3'), value: true, storageType: 'local' }),
        ])
      );
      expect(seen.length).toBe(3);
    });

    test('should filter by namespace if ns is provided', () => {
      const key1 = createKey<string>('ns1', 'k1', 'local');
      const key2 = createKey<number>('ns2', 'k2', 'session');
      const key3 = createKey<boolean>('ns1', 'k3', 'local');

      StrictStore.save(key1, 'foo');
      StrictStore.save(key2, 42);
      StrictStore.save(key3, true);

      const seen: Array<{ key: string; value: unknown; storageType: string }> = [];
      StrictStore.forEach((key, value, storageType) => {
        seen.push({ key, value, storageType });
      }, 'ns1');

      // There should only be keys with ns1
      expect(seen.length).toBe(2);
      expect(seen.every(item => item.key.includes('/ns1:'))).toBe(true);
    });

    test('should not call callback for non-StrictStore keys', () => {
      localStorage.setItem('randomKey', '123');
      sessionStorage.setItem('anotherKey', '456');

      const key = createKey<string>('ns', 'k', 'local');
      StrictStore.save(key, 'foo');

      const seen: string[] = [];
      StrictStore.forEach((key) => seen.push(key));

      // only one key needs to be found
      expect(seen.length).toBe(1);
      expect(seen[0]).toContain('/ns:k');
    });

    test('should correctly pass storageType argument', () => {
      const keyLocal = createKey<string>('ns', 'local', 'local');
      const keySession = createKey<string>('ns', 'session', 'session');
      StrictStore.save(keyLocal, 'l');
      StrictStore.save(keySession, 's');

      const types: string[] = [];
      StrictStore.forEach((_, __, storageType) => types.push(storageType));

      expect(types).toEqual(expect.arrayContaining(['local', 'session']));
      expect(types.length).toBe(2);
    });
  });

  describe('StrictStore.onChange', () => {
    // Auxiliary function for simulating StorageEvent
    const fireStorageEvent = <T extends Serializable>(
      key: StoreKey<T>,
      newValue: T,
      oldValue: T,
    ) => {
      const storageKey = getFullName(key.ns, key.name);
      const storageArea = key.storeType === 'local' ? localStorage : sessionStorage;

      const serialize = (v: Serializable) =>
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

      const unsubscribe = StrictStore.onChange((changedKey, newValue, oldValue, storageType) => {
        called = true;
        expect(changedKey).toEqual({
          ns: key.ns,
          name: key.name,
          storeType: key.storeType,
          __type: undefined
        });
        expect(newValue).toEqual(newVal);
        expect(oldValue).toEqual(oldVal);
        expect(storageType).toBe('local');
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
      const unsubscribe = StrictStore.onChange((changedKey) => {
        expect(changedKey.ns).toBe('ns1');
        called = true;
      }, ['ns1']);

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
        ['ns1', 'ns3']
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
        [key1]
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
        [key1, key3]
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
})
