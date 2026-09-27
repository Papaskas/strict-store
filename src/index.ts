import { StrictStoreService } from '@src/application/strict-store.service';
import { WebStorageResolver } from '@src/infrastructure/web-storage/web-storage.resolver';
import { SuperJsonAdapter } from '@src/infrastructure/super-json/super-json.adapter';
import { LodashMergeAdapter } from '@src/infrastructure/lodash/lodash-merge.adapter';
import { BroadcastChannelEventStorageAdapter } from '@src/infrastructure/broadcast-channel/broadcast-channel.adapter';
import { LocalEmitterAdapter } from '@src/infrastructure/broadcast-channel/local-emitter.adapter';
import { StrictStoreError } from './core/errors/strict-store.error';
import { StoreKey } from './core/store-key/store-key';

const webStorageResolver = new WebStorageResolver();
const superJsonAdapter = new SuperJsonAdapter();
const lodashMergeAdapter = new LodashMergeAdapter();
const localEmitterAdapter = new LocalEmitterAdapter();
const broadcastAdapter = new BroadcastChannelEventStorageAdapter(localEmitterAdapter);

const StrictStore = new StrictStoreService(
  webStorageResolver,
  superJsonAdapter,
  lodashMergeAdapter,
  broadcastAdapter,
);

const createKey = StoreKey.create.bind(StoreKey);

export { StrictStore, createKey, StrictStoreError };
