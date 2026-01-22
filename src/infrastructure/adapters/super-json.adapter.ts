import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { SerializerPort } from '@src/domain/ports/serializer.port';
import { SuperJSON } from 'superjson';

export class SuperJsonAdapter implements SerializerPort {
  parse<T extends Persistable>(value: string): T {
    return SuperJSON.parse<T>(value);
  }

  stringify<T extends StoreKey<Persistable>>(value: T): string {
    return SuperJSON.stringify(value);
  }
}
