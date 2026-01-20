import { StrictStoreService } from '@src/services/strict-store.service';
import { storeKeyFactory } from '@src/domain/entities/store-key/store-key.factory';
import { WebStorageProvider } from '@src/infrastructure/providers/web-storage.provider';
import { SuperJsonAdapter } from '@src/infrastructure/adapters/super-json.adapter';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { LodashMergeAdapter } from '@src/infrastructure/adapters/lodash-merge.adapter';
import { BroadcastChannelEventStorageAdapter } from '@src/infrastructure/adapters/broadcast-channel.adapter';
import { LocalEmitterAdapter } from '@src/infrastructure/adapters/local-emitter.adapter';

const webStorageProvider = new WebStorageProvider();
const superJsonAdapter = new SuperJsonAdapter();
const lodashMergeAdapter = new LodashMergeAdapter();
const localEmitterAdapter = new LocalEmitterAdapter();
const broadcastAdapter = new BroadcastChannelEventStorageAdapter(localEmitterAdapter);

const StrictStore = new StrictStoreService(
  webStorageProvider,
  superJsonAdapter,
  lodashMergeAdapter,
  broadcastAdapter,
);

export {
  StrictStore,
  storeKeyFactory as createKey,
  STRICT_STORE_ERROR_CODE,
};
