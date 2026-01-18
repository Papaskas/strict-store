import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { StrictStoreError } from '@src/domain/entities/errors/strict-store.error';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';

/**
 * Creates a type-safe store name object for use with StrictStore.
 * @public
 *
 * @typeParam T - Type of the stored value, must extend `Persistable`
 *
 * @param ns - Namespace to prevent name collisions (e.g., 'app', 'user')
 * @param name - Unique identifier within the ns
 * @param persistenceType - Determines which Web Storage API to use:
 *                  - 'local': Uses `localStorage`
 *                  - 'session': Uses `sessionStorage`
 *
 * @returns A frozen `StoreKey<T>` object with strict type information
 *
 * @remarks
 * - The returned object is frozen with `as const` for type safety
 * - Namespace and name are combined to form the final storage name (e.g., 'app:counter')
 *
 * @see {@link StrictStore} for usage examples with storage methods
 */
export const storeKeyFactory = <T extends Persistable>(
  ns: string,
  name: string,
  persistenceType: PersistenceType = 'local',
): StoreKey<T> => {
  if (ns.includes(':') || name.includes(':')) {
    throw new StrictStoreError(STRICT_STORE_ERROR_CODE.STORE_KEY_CONTAINS_COLON);
  }

  if (ns.length === 0 || name.length === 0) {
    throw new StrictStoreError(STRICT_STORE_ERROR_CODE.STORE_KEY_EMPTY_NAME_OR_NAMESPACE);
  }

  return {
    ns: ns,
    name: name,
    persistenceType: persistenceType,
  } as const satisfies StoreKey<T>;
};
