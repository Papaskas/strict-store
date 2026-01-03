import { keyPolicy } from '@src/domain/policies/key.policy';
import { Persistable } from '@src/domain/entities/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key.entity';
import { SerializerPort } from '@src/app/ports/serializer.port';
import { StorageProviderPort } from '@src/app/ports/storage-provider.port';
import { StoreType } from '@src/domain/entities/store-type.entity';
import { StrictStore } from '@src/interface';
import { DeepPartial } from '@src/domain/entities/deep-partial.entity';
import { strictJson } from '@src/infrastructure/adapters/serialization/serialization.adapter';
import { deepMerge } from '@src/domain/policies/merge.policy';
import { onChangePolicy } from '../domain/policies/on-change.policy';

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
export class StrictStoreService {
  constructor(
    private readonly storageProvider: StorageProviderPort,
    private readonly serializer: SerializerPort,
  ) {}

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
   */
  get<T extends Persistable>(key: StoreKey<T>): T | null {
    const storage = this.storageProvider.get(key.storeType);
    const raw = storage.get(keyPolicy.makeFullName(key.ns, key.name));

    if (raw === null) return null;
    return this.serializer.parse<T>(raw);
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
  pick<const K extends readonly StoreKey<Persistable>[]>(
    keys: K
  ): { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never } {
    const out: unknown[] = new Array(keys.length)
    for (let i = 0; i < keys.length; i++)
      out[i] = this.get(keys[i]);

    return out as { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never }
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
   * const themeKey = createKey<'light', 'dark'>('app', 'theme');
   *
   * // Only the literal type is allowed
   * StrictStore.save(themeKey, 'dark');
   * ```
   */
  save<T extends StoreKey<Persistable>>(key: T, value: T["__type"]): void {
    const storage = this.storageProvider.get(key.storeType);
    storage.set(keyPolicy.makeFullName(key.ns, key.name), this.serializer.stringify(value));
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
  saveBatch<
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
   * StrictStore.save(userKey, { name: 'Tom', age: 42 });
   * StrictStore.merge(userKey, { name: 'Alex' });
   * ```
   *
   * @throws Error if no value exists for the key.
   *
   * @remarks
   * - Internally uses {@link https://lodash.com/docs/#merge | lodash.merge}.
   * - ⚠️ Unlike lodash's default behavior, arrays in StrictStore **are replaced entirely**,
   *   not merged by index.
   *   - Example: merging `{ tags: ['a', 'b'] }` with `{ tags: ['x'] }` results in `{ tags: ['x'] }`.
   * - Use {@link StrictStore.save} if you need to completely overwrite the object
   *   rather than partially merging.
   * */
  merge<T extends Record<string, Persistable>>(
    key: StoreKey<T>,
    partial: DeepPartial<T>
  ): void {
    const storage = this.storageProvider.get(key.storeType);
    const fullKey = keyPolicy.makeFullName(key.ns, key.name);
    const storedValue = storage.get(fullKey);

    let current: T | null = null;
    if (storedValue !== null)
      current = strictJson.parse<T>(storedValue);

    else if (current === null)
      throw new Error('StrictStore.merge: Cannot initialize the object. Use StrictStore.save for initial value.');

    else if (typeof current !== 'object' || Array.isArray(current))
      throw new Error('StrictStore.merge: Can only merge into plain objects');

    const merged = deepMerge(current, partial);
    storage.set(fullKey, this.serializer.stringify(merged));
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
   forEach(
    callback: (
      key: StoreKey<Persistable>,
      value: Persistable,
    ) => void,
    ns?: string[]
  ): void {
    this.entries(ns).forEach(({ key, value }) => {
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
  onChange(
    callback: (
      key: StoreKey<Persistable>,
      newValue: Persistable,
      oldValue: Persistable,
    ) => void,
    target?: StoreKey<Persistable>[] | string[],
  ) {
    const { keyNames, nsPrefixes } = onChangePolicy.resolveTargets(target)

    const handler = (e: StorageEvent) => {
      if (!onChangePolicy.isStrictStoreEvent(e, keyNames, nsPrefixes)) return

      const storeKey = keyPolicy.parseStoreKey(e.key!, e.storageArea === localStorage ? 'local' : 'session')
      if (!storeKey) return

      callback(
        storeKey,
        e.newValue !== null ? strictJson.parse(e.newValue) : null,
        e.oldValue !== null ? strictJson.parse(e.oldValue) : null,
      )
    }

    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('storage', handler)
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
   * const themeKey = createKey<'light', 'dark'>('app', 'theme');
   *
   * const exists: boolean = StrictStore.has(themeKey);
   * const exists: boolean[] = StrictStore.has([themeKey, anotherKey]);
   * ```
   *
   * @remarks
   * - If the value is null, it returns false
   */
  has(key: StoreKey<Persistable>): boolean;
  has(key: StoreKey<Persistable>[]): boolean[];
  has(key: StoreKey<Persistable> | StoreKey<Persistable>[]): boolean | boolean[] {
    if (Array.isArray(key)) {
      return key.map(storeKey => {
        const storage = this.storageProvider.get(storeKey.storeType);
        return storage.get(keyPolicy.makeFullName(storeKey.ns, storeKey.name)) !== null;
      })

    } else {
      const storage = this.storageProvider.get(key.storeType);
      return storage.get(keyPolicy.makeFullName(key.ns, key.name)) !== null;
    }
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
  remove(keys: StoreKey<Persistable>[]): void {
    for (const key of keys) {
      const storage = this.storageProvider.get(key.storeType);
      storage.remove(keyPolicy.makeFullName(key.ns, key.name));
    }
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
   * const userItems = StrictStore.entries(['user']);
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
  entries(
    ns?: string[]
  ): { key: StoreKey<Persistable>, value: Persistable }[] {
    if (Array.isArray(ns) && ns.length === 0)
      return []

    const prefixes: string[] =
      ns && ns.length > 0 ? ns.map(n => `strict-store/${n}:`) : ['strict-store/']

    const storages: [Storage, StoreType][] = [
      [localStorage, 'local'],
      [sessionStorage, 'session'],
    ]

    const result: { key: StoreKey<Persistable>; value: Persistable }[] = []

    for (let s = 0; s < storages.length; s++) {
      const [storage, storageType] = storages[s]

      for (let i = 0; i < storage.length; i++) {
        const rawKey = storage.key(i);
        if (!rawKey) continue
        if (!keyPolicy.isStrictStoreKey(rawKey, prefixes)) continue

        const valueStr = storage.getItem(rawKey);
        if (valueStr === null) continue

        const storeKey = keyPolicy.parseStoreKey(rawKey, storageType)
        if (!storeKey) continue

        result.push({
          key: storeKey,
          value: this.serializer.parse(valueStr),
        })
      }
    }

    return result
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
  size(ns?: string[]): number {
    return this.entries(ns).length;
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
  keys(ns?: string[]): StoreKey<Persistable>[] {
    return this.entries(ns).map(({ key } ) => key)
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
  clear(ns?: string[]): void {
    const items = StrictStore.entries(ns);
    for (const { key } of items)
      this.remove([key]);
  }
}
