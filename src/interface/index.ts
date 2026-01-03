import { StrictStoreService } from '@src/app/strict-store.service';
import { createKey } from '@src/app/create-key';
import { WebStorageProvider } from '@src/infrastructure/providers/web-storage.provider';
import { strictJson } from '@src/infrastructure/adapters/serialization/serialization.adapter';

const StrictStore = new StrictStoreService(new WebStorageProvider(), strictJson);

export {
  StrictStore,
  createKey,
}
