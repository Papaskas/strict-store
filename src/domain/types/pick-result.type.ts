import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { Persistable } from '@src/domain/entities/core/persistable.entity';

export type PickResult<K extends StoreKey<Persistable>[]> = {
  [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never;
};
