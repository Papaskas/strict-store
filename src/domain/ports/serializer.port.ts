import { Persistable } from '@src/domain/entities/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { phantomTypeSymbol } from '@src/domain/types/phantom-type.symbol';

export interface SerializerPort {
  parse<T extends Persistable>(s: string): T;
  stringify<T extends StoreKey<Persistable>>(value: T[typeof phantomTypeSymbol]): string;
}
