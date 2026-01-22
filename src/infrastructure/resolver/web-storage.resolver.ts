import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { KeyValueStoragePort } from '@src/domain/ports/key-value-storage.port';
import { StorageResolverPort } from '@src/domain/ports/storage.resolver.port';
import { webStorageAdapter } from '@src/infrastructure/adapters/web-storage.adapter';

export class WebStorageResolver implements StorageResolverPort {
  resolve(type: PersistenceType): KeyValueStoragePort {
    return webStorageAdapter(type === 'local' ? localStorage : sessionStorage);
  }
}
