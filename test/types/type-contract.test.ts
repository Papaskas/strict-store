import { describe, test, expectTypeOf, beforeEach } from 'vitest';
import { StrictStore, createKey } from 'strict-store';
import { keys } from '@test/entities/key.entities';

describe('Type contract', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('keys are strongly typed by createKey generic', () => {
    expectTypeOf(keys.stringKey).toEqualTypeOf<ReturnType<typeof createKey<string>>>();
    expectTypeOf(keys.booleanKey).toEqualTypeOf<ReturnType<typeof createKey<boolean>>>();
    expectTypeOf(keys.numberKey).toEqualTypeOf<ReturnType<typeof createKey<number>>>();
    expectTypeOf(keys.nullKey).toEqualTypeOf<ReturnType<typeof createKey<null>>>();
    expectTypeOf(keys.objIncludedObj).toEqualTypeOf<
      ReturnType<typeof createKey<{ a: number; b: { c: number; d: number } }>>
    >();
    expectTypeOf(keys.objectKey).toEqualTypeOf<
      ReturnType<typeof createKey<{ name: string; age: number; email?: string }>>
    >();
    expectTypeOf(keys.objectWithArray).toEqualTypeOf<
      ReturnType<typeof createKey<{ name: string; tags: string[] }>>
    >();
    expectTypeOf(keys.objectWithSet).toEqualTypeOf<
      ReturnType<typeof createKey<{ name: string; roles: Set<string> }>>
    >();
    expectTypeOf(keys.objectWithMap).toEqualTypeOf<
      ReturnType<typeof createKey<{ name: string; scores: Map<string, number> }>>
    >();
    expectTypeOf(keys.objectWithArrayAndSet).toEqualTypeOf<
      ReturnType<
        typeof createKey<{ user: { name: string; tags: string[]; permissions: Set<string> } }>
      >
    >();
    expectTypeOf(keys.undefinedKey).toEqualTypeOf<ReturnType<typeof createKey<undefined>>>();
    expectTypeOf(keys.bigintKey).toEqualTypeOf<ReturnType<typeof createKey<bigint>>>();
    expectTypeOf(keys.regexpKey).toEqualTypeOf<ReturnType<typeof createKey<RegExp>>>();
    expectTypeOf(keys.dateKey).toEqualTypeOf<ReturnType<typeof createKey<Date>>>();
    expectTypeOf(keys.urlKey).toEqualTypeOf<ReturnType<typeof createKey<URL>>>();
    expectTypeOf(keys.errorKey).toEqualTypeOf<ReturnType<typeof createKey<Error>>>();
  });

  test('get returns value type tied to key', () => {
    expectTypeOf(StrictStore.get(keys.stringKey)).toEqualTypeOf<string | null>();
    expectTypeOf(StrictStore.get(keys.booleanKey)).toEqualTypeOf<boolean | null>();
    expectTypeOf(StrictStore.get(keys.numberKey)).toEqualTypeOf<number | null>();
    expectTypeOf(StrictStore.get(keys.nullKey)).toEqualTypeOf<null>();
    expectTypeOf(StrictStore.get(keys.objIncludedObj)).toEqualTypeOf<{
      a: number;
      b: { c: number; d: number };
    } | null>();
    expectTypeOf(StrictStore.get(keys.objectKey)).toEqualTypeOf<{
      name: string;
      age: number;
      email?: string;
    } | null>();
    expectTypeOf(StrictStore.get(keys.objectWithArray)).toEqualTypeOf<{
      name: string;
      tags: string[];
    } | null>();
    expectTypeOf(StrictStore.get(keys.objectWithSet)).toEqualTypeOf<{
      name: string;
      roles: Set<string>;
    } | null>();
    expectTypeOf(StrictStore.get(keys.objectWithMap)).toEqualTypeOf<{
      name: string;
      scores: Map<string, number>;
    } | null>();
    expectTypeOf(StrictStore.get(keys.objectWithArrayAndSet)).toEqualTypeOf<{
      user: { name: string; tags: string[]; permissions: Set<string> };
    } | null>();
    expectTypeOf(StrictStore.get(keys.undefinedKey)).toEqualTypeOf<undefined | null>();
    expectTypeOf(StrictStore.get(keys.bigintKey)).toEqualTypeOf<bigint | null>();
    expectTypeOf(StrictStore.get(keys.regexpKey)).toEqualTypeOf<RegExp | null>();
    expectTypeOf(StrictStore.get(keys.dateKey)).toEqualTypeOf<Date | null>();
    expectTypeOf(StrictStore.get(keys.urlKey)).toEqualTypeOf<URL | null>();
    expectTypeOf(StrictStore.get(keys.errorKey)).toEqualTypeOf<Error | null>();
  });

  test('save accepts only the value type tied to key', () => {
    StrictStore.save(keys.stringKey, 'value');
    StrictStore.save(keys.booleanKey, true);
    StrictStore.save(keys.numberKey, 123);
    StrictStore.save(keys.nullKey, null);
    StrictStore.save(keys.objectWithArrayAndSet, {
      user: {
        name: 'name',
        tags: ['tag1', 'tag2'],
        permissions: new Set<string>(['write']),
      },
    });
    StrictStore.save(keys.undefinedKey, undefined);
    StrictStore.save(keys.bigintKey, 123872148761523621812341728954238761423123781451236782123n);
    StrictStore.save(keys.regexpKey, /wq1/i);
    StrictStore.save(keys.dateKey, new Date());
    StrictStore.save(keys.urlKey, new URL('https://example.com'));
    StrictStore.save(keys.errorKey, new Error('error msg'));

    // @ts-expect-error - stringKey expects boolean
    StrictStore.save(keys.stringKey, false);

    // @ts-expect-error - booleanKey expects number
    StrictStore.save(keys.booleanKey, 123123);

    // @ts-expect-error - numberKey expects boolean
    StrictStore.save(keys.numberKey, false);
  });

  test('saveBatch enforces key-value pair typing', () => {
    StrictStore.saveBatch([
      [keys.numberKey, 1],
      [keys.stringKey, 'value'],
      [keys.booleanKey, true],
      [keys.nullKey, null],
      [keys.undefinedKey, undefined],
      [keys.bigintKey, 12312127468543724839623573129578634589712634099823659823764239561234332n],
      [keys.regexpKey, /123/i],
      [keys.dateKey, new Date(112)],
      [keys.urlKey, new URL('https://example.com/')],
      [keys.errorKey, new Error('error')],
      [
        keys.objectKey,
        {
          name: 'name',
          age: 20,
        },
      ],
    ]);

    // @ts-expect-error - numberKey expects number
    StrictStore.saveBatch([[keys.numberKey, 'nope']]);

    // @ts-expect-error - stringKey expects string
    StrictStore.saveBatch([[keys.stringKey, 123]]);
  });

  test('pick returns a tuple of key-specific value types', () => {
    expectTypeOf(
      StrictStore.pick([
        keys.stringKey,
        keys.booleanKey,
        keys.numberKey,
        keys.nullKey,
        keys.undefinedKey,
        keys.bigintKey,
        keys.regexpKey,
        keys.dateKey,
        keys.urlKey,
        keys.errorKey,
        keys.objIncludedObj,
        keys.objectKey,
        keys.objectWithArray,
        keys.objectWithSet,
        keys.objectWithMap,
        keys.objectWithArrayAndSet,
      ]),
    ).toEqualTypeOf<
      [
        string | null,
        boolean | null,
        number | null,
        null,
        undefined | null,
        bigint | null,
        RegExp | null,
        Date | null,
        URL | null,
        Error | null,
        { a: number; b: { c: number; d: number } } | null,
        { name: string; age: number; email?: string } | null,
        { name: string; tags: string[] } | null,
        { name: string; roles: Set<string> } | null,
        { name: string; scores: Map<string, number> } | null,
        {
          user: {
            name: string;
            tags: string[];
            permissions: Set<string>;
          };
        } | null,
      ]
    >();
  });
});
