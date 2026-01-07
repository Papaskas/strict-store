import { TypedArrayRegistryPort } from '@core/ports/typed-array-registry.port';
import { TYPED_ARRAY_CONSTRUCTORS } from '@strict-json/domain/entities/typed-array-constructors.entity';
import { TypedArray } from '@core/entities/typed-array.entity';

export type TypedArraySubtype = keyof typeof TYPED_ARRAY_CONSTRUCTORS;

export class TypedArrayRegistry implements TypedArrayRegistryPort {
  from(subtype: string, buffer: ArrayBuffer): TypedArray {
    const Ctor = TYPED_ARRAY_CONSTRUCTORS[subtype as TypedArraySubtype];
    if (!Ctor) throw new Error(`Unsupported TypedArray type: ${subtype}`);
    return new Ctor(buffer);
  }
}
