import { keyPolicy } from '@src/domain/policies/key.policy';
import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { SerializerPort } from '@src/domain/ports/serializer.port';
import { StorageProviderPort } from '@src/domain/ports/storage-provider.port';
import { phantomTypeSymbol } from '@src/domain/types/phantom-type.symbol';
import { StrictStoreError } from '@src/domain/entities/errors/strict-store.error';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { MergePort } from '@src/domain/ports/merge.port';
import { PartialDeep } from 'type-fest';
import { EventPort } from '@src/domain/ports/event.port';
import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';
import { StoreEvent } from '@src/domain/entities/on-change/store-event.entity';
import { isEqual } from 'lodash';

/**
 * A type-safe wrapper around localStorage and sessionStorage
 * @public
 *
 * @example
 * ```ts
 * const themeKey = createKey<'light', 'dark'>('app', 'theme');
 *
 * StrictStore.save(themeKey, 'dark'); // Only the literal type is allowed
 * const theme: 'light' | 'dark' | null = StrictStore.get(themeKey); // Return the literal type
 * ```
 */
export class StrictStoreService {
  constructor(
    private readonly storagePort: StorageProviderPort,
    private readonly serializationPort: SerializerPort,
    private readonly mergePort: MergePort,
    private readonly eventPort: EventPort,
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
   * const themeKey = createKey<'light', 'dark'>('app', 'theme');
   *
   * const theme: 'light' | 'dark' | null = StrictStore.get(themeKey);
   * ```
   */
  get<T extends Persistable>(key: StoreKey<T>): T | null {
    const storage = this.storagePort.get(key.persistenceType);
    const raw = storage.get(keyPolicy.makeKey(key.ns, key.name, key.persistenceType));

    if (!raw) return null;
    return this.serializationPort.parse<T>(raw);
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
  pick<const K extends StoreKey<Persistable>[]>(
    keys: K,
  ): { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never } {
    const out: unknown[] = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) out[i] = this.get(keys[i]);

    return out as { [I in keyof K]: K[I] extends StoreKey<infer T> ? T | null : never };
  }

  /**
   * Saves a value to storage with automatic serialization.
   * @public
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing ns and name
   * @param value - Value to store
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>('app', 'theme');
   *
   * // Only the literal type is allowed
   * StrictStore.save(themeKey, 'dark');
   * ```
   */
  save<T extends StoreKey<Persistable>>(key: T, value: T[typeof phantomTypeSymbol]): void {
    if (value === null) this.delete(key);
    else {
      const storage = this.storagePort.get(key.persistenceType);

      const rawValue = this.serializationPort.stringify(value);
      const rawKey = keyPolicy.makeKey(key.ns, key.name, key.persistenceType);

      storage.set(rawKey, rawValue);
    }
  }

  /**
   * Saves multiple key-value pairs to storage with automatic serialization.
   * @public
   *
   * @param entries - Array of [StoreKey, value] tuples
   *
   * const themeKey = createKey<'light' | 'dark'>('app', 'theme');
   * const langKey = createKey<'en' | 'ru'>('app', 'lang');
   *
   * @example
   * ```ts
   * StrictStore.saveBatch([
   *   [themeKey, 'dark'],
   *   [langKey, 'en'],
   * ]);
   * ```
   */
  saveBatch<Pairs extends readonly [StoreKey<Persistable>, Persistable][]>(
    entries: Pairs & {
      [K in keyof Pairs]: Pairs[K] extends [infer Key, unknown]
        ? Key extends StoreKey<infer T>
          ? [Key, T]
          : never
        : never;
    },
  ): void {
    for (const [key, value] of entries) this.save(key, value);
  }

  /**
   * Merges a partial value into an existing object stored under the specified key.
   * @public
   *
   * @typeParam T - Type of the stored value (must be an object)
   * @param key - StoreKey object identifying the item to merge into
   * @param partial - a Partial object to merge
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
   * @throws STRICT_STORE_ERROR_CODE.MERGE_NOT_INITIALIZED
   * @throws STRICT_STORE_ERROR_CODE.MERGE_TARGET_NOT_PLAIN_OBJECT
   *
   * @remarks
   * - Internally uses {@link https://lodash.com/docs/#merge | lodash.merge}.
   * - ⚠️ Unlike lodash's default behavior, arrays in StrictStore **are replaced entirely**,
   *   not merged by index.
   *   - Example: merging `{ tags: ['a', 'b'] }` with `{ tags: ['x'] }` results in `{ tags: ['x'] }`.
   * */
  merge<T extends Persistable>(key: StoreKey<T>, partial: PartialDeep<T>): T | null {
    const value = this.get(key);

    if (!value) {
      throw new StrictStoreError(STRICT_STORE_ERROR_CODE.MERGE_NOT_INITIALIZED);
    } else if (typeof value !== 'object' || Array.isArray(value)) {
      throw new StrictStoreError(STRICT_STORE_ERROR_CODE.MERGE_TARGET_NOT_PLAIN_OBJECT);
    }

    const merged = this.mergePort.merge(value, partial);
    this.save(key, merged);

    return this.get(key);
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
      index: number,
      array: {
        key: StoreKey<Persistable>;
        value: Persistable;
      }[],
    ) => void,
    ns?: string[],
  ): void {
    this.entries(ns).forEach(({ key, value }, index, array) => {
      callback(key, value, index, array);
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
   * StrictStore.onChange((key, newValue, oldValue) => { ... },
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
    callback: (res: StoreEvent) => void,
    target: StoreKey<Persistable>,
  ): Unsubscribe {
    return this.eventPort.subscribe((res) => {
      if (
        res.key === null ||
        !keyPolicy.isStoreKey(res.key) ||
        !isEqual(keyPolicy.parseKey(res.key), target)
      )
        return;

      const result: StoreEvent = {
        key: target,
        oldValue: res.oldValue && this.serializationPort.parse(res.oldValue),
        newValue: res.newValue && this.serializationPort.parse(res.newValue),
        url: res.url,
        isTrusted: res.isTrusted,
        timestamp: res.timeStamp,
      };

      callback(result);
    });
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
  has(keys: StoreKey<Persistable>[]): boolean[];
  has(value: StoreKey<Persistable> | StoreKey<Persistable>[]): boolean | boolean[] {
    if (Array.isArray(value)) return value.map((storeKey) => this.get(storeKey) !== null);

    return this.get(value) !== null;
  }

  /**
   * Removes a name-value pair from storage.
   * @public
   *
   * @param key - StoreKey object identifying item to delete
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>('app', 'theme');
   *
   * StrictStore.delete([themeKey]) // -> boolean[];
   * StrictStore.delete(themeKey) // -> boolean;
   * ```
   *
   * @remarks
   * - Silent if name doesn't exist
   * - Namespace-aware operation
   */
  delete(key: StoreKey<Persistable>): boolean;
  delete(keys: StoreKey<Persistable>[]): boolean[];
  delete(value: StoreKey<Persistable> | StoreKey<Persistable>[]): boolean | boolean[] {
    const isBatch = Array.isArray(value);
    const keys = isBatch ? value : [value];

    const results = keys.map((key) => {
      const storage = this.storagePort.get(key.persistenceType);
      const storageKey = keyPolicy.makeKey(key.ns, key.name, key.persistenceType);

      const existed = storage.get(storageKey) !== null;
      storage.remove(storageKey);

      return existed;
    });

    return isBatch ? results : results[0];
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
  entries(ns?: string[]): { key: StoreKey<Persistable>; value: Persistable }[] {
    if (Array.isArray(ns) && ns.length === 0) return [];

    const result: { key: StoreKey<Persistable>; value: Persistable }[] = [];

    const sources: { storage: Storage; type: PersistenceType }[] = [
      { storage: localStorage, type: 'local' },
      { storage: sessionStorage, type: 'session' },
    ];

    for (const source of sources) {
      const allKeys = Object.keys(source.storage);

      for (const rawKey of allKeys) {
        if (!keyPolicy.isStoreKey(rawKey)) continue;

        const parsedKey = keyPolicy.parseKey(rawKey);
        if (parsedKey === null) continue;

        if (ns && ns.length > 0 && !ns.includes(parsedKey.ns)) continue;

        const rawValue = source.storage.getItem(rawKey);
        if (rawValue === null) continue;

        const value = this.serializationPort.parse(rawValue);
        result.push({
          key: parsedKey,
          value: value,
        });
      }
    }

    return result;
  }

  /**
   * Gets the total number of items in localStorage + sessionStorage, but **only from strict-store**.
   * If ns is provided, count only items from the specified namespaces.
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
   *             If omitted, return keys from all namespaces.
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
   *   console.log(key.ns, key.name, key.persistenceType);
   * });
   *
   * @remarks
   * - Only includes keys managed by StrictStore (those starting with 'strict-store/').
   * - The returned StoreKey objects include ns, name, persistenceType, and phantomTypeSymbol.
   */
  keys(ns?: string[]): StoreKey<Persistable>[] {
    return this.entries(ns).map(({ key }) => key);
  }

  /**
   * Clears all **strict-store managed** items from localStorage and sessionStorage.
   * @public
   *
   * @param ns - Namespace prefix to clear (e.g., 'user' will delete 'user:settings', 'user:data' etc.)
   *
   * @example
   * ```ts
   * StrictStore.clear(); // Remove only strict-store keys
   * StrictStore.clear(['auth']); // Removes all strict-store 'auth:*' keys
   * ```
   * @return keys of clears
   *
   * @remarks
   * it only works in StrictStore
   */
  clear(ns?: string[]): StoreKey<Persistable>[] {
    const items = this.entries(ns);
    for (const { key } of items) this.delete([key]);

    return items.map((item) => item.key);
  }
}
