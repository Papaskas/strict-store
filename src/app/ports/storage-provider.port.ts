import { StoreType } from '@src/domain/entities/store-type.entity';
import { KeyValueStoragePort } from '@src/app/ports/key-value-storage.port';

export interface StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort;
}
