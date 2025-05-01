import { createKey } from '@src/strict-store';
import { Theme, User } from '@test/@types';

export const keys = {
  stringKey: createKey<string>(
    'test-ns',
    'string',
    'string value',
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

  hexKey: createKey<number>(
    'test-ns',
    'hex',
    0XFFFFFF,
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

  nullableStringKey: createKey<string | null>(
    'test-ns',
    'nullable-string',
    null,
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
