import { KeyValueStoragePort } from '@src/app/ports/key-value-storage.port';
import { StorageProviderPort } from '@src/app/ports/storage-provider.port';
import { StoreType } from '@src/domain/entities/store-type';
import { webStorageAdapter } from '@src/infrastructure/adapters/web-storage.adapter';

export class WebStorageProvider implements StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort {
    return webStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
