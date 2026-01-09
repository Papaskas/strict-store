import { PersistenceType } from '@core/entities/persistence-type.entity';
import { KeyValueStoragePort } from '@core/ports/key-value-storage.port';

export interface StorageProviderPort {
  get(type: PersistenceType): KeyValueStoragePort;
}
