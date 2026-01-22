import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';
import { describe, test, expect, beforeEach } from 'vitest';

describe('SaveBatch method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('does nothing when called with an empty batch', () => {
    StrictStore.saveBatch([]);

    const res = StrictStore.entries();
    expect(res).toEqual([]);
  });

  test('stores a single key–value pair when batch contains one entry', () => {
    StrictStore.saveBatch([[keys.stringKey, 'value']]);

    const res = StrictStore.entries();

    expect(res).toEqual([
      {
        key: keys.stringKey,
        value: 'value',
      },
    ]);
  });

  test('stores only non-null values from a batch of mixed entries', () => {
    StrictStore.saveBatch([
      [keys.stringKey, 'value'],
      [keys.nullKey, null],
      [keys.objectKey, { name: 'name', age: 20 }],
      [keys.objectWithArray, { name: 'age', tags: ['obj', 'arr'] }],
    ]);

    const res = StrictStore.entries();

    expect(res).toEqual([
      {
        key: keys.stringKey,
        value: 'value',
      },
      {
        key: keys.objectKey,
        value: { name: 'name', age: 20 },
      },
      {
        key: keys.objectWithArray,
        value: { name: 'age', tags: ['obj', 'arr'] },
      },
    ]);
  });

  test('reflects deletions correctly after saving a batch', () => {
    StrictStore.saveBatch([
      [keys.stringKey, 'value'],
      [keys.nullKey, null],
      [keys.objectKey, { name: 'name', age: 20 }],
      [keys.objectWithArray, { name: 'age', tags: ['obj', 'arr'] }],
    ]);

    StrictStore.delete(keys.stringKey);
    const res = StrictStore.entries();

    expect(res).toEqual([
      {
        key: keys.objectKey,
        value: { name: 'name', age: 20 },
      },
      {
        key: keys.objectWithArray,
        value: { name: 'age', tags: ['obj', 'arr'] },
      },
    ]);
  });
});
