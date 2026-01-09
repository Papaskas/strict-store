import { PersistenceType } from '@src/domain/entities/persistence-type.entity';
import { KeyValueStoragePort } from '@src/domain/ports/key-value-storage.port';
import { StorageProviderPort } from '@src/domain/ports/storage-provider.port';
import { webStorageAdapter } from '@src/infrastructure/adapters/web-storage.adapter';

export class WebStorageProvider implements StorageProviderPort {
  get(type: PersistenceType): KeyValueStoragePort {
    return webStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
