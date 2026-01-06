import { StoreType } from '@core/entities/store-type.entity';
import { KeyValueStoragePort } from '@core/ports/key-value-storage.port';
import { StorageProviderPort } from '@core/ports/storage-provider.port';
import { webStorageAdapter } from '@strict-store/infrastructure/adapters/web-storage.adapter';

export class WebStorageProvider implements StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort {
    return webStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
