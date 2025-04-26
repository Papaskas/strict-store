import { StorageKey } from '../@types';

enum EnumSample {
  Light, Dark
}

const keySamples = {
  stringSample: {
    ns: 'type-storage',
    key: 'string-sample',
    defaultValue: 'string',
  } as StorageKey<string>,

  booleanSample: {
    ns: 'type-storage',
    key: 'boolean-sample',
    defaultValue: true,
  } as StorageKey<boolean>,

  numberSample: {
    ns: 'type-storage',
    key: 'number-sample',
    defaultValue: 10,
  } as StorageKey<number>,

  objectSample: {
    ns: 'type-storage',
    key: 'object-sample',
    defaultValue: { darkMode: false, fontSize: 16 },
  } as StorageKey<{ darkMode: boolean; fontSize: number }>,

  enumSample: {
    ns: 'type-storage',
    key: 'enum-sample',
    defaultValue: EnumSample.Dark,
  } as StorageKey<EnumSample>,

  undefinedSample: {
    ns: 'type-storage',
    key: 'nullable-sample',
    defaultValue: undefined,
  } as StorageKey<string | undefined>,

  literalSample: {
    ns: 'type-storage',
    key: 'string-sample',
    defaultValue: 'light',
  } as StorageKey<'light' | 'dark'>,
} as const;
