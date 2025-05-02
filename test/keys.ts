import { createKey } from '@src/strict-store';
import { Theme, User } from '@test/@types';

export const keys = {
  stringKey: createKey<string>(
    'test-ns',
    'string',
    'default value',
  ),

  booleanKey: createKey<boolean>(
    'test-ns',
    'boolean',
    true,
    'session'
  ),

  numberKey: createKey<number>(
    'test-ns',
    'number',
    10,
    'session'
  ),

  objectKey: createKey<User>(
    'test-ns',
    'object',
    {
      first_name: null,
      last_name: null,
      age: 35,
      cash: 100n,
      hasEmail: false,
    },
  ),

  enumKey: createKey<Theme>(
    'test-ns',
    'enum',
    Theme.Dark,
  ),

  setKey: createKey(
    'test-ns',
    'set',
    new Set(['first', 'second']),
  ),

  mapKey: createKey(
    'test-ns',
    'userMap',
    new Map<string, number>([['admin', 1]])
  ),

  nullableStringKey: createKey<string | null>(
    'test-ns',
    'nullable-string',
    null,
  ),

  typedArrayKey: createKey<Int8Array>(
    'test-ns',
    'typedArray',
    new Int8Array([21, 31])
  ),

  literalKey: createKey<'light' | 'dark' | null>(
    'test-ns',
    'literal',
    null,
  ),

  bigIntKey: createKey<bigint>(
    'test-ns',
    'bigInt',
    88888888888888888n,
  ),

  arrayIntKey: createKey<number[]>(
    'test-ns',
    'arrayInt',
    []
  ),

  usersKey: createKey<User[]>(
    'test-ns',
    'users',
    []
  ),
} as const;
