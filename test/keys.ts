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
    { first_name: null, last_name: null },
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

  bigIntKey: createKey<BigInt>(
    'test-ns',
    'bigInt',
    BigInt(88888888888888888),
  ),

  arrayIntKey: createKey<number[]>(
    'test-ns',
    'arrayInt',
    []
  ),

  arrayAnyKey: createKey<any[]>(
    'test-ns',
    'arrayInt',
    [0, 'das', false, BigInt(999999999999999999999999999999)],
  ),
} as const;
