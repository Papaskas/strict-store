import { StorageKey } from '../src/@types';

enum EnumTest {
  Light, Dark
}

export const keys = {
  stringKey: {
    ns: 'type-storage-test',
    key: 'string-test',
    defaultValue: 'string value',
  } as StorageKey<string>,

  booleanKey: {
    ns: 'type-storage-test',
    key: 'boolean-test',
    defaultValue: true,
  } as StorageKey<boolean>,

  numberKey: {
    ns: 'type-storage-test',
    key: 'number-test',
    defaultValue: 10,
  } as StorageKey<number>,

  objectKey: {
    ns: 'type-storage-test',
    key: 'object-test',
    defaultValue: { darkMode: false, fontSize: 16 },
  } as StorageKey<{ darkMode: boolean; fontSize: number }>,

  enumKey: {
    ns: 'type-storage-test',
    key: 'enum-test',
    defaultValue: EnumTest.Dark,
  } as StorageKey<EnumTest>,

  nullableKey: {
    ns: 'type-storage-test',
    key: 'nullable-test',
    defaultValue: null,
  } as StorageKey<string | null>,

  literalKey: {
    ns: 'type-storage-test',
    key: 'string-test',
    defaultValue: 'light',
  } as StorageKey<'light' | 'dark'>,
} as const;
