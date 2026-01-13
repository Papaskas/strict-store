import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';
import { describe, test, expect, beforeEach } from 'vitest';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { StrictStoreError } from '@src/domain/entities/errors/strict-store.error';

describe('Merge method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('should merge partial object into existing object', () => {
    StrictStore.save(keys.objectKey, { name: 'Ivan', age: 30 });

    const res = StrictStore.merge(keys.objectKey, { age: 31, email: 'ivan@example.com' });

    expect(res).toEqual({
      name: 'Ivan',
      age: 31,
      email: 'ivan@example.com',
    });
  });

  test('should set value if no value exists', () => {
    expect(StrictStore.get(keys.objectKey)).toBe(null);

    expect(() => {
      StrictStore.merge(keys.objectKey, { name: 'Ivan' });
    }).toThrowError(StrictStoreError);

    try {
      StrictStore.merge(keys.objectKey, { name: 'Ivan' });
    } catch (e) {
      expect(e).toBeInstanceOf(StrictStoreError);
      expect((e as StrictStoreError).code).toBe(STRICT_STORE_ERROR_CODE.MERGE_NOT_INITIALIZED);
    }
  });

  test('should throw if trying to merge into non-object', () => {
    StrictStore.save(keys.numberKey, 123);

    expect(() => {
      // @ts-expect-error
      StrictStore.merge(keys.numberKey, { foo: 'bar' });
    }).toThrowError(StrictStoreError);

    try {
      // @ts-expect-error
      StrictStore.merge(keys.numberKey, { foo: 'bar' });
    } catch (e) {
      expect(e).toBeInstanceOf(StrictStoreError);
      expect((e as StrictStoreError).code).toBe(STRICT_STORE_ERROR_CODE.MERGE_TARGET_NOT_PLAIN_OBJECT);
    }
  });

  test('should merge only provided fields (shallow merge)', () => {
    StrictStore.save(keys.objIncludedObj, { a: 1, b: { c: 2, d: 3 } });

    const res = StrictStore.merge(keys.objIncludedObj, { b: { c: 99 } });

    expect(res).toEqual({ a: 1, b: { c: 99, d: 3 } });
  });

  test('should merge object with array property', () => {
    StrictStore.save(keys.objectWithArray, { name: 'Alex', tags: ['ts', 'storage'] });

    const res = StrictStore.merge(keys.objectWithArray, { tags: ['typescript', 'store', 'util'] });

    expect(res).toEqual({
      name: 'Alex',
      tags: ['typescript', 'store', 'util'],
    });
  });

  test('should merge object with Set property', () => {
    StrictStore.save(keys.objectWithSet, { name: 'Bob', roles: new Set(['admin', 'user']) });

    const result = StrictStore.merge(keys.objectWithSet, { roles: new Set(['editor']) });

    expect(result).toEqual({
      name: 'Bob',
      roles: new Set( ['editor']),
    })
  });

  test('should merge object with Map property', () => {
    StrictStore.save(keys.objectWithMap, {
      name: 'Carl',
      scores: new Map([
        ['math', 5],
        ['eng', 4],
      ]),
    });

    const result = StrictStore.merge(keys.objectWithMap, {
      scores: new Map([
        ['fr', 4],
      ]),
    });

    expect(result).toEqual({
      name: 'Carl',
      scores: new Map([
        ['fr', 4],
      ]),
    });
  });

  test('should merge deeply nested object with array and set', () => {
    StrictStore.save(keys.objectWithArrayAndSet, {
      user: {
        name: 'Dina',
        tags: ['a', 'b'],
        permissions: new Set(['read', 'edit']),
      },
    });

    const result = StrictStore.merge(keys.objectWithArrayAndSet, {
      user: {
        tags: ['c'],
        permissions: new Set(['write']),
      },
    });

    expect(result).toEqual({
      user: {
        name: 'Dina',
        tags: ['c', 'b'],
        permissions: new Set(['write']),
      }
    })
  });
});
