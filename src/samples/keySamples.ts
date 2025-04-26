import { StoreKey } from '../types';

enum EnumSample {
  Light, Dark
}

const keySamples = {
  stringSample: {
    namespace: 'typeStore',
    key: 'string-sample',
    defaultValue: 'light',
  } as StoreKey<'light' | 'dark'>,

  booleanSample: {
    namespace: 'typeStore',
    key: 'boolean-sample',
    defaultValue: true,
  } as StoreKey<boolean>,

  numberSample: {
    namespace: 'typeStore',
    key: 'number-sample',
    defaultValue: 10,
  } as StoreKey<number>,

  objectSample: {
    namespace: 'typeStore',
    key: 'object-sample',
    defaultValue: { darkMode: false, fontSize: 16 },
  } as StoreKey<{ darkMode: boolean; fontSize: number }>,

  enumSample: {
    namespace: 'typeStore',
    key: 'enum-sample',
    defaultValue: EnumSample.Dark,
  } as StoreKey<EnumSample>,

  undefinedSample: {
    namespace: 'typeStore',
    key: 'nullable-sample',
    defaultValue: undefined,
  } as StoreKey<string | undefined>,
} as const;
