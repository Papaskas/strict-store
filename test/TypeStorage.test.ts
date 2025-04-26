import { TypeStorage } from '../src/TypeStorage';

describe('TypeStorage', () => {
  // Тестовые ключи
  const stringKey = { ns: 'test', key: 'string', defaultValue: 'default' };
  const numberKey = { ns: 'test', key: 'number', defaultValue: 42 };
  const boolKey = { ns: 'test', key: 'bool', defaultValue: true };
  const objKey = { ns: 'test', key: 'obj', defaultValue: { a: 1 } };

  describe('Basic operations', () => {
    test('should return default value when empty', () => {
      expect(TypeStorage.get(stringKey)).toBe('default');
      expect(TypeStorage.get(numberKey)).toBe(42);
    });

    test('should set and get primitive values', () => {
      TypeStorage.save(stringKey, 'new');
      TypeStorage.save(numberKey, 100);
      TypeStorage.save(boolKey, false);

      expect(TypeStorage.get(stringKey)).toBe('new');
      expect(TypeStorage.get(numberKey)).toBe(100);
      expect(TypeStorage.get(boolKey)).toBe(false);
    });

    test('should handle objects', () => {
      const value = { a: 2 };
      TypeStorage.save(objKey, value);
      expect(TypeStorage.get(objKey)).toEqual(value);
    });
  });

  describe('ns isolation', () => {
    test('should not conflict between nss', () => {
      const key1 = { ns: 'ns1', key: 'same', defaultValue: 1 };
      const key2 = { ns: 'ns2', key: 'same', defaultValue: 2 };

      TypeStorage.save(key1, 10);
      TypeStorage.save(key2, 20);

      expect(TypeStorage.get(key1)).toBe(10);
      expect(TypeStorage.get(key2)).toBe(20);
    });
  });

  describe('Removal', () => {
    test('should remove items', () => {
      TypeStorage.save(stringKey, 'value');
      TypeStorage.remove(stringKey);
      expect(TypeStorage.get(stringKey)).toBe('default');
    });

    test('should clear nss', () => {
      const key1 = { ns: 'ns', key: 'key1', defaultValue: 1 };
      const key2 = { ns: 'ns', key: 'key2', defaultValue: 2 };

      TypeStorage.save(key1, 10);
      TypeStorage.save(key2, 20);
      TypeStorage.clearNamespace('ns');

      expect(TypeStorage.get(key1)).toBe(1);
      expect(TypeStorage.get(key2)).toBe(2);
    });
  });
});
