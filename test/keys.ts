import { StoreKey } from '../src/@types';

enum EnumTest {
  Light, Dark
}

export const keys = {
  stringKey: {
    ns: 'type-storage-test',
    key: 'string-test',
    defaultValue: 'string value',
  } as StoreKey<string>,

  booleanKey: {
    ns: 'type-storage-test',
    key: 'boolean-test',
    defaultValue: true,
  } as StoreKey<boolean>,

  numberKey: {
    ns: 'type-storage-test',
    key: 'number-test',
    defaultValue: 10,
  } as StoreKey<number>,

  objectKey: {
    ns: 'type-storage-test',
    key: 'object-test',
    defaultValue: { darkMode: false, fontSize: 16 },
  } as StoreKey<{ darkMode: boolean; fontSize: number }>,

  enumKey: {
    ns: 'type-storage-test',
    key: 'enum-test',
    defaultValue: EnumTest.Dark,
  } as StoreKey<EnumTest>,

  nullableKey: {
    ns: 'type-storage-test',
    key: 'nullable-test',
    defaultValue: null,
  } as StoreKey<string | null>,

  literalKey: {
    ns: 'type-storage-test',
    key: 'string-test',
    defaultValue: 'light',
  } as StoreKey<'light' | 'dark'>,
} as const;
