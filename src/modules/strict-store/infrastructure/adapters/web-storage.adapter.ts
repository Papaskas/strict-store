import { KeyValueStoragePort } from "@core/ports/key-value-storage.port";

export const webStorageAdapter = (storage: Storage): KeyValueStoragePort => ({
  get: (key: string) => storage.getItem(key),

  set: (key: string, value: string) => storage.setItem(key, value),

  remove: (key: string) => storage.removeItem(key),

  length: () => storage.length,

  clear: () => storage.clear(),

  key: (index: number) => storage.key(index),
});
