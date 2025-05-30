import { Serializable, StoreType, StoreKey } from '@src/types';
import { strictJson } from '@src/strict-json';
import { getFullName, getStorage } from '@src/utils';

/**
 * A type-safe wrapper around localStorage and sessionStorage that provides:
 * - Automatic JSON serialization/deserialization
 * - Namespace support to prevent name collisions
 * - Strict typing for all operations
 *
 * @example
 * ```ts
 * const name = createKey<'light', 'dark'>(
 *  'app',
 *  'theme',
 * );
 *
 * strictStore.save(name, 'dark'); // Only the literal type is allowed
 * const theme: 'light' | 'dark' | null = StrictStore.get(name); // Return the literal type
 * ```
 */
const strictStore = {

  /**
   * Retrieves a value from storage.
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key StoreKey object containing ns, name and default value
   * @returns The stored value
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * const theme: 'light' | 'dark' | null = strictStore.get(themeKey);
   * ```
   *
   * @remarks
   * - Automatically handles JSON parsing
   */
  get<T extends Serializable>(key: StoreKey<T>): T | null {
    const storage = getStorage(key.storeType);
    const storedValue = storage.getItem(getFullName(key.ns, key.name));

    if(storedValue === null) return storedValue;

    return strictJson.parse<T>(storedValue)
  },

  /**
   * Retrieves values from storage for a tuple of keys, preserving the type for each key.
   *
   * @typeParam K A tuple of StoreKey objects with different value types
   * @param keys A tuple of StoreKey objects
   * @returns A tuple of values (or null), corresponding to each key
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light' | 'dark'>('app', 'theme');
   * const langKey = createKey<'en' | 'ru'>('app', 'lang');
   *
   * const [theme, lang] = strictStore.pick([themeKey, langKey]);
   * ```
   */
  pick<const K extends readonly StoreKey<Serializable>[]>(
    keys: K
  ): { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never } {
    return keys.map(key => strictStore.get(key)) as {
      [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never
    };
  },

  /**
   * Retrieves all stored key-value pairs from both localStorage and sessionStorage that belong to strictStore.
   * If a namespace is provided, only keys with the 'strict-store/{ns}:' prefix are included.
   * Otherwise, all keys with the 'strict-store/' prefix are returned.
   *
   * @param ns (optional) Namespace to filter keys (e.g., 'user' will return all 'user:*' keys)
   * @returns An array of objects, each containing the storage key and its parsed value.
   *
   * @example
   * ```ts
   * // Get all items stored by strictStore
   * const allItems = strictStore.getAll();
   *
   * // Get only items for the 'user' namespace
   * const userItems = strictStore.getAll('user');
   *
   * userItems.forEach(({ key, value }) => {
   *   console.log(key, value);
   * });
   * ```
   *
   * @remarks
   * - Scans both localStorage and sessionStorage.
   * - Only includes keys managed by strictStore (those starting with 'strict-store/').
   */
  getAll(ns?: string) {
    const result: { key: string, value: Serializable }[] = [];
    const prefix = ns ? `strict-store/${ns}:` : 'strict-store/';

    [localStorage, sessionStorage].forEach((storage) => {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (key && key.startsWith(prefix)) {
          const value = storage.getItem(key);

          if (value !== null) {
            result.push({ key, value: strictJson.parse(value) });
          }
        }
      }
    });

    return result;
  },

  /**
   * Saves a value to storage with automatic serialization.
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key StoreKey object containing ns and name
   * @param value Value to store (will be JSON.stringified)
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * // Only the literal type is allowed
   * strictStore.save(themeKey, 'dark');
   * ```
   */
  save<T extends StoreKey<Serializable>>(key: T, value: T['__type']): void {
    const storage = getStorage(key.storeType);

    storage.setItem(getFullName(key.ns, key.name), strictJson.stringify(value));
  },

  /**
   * Removes a name-value pair from storage.
   *
   * @typeParam T - Type parameter for StoreKey consistency
   * @param key StoreKey object identifying item to remove
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * strictStore.remove(themeKey);
   * ```
   *
   * @remarks
   * - Silent if name doesn't exist
   * - Namespace-aware operation
   */
  remove(key: StoreKey<Serializable> | StoreKey<Serializable>[]): void {
    if (Array.isArray(key)) {
      for (const singleKey of key) {
        strictStore.remove(singleKey);
      }
      return
    }

    const storage = getStorage(key.storeType);
    storage.removeItem(getFullName(key.ns, key.name));
  },

  /**
   * Checks if a name exists in storage.
   *
   * @param key StoreKey object containing ns and name identifier
   * @returns `true` if the name exists, `false` otherwise
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * const exists: boolean = strictStore.has(themeKey);
   * ```
   *
   * @remarks
   * - Does not validate the stored value, only checks name presence
   * - If the value is null, it returns false
   */
  has(key: StoreKey<Serializable>): boolean {
    const storage = getStorage(key.storeType);

    return storage.getItem(getFullName(key.ns, key.name)) !== null;
  },

  /**
   * Gets the total number of items in localStorage + sessionStorage, but **only from strict-store**.
   *
   * @returns Count of all items from strict-store
   *
   * @example
   * ```ts
   * if (strictStore.length > 100) {
   *   strictStore.clear();
   * }
   * ```
   *
   * @remarks
   * it only works in strictStore
   */
  get length(): number {
    let count = 0;

    [localStorage, sessionStorage].forEach(storage => {
      const keys: string[] = [];

      Object.keys(storage).forEach(key => {
        if (key !== null && key.startsWith('strict-store'))
          keys.push(key);
      })

      count += keys.length;
    });

    return count;
  },

  /**
   * Clears all **strict-store managed** items from localStorage and sessionStorage.
   *
   * @param ns Namespace prefix to clear (e.g., 'user' will remove 'user:settings', 'user:data' etc.)
   *
   * @example
   * ```ts
   * strictStore.clear(); // Remove only strict-store keys
   * strictStore.clear('auth'); // Removes all strict-store 'auth:*' keys
   * ```
   *
   * @remarks
   * it only works in strictStore
   */
  clear(ns?: string) {
    [localStorage, sessionStorage].forEach(storage => {
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;

        if (ns !== undefined) {
          if (key.startsWith(`strict-store/${ns}:`)) {
            keysToRemove.push(key);
          }
        } else {
          if (key.startsWith('strict-store/')) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    })
  },
} as const

/**
 * Creates a type-safe store name object for use with strictStore.
 *
 * @typeParam T - Type of the stored value, must extend `Serializable`
 *
 * @param ns - Namespace to prevent name collisions (e.g., 'app', 'user')
 * @param name - Unique identifier within the ns
 * @param [storeType] - Determines which Web Storage API to use:
 *                  - 'local': Uses `localStorage`
 *                  - 'session': Uses `sessionStorage`
 *
 * @returns A frozen `StoreKey<T>` object with strict type information
 *
 * @remarks
 * - The returned object is frozen with `as const` for type safety
 * - Namespace and name are combined to form the final storage name (e.g., 'app:counter')
 *
 * @see {@link StoreKey} for the interface definition
 * @see {@link strictStore} for usage examples with storage methods
 */
const createKey = <T extends Serializable>(
  ns: string,
  name: string,
  storeType: StoreType = 'local',
): StoreKey<T> => {
  if (ns.includes(':') || name.includes(':')) {
    throw new Error('Namespace and name must not contain the ":" character.')
  } else if(ns.length === 0 || name.length === 0) {
    throw new Error('The name or namespace cannot be empty.')
  }

  return {
    ns: ns,
    name: name,
    storeType: storeType,
    __type: {} as T
  } as const satisfies StoreKey<T>
}

export {
  strictStore,
  createKey
}
