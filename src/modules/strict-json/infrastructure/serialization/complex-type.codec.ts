import { typedArrayPolicy } from '@core/policies/typed-array.policy';
import { ComplexTypeData } from '@strict-json/domain/entities/complex-type.entity';
import type { Persistable, NativePersistable } from '@core/entities/persistable.entity';
import type { ComplexTypeCodecPort } from '@core/ports/complex-type.port';
import type { TypedArrayRegistryPort } from '@core/ports/typed-array-registry.port';
import { TypedArray } from 'type-fest';
import { complexTypeMappers } from '@strict-json/infrastructure/mapper/complex-type.mapper';
import { typedArrayUtils } from '@strict-json/infrastructure/utils/typed-array.utils';

const isComplexPayload = (v: unknown): v is ComplexTypeData =>
  v !== null && typeof v === 'object' && '__type' in (v as any) && 'value' in (v as any);

export class ComplexTypeCodec implements ComplexTypeCodecPort {
  constructor(private readonly typedArrayRegistry: TypedArrayRegistryPort) {}

  encode(value: Persistable): ComplexTypeData | null {
    if (typeof value === 'bigint') return complexTypeMappers.bigint(value);
    if (value instanceof Map) return complexTypeMappers.map(value);
    if (value instanceof Set) return complexTypeMappers.set(value);
    if (typedArrayPolicy.isTypedArray(value)) return complexTypeMappers.typedArray(value);
    return null;
  }

  decode(value: NativePersistable | ComplexTypeData): Persistable | null {
    if (!isComplexPayload(value)) return null;

    switch (value.__type) {
      case 'bigint':
        return BigInt(value.value as bigint);
      case 'map':
        return new Map(value.value as Map<Persistable, Persistable>);
      case 'set':
        return new Set(value.value as Set<Persistable>);
      case 'typedArray': {
        const ta = value.value as TypedArray;
        const ab = typedArrayUtils.toArrayBuffer(ta);
        return this.typedArrayRegistry.from(String(value.subtype), ab);
      }
      default:
        throw new Error(`Unknown __type: ${(value as any).__type}`);
    }
  }
}
