import { KeyValueStoragePort, StorageProviderPort } from '@src/app/ports/storage.port';
import { StoreType } from '@src/domain/entities/store-type';

class WebStorageAdapter implements KeyValueStoragePort {
  constructor(private readonly storage: Storage) {}

  get(k: string) { return this.storage.getItem(k); }
  set(k: string, v: string) { this.storage.setItem(k, v); }
  remove(k: string) { this.storage.removeItem(k); }
  keys() {
    const out: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k) out.push(k);
    }
    return out;
  }
}

export class BrowserStorageProvider implements StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort {
    return new WebStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
