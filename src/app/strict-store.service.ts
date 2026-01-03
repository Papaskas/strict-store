import { isStrictStoreKey, makeFullName, parseStoreKey } from '@src/domain/key.format';
import { Persistable } from '@src/domain/entities/persistable';
import { StoreKey } from '@src/domain/entities/store-keys';
import { SerializerPort } from '@src/app/ports/serializer.port';
import { StorageProviderPort } from '@src/app/ports/storage-provider.port';
import { StoreType } from '@src/domain/entities/store-type';
import { StrictStore } from '@src/interface';

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
    const raw = storage.get(makeFullName(key.ns, key.name));

    if (raw === null) return null;
    return this.serializer.parse<T>(raw);
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
    storage.set(makeFullName(key.ns, key.name), this.serializer.stringify(value));
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
      storage.remove(makeFullName(key.ns, key.name));
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
        if (!isStrictStoreKey(rawKey, prefixes)) continue

        const valueStr = storage.getItem(rawKey);
        if (valueStr === null) continue

        const storeKey = parseStoreKey(rawKey, storageType)
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
