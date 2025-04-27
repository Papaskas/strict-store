import { StorageKey } from '../src/@types';
import { TypeStorage } from '../src/TypeStorage';
import { keys } from './keys';

describe('TypeStorage', () => {
  beforeEach(() => {
    TypeStorage.clear();
  });

  describe('Basic operations', () => {
    test('should return default value when empty', () => {
      expect(TypeStorage.get(keys.stringKey)).toBe('string value');
    });

    test('should correct save and get this value', () => {
      TypeStorage.save(keys.stringKey, 'save and get test');
      expect(TypeStorage.get(keys.stringKey)).toBe('save and get test');
    });

    test('should set and get primitive values', () => {
      TypeStorage.save(keys.stringKey, 'test primitive value');
      TypeStorage.save(keys.booleanKey,false);
      TypeStorage.save(keys.numberKey,100);

      expect(TypeStorage.get(keys.stringKey)).toBe('test primitive value');
      expect(TypeStorage.get(keys.numberKey)).toBe(100);
      expect(TypeStorage.get(keys.booleanKey)).toBe(false);
    });

    test('should remove items and get default value', () => {
      TypeStorage.save(keys.stringKey, 'remove value');
      expect(TypeStorage.get(keys.stringKey)).toBe('remove value');

      TypeStorage.remove(keys.stringKey);
      expect(TypeStorage.get(keys.stringKey)).toBe('string value');
    });

    test('should working clear method', () => {
      TypeStorage.save(keys.stringKey, 'clear value');
      expect(TypeStorage.countItems).toBe(1);

      TypeStorage.clear();

      expect(TypeStorage.countItems).toBe(0);
    });

    test('should working has method', () => {
      TypeStorage.save(keys.stringKey, 'clear value');
      expect(TypeStorage.has(keys.stringKey)).toBe(true);

      TypeStorage.remove(keys.stringKey);

      expect(TypeStorage.has(keys.stringKey)).toBe(false);
    })
  });

  describe('Namespaces operations', () => {
    test('correct generate namespace', () => {
      const key: StorageKey<string> = {
          ns: 'ns1',
          key: 'key',
          defaultValue: 'key1',
      };

      TypeStorage.save(key, 'key1');

      const valueLib = TypeStorage.get(key)
      const valueCommon = localStorage.getItem('ns1:key');

      expect(valueCommon).not.toBe(null);
      expect(valueLib).toBe(JSON.parse(valueCommon!));
    });

    test('should correct clear one ns', () => {
      const nsKeys = {
        key1: {
          ns: 'ns1',
          key: 'key1',
          defaultValue: 'key1',
        } as StorageKey<string>,

        key2: {
          ns: 'ns1',
          key: 'key2',
          defaultValue: 'key2',
        } as StorageKey<string>,

        key3: {
          ns: 'ns2',
          key: 'key1',
          defaultValue: 'key3',
        } as StorageKey<string>,
      } as const;

      TypeStorage.save(nsKeys.key1, 'new value1'); // ns1
      TypeStorage.save(nsKeys.key2, 'new value2'); // ns1
      TypeStorage.save(nsKeys.key3, 'new value3'); // ns2
      TypeStorage.clearNamespace('ns1');

      expect(TypeStorage.get(nsKeys.key1)).toBe('key1');
      expect(TypeStorage.get(nsKeys.key2)).toBe('key2');
      expect(TypeStorage.get(nsKeys.key3)).toBe('new value3');
    });
  });

  describe('advanced types', () => {
    test('enum', () => {
      enum Theme {
        Light, Dark
      }

      const key: StorageKey<Theme> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: Theme.Dark,
      };

      expect(TypeStorage.get(key)).toStrictEqual(Theme.Dark);

      TypeStorage.save(key, Theme.Light);
      expect(TypeStorage.get(key)).toStrictEqual(Theme.Light);
    });

    test('array<number>', () => {
      const key: StorageKey<number[]> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: [0],
      };

      expect(TypeStorage.get(key)).toStrictEqual([0])

      TypeStorage.save(key, [312, 0.31]);
      expect(TypeStorage.get(key)).toStrictEqual([312, 0.31])
    });

    test('array<any>', () => {
      const key: StorageKey<any[]> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: [0, 'das', false, BigInt(100)],
      };

      expect(TypeStorage.get(key)).toStrictEqual([0, 'das', false, BigInt(100)])

      TypeStorage.save(key, [null, 'das', true, 0.31]);
      expect(TypeStorage.get(key)).toStrictEqual([null, 'das', true, 0.31])
    });

    test('union', () => {
      const key: StorageKey<'light' | 'dark' | null> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: null,
      };

      expect(TypeStorage.get(key)).toStrictEqual(null);

      TypeStorage.save(key, 'dark');
      expect(TypeStorage.get(key)).toStrictEqual('dark');
    });

    test('object', () => {
      type User = {
        first_name: string,
        last_name: string,
      }

      const user: User = {
        first_name: 'Pavel',
        last_name: 'Dev',
      }

      const key: StorageKey<User> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: user,
      };

      expect(TypeStorage.get(key)).toStrictEqual(user);
    });

    test('bigint', () => {
      const key: StorageKey<bigint> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: BigInt(100),
      };

      expect(TypeStorage.get(key)).toStrictEqual(BigInt(100));

      TypeStorage.save(key, BigInt(1000))
      expect(TypeStorage.get(key)).toStrictEqual(BigInt(1000));
    });

    test('hex number', () => {
      const key: StorageKey<number> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: 0XFF123,
      };

      expect(TypeStorage.get(key)).toStrictEqual(0XFF123);

      TypeStorage.save(key, 0XFFFFFF)
      expect(TypeStorage.get(key)).toStrictEqual(0XFFFFFF);
    });
  })
});
