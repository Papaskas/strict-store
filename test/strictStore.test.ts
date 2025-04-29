import { createKey } from '../src';
import { strictStore } from '../src';
import { keys } from './keys';
import { Theme, User } from './@types';

describe('strictStore', () => {
  beforeEach(() => {
    strictStore.clear();
  });

  describe('Basic operations', () => {
    test('should return default value when empty', () => {
      expect(strictStore.get(keys.stringKey)).toBe('string value');
    });

    test('should correct save and get this value', () => {
      strictStore.save(keys.stringKey, 'save and get test');
      expect(strictStore.get(keys.stringKey)).toBe('save and get test');
    });

    test('should set and get primitive values', () => {
      strictStore.save(keys.stringKey, 'test primitive value');
      strictStore.save(keys.booleanKey,false);
      strictStore.save(keys.numberKey,100);

      expect(strictStore.get(keys.stringKey)).toBe('test primitive value');
      expect(strictStore.get(keys.numberKey)).toBe(100);
      expect(strictStore.get(keys.booleanKey)).toBe(false);
    });

    test('should remove items and get default value', () => {
      strictStore.save(keys.stringKey, 'remove value');
      expect(strictStore.get(keys.stringKey)).toBe('remove value');

      strictStore.remove(keys.stringKey);
      expect(strictStore.get(keys.stringKey)).toBe('string value');
    });

    test('should working clear method', () => {
      strictStore.save(keys.stringKey, 'clear value');
      expect(strictStore.countItems).toBe(1);

      strictStore.clear();

      expect(strictStore.countItems).toBe(0);
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
      expect(strictStore.get(keys.enumKey)).toStrictEqual(Theme.Dark);

      strictStore.save(keys.enumKey, Theme.Light);
      expect(strictStore.get(keys.enumKey)).toStrictEqual(Theme.Light);
    });

    test('array<number>', () => {
      expect(strictStore.get(keys.arrayIntKey)).toStrictEqual([])

      strictStore.save(keys.arrayIntKey, [312, 0.31]);
      expect(strictStore.get(keys.arrayIntKey)).toStrictEqual([312, 0.31])
    });

    test('array<any>', () => {
      expect(strictStore.get(keys.arrayAnyKey)).toStrictEqual([0, 'das', false, BigInt(999999999999999999999999999999)],)

      strictStore.save(keys.arrayAnyKey, [null, 'das', true, 0.31]);
      expect(strictStore.get(keys.arrayAnyKey)).toStrictEqual([null, 'das', true, 0.31])
    });

    test('union', () => {
      expect(strictStore.get(keys.literalKey)).toStrictEqual(null);

      strictStore.save(keys.literalKey, 'dark');
      expect(strictStore.get(keys.literalKey)).toStrictEqual('dark');
    });

    test('object', () => {
      expect(strictStore.get(keys.objectKey)).toStrictEqual({ first_name: null, last_name: null });

      const user: User = {
        first_name: 'Pavel',
        last_name: 'Dev',
      }

      strictStore.save(keys.objectKey, user)
      expect(strictStore.get(keys.objectKey)).toStrictEqual(user);
    });

    test('bigint', () => {
      expect(strictStore.get(keys.bigIntKey)).toStrictEqual(BigInt(88888888888888888));

      strictStore.save(keys.bigIntKey, BigInt(999999999999999999999))
      expect(strictStore.get(keys.bigIntKey)).toStrictEqual(BigInt(999999999999999999999));
    });

    test('hex number', () => {
      expect(strictStore.get(keys.hexKey)).toStrictEqual(0XFFFFFF);

      strictStore.save(keys.hexKey, 0XF12FF23)
      expect(strictStore.get(keys.hexKey)).toStrictEqual(0XF12FF23);
    });
  })
});
