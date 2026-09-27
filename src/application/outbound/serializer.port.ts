import { Persistable } from '@src/core/persistable/persistable';
import { StoreKey } from '@src/core/store-key/store-key';
import { storeKeyBrand } from '@src/core/store-key/store-key.brand';

export interface SerializerPort {
  parse<T extends Persistable>(s: string): T;
  stringify<T extends StoreKey<Persistable>>(value: T[typeof storeKeyBrand]): string;
}
