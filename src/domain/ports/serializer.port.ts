import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { typeMarkerSymbol } from '@src/domain/types/type-marker.symbol';

export interface SerializerPort {
  parse<T extends Persistable>(s: string): T;
  stringify<T extends StoreKey<Persistable>>(value: T[typeof typeMarkerSymbol]): string;
}
