import { strictJson } from '@src/strict-json';
import { deepMerge, getFullName, getStorage } from '@src/utils';
import { StoreKey, Persistable, StoreType, ExtendedPersistable, BasicPersistable } from '@src/types';
import { DeepPartial } from '@src/internal-types';

/**
 * A type-safe wrapper around localStorage and sessionStorage
 * @public
 *
 * @example
 * ```typescript
 * const themeKey = createKey<'light', 'dark'>('app', 'theme');
 *
 * StrictStore.save(themeKey, 'dark'); // Only the literal type is allowed
 * const theme: 'light' | 'dark' | null = StrictStore.get(themeKey); // Return the literal type
 * ```
 */
class StrictStore {

  /**
   * To ignore TypeDoc
   * */
  private constructor() {}

  /**
   * Retrieves a value from storage.
   * @public
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing ns, name and default value
   * @returns The stored value that provides:
   * - Automatic JSON serialization/deserialization
   * - Namespace support to prevent name collisions
   * - Strict typing for all operations
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * const theme: 'light' | 'dark' | null = StrictStore.get(themeKey);
   * ```
   *
   * @remarks
   * - Automatically handles JSON parsing
   */
  static get<T extends Persistable>(key: StoreKey<T>): T | null {
    const storage = getStorage(key.storeType);
    const storedValue = storage.getItem(getFullName(key.ns, key.name));

    if(storedValue === null) return storedValue;

    return strictJson.parse<T>(storedValue)
  }

  /**
   * Retrieves values from storage for a tuple of keys, preserving the type for each key.
   * @public
   *
   * @typeParam K - A tuple of StoreKey objects with different value types
   * @param keys - A tuple of StoreKey objects
   * @returns A tuple of values (or null), corresponding to each key
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light' | 'dark'>('app', 'theme');
   * const langKey = createKey<'en' | 'ru'>('app', 'lang');
   *
   * const [theme, lang] = StrictStore.pick([themeKey, langKey]);
   * ```
   */
  static pick<const K extends readonly StoreKey<Persistable>[]>(
    keys: K
  ): { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never } {
    const out: unknown[] = new Array(keys.length)
    for (let i = 0; i < keys.length; i++)
      out[i] = StrictStore.get(keys[i]);

    return out as { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never }
  }

  /**
   * Retrieves all stored key-value pairs from both localStorage and sessionStorage that belong to StrictStore.
   * If a namespace is provided, only keys with the 'strict-store/[ns]:' prefix are included.
   * Otherwise, all keys with the 'strict-store/' prefix are returned.
   * @public
   *
   * @param ns - (optional) Namespace to filter keys (e.g., 'user' will return all 'user:*' keys)
   * @returns An array of objects, each containing the storage key and its parsed value.
   *
   * @example
   * ```ts
   * // Get all items stored by StrictStore
   * const allItems = StrictStore.entries();
   *
   * // Get only items for the 'user' namespace
   * const userItems = StrictStore.entries('user');
   *
   * userItems.forEach(({ key, value }) => {
   *   console.log(key, value);
   * });
   * ```
   *
   * @remarks
   * - Scans both localStorage and sessionStorage.
   * - Only includes keys managed by StrictStore (those starting with 'strict-store/').
   */
  static entries(ns?: string[]): { key: StoreKey<Persistable>, value: Persistable }[] {
    if (Array.isArray(ns) && ns.length === 0)
      return [];

    const result: { key: StoreKey<Persistable>, value: Persistable }[] = [];
    const prefixes = ns && ns.length > 0
      ? ns.map(n => `strict-store/${n}:`)
      : ['strict-store/'];

    const storages: [Storage, StoreType][] = [
      [localStorage, 'local'],
      [sessionStorage, 'session']
    ];

    for (const [storage, storageType] of storages) {
      for (let i = 0; i < storage.length; i++) {
        const keyStr = storage.key(i);
        if (!keyStr) continue;
        if (!prefixes.some(prefix => keyStr.startsWith(prefix))) continue;

        const valueStr = storage.getItem(keyStr);
        if (valueStr === null) continue;

        const match = /^strict-store\/([^:]+):(.+)$/.exec(keyStr);
        if (!match) continue;
        const [, nsPart, namePart] = match;

        const storeKey: StoreKey<Persistable> = {
          ns: nsPart,
          name: namePart,
          storeType: storageType,
          __type: undefined as any,
        };

        result.push({
          key: storeKey,
          value: strictJson.parse(valueStr)
        });
      }
    }

    return result;
  }

  /**
   * Saves a value to storage with automatic serialization.
   * @public
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing ns and name
   * @param value - Value to store (will be JSON.stringified)
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * // Only the literal type is allowed
   * StrictStore.save(themeKey, 'dark');
   * ```
   */
  static save<T extends StoreKey<Persistable>>(key: T, value: T['__type']): void {
    const storage = getStorage(key.storeType);

    storage.setItem(getFullName(key.ns, key.name), strictJson.stringify(value));
  }

