import { Serializable, StoreKey } from '@types';

/**
 * Creates a type-safe store key object for use with strictStore.
 *
 * @template T - Type of the stored value, must extend `Serializable`
 * @param ns - Namespace to prevent key collisions (e.g., 'app', 'user')
 * @param key - Unique identifier within the namespace
 * @param defaultValue - Default value returned if key doesn't exist in storage
 *
 * @returns A frozen `StoreKey<T>` object with strict type information
 *
 * @remarks
 * - The returned object is frozen with `as const` for type safety
 * - Namespace and key are combined to form the final storage key (e.g., 'app:counter')
 * - Default value determines the runtime type and TypeScript type inference
 *
 * @see {@link StoreKey} for the interface definition
 * @see {@link strictStore} for usage examples with storage methods
 */
export function createKey<T extends Serializable>(
  ns: string,
  key: string,
  defaultValue: T,
) {
  return {
    ns: ns,
    key: key,
    defaultValue: defaultValue,
  } as const satisfies StoreKey<T>;
}
