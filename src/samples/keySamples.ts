import { StorageKey } from '../@types';

enum EnumSample {
  Light, Dark
}

const keySamples = {
  stringSample: {
    namespace: 'type-storage',
    key: 'string-sample',
    defaultValue: 'string',
  } as StorageKey<string>,

  booleanSample: {
    namespace: 'type-storage',
    key: 'boolean-sample',
    defaultValue: true,
  } as StorageKey<boolean>,

  numberSample: {
    namespace: 'type-storage',
    key: 'number-sample',
    defaultValue: 10,
  } as StorageKey<number>,

  objectSample: {
    namespace: 'type-storage',
    key: 'object-sample',
    defaultValue: { darkMode: false, fontSize: 16 },
  } as StorageKey<{ darkMode: boolean; fontSize: number }>,

  enumSample: {
    namespace: 'type-storage',
    key: 'enum-sample',
    defaultValue: EnumSample.Dark,
  } as StorageKey<EnumSample>,

  undefinedSample: {
    namespace: 'type-storage',
    key: 'nullable-sample',
    defaultValue: undefined,
  } as StorageKey<string | undefined>,

  literalSample: {
    namespace: 'type-storage',
    key: 'string-sample',
    defaultValue: 'light',
  } as StorageKey<'light' | 'dark'>,
} as const;
