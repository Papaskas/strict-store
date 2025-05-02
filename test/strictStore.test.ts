import { strictStore, createKey } from '@src/strict-store';
import { keys } from '@test/keys';
import { Theme, User } from '@test/@types';
import { Serializable, StoreKey, TYPED_ARRAY_CONSTRUCTORS } from '../src/types';

describe('strictStore', () => {
  beforeEach(() => {
    strictStore.clear();
  });

  const strictTest = <T extends Serializable>(
    key: StoreKey<T>,
    newValue: T,
  ) => {
    expect(strictStore.get(key)).toStrictEqual(key.defaultValue);

    strictStore.save(key, newValue);
    expect(strictStore.get(key)).toStrictEqual(newValue);
  }

  describe('Basic operations', () => {
    test('should return default value when empty', () => {
      expect(strictStore.get(keys.stringKey)).toBe(keys.stringKey.defaultValue);
    });

    test('should correct save and get this value', () => {
      strictStore.save(keys.stringKey, 'save and get test');
      expect(strictStore.get(keys.stringKey)).toBe('save and get test');
    });

    test('should set and get primitive values', () => {
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

      strictStore.remove(keys.stringKey);
      expect(strictStore.get(keys.stringKey)).toBe(keys.stringKey.defaultValue);
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
    test('correct generate namespace', () => {
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
          'key1',
        ),

        key2: createKey<string>(
          'ns1',
          'key2',
          'key2',
        ),

        key3: createKey<string>(
          'ns2',
          'key3',
          'key3',
        ),
      } as const;

      strictStore.save(nsKeys.key1, 'new value1'); // ns1
      strictStore.save(nsKeys.key2, 'new value2'); // ns1
      strictStore.save(nsKeys.key3, 'new value3'); // ns2
      strictStore.clearNamespace('ns1');

      expect(strictStore.get(nsKeys.key1)).toBe('key1');
      expect(strictStore.get(nsKeys.key2)).toBe('key2');
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
        999999999999999999999n
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
        {
          defaultValue: new Int8Array([1, -2, 3]),
          newValue: new Int8Array([3, -2, 1]),
        },
        {
          defaultValue: new Uint8Array([3, 2, 1]),
          newValue: new Uint8Array([1, 2, 3]),
        },
        {
          defaultValue: new Uint8ClampedArray([256, 1, 2]),
          newValue: new Uint8ClampedArray([1, 2, 256]),
        },
        {
          defaultValue: new Int16Array([1000, -2000, 3000]),
          newValue: new Int16Array([3000, 1000, -2000]),
        },
        {
          defaultValue: new Uint16Array([1000, 2000, 3000]),
          newValue: new Uint16Array([3000, 1000, 2000]),
        },
        {
          defaultValue: new Int32Array([100000, -200000, 300000]),
          newValue: new Int32Array([300000, 100000, -200000]),
        },
        {
          defaultValue: new Uint32Array([100000, 200000, 300000]),
          newValue: new Uint32Array([300000, 100000, 200000]),
        },
        {
          defaultValue: new Float32Array([3.5, 1.5, -2.5]),
          newValue: new Float32Array([1.5, -2.5, 3.5]),
        },
        {
          defaultValue: new Float64Array([1.123456789, -2.987654321]),
          newValue: new Float64Array([-2.987654321, 1.123456789]),
        },
        {
          defaultValue: new BigInt64Array([1n, -2n, 3n]),
          newValue: new BigInt64Array([3n, 1n, -2n]),
        },
        {
          defaultValue: new BigUint64Array([1n, 2n, 3n]),
          newValue: new BigUint64Array([3n, 1n, 2n]),
        },
      ].forEach((value, index) => {
        const key = createKey(
          'test-ns',
          `typedArray${index}`,
          value.defaultValue,
        )

        strictTest(
          key,
          value.newValue
        )
      })
    });
  })
});
