import { StrictStore, createKey } from '@src/strict-store';
import { keys } from '@test/keys';
import { Theme, User } from '@test/@types';
import { Serializable, StoreKey } from '@src/types';

describe('StrictStore', () => {
  beforeEach(() => {
    StrictStore.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  const strictTest = <T extends StoreKey<Serializable>>(key: T, value: T['__type']) => {
    expect(StrictStore.get(key)).toStrictEqual(null);

    StrictStore.save(key, value);
    expect(StrictStore.get(key)).toStrictEqual(value);
  }

  const expectType = <T>(_value: T) => {}

  describe('Basic operations', () => {
    test('should return `null` value when empty', () => {
      expect(StrictStore.get(keys.stringKey)).toBe(null);
    });

    test('should correct save and get this value', () => {
      StrictStore.save(keys.stringKey, 'save and get test');
      expect(StrictStore.get(keys.stringKey)).toBe('save and get test');
    });

    test('should correct removeAll method', () => {
      StrictStore.save(keys.stringKey, 'remove test');
      StrictStore.save(keys.numberKey, 45);

      expect(StrictStore.size()).toBe(2);

      StrictStore.remove([
        keys.stringKey,
        keys.numberKey,
        keys.booleanKey,
        keys.enumKey,
        keys.literalKey,
        keys.setKey,
      ]);

      expect(StrictStore.size()).toBe(0);
    });

    test('should correct pick method', () => {
      const themeKey = createKey<'light' | 'dark'>('app', 'theme');
      const langKey = createKey<'en' | 'ru'>('app', 'lang');

      StrictStore.save(themeKey, 'dark')
      StrictStore.save(langKey, 'en')

      const [theme, lang] = StrictStore.pick([themeKey, langKey]);

      expectType<'light' | 'dark' | null>(theme)
      expectType<'en' | 'ru' | null>(lang)

      expect(theme).toBe('dark');
      expect(lang).toBe('en');
    });

    test('should set and get primitive values', () => {
      new Map<StoreKey<Serializable>, Serializable>([
        [keys.stringKey, 'test primitive value'],
        [keys.booleanKey, false],
        [keys.numberKey, 141],
        [keys.nullableStringKey, null],
        [keys.bigIntKey, 98741954896215948924132156489498412315618948941321532156489748915618949484n],
      ]).forEach((value, key) => {
        strictTest(
          key,
          value,
        )
      })
    });

    test('should remove items and get default value', () => {
      StrictStore.save(keys.stringKey, 'remove value');
      expect(StrictStore.get(keys.stringKey)).toBe('remove value');
      expect(StrictStore.size()).toBe(1);

      StrictStore.remove([keys.stringKey]);
      expect(StrictStore.get(keys.stringKey)).toBe(null);
      expect(StrictStore.size()).toBe(0);
    });

    test('should working clear method', () => {
      localStorage.setItem('1', '231')
      sessionStorage.setItem('1', '231')
      StrictStore.save(keys.stringKey, 'clear value');

      expect(StrictStore.size()).toBe(1); // stringKey
      expect(localStorage.length).toBe(2); // stringKey, localKey
      expect(sessionStorage.length).toBe(1); // sessionKey

      StrictStore.clear(); // only StrictStore keys

      expect(StrictStore.size()).toBe(0); // StrictStore keys
      expect(localStorage.length).toBe(1);
      expect(sessionStorage.length).toBe(1);
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

  describe('Namespaces operations', () => {
    test('correct generate ns', () => {
      StrictStore.save(keys.stringKey, 'key1');

      const valueLib = StrictStore.get(keys.stringKey)
      const valueCommon = localStorage.getItem('strict-store/test-ns:string');

      expect(valueCommon).not.toBe(null);
      expect(valueLib).toBe(JSON.parse(valueCommon!));
    });

    test('should correct clear one ns', () => {
      const nsKeys = {
        key1: createKey<string>(
          'ns1',
          'key1',
        ),

        key2: createKey<string>(
          'ns1',
          'key2',
        ),

        key3: createKey<string>(
          'ns2',
          'key3',
        ),
      } as const;

      StrictStore.save(nsKeys.key1, 'new value1'); // ns1
      StrictStore.save(nsKeys.key2, 'new value2'); // ns1
      StrictStore.save(nsKeys.key3, 'new value3'); // ns2
      StrictStore.clear(['ns1']);

      expect(StrictStore.get(nsKeys.key1)).toBe(null);
      expect(StrictStore.get(nsKeys.key2)).toBe(null);
      expect(StrictStore.get(nsKeys.key3)).toBe('new value3');
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

  describe('advanced types', () => {
    test('enum', () => {
      strictTest(
        keys.enumKey,
        Theme.Light
      )
    });

    test('array<number>', () => {
      strictTest(
        keys.arrayIntKey,
        [312, 0.31]
      )
    });

    test('array<User>', () => {
      const users: User[] = [
        {
          first_name: '1',
          last_name: '1',
          age: 44,
          cash: 1000n,
          hasEmail: true,
        },
        {
          first_name: 'null',
          last_name: null,
          age: 55,
          cash: 10000000n,
          hasEmail: false,
        },
      ]

      strictTest(
        keys.usersKey,
        users
      )
    });

    test('union', () => {
      strictTest<StoreKey<'light' | 'dark' | null>>(
        keys.literalKey,
        'dark'
      )
    });

    test('object', () => {
      const user: User = {
        first_name: 'Pavel',
        last_name: 'Dev',
        age: 46,
        cash: 900n,
        hasEmail: true,
      }

      strictTest(
        keys.objectKey,
        user
      )
    });

    test('bigint', () => {
      strictTest(
        keys.bigIntKey,
        8641975320864197532085418919512894521652189189232156486484318163498451654894894119753208641975321n
      )
    });

    test('map', () => {
      const map = new Map([
        ["key1", 123],
        ["key2", 321],
      ]);

      strictTest(
        keys.mapKey,
        map,
      )
    });

    test('set', () => {
      strictTest(
        keys.setKey,
        new Set(['third', 'Fourth']),
      )
    });

    test('TypedArray', () => {
      [
        new Int8Array([3, -2, 1]),
        new Uint8Array([1, 2, 3]),
        new Uint8ClampedArray([1, 2, 256]),
        new Int16Array([3000, 1000, -2000]),
        new Uint16Array([3000, 1000, 2000]),
        new Int32Array([300000, 100000, -200000]),
        new Uint32Array([300000, 100000, 200000]),
        new Float32Array([1.5, -2.5, 3.5]),
        new Float64Array([-2.987654321, 1.123456789]),
        new BigInt64Array([3n, 1n, -2n]),
        new BigUint64Array([3n, 1n, 2n]),
      ].forEach((value, index) => {
        const key = createKey<typeof value>(
          'test-ns',
          `typedArray${index}`,
        )

        strictTest(
          key,
          value
        )
      })
    });
  })
});
