import { StoreType } from '@src/domain/entities/store-type';

export interface KeyValueStoragePort {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(): string[];
}

export interface StorageProviderPort {
  get(type: StoreType): KeyValueStoragePort;
}
