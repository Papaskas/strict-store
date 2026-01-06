import { StrictStoreService } from '@strict-store/strict-store.service';
import { createKey } from '@strict-store/app/create-key';
import { WebStorageProvider } from '@strict-store/infrastructure/providers/web-storage.provider';
import { strictJson } from '@strict-store/infrastructure/adapters/serialization/serialization.adapter';

const StrictStore = new StrictStoreService(new WebStorageProvider(), strictJson);

export { StrictStore, createKey };
