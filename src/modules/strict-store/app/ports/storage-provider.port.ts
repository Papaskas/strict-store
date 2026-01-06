import { StoreType } from '@core/entities/store-type.entity';
import { KeyValueStoragePort } from '@strict-store/app/ports/key-value-storage.port';

export interface StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort;
}
