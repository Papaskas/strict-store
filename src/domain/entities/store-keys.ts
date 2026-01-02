import { Persistable } from '@src/domain/entities/persistable';
import { StoreType } from '@src/domain/entities/store-type';

/**
 * Defines a type-safe storage name structure for `StrictStore` operations.
 * @public
 *
 * @typeParam T - Concrete serializable type for this storage entry
 *
 * @param ns - Namespace prefix to prevent name collisions between modules
 * @param name - Name of the storage entry
 * @param key - Unique identifier within the ns
 * @param __type - Acceptable types for key
 * */
export type StoreKey<T extends Persistable> = {
  readonly ns: string;
  readonly name: string;
  readonly storeType: StoreType;
  readonly __type: T;
};

