import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { phantomTypeSymbol } from '@src/domain/types/phantom-type.symbol';

/**
 * Defines a type-safe storage name structure for `StrictStore` operations.
 * @public
 *
 * @typeParam T - Concrete serializable type for this storage entry
 *
 * @param ns - Namespace prefix to prevent name collisions between modules
 * @param name - Name of the storage entry
 * @param key - Unique identifier within the ns
 * @param __runtime_type - Iternal acceptable types for a key
 * */
export type StoreKey<T extends Persistable> = {
  readonly ns: string;
  readonly name: string;
  readonly persistenceType: PersistenceType;
  readonly [phantomTypeSymbol]?: T;
};
