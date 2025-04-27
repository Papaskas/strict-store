import { Serializable, StoreKey } from './@types';

/**
 * A type-safe wrapper around localStorage that provides:
 * - Automatic JSON serialization/deserialization
 * - Namespace support to prevent key collisions
 * - Strict typing for all operations
 *
 * @example
 * ```ts
 * const key = {
 *    ns: 'app',
 *    key: 'theme',
 *    defaultValue: 'light'
 * } as StoreKey<'light' | 'dark'>;
 *
 * StrictStore.save(key, 'dark');
 * const theme = StrictStore.get(key); // Typed as literal
 * ```
 */
export class StrictStore {

  /**
   * Retrieves a value from storage. Returns defaultValue if key doesn't exist.
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing namespace, key and default value
   * @returns The stored value or defaultValue if not found
   *
   * @example
   * ```ts
   * // Returns 'light' if not found
   * const theme = StrictStore.get({
   *   ns: 'ui',
   *   key: 'theme',
   *   defaultValue: 'light'
   * });
   * ```
   *
   * @remarks
   * - Automatically handles JSON parsing
   * - Returns defaultValue for non-existent keys
   */
  static get<T extends Serializable>(key: StoreKey<T>): T {
    const fullKey = this.getFullKey(key.ns, key.key);
    const storedValue = localStorage.getItem(fullKey);

    if (storedValue === null) {
      return key.defaultValue;
    }

    try {
      return JSON.parse(storedValue, this.reviver) as T;
    } catch {
      return storedValue as T;
    }
  }

  /**
   * Saves a value to storage with automatic serialization.
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key - StoreKey object containing namespace and key
   * @param value - Value to store (will be JSON.stringified)
   *
   * @example
   * ```ts
   * StrictStore.save(
   *   { ns: 'user', key: 'token', defaultValue: undefined },
   *   456156150501
   * );
   * ```
   *
   * @remarks
   * - Overwrites existing values
   * - Supports all JSON-serializable values
   */
  static save<T extends StoreKey<any>>(key: T, value: T['defaultValue']): void {
    const fullKey = this.getFullKey(key.ns, key.key);
    localStorage.setItem(fullKey, JSON.stringify(value, this.replacer));
  }

  /**
   * Removes a key-value pair from storage.
   *
   * @typeParam T - Type parameter for StoreKey consistency
   * @param key - StoreKey object identifying item to remove
   *
   * @example
   * ```ts
   * StrictStore.remove({ ns: 'temp', key: 'cache' });
   * ```
   *
   * @remarks
   * - Silent if key doesn't exist
   * - Namespace-aware operation
   */
  static remove<T extends Serializable>(key: StoreKey<T>): void {
    const fullKey = this.getFullKey(key.ns, key.key);
    localStorage.removeItem(fullKey);
  }

  /**
   * Checks if a key exists in localStorage.
   *
   * @param key - StoreKey object containing namespace and key identifier
   * @returns `true` if the key exists, `false` otherwise
   *
   * @example
   * ```ts
   * const exists: boolean = TypedStorage.has({ ns: 'app', key: 'settings' });
   * ```
   *
   * @remarks
   * - Does not validate the stored value, only checks key presence
   */
  static has<T extends Serializable>(key: StoreKey<T>): boolean {
    const fullKey = this.getFullKey(key.ns, key.key);
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Gets the total number of items in localStorage.
   *
   * @returns Count of all items (including non-namespaced)
   *
   * @example
   * ```ts
   * if (StrictStore.countItems > 100) {
   *   StrictStore.clear();
   * }
   * ```
   */
  static get countItems(): number {
    return localStorage.length
  }

  /**
   * Clears all items from localStorage (including non-namespaced).
   *
   * @example
   * ```ts
   * StrictStore.clear(); // Full reset
   * ```
   *
   * @remarks
   * - Affects entire localStorage, not just typed keys
   * - Irreversible operation
   */
  static clear() {
    localStorage.clear();
  }

  /**
   * Clears all keys in localStorage that belong to a specific namespace.
   *
   * @param ns - Namespace prefix to clear (e.g., 'user' will remove 'user:settings', 'user:data' etc.)
   *
   * @example
   * ```ts
   * TypedStorage.clearNamespace('auth'); // Removes all 'auth:*' keys
   * ```
   *
   * @remarks
   * This operation is synchronous and affects only keys with matching namespace prefix.
   */
  static clearNamespace(ns: string): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${ns}:`)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * @internal
   * Generates full storage key by combining namespace and key
   */
  private static getFullKey(ns: string, key: string): string {
    return `${ns}:${key}`
  }

  /**
   * Custom JSON replacer for BigInt serialization
   */
  private static replacer(key: any, value: any) {
    if (typeof value === 'bigint') {
      return { __type: 'BigInt', value: value.toString() };
    }
    return value;
  }

  /**
   * Custom JSON reviver for BigInt deserialization
   */
  private static reviver(key: any, value: any) {
    if (typeof value === 'object' && value?.__type === 'BigInt') {
      return BigInt(value.value);
    }
    return value;
  }
}