  /**
   * Saves multiple key-value pairs to storage with automatic serialization.
   * @public
   *
   * @param entries - Array of [StoreKey, value] tuples
   *
   * @example
   * ```ts
   * StrictStore.saveBatch([
   *   [themeKey, 'dark'],
   *   [langKey, 'en'],
   * ]);
   * ```
   */
  static saveBatch<
    Pairs extends readonly [StoreKey<Persistable>, Persistable][]
  >(
    entries: Pairs & {
      [K in keyof Pairs]: Pairs[K] extends [infer Key, unknown]
        ? Key extends StoreKey<infer T>
          ? [Key, T]
          : never
        : never
    }
  ): void {
    for (const [key, value] of entries) {
      StrictStore.save(key as any, value);
    }
  }

  /**
   * Merges a partial value into an existing object stored under the specified key.
   * @public
   *
   * **Lodash is used under the hood. For all the features of merge, see the Lodash documentation.**
   *
   * @typeParam T - Type of the stored value (must be an object)
   * @param key - StoreKey object identifying the item to merge into
   * @param partial - Partial object to merge
   *
   * @example
   * ```ts
   * type User = {
   *  name: string;
   *  age: number;
   * }
   * const userKey = createKey<User>('app', 'user');
   *
   * StrictStore.merge(userKey, { name: 'Alex' });
   * ```
   *
   * @throws Error if no value exists for the key.
   * */
  static merge<T extends Record<string, Persistable>>(
    key: StoreKey<T>,
    partial: DeepPartial<T>
  ): void {
    const storage = getStorage(key.storeType);
    const fullKey = getFullName(key.ns, key.name);
    const storedValue = storage.getItem(fullKey);

    let current: T | null = null;
    if (storedValue !== null) {
      current = strictJson.parse<T>(storedValue);
    }

    if (current === null) {
      throw new Error('StrictStore.merge: Cannot initialize the object. Use StrictStore.save for initial value.');
    }

    if (typeof current !== 'object' || Array.isArray(current)) {
      throw new Error('StrictStore.merge: Can only merge into plain objects');
    }

    const merged = deepMerge(current, partial);
    storage.setItem(fullKey, strictJson.stringify(merged));
  }

  /**
   * Iterates over all StrictStore-managed key-value pairs and executes a callback for each.
   * @public
   *
   * @param callback - Function to execute for each key-value pair.
   *   Receives (key, value)
   * @param ns - Optional namespace to filter keys.
   *
   * @example
   * ```ts
   * StrictStore.forEach((key, value) => {
   *   console.log(key, value, storageType);
   * }, ['namespace1', 'namespace2']);
   * ```
   */
  static forEach(
    callback: (
      key: StoreKey<Persistable>,
      value: Persistable,
    ) => void,
    ns?: string[]
  ): void {
    StrictStore.entries(ns).forEach(({ key, value }) => {
      callback(key, value);
    });
  }

