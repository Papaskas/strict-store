import { KeyValueStoragePort } from '@strict-store/app/ports/key-value-storage.port';
import { StorageProviderPort } from '@strict-store/app/ports/storage-provider.port';
import { StoreType } from '@core/entities/store-type.entity';
import { webStorageAdapter } from '@strict-store/infrastructure/adapters/web-storage.adapter';

export class WebStorageProvider implements StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort {
    return webStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
