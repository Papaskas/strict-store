import { createKey } from '../../src/index.module';

export const keys = {
  stringKey: createKey<string>('test-ns', 'string'),

  booleanKey: createKey<boolean>('test-ns', 'boolean', 'session'),

  numberKey: createKey<number>('test-ns', 'number', 'session'),

  nullKey: createKey<null>('test-ns', 'null', 'local'),

  userKey: createKey<{ name: string; age: number; email?: string }>('test-ns', 'user'),

  objKey: createKey<{ a: number; b: { c: number; d: number } }>('test-ns', 'object'),

  objectWithArray: createKey<{ name: string; tags: string[] }>('test-ns', 'arr'),

  objectWithSet: createKey<{ name: string; roles: Set<string> }>('test-ns', 'set'),

  objectWithMap: createKey<{ name: string; scores: Map<string, number> }>('test-ns', 'map'),

  objectWithArrayAndSet: createKey<{
    user: {
      name: string;
      tags: string[];
      permissions: Set<string>;
    }
  }>('test-ns', 'complex'),
} as const;
