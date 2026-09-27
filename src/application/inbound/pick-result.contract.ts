import { StoreKey } from '@src/core/store-key/store-key';
import { Persistable } from '@src/core/persistable/persistable';

export type PickResult<K extends StoreKey<Persistable>[]> = {
  [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never;
};
