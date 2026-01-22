import { beforeEach, describe, expect, test } from 'vitest';
import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';

describe('Keys method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns zero when the store is empty', () => {
    expect(StrictStore.keys().length).toBe(0);
  });

  test('returns one after saving a single value', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.keys().length).toBe(1);
  });

  test('treats undefined namespace filter as no filter', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.keys(undefined).length).toBe(1);
  });

  test('returns empty result when namespace filter does not match any key', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.keys(['another_ns']).length).toBe(0);
  });

  test('returns empty result when namespace filter contains an empty string', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.keys([''])).toEqual([]);
  });

  test('returns keys matching a single namespace', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.keys(['test-ns'])).toEqual([keys.stringKey]);
  });

  test('returns zero after deleting the only stored value', () => {
    StrictStore.save(keys.stringKey, 'value');
    StrictStore.delete(keys.stringKey);

    expect(StrictStore.keys().length).toBe(0);
  });

  test('excludes null-valued keys from the result', () => {
    StrictStore.save(keys.ns1Key, 'value');
    StrictStore.save(keys.booleanKey, false);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectKey, {
      name: 'value',
      age: 123,
    });

    expect(StrictStore.keys().length).toBe(3);
  });

  test('returns all stored keys regardless of order', () => {
    StrictStore.save(keys.ns1Key, 'value');
    StrictStore.save(keys.booleanKey, false);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectKey, {
      name: 'value',
      age: 123,
    });

    expect(StrictStore.keys()).toEqual(
      expect.arrayContaining([keys.ns1Key, keys.booleanKey, keys.objectKey]),
    );
  });

  test('returns keys matching the specified namespace only', () => {
    StrictStore.save(keys.ns1Key, 'value');
    StrictStore.save(keys.booleanKey, false);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectKey, {
      name: 'value',
      age: 123,
    });

    expect(StrictStore.keys(['test-ns'])).toEqual(
      expect.arrayContaining([keys.booleanKey, keys.objectKey]),
    );
  });

  test('returns keys matching multiple namespaces', () => {
    StrictStore.save(keys.ns1Key, 'value');
    StrictStore.save(keys.booleanKey, false);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectKey, {
      name: 'value',
      age: 123,
    });

    expect(StrictStore.keys(['test-ns', 'ns1'])).toEqual(
      expect.arrayContaining([keys.ns1Key, keys.booleanKey, keys.objectKey]),
    );
  });
});
