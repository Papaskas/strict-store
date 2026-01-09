import { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key/store-key.entity';
import { phantomTypeSymbol } from '@core/types/phantom-type.symbol';

export interface SerializerPort {
  parse<T extends Persistable>(s: string): T;
  stringify<T extends StoreKey<Persistable>>(value: T[typeof phantomTypeSymbol]): string;
}
