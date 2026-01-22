import { StrictStore } from 'strict-store';
import { describe, test, expect, beforeEach } from 'vitest';
import { keys } from '@test/entities/key.entities';

describe('forEach method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('should not invoke callback when store is empty and namespaces are not provided', () => {
    StrictStore.forEach(() => {
      throw new Error('dont have key');
    });
  });

  test('should not invoke callback when store is empty and namespaces list is empty', () => {
    StrictStore.forEach(() => {
      throw new Error('dont have a key');
    }, []);
  });

  test('should not invoke callback when no keys match provided namespaces', () => {
    StrictStore.save(keys.stringKey, 'value');

    StrictStore.forEach(() => {
      throw new Error('dont have a key');
    }, ['ns1']);
  });

  test('should not invoke callback when multiple namespaces do not match stored key', () => {
    StrictStore.save(keys.stringKey, 'value');

    StrictStore.forEach(() => {
      throw new Error('dont have a key');
    }, ['ns1', 'ns2', 'ns3', 'ns4']);
  });

  test('should iterate over all stored entries when namespaces are not provided', () => {
    StrictStore.save(keys.stringKey, 'value');

    StrictStore.forEach((key, value) => {
      expect(key).toEqual(keys.stringKey);
      expect(value).toBe('value');
    });
  });

  test('should iterate over all stored entries even if namespace filter does not match key namespace', () => {
    StrictStore.save(keys.stringKey, 'value');

    StrictStore.forEach(
      (key, value) => {
        expect(key).toEqual(keys.stringKey);
        expect(value).toBe('value');
      },
      ['test-ns'],
    );
  });

  test('should iterate over stored entries in insertion order and provide correct index', () => {
    StrictStore.saveBatch([
      [keys.stringKey, 'value'],
      [keys.numberKey, 123],
      [keys.booleanKey, true],
      [keys.nullKey, null],
    ]);

    StrictStore.forEach(
      (key, value, index) => {
        switch (index) {
          case 0:
            expect(key).toEqual(keys.stringKey);
            expect(value).toBe('value');
            break;
          case 1:
            expect(key).toEqual(keys.numberKey);
            expect(value).toBe(123);
            break;
          case 2:
            expect(key).toEqual(keys.booleanKey);
            expect(value).toBe(true);
            break;
          default:
            throw new Error(`key ${index} not found`);
        }
      },
      ['test-ns'],
    );
  });

  test('should iterate only over keys matching provided namespaces and preserve order', () => {
    StrictStore.saveBatch([
      [keys.ns1Key, 'ns1'],
      [keys.ns2Key, 'ns2'],
      [keys.ns3Key, 'ns3'],
      [keys.ns4Key, 'ns4'],
    ]);

    StrictStore.forEach(
      (key, value, index) => {
        switch (index) {
          case 0:
            expect(key).toEqual(keys.ns1Key);
            expect(value).toBe('ns1');
            break;
          case 1:
            expect(key).toEqual(keys.ns3Key);
            expect(value).toBe('ns3');
            break;
          default:
            throw new Error(`key ${index} not found`);
        }
      },
      ['ns1', 'ns3'],
    );
  });

  test('should provide filtered iteration array as fourth callback argument', () => {
    StrictStore.saveBatch([
      [keys.ns1Key, 'ns1'],
      [keys.ns2Key, 'ns2'],
      [keys.ns3Key, 'ns3'],
      [keys.ns4Key, 'ns4'],
    ]);

    StrictStore.forEach(
      (key, value, index, array) => {
        expect(array).toEqual([
          {
            key: keys.ns1Key,
            value: 'ns1',
          },
          {
            key: keys.ns3Key,
            value: 'ns3',
          },
        ]);
      },
      ['ns1', 'ns3'],
    );
  });
});
