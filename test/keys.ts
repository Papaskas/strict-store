import { createKey } from '@src/strict-store';
import { Theme, User } from '@test/@types';

export const keys = {
  stringKey: createKey<string>(
    'test-ns',
    'string',
  ),

  booleanKey: createKey<boolean>(
    'test-ns',
    'boolean',
    'session'
  ),

  numberKey: createKey<number>(
    'test-ns',
    'number',
    'session'
  ),

  objectKey: createKey<User>(
    'test-ns',
    'object',
  ),

  enumKey: createKey<Theme>(
    'test-ns',
    'enum',
  ),

  setKey: createKey(
    'test-ns',
    'set',
  ),

  mapKey: createKey<Map<string, number>>(
    'test-ns',
    'userMap',
  ),

  nullableStringKey: createKey<string | null>(
    'test-ns',
    'nullable-string',
  ),

  typedArrayKey: createKey<Int8Array>(
    'test-ns',
    'typedArray',
  ),

  literalKey: createKey<'light' | 'dark' | null>(
    'test-ns',
    'literal',
  ),

  bigIntKey: createKey<bigint>(
    'test-ns',
    'bigInt',
  ),

  arrayIntKey: createKey<number[]>(
    'test-ns',
    'arrayInt',
  ),

  usersKey: createKey<User[]>(
    'test-ns',
    'users',
  ),
} as const;
