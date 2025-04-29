import { Serializable, StoreKey } from '@types';

/**
 * A type-safe wrapper around localStorage that provides:
 * - Automatic JSON serialization/deserialization
 * - Namespace support to prevent key collisions
 * - Strict typing for all operations
 *
 * @example
 * ```ts
 * const key = createKey<'light', 'dark'>(
 *  'app',
 *  'theme',
 *  'light'
 * );
 *
 * strictStore.save(key, 'dark'); // Only the literal type is allowed
 * const theme: 'light' | 'dark' = StrictStore.get(key); // Return the literal type
 * ```
 */
export const strictStore = {

  /**
   * Retrieves a value from storage.
   * Returns `defaultValue` if key doesn't exist.
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing namespace, key and default value
   * @returns The stored value or defaultValue if not found
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   *  'light'
   * );
   *
   * const theme: 'light' | 'dark' = strictStore.get(themeKey);
   * ```
   *
   * @remarks
   * - Automatically handles JSON parsing
   * - Returns defaultValue for non-existent keys
   */
  get<T extends Serializable>(key: StoreKey<T>): T {
    const fullKey = getFullKey(key.ns, key.key);
    const storedValue = localStorage.getItem(fullKey);

    if (storedValue === null) {
      return key.defaultValue;
    }

    try {
      return JSON.parse(storedValue, reviver) as T;
    } catch {
      return storedValue as T;
    }
  },

  /**
   * Saves a value to storage with automatic serialization.
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing namespace and key
   * @param value - Value to store (will be JSON.stringified)
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   *  'light'
   * );
   *
   * // Only the literal type is allowed
   * strictStore.save(themeKey, 'dark');
   * ```
   *
   * @remarks
   * - Overwrites existing values
   * - Supports all JSON-serializable values
   */
  save<T extends StoreKey<any>>(key: T, value: T['defaultValue']): void {
    const fullKey = getFullKey(key.ns, key.key);
    localStorage.setItem(fullKey, JSON.stringify(value, replacer));
  },

  /**
   * Removes a key-value pair from storage.
   *
   * @typeParam T - Type parameter for StoreKey consistency
   * @param key - StoreKey object identifying item to remove
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   *  'light'
   * );
   *
   * strictStore.remove(themeKey);
   * ```
   *
   * @remarks
   * - Silent if key doesn't exist
   * - Namespace-aware operation
   */
  remove<T extends Serializable>(key: StoreKey<T>): void {
    const fullKey = getFullKey(key.ns, key.key);
    localStorage.removeItem(fullKey);
  },

  /**
   * Checks if a key exists in localStorage.
   *
   * @param key - StoreKey object containing namespace and key identifier
   * @returns `true` if the key exists, `false` otherwise
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   *  'light'
   * );
   *
   * const exists: boolean = strictStore.has(themeKey);
   * ```
   *
   * @remarks
   * - Does not validate the stored value, only checks key presence
   * - If the value is null, it returns false
   */
  has<T extends Serializable>(key: StoreKey<T>): boolean {
    const fullKey = getFullKey(key.ns, key.key);
    return localStorage.getItem(fullKey) !== null;
  },

  /**
   * Gets the total number of items in localStorage.
   *
   * @returns Count of all items (including non-namespaced)
   *
   * @example
   * ```ts
   * if (strictStore.countItems > 100) {
   *   strictStore.clear();
   * }
   * ```
   */
  get countItems(): number {
    return localStorage.length
  },

  /**
   * Clears all items from localStorage (including non-namespaced).
   *
   * @example
   * ```ts
   * strictStore.clear(); // Full reset
   * ```
   *
   * @remarks
   * - Affects entire localStorage, not just typed keys
   * - Irreversible operation
   */
  clear() {
    localStorage.clear();
  },

  /**
   * Clears all keys in localStorage that belong to a specific namespace.
   *
   * @param ns - Namespace prefix to clear (e.g., 'user' will remove 'user:settings', 'user:data' etc.)
   *
   * @example
   * ```ts
   * strictStore.clearNamespace('auth'); // Removes all 'auth:*' keys
   * ```
   *
   * @remarks
   * This operation is synchronous and affects only keys with matching namespace prefix.
   */
  clearNamespace(ns: string): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${ns}:`)) {
        localStorage.removeItem(key);
      }
    });
  },
}

/**
 * @internal
 * Generates full storage key by combining namespace and key
 */
function getFullKey(ns: string, key: string): string {
  return `${ns}:${key}`
}

/**
 * @internal
 * Custom JSON replacer for BigInt serialization
 */
function replacer(key: any, value: any) {
  if (typeof value === 'bigint') {
    return { __type: 'BigInt', value: value.toString() };
  }
  return value;
}

/**
 * @internal
 * Custom JSON reviver for BigInt deserialization
 */
function reviver(key: any, value: any) {
  if (typeof value === 'object' && value?.__type === 'BigInt') {
    return BigInt(value.value);
  }
  return value;
}
