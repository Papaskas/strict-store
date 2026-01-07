import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities'
import { STRICT_STORE_THROWS_MESSAGES } from '@strict-store/infrastructure/error/throws.messages';

describe.skip('Merge method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('should merge partial object into existing object', () => {
    StrictStore.save(keys.userKey, { name: 'Ivan', age: 30 });

    StrictStore.merge(keys.userKey, { age: 31, email: 'ivan@example.com' });

    expect(StrictStore.get(keys.userKey)).toEqual({
      name: 'Ivan',
      age: 31,
      email: 'ivan@example.com'
    });
  });

  test('should set value if no value exists', () => {
    expect(StrictStore.get(keys.userKey)).toBe(null);

    expect(() => {
      StrictStore.merge(keys.userKey, { name: 'Ivan' });
    }).toThrow(STRICT_STORE_THROWS_MESSAGES.merge.notInitialized);
  });

  test('should throw if trying to merge into non-object', () => {
    StrictStore.save(keys.numberKey, 123);

    expect(() => {
      // @ts-expect-error
      StrictStore.merge(keys.numberKey, { foo: 'bar' });
    }).toThrow(STRICT_STORE_THROWS_MESSAGES.merge.targetNotPlainObject);
  });

  test('should merge only provided fields (shallow merge)', () => {
    StrictStore.save(keys.objKey, { a: 1, b: { c: 2, d: 3 } });

    StrictStore.merge(keys.objKey, { b: { c: 99 } });

    expect(StrictStore.get(keys.objKey)).toEqual({ a: 1, b: { c: 99, d: 3 } });
  });

  test('should merge object with array property', () => {
    StrictStore.save(keys.objectWithArray, { name: 'Alex', tags: ['ts', 'storage'] });

    StrictStore.merge(keys.objectWithArray, { tags: ['typescript', 'store', 'util'] });

    expect(StrictStore.get(keys.objectWithArray)).toEqual({ name: 'Alex', tags: ['typescript', 'store', 'util'] });
  });

  test('should merge object with Set property', () => {
    StrictStore.save(keys.objectWithSet, { name: 'Bob', roles: new Set(['admin', 'user']) });

    StrictStore.merge(keys.objectWithSet, { roles: new Set(['editor']) });

    const result = StrictStore.get(keys.objectWithSet);
    expect(result?.name).toBe('Bob');
    expect(result?.roles instanceof Set).toBe(true);
    expect(Array.from(result!.roles)).toEqual(['editor']);
  });

  test('should merge object with Map property', () => {
    StrictStore.save(keys.objectWithMap, { name: 'Carl', scores: new Map([['math', 5], ['eng', 4]]) });

    StrictStore.merge(keys.objectWithMap, { scores: new Map([['fr', 4], ['sci', 3]]) });

    const result = StrictStore.get(keys.objectWithMap);
    expect(result?.name).toBe('Carl');
    expect(result?.scores instanceof Map).toBe(true);
    expect(Array.from(result!.scores.entries())).toEqual([
      ['fr', 4],
      ['sci', 3]
    ]);
  });

  test('should merge deeply nested object with array and set', () => {
    StrictStore.save(keys.objectWithArrayAndSet, {
      user: {
        name: 'Dina',
        tags: ['a', 'b'],
        permissions: new Set(['read'])
      }
    });

    StrictStore.merge(keys.objectWithArrayAndSet, {
      user: {
        tags: ['c'],
        permissions: new Set(['write'])
      }
    });

    const result = StrictStore.get(keys.objectWithArrayAndSet);
    expect(result?.user.name).toBe('Dina');
    expect(result?.user.tags).toEqual(['c']);
    expect(result?.user.permissions instanceof Set).toBe(true);
    expect(Array.from(result!.user.permissions)).toEqual(['write']);
  });
});
