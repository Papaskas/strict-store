import { createKey } from 'strict-store';

export const keys = {
  stringKey: createKey<string>('test-ns', 'string'),

  booleanKey: createKey<boolean>('test-ns', 'boolean', 'session'),

  numberKey: createKey<number>('test-ns', 'number', 'session'),

  nullKey: createKey<null>('test-ns', 'null', 'local'),

  undefinedKey: createKey<undefined>('test-ns', 'undefined', 'local'),

  bigintKey: createKey<bigint>('test-ns', 'bigint', 'local'),

  regexpKey: createKey<RegExp>('test-ns', 'regexp', 'local'),

  dateKey: createKey<Date>('test-ns', 'date', 'local'),

  urlKey: createKey<URL>('test-ns', 'URL', 'local'),

  errorKey: createKey<Error>('test-ns', 'null', 'local'),

  objIncludedObj: createKey<{ a: number; b: { c: number; d: number } }>('test-ns', 'user'),

  objectKey: createKey<{ name: string; age: number; email?: string }>('test-ns', 'user'),

  objectWithArray: createKey<{ name: string; tags: string[] }>('test-ns', 'arr'),

  objectWithSet: createKey<{ name: string; roles: Set<string> }>('test-ns', 'set'),

  objectWithMap: createKey<{ name: string; scores: Map<string, number> }>('test-ns', 'map'),

  objectWithArrayAndSet: createKey<{
    user: {
      name: string;
      tags: string[];
      permissions: Set<string>;
    };
  }>('test-ns', 'complex'),

  ns1Key: createKey<string>('ns1', 'ns1', 'local'),
  ns2Key: createKey<string>('ns2', 'ns2', 'local'),
  ns3Key: createKey<string>('ns3', 'ns3', 'session'),
  ns4Key: createKey<string>('ns4', 'ns4', 'session'),
} as const;
