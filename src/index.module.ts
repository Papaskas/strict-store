import { StrictStoreService } from '@src/services/strict-store.service';
import { storeKeyFactory } from '@src/domain/entities/store-key/store-key.factory';
import { WebStorageProvider } from '@src/infrastructure/providers/web-storage.provider';
import { SuperJsonAdapter } from '@src/infrastructure/adapters/super-json.adapter';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { LodashMergeAdapter } from '@src/infrastructure/adapters/lodash-merge.adapter';
import { EventStorageAdapter } from '@src/infrastructure/adapters/event-storage.adapter';

const webStorageProvider = new WebStorageProvider();
const superJsonAdapter = new SuperJsonAdapter();
const lodashMergeAdapter = new LodashMergeAdapter();
const eventStorageAdapter = new EventStorageAdapter();

const StrictStore = new StrictStoreService(
  webStorageProvider,
  superJsonAdapter,
  lodashMergeAdapter,
  eventStorageAdapter,
);

export {
  StrictStore,
  storeKeyFactory as createKey,
  STRICT_STORE_ERROR_CODE,
};
