import { KeyValueStoragePort } from '@src/app/ports/key-value-storage.port';

export const webStorageAdapter = (storage: Storage): KeyValueStoragePort => ({
  get: (key) => storage.getItem(key),

  set: (key, value) => storage.setItem(key, value),

  remove: (key) => storage.removeItem(key),

  length: () => storage.length,

  clear: () => storage.clear(),

  keys: () => {
    const out: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k) out.push(k);
    }
    return out;
  },
});
