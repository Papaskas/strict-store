import { KeyValueStoragePort } from '@src/application/outbound/key-value-storage.port';

export const webStorageAdapter = (storage: Storage): KeyValueStoragePort => ({
  get: (key: string) => storage.getItem(key),

  set: (data: {key: string, value: string}) => storage.setItem(data.key, data.value),

  remove: (key: string) => storage.removeItem(key),

  length: () => storage.length,

  clear: () => storage.clear(),

  key: (index: number) => storage.key(index),
});
