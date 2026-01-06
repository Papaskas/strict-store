import { createKey } from '../../src/index.module';

export const keys = {
  stringKey: createKey<string>('test-ns', 'string'),

  booleanKey: createKey<boolean>('test-ns', 'boolean', 'session'),

  numberKey: createKey<number>('test-ns', 'number', 'session'),

  nullKey: createKey<null>('test-ns', 'null', 'local'),
} as const;
