import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { typeMarkerSymbol } from '@src/domain/types/type-marker.symbol';

/**
 * Defines a type-safe storage name structure for `StrictStore` operations.
 * @public
 *
 * @typeParam T - Concrete serializable type for this storage entry
 *
 * @param ns - Namespace prefix to prevent name collisions between modules
 * @param name - Name of the storage entry
 * @param key - Unique identifier within the ns
 * */
export type StoreKey<T extends Persistable> = {
  readonly ns: string;
  readonly name: string;
  readonly persistenceType: PersistenceType;
} & TypeMarker<T>;

type TypeMarker<T> = {
  readonly [typeMarkerSymbol]: T;
};
