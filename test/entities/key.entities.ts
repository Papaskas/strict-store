import { createKey } from '../../src/interface';

export const Keys = {
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
} as const;
