import { StrictStore } from 'strict-store';
import { describe, test, expect, beforeEach } from 'vitest';
import { keys } from '@test/entities/key.entities';

describe('Pick method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns an empty array when called with no keys', () => {
    const res = StrictStore.pick([]);
    expect(res).toEqual([]);
  });

  test('returns null for a single missing key', () => {
    const res = StrictStore.pick([keys.stringKey]);
    expect(res).toEqual([null]);
  });

  test('returns null for each key when all requested keys are missing', () => {
    const res = StrictStore.pick([keys.stringKey, keys.nullKey, keys.booleanKey, keys.numberKey]);
    expect(res).toEqual([null, null, null, null]);
  });

  test('returns values in key order for multiple keys with existing and null values', () => {
    StrictStore.saveBatch([
      [keys.stringKey, 'value'],
      [keys.nullKey, null],
      [keys.booleanKey, true],
      [keys.numberKey, 112],
    ]);
    const res = StrictStore.pick([keys.stringKey, keys.nullKey, keys.booleanKey, keys.numberKey]);

    expect(res).toEqual(['value', null, true, 112]);
  });
});
