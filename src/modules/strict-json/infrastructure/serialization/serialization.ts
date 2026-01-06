import { StrictJsonSerializer } from '@strict-json/strict-json.service';
import { TypedArrayRegistry } from '@strict-json/infrastructure/typed-array/typed-array.registery';
import { ComplexTypeCodec } from '@strict-json/infrastructure/serialization/complex-type.codec';

const typedArrayRegistry = new TypedArrayRegistry();
const codec = new ComplexTypeCodec(typedArrayRegistry);

export const strictJson = new StrictJsonSerializer(codec);
