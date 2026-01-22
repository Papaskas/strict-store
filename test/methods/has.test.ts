import { StrictStore } from 'strict-store';
import { describe, test, expect, beforeEach } from 'vitest';
import { keys } from '@test/entities/key.entities';

describe('Has method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns false when checking a missing key', () => {
    expect(StrictStore.has(keys.stringKey)).toBe(false);
  });

  test('returns true when checking an existing key', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.has(keys.stringKey)).toBe(true);
  });

  test('returns false after a key has been deleted', () => {
    StrictStore.save(keys.stringKey, 'value');
    StrictStore.delete(keys.stringKey);

    expect(StrictStore.has(keys.stringKey)).toBe(false);
  });

  test('returns false for each key when checking multiple missing keys', () => {
    expect(StrictStore.has([keys.ns1Key, keys.booleanKey, keys.nullKey, keys.objectKey])).toEqual([
      false,
      false,
      false,
      false,
    ]);
  });

  test('returns correct boolean results when checking multiple keys with mixed states', () => {
    StrictStore.save(keys.ns1Key, 'value');
    StrictStore.save(keys.booleanKey, false);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectKey, {
      name: 'value',
      age: 123,
    });

    expect(StrictStore.has([keys.ns1Key, keys.booleanKey, keys.nullKey, keys.objectKey])).toEqual([
      true,
      true,
      false,
      true,
    ]);
  });
});
