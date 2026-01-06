import { StrictStoreService } from '@strict-store/strict-store.service';
import { createKey } from '@strict-store/app/create-key';
import { WebStorageProvider } from '@strict-store/infrastructure/providers/web-storage.provider';
import { StrictJsonSerializer } from '@strict-json/strict-json.service';
import { ComplexTypeCodec } from '@strict-json/infrastructure/serialization/complex-type.codec';

const complexTypeCodec = new ComplexTypeCodec();
const serializer = new StrictJsonSerializer(complexTypeCodec);
const StrictStore = new StrictStoreService(new WebStorageProvider(), serializer);

export { StrictStore, createKey };
