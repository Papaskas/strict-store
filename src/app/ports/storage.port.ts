import { KeyValueStoragePort } from '@src/app/ports/key-value-storage.port';

export interface StoragePort {
  local: KeyValueStoragePort;
  session: KeyValueStoragePort;
}
