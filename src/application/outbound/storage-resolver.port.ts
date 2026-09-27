import { PersistenceType } from '@src/core/store-key/persistence-type';
import { KeyValueStoragePort } from '@src/application/outbound/key-value-storage.port';

export interface StorageResolverPort {
  resolve(type: PersistenceType): KeyValueStoragePort;
}
