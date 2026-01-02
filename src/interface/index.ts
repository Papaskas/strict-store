import { StrictStoreService } from '@src/app/strict-store.service';
import { createKey } from '@src/domain/policies/create-key';
import { strictJson } from '@src/infrastructure/serialization/strict-store.adapter';
import { BrowserStorageProvider } from '@src/infrastructure/web/web-storage.adapter';

const createWebStrictStore = () =>
  new StrictStoreService(new BrowserStorageProvider(), strictJson);

const StrictStore = createWebStrictStore();

export {
  StrictStore,
  createKey,
}