  /**
   * Subscribes to changes of StrictStore-managed keys in localStorage/sessionStorage.
   * @public
   *
   * @param callback - Function to call when a value changes.
   *   Receives (key, newValue, oldValue)
   * @param target - (optional) Array of StoreKey or array of namespaces (string[]) to filter the observed changes.
   *   If omitted, all strict-store keys are obeyed.
   *
   * @returns Unsubscribe function.
   *
   * @example
   * ```ts
   * // Listen to all changes in the 'user' namespace:
   * const unsubscribe = StrictStore.onChange((key, newValue, oldValue) => {
   *   console.log(key, newValue, oldValue);
   * }, ['user']);
   *
   * // Listen only to specific keys:
   * const userKey = createKey<{name: string}>('user', 'profile');
   * const settingsKey = createKey<{theme: string}>('user', 'settings');
   *
   * StrictStore.onChange(
   *   (key, newValue, oldValue) => { ... },
   *   [userKey, settingsKey]
   * );
   *
   * // Later, to stop listening:
   * unsubscribe();
   * ```
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
   */
  static onChange(
    callback: (
      key: StoreKey<Persistable>,
      newValue: Persistable,
      oldValue: Persistable,
    ) => void,
    target?: StoreKey<Persistable>[] | string[],
  ): () => void {
    let keyNames: string[] | undefined;
    let nsPrefixes: string[] | undefined;

    if (target !== undefined) {
      if (target.length === 0) {
        // Empty array — we don't listen to anything
        keyNames = [];
        nsPrefixes = [];
      } else if (typeof target[0] === 'string') {
        // Namespace array
        nsPrefixes = (target as string[]).map(ns => `strict-store/${ns}:`);
      } else {
        // StoreKey array
        keyNames = (target as StoreKey<Persistable>[]).map(k => getFullName(k.ns, k.name));
      }
    }

    const handler = (e: StorageEvent) => {
      if (!e.key) return;
      if (!e.key.startsWith('strict-store/')) return;

      // Key filtering
      if (keyNames) {
        if (!keyNames.includes(e.key)) return;
      }
      // Filtering by namespace
      else if (nsPrefixes) {
        if (!nsPrefixes.some(prefix => e.key!.startsWith(prefix))) return;
      }

      const storageType: StoreType =
        e.storageArea === localStorage ? 'local' : 'session';

      const newValue = e.newValue !== null ? strictJson.parse(e.newValue) : null;
      const oldValue = e.oldValue !== null ? strictJson.parse(e.oldValue) : null;

      // Recover StoreKey from string
      const match = /^strict-store\/([^:]+):(.+)$/.exec(e.key);
      if (!match) return;
      const [ , ns, name ] = match;

      const storeKey: StoreKey<Persistable> = {
        ns,
        name,
        storeType: storageType,
        __type: undefined as any,
      };

      callback(storeKey, newValue, oldValue);
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }

  /**
   * Removes a name-value pair from storage.
   * @public
   *
   * @typeParam T - Type parameter for StoreKey consistency
   * @param keys - StoreKey object identifying item to remove
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * StrictStore.remove([themeKey]);
   * ```
   *
   * @remarks
   * - Silent if name doesn't exist
   * - Namespace-aware operation
   */
  static remove(keys: StoreKey<Persistable>[]): void {
    for (const key of keys) {
      const storage = getStorage(key.storeType);
      storage.removeItem(getFullName(key.ns, key.name));
    }
  }

  /**
   * Checks if a name exists in storage.
   * @public
   *
   * @param key - StoreKey object containing ns and name identifier
   * @returns `true` if the name exists, `false` otherwise
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * const exists: boolean = StrictStore.has(themeKey);
   * const exists: boolean[] = StrictStore.has([themeKey, anotherKey]);
   * ```
   *
   * @remarks
   * - If the value is null, it returns false
   */
  static has(key: StoreKey<Persistable>): boolean;
  static has(key: StoreKey<Persistable>[]): boolean[];
  static has(key: StoreKey<Persistable> | StoreKey<Persistable>[]): boolean | boolean[] {
    if (Array.isArray(key)) {
      return key.map(storeKey => {
        const storage = getStorage(storeKey.storeType);
        return storage.getItem(getFullName(storeKey.ns, storeKey.name)) !== null;
      })

    } else {
      const storage = getStorage(key.storeType);
      return storage.getItem(getFullName(key.ns, key.name)) !== null;
    }
  }

  /**
   * Gets the total number of items in localStorage + sessionStorage, but **only from strict-store**.
   * If ns is provided, counts only items from the specified namespaces.
   * @public
   *
   * @param ns - (optional) Array of namespaces to filter by
   * @returns Count of all items from strict-store or from the specified namespaces
   *
   * @example
   * ```ts
   * if (StrictStore.size() > 100) {
   *   StrictStore.clear();
   * }
   *
   * if (StrictStore.size(['user', 'settings']) > 10) {
   *   StrictStore.clear(['user', 'settings']);
   * }
   * ```
   */
  static size(ns?: string[]): number {
    return StrictStore.entries(ns).length;
  }

  /**
   * Returns all StoreKey objects managed by StrictStore, optionally filtered by namespaces.
   * Scans both localStorage and sessionStorage for keys with the 'strict-store/' prefix.
   *
   * @public
   * @param ns - (optional) Array of namespaces to filter keys (e.g., ['user', 'settings']).
   *             If omitted, returns keys from all namespaces.
   * @returns Array of StoreKey objects for all stored items matching the filter.
   *
   * @example
   * // Get all keys managed by StrictStore:
   * const allKeys = StrictStore.keys();
   *
   * // Get only keys for the 'user' namespace:
   * const userKeys = StrictStore.keys(['user']);
   *
   * userKeys.forEach(key => {
   *   console.log(key.ns, key.name, key.storeType);
   * });
   *
   * @remarks
   * - Only includes keys managed by StrictStore (those starting with 'strict-store/').
   * - The returned StoreKey objects include ns, name, storeType, and __type.
   */
  static keys(ns?: string[]): StoreKey<Persistable>[] {
    return StrictStore.entries(ns).map(({ key } ) =>
      key
    )
  }

  /**
   * Clears all **strict-store managed** items from localStorage and sessionStorage.
   * @public
   *
   * @param ns - Namespace prefix to clear (e.g., 'user' will remove 'user:settings', 'user:data' etc.)
   *
   * @example
   * ```ts
   * StrictStore.clear(); // Remove only strict-store keys
   * StrictStore.clear(['auth']); // Removes all strict-store 'auth:*' keys
   * ```
   *
   * @remarks
   * it only works in StrictStore
   */
  static clear(ns?: string[]): void {
    const items = StrictStore.entries(ns);
    for (const { key } of items)
      StrictStore.remove([key]);
  }
}

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
const createKey = <T extends Persistable>(
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
  StrictStore,
  createKey,
}

export type {
  StoreKey,
  Persistable,
  StoreType,
  ExtendedPersistable,
  BasicPersistable,
}
