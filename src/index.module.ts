import { StrictStoreService } from '@src/services/strict-store.service';
import { storeKeyFactory } from '@src/domain/entities/store-key/store-key.factory';
import { WebStorageProvider } from '@src/infrastructure/providers/web-storage.provider';
import { SerializationAdapter } from '@src/infrastructure/adapters/serialization.adapter';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { MergeAdapter } from '@src/infrastructure/adapters/merge.adapter';

const serializationAdapter = new SerializationAdapter();
const mergeAdapter = new MergeAdapter();
const StrictStore = new StrictStoreService(new WebStorageProvider(), serializationAdapter, mergeAdapter);

export {
  StrictStore,
  storeKeyFactory as createKey,
  STRICT_STORE_ERROR_CODE,
};
