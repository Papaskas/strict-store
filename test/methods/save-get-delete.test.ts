import { StrictStore, createKey } from 'strict-store';
import { describe, test, expect, beforeEach } from 'vitest';
import { keys } from '@test/entities/key.entities';

describe('Save, get, and delete methods', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('get returns null for missing key', () => {
    expect(StrictStore.get(keys.stringKey)).toBe(null);
  });

  test('save stores value and get returns it', () => {
    StrictStore.save(keys.stringKey, 'new value');

    expect(StrictStore.get(keys.stringKey)).toBe('new value');
  });

  test('save does not persist null values', () => {
    StrictStore.save(keys.nullKey, null);

    expect(StrictStore.get(keys.nullKey)).toBe(null);
    expect(StrictStore.size()).toBe(0);
  });

  test('delete returns false for missing key and keeps get as null', () => {
    expect(StrictStore.get(keys.stringKey)).toBe(null);

    const isDeleted = StrictStore.delete(keys.stringKey);
    expect(StrictStore.get(keys.stringKey)).toBe(null);
    expect(isDeleted).toBe(false);
  });

  test('delete returns true for existing key and removes stored value', () => {
    StrictStore.save(keys.stringKey, 'new value');

    expect(StrictStore.get(keys.stringKey)).toBe('new value');

    const isDeleted = StrictStore.delete(keys.stringKey);
    expect(isDeleted).toBe(true);
    expect(StrictStore.get(keys.stringKey)).toBe(null);
  });

  test('pick returns nulls and delete returns falses for missing keys (batch)', () => {
    expect(StrictStore.pick([keys.stringKey, keys.booleanKey, keys.numberKey])).toEqual([
      null,
      null,
      null,
    ]);

    expect(StrictStore.delete([keys.stringKey, keys.booleanKey, keys.numberKey])).toEqual([
      false,
      false,
      false,
    ]);
  });

  test('saveBatch stores values; has/pick/delete work for multiple keys', () => {
    StrictStore.saveBatch([
      [keys.stringKey, 'value'],
      [keys.booleanKey, true],
      [keys.numberKey, 123],
    ]);

    expect(StrictStore.has([keys.stringKey, keys.booleanKey, keys.numberKey])).toEqual([
      true,
      true,
      true,
    ]);

    expect(StrictStore.pick([keys.stringKey, keys.booleanKey, keys.numberKey])).toEqual([
      'value',
      true,
      123,
    ]);

    expect(StrictStore.delete([keys.stringKey, keys.booleanKey, keys.numberKey])).toEqual([
      true,
      true,
      true,
    ]);
  });

  test('save overwrites existing value for same key', () => {
    StrictStore.save(keys.stringKey, 'new value 1');
    expect(StrictStore.get(keys.stringKey)).toBe('new value 1');

    StrictStore.save(keys.stringKey, 'new value 2');
    expect(StrictStore.get(keys.stringKey)).toBe('new value 2');
  });

  test('keys with same namespace and name collide regardless of generic type', () => {
    const ns = 'ns1';
    const name = 'key';
    const stringKey = createKey<string>(ns, name);
    const numberKey = createKey<number>(ns, name);

    StrictStore.save(stringKey, 'new value');
    StrictStore.save(numberKey, 321);

    expect(StrictStore.get(stringKey)).toBe(321);
    expect(StrictStore.get(numberKey)).toBe(321);
  });
});
