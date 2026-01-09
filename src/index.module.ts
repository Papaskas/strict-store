import { StrictStoreService } from '@src/services/strict-store.service';
import { storeKeyFactory } from '@src/domain/entities/store-key/store-key.factory';
import { WebStorageProvider } from '@src/infrastructure/providers/web-storage.provider';
import { StrictJsonService } from '@src/services/strict-json.service';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';

const serializer = new StrictJsonService();
const StrictStore = new StrictStoreService(new WebStorageProvider(), serializer);

export {
  StrictStore,
  storeKeyFactory as createKey,
  STRICT_STORE_ERROR_CODE,
};
