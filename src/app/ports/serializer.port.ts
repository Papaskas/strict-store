import { Persistable } from '@src/domain/entities/persistable';
import { StoreKey } from '@src/domain/entities/store-keys';

export interface SerializerPort {
  parse<T extends Persistable>(s: string): T;
  stringify<T extends StoreKey<Persistable>>(value: T['__type']): string;
}
