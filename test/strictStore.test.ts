import { StrictStore, createKey } from '@src/strict-store';
import { keys } from '@test/keys';
import { Persistable, StoreKey } from '@src/@types';

describe('StrictStore', () => {
  beforeEach(() => {
    StrictStore.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  const expectType = <const T>(_value: T) => {}

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
      StrictStore.remove([keys.stringKey]);
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
      const nullKey = createKey<null>('basic', 'null');
      StrictStore.save(nullKey, null);
      expect(StrictStore.get(nullKey)).toBe(null);
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
      StrictStore.remove([keys.stringKey]);
      expect(StrictStore.get(keys.stringKey)).toBe(null);
      expect(StrictStore.get(keys.numberKey)).toBe(2);
    });

    test('does not throw when removing non-existent key', () => {
      expect(() => StrictStore.remove([keys.stringKey])).not.toThrow();
    });

    test('does not throw when getting non-existent key', () => {
      expect(() => StrictStore.get(keys.stringKey)).not.toThrow();
    });
  });

  describe('StrictStore.has', () => {
    test('returns false for non-existent single key', () => {
      expect(StrictStore.has(keys.stringKey)).toBe(false);
    });

    test('returns true for existing single key', () => {
      StrictStore.save(keys.stringKey, 'test');
      expect(StrictStore.has(keys.stringKey)).toBe(true);
    });

    test('returns correct array for multiple keys (all exist)', () => {
      StrictStore.save(keys.stringKey, 'test');
      StrictStore.save(keys.numberKey, 42);
      expect(StrictStore.has([keys.stringKey, keys.numberKey])).toEqual([true, true]);
    });

    test('returns correct array for multiple keys (some exist, some not)', () => {
      StrictStore.save(keys.stringKey, 'test');
      expect(StrictStore.has([keys.stringKey, keys.numberKey])).toEqual([true, false]);
    });

    test('returns correct array for multiple keys (none exist)', () => {
      expect(StrictStore.has([keys.stringKey, keys.numberKey])).toEqual([false, false]);
    });

    test('returns empty array for empty input array', () => {
      expect(StrictStore.has([])).toEqual([]);
    });

    test('works with keys from different storage types', () => {
      StrictStore.save(keys.stringKey, 'test');
      StrictStore.save(keys.booleanKey, true); // session storage
      expect(StrictStore.has([keys.stringKey, keys.booleanKey])).toEqual([true, true]);
      StrictStore.remove([keys.stringKey]);
      expect(StrictStore.has([keys.stringKey, keys.booleanKey])).toEqual([false, true]);
    });

    test('does not throw for keys that were never saved', () => {
      expect(() => StrictStore.has(keys.enumKey)).not.toThrow();
      expect(() => StrictStore.has([keys.enumKey, keys.literalKey])).not.toThrow();
    });
  });

  describe('StrictStore.remove', () => {
    const localKey1 = createKey<string>('ns1', 'k1', 'local');
    const localKey2 = createKey<number>('ns1', 'k2', 'local');
    const sessionKey1 = createKey<boolean>('ns2', 'k3', 'session');
    const sessionKey2 = createKey<string>('ns2', 'k4', 'session');

    test('removes a single key from localStorage', () => {
      StrictStore.save(localKey1, 'foo');
      expect(StrictStore.get(localKey1)).toBe('foo');
      StrictStore.remove([localKey1]);
      expect(StrictStore.get(localKey1)).toBe(null);
    });

    test('removes a single key from sessionStorage', () => {
      StrictStore.save(sessionKey1, true);
      expect(StrictStore.get(sessionKey1)).toBe(true);
      StrictStore.remove([sessionKey1]);
      expect(StrictStore.get(sessionKey1)).toBe(null);
    });

    test('removes multiple keys from both storages', () => {
      StrictStore.save(localKey1, 'foo');
      StrictStore.save(localKey2, 123);
      StrictStore.save(sessionKey1, false);
      StrictStore.save(sessionKey2, 'bar');

      StrictStore.remove([localKey1, sessionKey2]);
      expect(StrictStore.get(localKey1)).toBe(null);
      expect(StrictStore.get(sessionKey2)).toBe(null);
      expect(StrictStore.get(localKey2)).toBe(123);
      expect(StrictStore.get(sessionKey1)).toBe(false);
    });

    test('removing a non-existent key does not throw and is silent', () => {
      expect(() => StrictStore.remove([localKey1])).not.toThrow();
      expect(StrictStore.get(localKey1)).toBe(null);
    });

    test('removing an empty array does nothing', () => {
      StrictStore.save(localKey1, 'foo');
      StrictStore.remove([]);
      expect(StrictStore.get(localKey1)).toBe('foo');
    });

    test('removing all keys clears the store', () => {
      StrictStore.save(localKey1, 'foo');
      StrictStore.save(localKey2, 45);
      StrictStore.save(sessionKey1, true);
      StrictStore.save(sessionKey2, 'baz');

      StrictStore.remove([localKey1, localKey2, sessionKey1, sessionKey2]);
      expect(StrictStore.size()).toBe(0);
      expect(StrictStore.get(localKey1)).toBe(null);
      expect(StrictStore.get(localKey2)).toBe(null);
      expect(StrictStore.get(sessionKey1)).toBe(null);
      expect(StrictStore.get(sessionKey2)).toBe(null);
    });
  });

  describe('StrictStore.size', () => {
    test('returns 0 when store is empty', () => {
      expect(StrictStore.size()).toBe(0);
      expect(StrictStore.size([])).toBe(0);
      expect(StrictStore.size(['user'])).toBe(0);
    });

    test('returns correct size for all namespaces', () => {
      StrictStore.save(keys.stringKey, 'test');
      StrictStore.save(keys.numberKey, 42);
      StrictStore.save(keys.booleanKey, true);
      expect(StrictStore.size()).toBe(3);
    });

    test('returns correct size for single namespace', () => {
      const userKey1 = createKey<string>('user', 'name');
      const userKey2 = createKey<number>('user', 'age');
      const settingsKey = createKey<string>('settings', 'theme');

      StrictStore.save(userKey1, 'Alice');
      StrictStore.save(userKey2, 30);
      StrictStore.save(settingsKey, 'dark');

      expect(StrictStore.size(['user'])).toBe(2);
      expect(StrictStore.size(['settings'])).toBe(1);
      expect(StrictStore.size(['user', 'settings'])).toBe(3);
    });

    test('returns 0 for non-existent namespace', () => {
      StrictStore.save(keys.stringKey, 'test');
      expect(StrictStore.size(['nonexistent'])).toBe(0);
    });

    test('returns correct size for multiple namespaces', () => {
      const userKey = createKey<string>('user', 'name');
      const settingsKey = createKey<string>('settings', 'theme');
      const appKey = createKey<number>('app', 'counter');

      StrictStore.save(userKey, 'Bob');
      StrictStore.save(settingsKey, 'light');
      StrictStore.save(appKey, 7);

      expect(StrictStore.size(['user', 'settings'])).toBe(2);
      expect(StrictStore.size(['user', 'app'])).toBe(2);
      expect(StrictStore.size(['settings', 'app'])).toBe(2);
      expect(StrictStore.size(['user', 'settings', 'app'])).toBe(3);
    });

    test('works with both localStorage and sessionStorage', () => {
      const localKey = createKey<string>('local', 'foo', 'local');
      const sessionKey = createKey<string>('session', 'bar', 'session');
      StrictStore.save(localKey, 'l');
      StrictStore.save(sessionKey, 's');

      expect(StrictStore.size(['local'])).toBe(1);
      expect(StrictStore.size(['session'])).toBe(1);
      expect(StrictStore.size(['local', 'session'])).toBe(2);
      expect(StrictStore.size()).toBe(2);
    });

    test('returns 0 for empty ns array', () => {
      StrictStore.save(keys.stringKey, 'test');
      expect(StrictStore.size([])).toBe(0);
    });
  });

  describe('StrictStore.clear', () => {
    test('clears all strict-store keys when called without arguments', () => {
      const key1 = createKey<string>('ns1', 'k1');
      const key2 = createKey<number>('ns2', 'k2');
      StrictStore.save(key1, 'v1');
      StrictStore.save(key2, 2);

      expect(StrictStore.size()).toBe(2);

      StrictStore.clear();

      expect(StrictStore.size()).toBe(0);
      expect(StrictStore.get(key1)).toBe(null);
      expect(StrictStore.get(key2)).toBe(null);
    });

    test('clears only specified namespace', () => {
      const key1 = createKey<string>('ns1', 'k1');
      const key2 = createKey<number>('ns2', 'k2');
      StrictStore.save(key1, 'v1');
      StrictStore.save(key2, 2);

      StrictStore.clear(['ns1']);

      expect(StrictStore.get(key1)).toBe(null);
      expect(StrictStore.get(key2)).toBe(2);
      expect(StrictStore.size()).toBe(1);
    });

    test('clears multiple namespaces', () => {
      const key1 = createKey<string>('ns1', 'k1');
      const key2 = createKey<number>('ns2', 'k2');
      const key3 = createKey<boolean>('ns3', 'k3');
      StrictStore.save(key1, 'v1');
      StrictStore.save(key2, 2);
      StrictStore.save(key3, true);

      StrictStore.clear(['ns1', 'ns3']);

      expect(StrictStore.get(key1)).toBe(null);
      expect(StrictStore.get(key2)).toBe(2);
      expect(StrictStore.get(key3)).toBe(null);
      expect(StrictStore.size()).toBe(1);
    });

    test('does nothing if empty array is passed', () => {
      const key1 = createKey<string>('ns1', 'k1');
      StrictStore.save(key1, 'v1');
      StrictStore.clear([]);
      expect(StrictStore.get(key1)).toBe('v1');
      expect(StrictStore.size()).toBe(1);
    });

    test('does not remove non-strict-store keys', () => {
      localStorage.setItem('foreign', 'value');
      StrictStore.save(keys.stringKey, 'test');
      StrictStore.clear();
      expect(localStorage.getItem('foreign')).toBe('value');
    });
  });

  describe('StrictStore.pick', () => {
    const stringKey = createKey<string>('ns', 'str');
    const numberKey = createKey<number>('ns', 'num');
    const boolKey = createKey<boolean>('ns', 'bool');
    const sessionKey = createKey<string>('ns', 'session', 'session');
    const ns2Key = createKey<number>('other', 'foo');

    test('returns correct values for existing keys', () => {
      StrictStore.save(stringKey, 'hello');
      StrictStore.save(numberKey, 42);
      StrictStore.save(boolKey, true);

      const [str, num, bool] = StrictStore.pick([stringKey, numberKey, boolKey]);
      expect(str).toBe('hello');
      expect(num).toBe(42);
      expect(bool).toBe(true);
    });

    test('returns null for missing keys', () => {
      StrictStore.save(stringKey, 'hello');
      const [str, num, bool] = StrictStore.pick([stringKey, numberKey, boolKey]);
      expect(str).toBe('hello');
      expect(num).toBe(null);
      expect(bool).toBe(null);
    });

    test('works with keys from different namespaces', () => {
      StrictStore.save(stringKey, 'foo');
      StrictStore.save(ns2Key, 99);

      const [v1, v2] = StrictStore.pick([stringKey, ns2Key]);
      expect(v1).toBe('foo');
      expect(v2).toBe(99);
    });

    test('works with keys from different storage types', () => {
      StrictStore.save(stringKey, 'foo');
      StrictStore.save(sessionKey, 'bar');

      const [localVal, sessionVal] = StrictStore.pick([stringKey, sessionKey]);
      expect(localVal).toBe('foo');
      expect(sessionVal).toBe('bar');
    });

    test('returns empty array for empty input', () => {
      expect(StrictStore.pick([])).toEqual([]);
    });

    test('returns all nulls for all missing keys', () => {
      const [a, b] = StrictStore.pick([stringKey, numberKey]);
      expect(a).toBe(null);
      expect(b).toBe(null);
    });

    test('type safety: tuple preserves types', () => {
      StrictStore.save(stringKey, 'abc');
      StrictStore.save(numberKey, 123);

      const result = StrictStore.pick([stringKey, numberKey]);
      expectType<readonly [string | null, number | null]>(result);
      // Runtime check
      expect(result).toEqual(['abc', 123]);
    });

    test('type safety: error if key is not StoreKey', () => {
      // @ts-expect-error
      StrictStore.pick([{ ns: 'x', name: 'y', storeType: 'local' }]);
    });

    test('type safety: error if array contains non-StoreKey', () => {
      // @ts-expect-error
      StrictStore.pick([stringKey, { ns: 'x', name: 'y', storeType: 'local' }]);
    });
  });

  describe('StrictStore.saveMany', () => {
    const stringKey = createKey<string>('test', 'str');
    const numberKey = createKey<number>('test', 'num');
    const boolKey = createKey<boolean>('test', 'bool');
    const objKey = createKey<{ a: number; b: string }>('test', 'obj');
    const ns2Key = createKey<string>('other', 'foo');

    test('saves multiple key-value pairs of different types', () => {
      StrictStore.saveMany([
        [stringKey, 'hello'],
        [numberKey, 42],
        [boolKey, true],
        [objKey, { a: 1, b: 'x' }],
      ]);

      expect(StrictStore.get(stringKey)).toBe('hello');
      expect(StrictStore.get(numberKey)).toBe(42);
      expect(StrictStore.get(boolKey)).toBe(true);
      expect(StrictStore.get(objKey)).toEqual({ a: 1, b: 'x' });
    });

    test('saves keys from different namespaces', () => {
      StrictStore.saveMany([
        [stringKey, 'foo'],
        [ns2Key, 'bar'],
      ]);
      expect(StrictStore.get(stringKey)).toBe('foo');
      expect(StrictStore.get(ns2Key)).toBe('bar');
    });

    test('overwrites previous values', () => {
      StrictStore.save(stringKey, 'old');
      StrictStore.saveMany([
        [stringKey, 'new'],
        [numberKey, 100],
      ]);
      expect(StrictStore.get(stringKey)).toBe('new');
      expect(StrictStore.get(numberKey)).toBe(100);
    });

    test('works with empty array', () => {
      expect(() => StrictStore.saveMany([])).not.toThrow();
      expect(StrictStore.size()).toBe(0);
    });

    test('type safety: error if value does not match key type', () => {
      // @ts-expect-error
      StrictStore.saveMany([[stringKey, 123]]);
      // @ts-expect-error
      StrictStore.saveMany([[numberKey, 'not a number']]);
      // @ts-expect-error
      StrictStore.saveMany([[objKey, { a: 'wrong', b: 2 }]]);
    });

    test('type safety: error if key is not StoreKey', () => {
      // @ts-expect-error
      StrictStore.saveMany([[{ ns: 'x', name: 'y', storeType: 'local' }, 'foo']]);
    });
  });

  describe('StrictStore.getAll', () => {
    const localKey = createKey<string>('ns1', 'local', 'local');
    const sessionKey = createKey<number>('ns1', 'session', 'session');
    const ns2Key = createKey<boolean>('ns2', 'flag', 'local');

    it('returns empty array when store is empty', () => {
      expect(StrictStore.getAll()).toEqual([]);
    });

    it('returns all stored items with correct structure', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);
      StrictStore.save(ns2Key, true);

      const all = StrictStore.getAll();

      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(3);

      const localEntry = all.find(e => e.key.ns === 'ns1' && e.key.name === 'local');
      const sessionEntry = all.find(e => e.key.ns === 'ns1' && e.key.name === 'session');
      const ns2Entry = all.find(e => e.key.ns === 'ns2' && e.key.name === 'flag');

      expect(localEntry).toMatchObject({
        key: expect.objectContaining({ ns: 'ns1', name: 'local', storeType: 'local' }),
        value: 'foo',
        storageType: 'local'
      });
      expect(sessionEntry).toMatchObject({
        key: expect.objectContaining({ ns: 'ns1', name: 'session', storeType: 'session' }),
        value: 42,
        storageType: 'session'
      });
      expect(ns2Entry).toMatchObject({
        key: expect.objectContaining({ ns: 'ns2', name: 'flag', storeType: 'local' }),
        value: true,
        storageType: 'local'
      });
    });

    it('filters by namespace', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);
      StrictStore.save(ns2Key, true);

      const ns1 = StrictStore.getAll(['ns1']);
      expect(ns1.length).toBe(2);
      expect(ns1.every(e => e.key.ns === 'ns1')).toBe(true);

      const ns2 = StrictStore.getAll(['ns2']);
      expect(ns2.length).toBe(1);
      expect(ns2[0].key.ns).toBe('ns2');
      expect(ns2[0].value).toBe(true);
    });

    it('returns correct storageType for each entry', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);

      const all = StrictStore.getAll();
      const local = all.find(e => e.key.name === 'local');
      const session = all.find(e => e.key.name === 'session');

      expect(local?.storageType).toBe('local');
      expect(session?.storageType).toBe('session');
    });

    it('returns only items from specified namespaces', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);
      StrictStore.save(ns2Key, true);

      const filtered = StrictStore.getAll(['ns2']);
      expect(filtered.length).toBe(1);
      expect(filtered[0].key.ns).toBe('ns2');
      expect(filtered[0].value).toBe(true);
    });

    it('returns empty array for non-existent namespace', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);

      const result = StrictStore.getAll(['doesnotexist']);
      expect(result).toEqual([]);
    });

    it('returns empty array for empty namespace array', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);

      const result = StrictStore.getAll([]);
      expect(result).toEqual([]);
    });

    it('correctly handles multiple namespaces', () => {
      StrictStore.save(localKey, 'foo');
      StrictStore.save(sessionKey, 42);
      StrictStore.save(ns2Key, true);

      const result = StrictStore.getAll(['ns1', 'ns2']);
      expect(result.length).toBe(3);
      const ns1Count = result.filter(e => e.key.ns === 'ns1').length;
      const ns2Count = result.filter(e => e.key.ns === 'ns2').length;
      expect(ns1Count).toBe(2);
      expect(ns2Count).toBe(1);
    });
  });

  describe('createKey correct working', () => {
    test('should throw an exception if the name or ns is incorrect.', () => {
      const nsKey = () => createKey('ans:dassda', 'name')
      const nameKey = () => createKey('namespace', 'nam:e')

      expect(nameKey).toThrow('Namespace and name must not contain the ":" character.');
      expect(nsKey).toThrow('Namespace and name must not contain the ":" character.');
    });

    test('should throw an exception if the ns or name is empty.', () => {
      const nsKey = () => createKey('', 'name',)
      const nameKey = () => createKey('ns', '',)

      expect(nsKey).toThrow('The name or namespace cannot be empty.');
      expect(nameKey).toThrow('The name or namespace cannot be empty.');
    });

    test('createKey return correct type', () => {
      const key = createKey<string>('namespace', 'name');
      const key2 = createKey<{ key: string; value: number; }>('namespace', 'name');

      expectType<StoreKey<string>>(key)
      expectType<StoreKey<{ key: string, value: number }>>(key2)
    });
  })

  describe('StrictStore supported types', () => {
    const strictTest = <T extends StoreKey<Persistable>>(key: T, value: T['__type']) => {
      expect(StrictStore.get(key)).toStrictEqual(null);
      StrictStore.save(key, value);
      const result = StrictStore.get(key);

      // For Map/Set/TypedArray, compare by value, not reference
      if (value instanceof Map) {
        expect(result instanceof Map).toBe(true);
        expect(Array.from(result as Map<any, any>)).toEqual(Array.from(value));

      } else if (value instanceof Set) {
        expect(result instanceof Set).toBe(true);
        expect(Array.from(result as Set<any>)).toEqual(Array.from(value));

      } else if (
        ArrayBuffer.isView(value) &&
        Object.getPrototypeOf(value).constructor !== Array

      ) {
        expect(result?.constructor).toBe(value.constructor);
        expect(Array.from(result as any)).toEqual(Array.from(value as any));
      } else {
        expect(result).toStrictEqual(value);
      }
    };

    test('string', () => {
      const key = createKey<string>('types', 'string');
      strictTest(key, 'hello world');
    });

    test('number', () => {
      const key = createKey<number>('types', 'number');
      strictTest(key, 123.456);
    });

    test('boolean', () => {
      const key = createKey<boolean>('types', 'boolean');
      strictTest(key, true);
    });

    test('null', () => {
      const key = createKey<null>('types', 'null');
      strictTest(key, null);
    });

    test('plain object', () => {
      const key = createKey<{ a: number; b: string }>('types', 'object');
      strictTest(key, { a: 1, b: 'test' });
    });

    test('empty object', () => {
      const key = createKey<{}>('types', 'empty-object');
      strictTest(key, {});
    });

    test('array of primitives', () => {
      const key = createKey<number[]>('types', 'array-num');
      strictTest(key, [1, 2, 3]);
    });

    test('empty array', () => {
      const key = createKey<[]>( 'types', 'empty-array');
      strictTest(key, []);
    });

    test('array of objects', () => {
      const key = createKey<Array<{ x: string }>>('types', 'array-obj');
      strictTest(key, [{ x: 'a' }, { x: 'b' }]);
    });

    test('enum (as string)', () => {
      enum Color { Red = 'red', Blue = 'blue' }
      const key = createKey<Color>('types', 'enum');
      strictTest(key, Color.Blue);
    });

    test('union', () => {
      const key = createKey<'a' | 'b' | null>('types', 'union');
      strictTest(key, 'a');

      expectType<'a' | 'b' | null>(StrictStore.get(key))
    });

    test('bigint', () => {
      const key = createKey<bigint>('types', 'bigint');
      strictTest(key, 12345678901234567890n);
    });

    test('Map<string, number>', () => {
      const key = createKey<Map<string, number>>('types', 'map');
      strictTest(key, new Map([['a', 1], ['b', 2]]));
    });

    test('empty Map', () => {
      const key = createKey<Map<any, any>>('types', 'empty-map');
      strictTest(key, new Map());
    });

    test('Set<string>', () => {
      const key = createKey<Set<string>>('types', 'set');
      strictTest(key, new Set(['x', 'y']));
    });

    test('empty Set', () => {
      const key = createKey<Set<any>>('types', 'empty-set');
      strictTest(key, new Set());
    });

    test('TypedArray: Int8Array', () => {
      const key = createKey<Int8Array>('types', 'int8');
      strictTest(key, new Int8Array([-128, 0, 127]));
    });

    test('TypedArray: Uint8Array', () => {
      const key = createKey<Uint8Array>('types', 'uint8');
      strictTest(key, new Uint8Array([0, 255]));
    });

    test('TypedArray: Uint8ClampedArray', () => {
      const key = createKey<Uint8ClampedArray>('types', 'clamped');
      strictTest(key, new Uint8ClampedArray([0, 128, 255]));
    });

    test('TypedArray: Int16Array', () => {
      const key = createKey<Int16Array>('types', 'int16');
      strictTest(key, new Int16Array([-32768, 0, 32767]));
    });

    test('TypedArray: Uint16Array', () => {
      const key = createKey<Uint16Array>('types', 'uint16');
      strictTest(key, new Uint16Array([0, 65535]));
    });

    test('TypedArray: Int32Array', () => {
      const key = createKey<Int32Array>('types', 'int32');
      strictTest(key, new Int32Array([-2147483648, 0, 2147483647]));
    });

    test('TypedArray: Uint32Array', () => {
      const key = createKey<Uint32Array>('types', 'uint32');
      strictTest(key, new Uint32Array([0, 4294967295]));
    });

    test('TypedArray: Float32Array', () => {
      const key = createKey<Float32Array>('types', 'float32');
      strictTest(key, new Float32Array([1.5, -2.5, 3.5]));
    });

    test('TypedArray: Float64Array', () => {
      const key = createKey<Float64Array>('types', 'float64');
      strictTest(key, new Float64Array([-2.987654321, 1.123456789]));
    });

    test('TypedArray: BigInt64Array', () => {
      const key = createKey<BigInt64Array>('types', 'bigint64');
      strictTest(key, new BigInt64Array([3n, 1n, -2n]));
    });

    test('TypedArray: BigUint64Array', () => {
      const key = createKey<BigUint64Array>('types', 'biguint64');
      strictTest(key, new BigUint64Array([3n, 1n, 2n]));
    });

    test('nested: Map inside object', () => {
      const key = createKey<{ m: Map<string, number> }>('types', 'obj-map');
      strictTest(key, { m: new Map([['a', 1]]) });
    });

    test('nested: Set inside array', () => {
      const key = createKey<Array<Set<number>>>('types', 'arr-set');
      strictTest(key, [new Set([1, 2]), new Set([3])]);
    });

    test('nested: Map with Set values', () => {
      const key = createKey<Map<string, Set<number>>>('types', 'map-set');
      strictTest(key, new Map([['a', new Set([1, 2])]]));
    });

    test('nested: Set with Map values', () => {
      const key = createKey<Set<Map<string, number>>>('types', 'set-map');
      strictTest(key, new Set([new Map([['x', 1]])]));
    });

    test('deeply nested structure', () => {
      const key = createKey<any>('types', 'deep-nested');
      const value = {
        arr: [new Set([1, 2]), new Map([['a', 1]])],
        obj: { map: new Map([['k', new Set([3, 4])]]) },
        big: 123n,
        typed: new Float32Array([1.1, 2.2]),
      };
      strictTest(key, value);
    });
  });

  describe('StrictStore JSON compatibility', () => {
    test('plain object: StrictStore matches JSON.stringify/parse', () => {
      const obj = { a: 1, b: 'test', c: true, d: null };
      const key = createKey<typeof obj>('json', 'plain-object');
      StrictStore.save(key, obj);

      const storeValue = StrictStore.get(key);
      const jsonValue = JSON.parse(JSON.stringify(obj));

      expect(storeValue).toEqual(jsonValue);
    });

    test('array: StrictStore matches JSON.stringify/parse', () => {
      const arr = [1, 'a', false, null, { x: 2 }];
      const key = createKey<typeof arr>('json', 'array');
      StrictStore.save(key, arr);

      const storeValue = StrictStore.get(key);
      const jsonValue = JSON.parse(JSON.stringify(arr));

      expect(storeValue).toEqual(jsonValue);
    });

    test('nested object: StrictStore matches JSON.stringify/parse', () => {
      const nested = {
        foo: [1, 2, { bar: 'baz', arr: [true, false] }],
        obj: { a: 1, b: { c: 2 } },
        empty: {},
        nil: null
      };
      const key = createKey<typeof nested>('json', 'nested');
      StrictStore.save(key, nested);

      const storeValue = StrictStore.get(key);
      const jsonValue = JSON.parse(JSON.stringify(nested));

      expect(storeValue).toEqual(jsonValue);
    });

    test('JSON-incompatible types are not strictly equal after JSON parse', () => {
      const map = new Map([['a', 1]]);
      const set = new Set([1, 2, 3]);
      const keyMap = createKey<Map<string, number>>('json', 'map');
      const keySet = createKey<Set<number>>('json', 'set');

      StrictStore.save(keyMap, map);
      StrictStore.save(keySet, set);

      const storeMap = StrictStore.get(keyMap);
      const storeSet = StrictStore.get(keySet);

      const jsonMap = JSON.parse(JSON.stringify(map));
      const jsonSet = JSON.parse(JSON.stringify(set));

      expect(storeMap).not.toEqual(jsonMap);
      expect(storeSet).not.toEqual(jsonSet);
      expect(storeMap instanceof Map).toBe(true);
      expect(storeSet instanceof Set).toBe(true);
    });

    test('StrictStore preserves types for JSON-compatible and incompatible values', () => {
      const obj = { a: 1, b: [2, 3], c: { d: 'x' } };
      const arr = [1, 2, 3];
      const map = new Map([['k', 42]]);
      const set = new Set(['a', 'b']);

      const keyObj = createKey<typeof obj>('json', 'obj');
      const keyArr = createKey<typeof arr>('json', 'arr');
      const keyMap = createKey<Map<string, number>>('json', 'map2');
      const keySet = createKey<Set<string>>('json', 'set2');

      StrictStore.save(keyObj, obj);
      StrictStore.save(keyArr, arr);
      StrictStore.save(keyMap, map);
      StrictStore.save(keySet, set);

      expect(StrictStore.get(keyObj)).toEqual(obj);
      expect(StrictStore.get(keyArr)).toEqual(arr);
      expect(StrictStore.get(keyMap)).toBeInstanceOf(Map);
      expect(StrictStore.get(keySet)).toBeInstanceOf(Set);
    });
  });

  describe('StrictStore namespaces operations', () => {
    beforeEach(() => {
      StrictStore.clear();
      localStorage.clear();
      sessionStorage.clear();
    });

    test('saves and retrieves value with correct namespace', () => {
      const key = createKey<string>('test-ns', 'string');
      StrictStore.save(key, 'key1');

      const valueFromStore = StrictStore.get(key);
      const valueFromStorage = localStorage.getItem('strict-store/test-ns:string');

      expect(valueFromStorage).not.toBe(null);
      expect(valueFromStore).toBe(JSON.parse(valueFromStorage!));
    });

    test('clear removes only keys from specified namespace', () => {
      const ns1Key1 = createKey<string>('ns1', 'key1');
      const ns1Key2 = createKey<string>('ns1', 'key2');
      const ns2Key = createKey<string>('ns2', 'key3');

      StrictStore.save(ns1Key1, 'value1');
      StrictStore.save(ns1Key2, 'value2');
      StrictStore.save(ns2Key, 'value3');

      StrictStore.clear(['ns1']);

      expect(StrictStore.get(ns1Key1)).toBe(null);
      expect(StrictStore.get(ns1Key2)).toBe(null);
      expect(StrictStore.get(ns2Key)).toBe('value3');
    });

    test('clear removes keys from multiple namespaces', () => {
      const ns1Key = createKey<string>('ns1', 'k1');
      const ns2Key = createKey<string>('ns2', 'k2');
      const ns3Key = createKey<string>('ns3', 'k3');

      StrictStore.save(ns1Key, 'v1');
      StrictStore.save(ns2Key, 'v2');
      StrictStore.save(ns3Key, 'v3');

      StrictStore.clear(['ns1', 'ns3']);

      expect(StrictStore.get(ns1Key)).toBe(null);
      expect(StrictStore.get(ns2Key)).toBe('v2');
      expect(StrictStore.get(ns3Key)).toBe(null);
    });

    test('clear does not remove keys from other namespaces', () => {
      const ns1Key = createKey<string>('ns1', 'k1');
      const ns2Key = createKey<string>('ns2', 'k2');

      StrictStore.save(ns1Key, 'v1');
      StrictStore.save(ns2Key, 'v2');

      StrictStore.clear(['ns1']);

      expect(StrictStore.get(ns1Key)).toBe(null);
      expect(StrictStore.get(ns2Key)).toBe('v2');
    });

    test('clear with empty array does nothing', () => {
      const ns1Key = createKey<string>('ns1', 'k1');
      StrictStore.save(ns1Key, 'v1');
      StrictStore.clear([]);
      expect(StrictStore.get(ns1Key)).toBe('v1');
    });

    test('clear with non-existent namespace does nothing', () => {
      const ns1Key = createKey<string>('ns1', 'k1');
      StrictStore.save(ns1Key, 'v1');
      StrictStore.clear(['doesnotexist']);
      expect(StrictStore.get(ns1Key)).toBe('v1');
    });

    test('clear with no arguments removes all strict-store keys', () => {
      const ns1Key = createKey<string>('ns1', 'k1');
      const ns2Key = createKey<string>('ns2', 'k2');
      StrictStore.save(ns1Key, 'v1');
      StrictStore.save(ns2Key, 'v2');
      StrictStore.clear();
      expect(StrictStore.get(ns1Key)).toBe(null);
      expect(StrictStore.get(ns2Key)).toBe(null);
    });

    test('does not remove non-strict-store keys from storage', () => {
      localStorage.setItem('foreign', 'value');
      const nsKey = createKey<string>('ns', 'k');
      StrictStore.save(nsKey, 'test');
      StrictStore.clear();
      expect(localStorage.getItem('foreign')).toBe('value');
    });
  });
});
