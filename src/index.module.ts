import { StrictStoreService } from '@strict-store/strict-store.service';
import { createKey } from '@strict-store/app/create-key';
import { WebStorageProvider } from '@strict-store/infrastructure/providers/web-storage.provider';
import { StrictJsonSerializer } from '@strict-json/strict-json.service';
import { ComplexTypeCodec } from '@strict-json/infrastructure/serialization/complex-type.codec';
import { TypedArrayRegistry } from '@strict-json/infrastructure/typed-array/typed-array.registery';

const complexTypeCodec = new ComplexTypeCodec(new TypedArrayRegistry());
const serializer = new StrictJsonSerializer(complexTypeCodec);
const StrictStore = new StrictStoreService(new WebStorageProvider(), serializer);

export { StrictStore, createKey };
