import { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key.entity';
import { SerializerPort } from '@core/ports/serializer.port';
import { SuperJSON } from 'superjson';

/**
 * A strict JSON serializer that handles advanced types like object, array, bigint, Map, Set, and TypedArray.
 */
export class StrictJsonSerializer implements SerializerPort {

  parse<T extends Persistable>(value: string): T {
    return SuperJSON.parse<T>(value);
  }

  stringify<T extends StoreKey<Persistable>>(value: T): string {
    return SuperJSON.stringify(value);
  }
}
