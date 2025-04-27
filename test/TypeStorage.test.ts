import { StoreKey } from '../src/@types';
import { StrictStore } from '../src/StrictStore';
import { keys } from './keys';

describe('StrictStore', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  describe('Basic operations', () => {
    test('should return default value when empty', () => {
      expect(StrictStore.get(keys.stringKey)).toBe('string value');
    });

    test('should correct save and get this value', () => {
      StrictStore.save(keys.stringKey, 'save and get test');
      expect(StrictStore.get(keys.stringKey)).toBe('save and get test');
    });

    test('should set and get primitive values', () => {
      StrictStore.save(keys.stringKey, 'test primitive value');
      StrictStore.save(keys.booleanKey,false);
      StrictStore.save(keys.numberKey,100);

      expect(StrictStore.get(keys.stringKey)).toBe('test primitive value');
      expect(StrictStore.get(keys.numberKey)).toBe(100);
      expect(StrictStore.get(keys.booleanKey)).toBe(false);
    });

    test('should remove items and get default value', () => {
      StrictStore.save(keys.stringKey, 'remove value');
      expect(StrictStore.get(keys.stringKey)).toBe('remove value');

      StrictStore.remove(keys.stringKey);
      expect(StrictStore.get(keys.stringKey)).toBe('string value');
    });

    test('should working clear method', () => {
      StrictStore.save(keys.stringKey, 'clear value');
      expect(StrictStore.countItems).toBe(1);

      StrictStore.clear();

      expect(StrictStore.countItems).toBe(0);
    });

    test('should working has method', () => {
      StrictStore.save(keys.stringKey, 'clear value');
      expect(StrictStore.has(keys.stringKey)).toBe(true);

      StrictStore.remove(keys.stringKey);

      expect(StrictStore.has(keys.stringKey)).toBe(false);
    })
  });

  describe('Namespaces operations', () => {
    test('correct generate namespace', () => {
      const key: StoreKey<string> = {
          ns: 'ns1',
          key: 'key',
          defaultValue: 'key1',
      };

      StrictStore.save(key, 'key1');

      const valueLib = StrictStore.get(key)
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
        } as StoreKey<string>,

        key2: {
          ns: 'ns1',
          key: 'key2',
          defaultValue: 'key2',
        } as StoreKey<string>,

        key3: {
          ns: 'ns2',
          key: 'key1',
          defaultValue: 'key3',
        } as StoreKey<string>,
      } as const;

      StrictStore.save(nsKeys.key1, 'new value1'); // ns1
      StrictStore.save(nsKeys.key2, 'new value2'); // ns1
      StrictStore.save(nsKeys.key3, 'new value3'); // ns2
      StrictStore.clearNamespace('ns1');

      expect(StrictStore.get(nsKeys.key1)).toBe('key1');
      expect(StrictStore.get(nsKeys.key2)).toBe('key2');
      expect(StrictStore.get(nsKeys.key3)).toBe('new value3');
    });
  });

  describe('advanced types', () => {
    test('enum', () => {
      enum Theme {
        Light, Dark
      }

      const key: StoreKey<Theme> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: Theme.Dark,
      };

      expect(StrictStore.get(key)).toStrictEqual(Theme.Dark);

      StrictStore.save(key, Theme.Light);
      expect(StrictStore.get(key)).toStrictEqual(Theme.Light);
    });

    test('array<number>', () => {
      const key: StoreKey<number[]> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: [0],
      };

      expect(StrictStore.get(key)).toStrictEqual([0])

      StrictStore.save(key, [312, 0.31]);
      expect(StrictStore.get(key)).toStrictEqual([312, 0.31])
    });

    test('array<any>', () => {
      const key: StoreKey<any[]> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: [0, 'das', false, BigInt(100)],
      };

      expect(StrictStore.get(key)).toStrictEqual([0, 'das', false, BigInt(100)])

      StrictStore.save(key, [null, 'das', true, 0.31]);
      expect(StrictStore.get(key)).toStrictEqual([null, 'das', true, 0.31])
    });

    test('union', () => {
      const key: StoreKey<'light' | 'dark' | null> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: null,
      };

      expect(StrictStore.get(key)).toStrictEqual(null);

      StrictStore.save(key, 'dark');
      expect(StrictStore.get(key)).toStrictEqual('dark');
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

      const key: StoreKey<User> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: user,
      };

      expect(StrictStore.get(key)).toStrictEqual(user);
    });

    test('bigint', () => {
      const key: StoreKey<bigint> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: BigInt(100),
      };

      expect(StrictStore.get(key)).toStrictEqual(BigInt(100));

      StrictStore.save(key, BigInt(1000))
      expect(StrictStore.get(key)).toStrictEqual(BigInt(1000));
    });

    test('hex number', () => {
      const key: StoreKey<number> = {
        ns: 'ns1',
        key: 'key',
        defaultValue: 0XFF123,
      };

      expect(StrictStore.get(key)).toStrictEqual(0XFF123);

      StrictStore.save(key, 0XFFFFFF)
      expect(StrictStore.get(key)).toStrictEqual(0XFFFFFF);
    });
  })
});
