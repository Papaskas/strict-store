import { Serializable, StoreType, StoreKey } from '@src/types';
import { strictJson } from '@src/strict-json';

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
export const strictStore = {

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
   * Retrieves all values stored via strictStore from both localStorage and sessionStorage.
   * Only keys with the 'strict-store/' prefix are included, ensuring that only values managed by strictStore are returned.
   *
   * @returns An array of objects, each containing the storage key and its parsed value.
   *
   * @example
   * ```ts
   * const all = strictStore.getAll();
   *
   * all.forEach(({ key, value }) => {
   *   console.log(key, value);
   * });
   *
   * // Example output:
   * // 'strict-store/app:theme', 'dark'
   * // 'strict-store/app:lang', 'en'
   * ```
   *
   * @remarks
   * - Only keys saved via strictStore (with the 'strict-store/' prefix) are included
   */
  getAll() {
    const result: { key: string, value: Serializable }[] = [];

    [localStorage, sessionStorage].forEach((storage) => {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (key && key.startsWith('strict-store/')) {
          const value = storage.getItem(key);

          if (value !== null) {
            result.push({ key, value: strictJson.parse(value) });
          }
        }
      }
    })

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
   * Gets the total number of items in localStorage + sessionStorage.
   *
   * @returns Count of all items (including non-namespaced)
   *
   * @example
   * ```ts
   * if (strictStore.length > 100) {
   *   strictStore.clear();
   * }
   * ```
   */
  get length(): number {
    return localStorage.length + sessionStorage.length
  },

  /**
   * Clears all items from localStorage and sessionStorage (including non-namespaced).
   *
   * @example
   * ```ts
   * strictStore.clear(); // Full reset
   * ```
   *
   * @remarks
   * - Affects entire storage, not just typed keys
   * - Irreversible operation
   */
  clear() {
    localStorage.clear();
    sessionStorage.clear();
  },

  /**
   * Clears all keys in storage that belong to a specific ns.
   *
   * @param ns Namespace prefix to clear (e.g., 'user' will remove 'user:settings', 'user:data' etc.)
   *
   * @example
   * ```ts
   * strictStore.clearNamespace('auth'); // Removes all 'auth:*' keys
   * ```
   *
   * @remarks
   * This operation is synchronous and affects only keys with matching ns prefix.
   */
  clearNamespace(ns: string) {
    [localStorage, sessionStorage].forEach(storage => {
      Object.keys(storage).forEach(key => {
        if (key.startsWith(`strict-store/${ns}:`)) {
          storage.removeItem(key);
        }
      })
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
export function createKey<T extends Serializable>(
  ns: string,
  name: string,
  storeType: StoreType = 'local',
): StoreKey<T> {
  if (ns.includes(':') || name.includes(':')) {
    throw new Error('Namespace and name must not contain the ":" character.')
  }

  return {
    ns: ns,
    name: name,
    storeType: storeType,
    __type: {} as T
  } as const satisfies StoreKey<T>
}

/**
 * @internal
 * */
const getStorage = (type: StoreType): Storage => {
  return type === 'local' ? localStorage : sessionStorage
}

const getFullName = (ns: string, name: string): string => {
  return `strict-store/${ns}:${name}`
}
