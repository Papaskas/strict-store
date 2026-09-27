import { PersistenceType } from '@src/core/store-key/persistence-type';
import { KeyValueStoragePort } from '@src/application/outbound/key-value-storage.port';
import { StorageResolverPort } from '@src/application/outbound/storage-resolver.port';
import { webStorageAdapter } from '@src/infrastructure/web-storage/web-storage.adapter';

export class WebStorageResolver implements StorageResolverPort {
  resolve(type: PersistenceType): KeyValueStoragePort {
    return webStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
