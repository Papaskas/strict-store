import { Persistable } from '@src/core/persistable/persistable';
import { StoreKey } from '@src/core/store-key/store-key';
import { SerializerPort } from '@src/application/outbound/serializer.port';
import { SuperJSON } from 'superjson';

export class SuperJsonAdapter implements SerializerPort {
  parse<T extends Persistable>(value: string): T {
    return SuperJSON.parse<T>(value);
  }

  stringify<T extends StoreKey<Persistable>>(value: T): string {
    return SuperJSON.stringify(value);
  }
}
