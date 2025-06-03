import { Serializable, StoreType, StoreKey, DeepPartial, ExtendedSerializable, BasicSerializable } from '@src/types';
import { strictJson } from '@src/strict-json';
import { deepMergeWithCollections, getFullName, getStorage } from '@src/utils';

/**
 * A type-safe wrapper around localStorage and sessionStorage
 * @public
 *
 * ```
 * StrictStore.save(name, 'dark'); // Only the literal type is allowed
 * const theme: 'light' | 'dark' | null = StrictStore.get(name); // Return the literal type
 * ```
 */
class StrictStore {

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
   * const name = createKey<'light', 'dark'>(
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
  static get<T extends Serializable>(key: StoreKey<T>): T | null {
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
   * const [theme, lang] = strictStore.pick([themeKey, langKey]);
   * ```
   */
  static pick<const K extends readonly StoreKey<Serializable>[]>(
    keys: K
  ): { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never } {
    return keys.map(key => StrictStore.get(key)) as {
      [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never
    };
  }

  /**
   * Retrieves all stored key-value pairs from both localStorage and sessionStorage that belong to strictStore.
   * If a namespace is provided, only keys with the 'strict-store/[ns]:' prefix are included.
   * Otherwise, all keys with the 'strict-store/' prefix are returned.
   * @public
   *
   * @param ns - (optional) Namespace to filter keys (e.g., 'user' will return all 'user:*' keys)
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
  static getAll(ns?: string[]): { key: StoreKey<Serializable>, value: Serializable, storageType: StoreType }[] {
    if (Array.isArray(ns) && ns.length === 0)
      return [];

    const result: { key: StoreKey<Serializable>, value: Serializable, storageType: StoreType }[] = [];
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

        // Parse key string: strict-store/ns:name
        const match = /^strict-store\/([^:]+):(.+)$/.exec(keyStr);
        if (!match) continue;
        const [, nsPart, namePart] = match;

        const storeKey: StoreKey<Serializable> = {
          ns: nsPart,
          name: namePart,
          storeType: storageType,
          __type: undefined as any,
        };

        result.push({
          key: storeKey,
          value: strictJson.parse(valueStr),
          storageType
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
   * strictStore.save(themeKey, 'dark');
   * ```
   */
  static save<T extends StoreKey<Serializable>>(key: T, value: T['__type']): void {
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
   * StrictStore.saveMany([
   *   [themeKey, 'dark'],
   *   [langKey, 'en'],
   * ]);
   * ```
   */
  static saveMany<
    Pairs extends readonly [StoreKey<Serializable>, Serializable][]
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
   * strictStore.merge(userKey, { name: 'Alex' });
   * ```
   */
  static merge<T extends Record<string, Serializable>>(
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

    const merged = deepMergeWithCollections(current, partial);
    storage.setItem(fullKey, strictJson.stringify(merged));
  }

  /**
   * Iterates over all strictStore-managed key-value pairs and executes a callback for each.
   * @public
   *
   * @param callback - Function to execute for each key-value pair.
   *   Receives (key: Key<Serializable>, value: Serializable, storageType: 'local' | 'session')
   * @param ns - Optional namespace to filter keys.
   *
   * @example
   * ```ts
   * strictStore.forEach((key, value, storageType) => {
   *   console.log(key, value, storageType);
   * }, ["namespace1", "namespace2"]);
   * ```
   */
  static forEach(
    callback: (key: StoreKey<Serializable>, value: Serializable, storageType: StoreType) => void,
    ns?: string[]
  ): void {
    StrictStore.getAll(ns).forEach(({ key, value, storageType }) => {
      callback(key, value, storageType);
    });
  }

  /**
   * Subscribes to changes of strictStore-managed keys in localStorage/sessionStorage.
   * @public
   *
   * @param callback - Function to call when a value changes.
   *   Receives (key: StoreKey<Serializable>, newValue: Serializable, oldValue: Serializable, storageType: 'local' | 'session')
   * @param target - (optional) Array of StoreKeys или array of namespaces (string[]) to filter the observed changes.
   *   If omitted, all strict-store keys are obeyed.
   *
   * @returns Unsubscribe function.
   *
   * @example
   * ```ts
   * // Listen to all changes in the 'user' namespace:
   * const unsubscribe = StrictStore.onChange((key, newValue, oldValue, storageType) => {
   *   console.log(key, newValue, oldValue, storageType);
   * }, ['user']);
   *
   * // Listen only to specific keys:
   * const userKey = createKey<{name: string}>('user', 'profile');
   * const settingsKey = createKey<{theme: string}>('user', 'settings');
   *
   * StrictStore.onChange(
   *   (key, newValue, oldValue, storageType) => { ... },
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
      key: StoreKey<Serializable>,
      newValue: Serializable,
      oldValue: Serializable,
      storeType: StoreType,
    ) => void,
    target?: StoreKey<Serializable>[] | string[],
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
        keyNames = (target as StoreKey<Serializable>[]).map(k => getFullName(k.ns, k.name));
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

      const storeKey: StoreKey<Serializable> = {
        ns,
        name,
        storeType: storageType,
        __type: undefined as any,
      };

      callback(storeKey, newValue, oldValue, storageType);
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
   * strictStore.remove(themeKey);
   * strictStore.remove([themeKey, ...]);
   * ```
   *
   * @remarks
   * - Silent if name doesn't exist
   * - Namespace-aware operation
   */
  static remove(keys: StoreKey<Serializable>[]): void {
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
   * const exists: boolean = strictStore.has(themeKey);
   * const exists: boolean[] = strictStore.has([themeKey, anotherKey]);
   * ```
   *
   * @remarks
   * - If the value is null, it returns false
   */
  static has(key: StoreKey<Serializable>): boolean;
  static has(key: StoreKey<Serializable>[]): boolean[];
  static has(key: StoreKey<Serializable> | StoreKey<Serializable>[]): boolean | boolean[] {
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
    return StrictStore.getAll(ns).length;
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
  static clear(ns?: string[]) {
    if (Array.isArray(ns) && ns.length === 0)
      return;

    const items = StrictStore.getAll(ns);
    for (const { key } of items)
      StrictStore.remove([key]);
  }
}

/**
 * Creates a type-safe store name object for use with strictStore.
 * @public
 *
 * @typeParam T - Type of the stored value, must extend `Serializable`
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
  StrictStore,
  createKey,
  StoreKey,
  StoreType,
  Serializable,
  ExtendedSerializable,
  BasicSerializable
}
