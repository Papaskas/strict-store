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

      expect(StrictStore.size).toBe(2);

      StrictStore.remove([
        keys.stringKey,
        keys.numberKey,
        keys.booleanKey,
        keys.enumKey,
        keys.literalKey,
        keys.setKey,
      ]);

      expect(StrictStore.size).toBe(0);
    });

    test('should correct getAll method', () => {
      StrictStore.save(keys.stringKey, 'remove test');
      StrictStore.save(keys.numberKey, 45);

      const all = StrictStore.getAll()

      expect(all.length).toBe(2);

      const stringEntry = all.find(entry => entry.key.endsWith('/test-ns:string'));
      const numberEntry = all.find(entry => entry.key.endsWith('/test-ns:number'));

      expect(stringEntry).toBeDefined();
      expect(stringEntry?.value).toBe('remove test');

      expect(numberEntry).toBeDefined();
      expect(numberEntry?.value).toBe(45);
    });

    test('should correct getAllByNamespace method', () => {
      StrictStore.save(keys.stringKey, 'remove test');
      StrictStore.save(keys.numberKey, 45);
      StrictStore.save(createKey<number>(
        'ns-2',
        'name-2',
      ), 45);

      expect(StrictStore.size).toBe(3);

      const all = StrictStore.getAll("test-ns")

      expect(all.length).toBe(2);

      const stringEntry = all.find(entry => entry.key.endsWith('/test-ns:string'));
      const numberEntry = all.find(entry => entry.key.endsWith('/test-ns:number'));
      const unknownEntry = all.find(entry => entry.key.endsWith('/ns-2:name-2'));

      expect(stringEntry).toBeDefined();
      expect(stringEntry?.value).toBe('remove test');

      expect(numberEntry).toBeDefined();
      expect(numberEntry?.value).toBe(45);

      expect(unknownEntry).toBe(undefined);
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
      expect(StrictStore.size).toBe(1);

      StrictStore.remove([keys.stringKey]);
      expect(StrictStore.get(keys.stringKey)).toBe(null);
      expect(StrictStore.size).toBe(0);
    });

    test('should working clear method', () => {
      localStorage.setItem('1', '231')
      sessionStorage.setItem('1', '231')
      StrictStore.save(keys.stringKey, 'clear value');

      expect(StrictStore.size).toBe(1); // stringKey
      expect(localStorage.length).toBe(2); // stringKey, localKey
      expect(sessionStorage.length).toBe(1); // sessionKey

      StrictStore.clear(); // only StrictStore keys

      expect(StrictStore.size).toBe(0); // StrictStore keys
      expect(localStorage.length).toBe(1);
      expect(sessionStorage.length).toBe(1);
    });

    test('should working length method', () => {
      localStorage.setItem('localKey', 'asd')
      sessionStorage.setItem('sessionKey', 'asd')
      StrictStore.save(keys.stringKey, 'value');

      expect(localStorage.length).toBe(2); // stringKey, localKey
      expect(sessionStorage.length).toBe(1); // sessionKey
      expect(StrictStore.size).toBe(1); // stringKey

      StrictStore.clear();

      expect(StrictStore.size).toBe(0);
      expect(localStorage.length).toBe(1); // localKey
      expect(sessionStorage.length).toBe(1); // sessionKey
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
      StrictStore.clear('ns1');

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
