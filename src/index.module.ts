import { StrictStoreService } from '@strict-store/strict-store.service';
import { createKey } from '@strict-store/app/create-key';
import { WebStorageProvider } from '@strict-store/infrastructure/providers/web-storage.provider';
import { StrictJsonService } from '@strict-json/strict-json.service';

const serializer = new StrictJsonService();
const StrictStore = new StrictStoreService(new WebStorageProvider(), serializer);

export { StrictStore, createKey };
