import { strictStore, createKey } from '@src/strict-store';
import { keys } from '@test/keys';
import { Theme, User } from '@test/@types';
import { Serializable, StoreKey } from '@src/types';

describe('strictStore', () => {
  beforeEach(() => {
    strictStore.clear();
  });

  const strictTest = <T extends StoreKey<Serializable>>(key: T, value: T['__type']) => {
    expect(strictStore.get(key)).toStrictEqual(null);

    strictStore.save(key, value);
    expect(strictStore.get(key)).toStrictEqual(value);
  }

  describe('Basic operations', () => {
    test('should return `null` value when empty', () => {
      expect(strictStore.get(keys.stringKey)).toBe(null);
    });

    test('should throw an exception if the ns is incorrect.', () => {
      const nsKey = () => createKey(
        'ans:dassda',
        'name',
      )

      expect(nsKey).toThrow('Namespace and name must not contain the ":" character.');
    });

    test('should throw an exception if the name is incorrect.', () => {
      const nameKey = () => createKey(
        'namespace',
        'nam:e',
      )

      expect(nameKey).toThrow('Namespace and name must not contain the ":" character.');
    });

    test('should correct save and get this value', () => {
      strictStore.save(keys.stringKey, 'save and get test');
      expect(strictStore.get(keys.stringKey)).toBe('save and get test');
    });

    test('should correct removeAll method', () => {
      strictStore.save(keys.stringKey, 'remove test');
      strictStore.save(keys.numberKey, 45);

      expect(strictStore.length).toBe(2);

      strictStore.remove([
        keys.stringKey,
        keys.numberKey,
        keys.booleanKey,
        keys.enumKey,
        keys.literalKey,
        keys.setKey
      ]);

      expect(strictStore.length).toBe(0);
    });

    test('should Set and get primitive values', () => {
      new Map<StoreKey<Serializable>, Serializable>([
        [keys.stringKey, 'test primitive value'],
        [keys.booleanKey, false],
        [keys.numberKey, 141],
        [keys.nullableStringKey, null],
        [keys.bigIntKey, 999999999999999n],
      ]).forEach((value, key) => {
        strictTest(
          key,
          value,
        )
      })
    });

    test('should remove items and get default value', () => {
      strictStore.save(keys.stringKey, 'remove value');
      expect(strictStore.get(keys.stringKey)).toBe('remove value');
      expect(strictStore.length).toBe(1);

      strictStore.remove(keys.stringKey);
      expect(strictStore.get(keys.stringKey)).toBe(null);
      expect(strictStore.length).toBe(0);
    });

    test('should working clear method', () => {
      strictStore.save(keys.stringKey, 'clear value');
      expect(strictStore.length).toBe(1);

      strictStore.clear();

      expect(strictStore.length).toBe(0);
    });

    test('should working has method', () => {
      strictStore.save(keys.stringKey, 'clear value');
      expect(strictStore.has(keys.stringKey)).toBe(true);

      strictStore.remove(keys.stringKey);

      expect(strictStore.has(keys.stringKey)).toBe(false);
    })
  });

  describe('Namespaces operations', () => {
    test('correct generate ns', () => {
      strictStore.save(keys.stringKey, 'key1');

      const valueLib = strictStore.get(keys.stringKey)
      const valueCommon = localStorage.getItem('test-ns:string');

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

      strictStore.save(nsKeys.key1, 'new value1'); // ns1
      strictStore.save(nsKeys.key2, 'new value2'); // ns1
      strictStore.save(nsKeys.key3, 'new value3'); // ns2
      strictStore.clearNamespace('ns1');

      expect(strictStore.get(nsKeys.key1)).toBe(null);
      expect(strictStore.get(nsKeys.key2)).toBe(null);
      expect(strictStore.get(nsKeys.key3)).toBe('new value3');
    });
  });

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
      strictTest(
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
