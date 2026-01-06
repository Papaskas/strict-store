import { ComplexTypeCodecPort } from '@core/ports/complex-type.port';
import { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key.entity';
import { SerializerPort } from '@core/ports/serializer.port';

/**
 * A strict JSON serializer that handles complex types like bigint, Map, Set, and TypedArray.
 */
export class StrictJsonSerializer implements SerializerPort {
  constructor(private readonly codec: ComplexTypeCodecPort) {}

  parse<T extends Persistable>(value: string): T {
    return JSON.parse(value, (_k, v) => this.codec.decode(v) ?? v) as T;
  }

  stringify<T extends StoreKey<Persistable>>(value: T['__type']): string {
    return JSON.stringify(value, (_k, v) => this.codec.encode(v as Persistable) ?? (v as any));
  }
}
