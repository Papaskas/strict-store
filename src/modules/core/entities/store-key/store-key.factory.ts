import { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key/store-key.entity';
import { PersistenceType } from '@core/entities/persistence-type.entity';
import { STORE_KEY_ERROR } from '@core/entities/store-key/store-key.error';

/**
 * Creates a type-safe store name object for use with StrictStore.
 * @public
 *
 * @typeParam T - Type of the stored value, must extend `Persistable`
 *
 * @param ns - Namespace to prevent name collisions (e.g., 'app', 'user')
 * @param name - Unique identifier within the ns
 * @param storeType - Determines which Web Storage API to use:
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
  storeType: PersistenceType = 'local',
): StoreKey<T> => {
  if (ns.includes(':') || name.includes(':')) throw new Error(STORE_KEY_ERROR.containsColon);
  else if (ns.length === 0 || name.length === 0)
    throw new Error(STORE_KEY_ERROR.emptyNameOrNamespace);

  return {
    ns: ns,
    name: name,
    storeType: storeType,
  } as const satisfies StoreKey<T>;
};
