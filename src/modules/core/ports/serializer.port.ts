import { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key.entity';

export interface SerializerPort {
  parse<T extends Persistable>(s: string): T;
  stringify<T extends StoreKey<Persistable>>(value: T['__type']): string;
}
