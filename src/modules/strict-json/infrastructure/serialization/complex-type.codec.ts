import { typedArrayPolicy } from '@core/policies/typed-array.policy';
import type { Persistable, NativePersistable } from '@core/entities/persistable.entity';
import type { ComplexTypeCodecPort } from '@core/ports/complex-type.port';
import type { ComplexTypeData } from '@strict-json/domain/entities/complex-type.entity';
import { complexTypeEncoders } from '@strict-json/infrastructure/mapper/complex-type.encoder';
import { complexTypeDecoder } from '@strict-json/infrastructure/mapper/complex-type.decoder';

const isComplexPayload = (v: unknown): v is ComplexTypeData =>
  v !== null && typeof v === 'object' && '__type' in v && 'value' in v;

export class ComplexTypeCodec implements ComplexTypeCodecPort {
  encode(value: Persistable): ComplexTypeData | null {
    if (typeof value === 'bigint') return complexTypeEncoders.bigint(value);
    if (value instanceof Map) return complexTypeEncoders.map(value);
    if (value instanceof Set) return complexTypeEncoders.set(value);
    if (typedArrayPolicy.isTypedArray(value)) return complexTypeEncoders.typedArray(value);
    return null;
  }

  decode(value: NativePersistable | ComplexTypeData): Persistable | null {
    if (!isComplexPayload(value)) return null;

    const decode = complexTypeDecoder[value.__type];
    if (!decode) throw new Error(`Unknown __type: ${String(value.__type)}`);

    return decode(value);
  }
}
