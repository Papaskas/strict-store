import { PersistenceType } from '@src/domain/entities/persistence-type.entity';
import { KeyValueStoragePort } from '@src/domain/ports/key-value-storage.port';

export interface StorageProviderPort {
  get(type: PersistenceType): KeyValueStoragePort;
}
