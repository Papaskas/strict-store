import { Persistable } from '@core/entities/persistable.entity';
import { ComplexTypeData } from '@strict-json/domain/entities/complex-type.entity';
import { typedArrayUtils } from '@strict-json/infrastructure/utils/typed-array.utils';
import { TypedArrayRegistry } from '@strict-json/infrastructure/typed-array/typed-array.registery';

type Decoder = (payload: ComplexTypeData) => Persistable;

export const complexTypeDecoder: Record<string, Decoder> = {
  bigint: (p) => BigInt(p.value as bigint),
  map: (p) => new Map(p.value as Map<Persistable, Persistable>),
  set: (p) => new Set(p.value as Set<Persistable>),
  typedArray: (p) => {
    const ab = typedArrayUtils.toArrayBuffer(p.value as ArrayBufferView);
    return new TypedArrayRegistry().from(String(p.subtype), ab) as Persistable;
  },
};
