import { StrictStore } from 'strict-store';
import { describe, test, expect, beforeEach } from 'vitest';
import { keys } from '@test/entities/key.entities';

describe('Size method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns zero when the store is empty', () => {
    expect(StrictStore.size()).toBe(0);
  });

  test('returns one after saving a single value', () => {
    StrictStore.save(keys.stringKey, 'value');

    expect(StrictStore.size()).toBe(1);
  });

  test('returns zero after deleting the only stored value', () => {
    StrictStore.save(keys.stringKey, 'value');
    StrictStore.delete(keys.stringKey);

    expect(StrictStore.size()).toBe(0);
  });

  test('counts only non-null stored values when multiple keys are saved', () => {
    StrictStore.save(keys.ns1Key, 'value');
    StrictStore.save(keys.booleanKey, false);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectKey, {
      name: 'value',
      age: 123,
    });

    expect(StrictStore.size()).toBe(3);
  });
});
