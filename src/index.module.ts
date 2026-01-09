import { StrictStoreService } from '@strict-store/strict-store.service';
import { storeKeyFactory } from '@core/entities/store-key/store-key.factory';
import { WebStorageProvider } from '@strict-store/infrastructure/providers/web-storage.provider';
import { StrictJsonService } from '@strict-json/strict-json.service';
import { STRICT_STORE_ERROR_CODE } from '@core/entities/errors/strict-store.error.code';

const serializer = new StrictJsonService();
const StrictStore = new StrictStoreService(new WebStorageProvider(), serializer);

export {
  StrictStore,
  storeKeyFactory as createKey,
  STRICT_STORE_ERROR_CODE,
};
