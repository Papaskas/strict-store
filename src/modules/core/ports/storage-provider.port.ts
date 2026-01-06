import { StoreType } from '@core/entities/store-type.entity';
import { KeyValueStoragePort } from '@core/ports/key-value-storage.port';

export interface StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort;
}
