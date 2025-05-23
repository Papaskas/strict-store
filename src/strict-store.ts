import { Serializable, StoreType, StoreKey, TYPED_ARRAY_CONSTRUCTORS } from '@src/types';

/**
 * A type-safe wrapper around localStorage and sessionStorage that provides:
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
   *
   * @typeParam T - Type of the stored value (inferred from StoreKey)
   * @param key StoreKey object containing namespace, key and default value
   * @returns The stored value
   *
   * @example
   * ```ts
   * const themeKey = createKey<'light', 'dark'>(
   *  'app',
   *  'theme',
   * );
   *
   * const theme: 'light' | 'dark' = strictStore.get(themeKey);
   * ```
   *
   * @remarks
   * - Automatically handles JSON parsing
   */
  get<T extends Serializable>(key: StoreKey<T>): T | null {
    const storage = getStorage(key.storeType);
    const fullKey = getFullKey(key.ns, key.key);
    const storedValue = storage.getItem(fullKey);

    if(storedValue === null) return storedValue;

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
   * @param key StoreKey object containing namespace and key
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
  save<T extends StoreKey<any>>(key: T, value: T['__type']): void {
    const storage = getStorage(key.storeType);
    const fullKey = getFullKey(key.ns, key.key);

    storage.setItem(fullKey, JSON.stringify(value, replacer));
  },

  /**
   * Removes a key-value pair from storage.
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
   * - Silent if key doesn't exist
   * - Namespace-aware operation
   */
  remove<T extends Serializable>(key: StoreKey<T>): void {
    const storage = getStorage(key.storeType);
    const fullKey = getFullKey(key.ns, key.key);

    storage.removeItem(fullKey);
  },

  /**
   * Checks if a key exists in storage.
   *
   * @param key StoreKey object containing namespace and key identifier
   * @returns `true` if the key exists, `false` otherwise
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
   * - Does not validate the stored value, only checks key presence
   * - If the value is null, it returns false
   */
  has<T extends Serializable>(key: StoreKey<T>): boolean {
    const storage = getStorage(key.storeType);
    const fullKey = getFullKey(key.ns, key.key);

    return storage.getItem(fullKey) !== null;
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
   * Clears all keys in storage that belong to a specific namespace.
   *
   * @param ns Namespace prefix to clear (e.g., 'user' will remove 'user:settings', 'user:data' etc.)
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
    [localStorage, sessionStorage].forEach(storage => {
      Object.keys(storage).forEach(key => {
        if (key.startsWith(`${ns}:`)) {
          storage.removeItem(key);
        }
      });
    });
  }
}

/**
 * Creates a type-safe store key object for use with strictStore.
 *
 * @typeParam T - Type of the stored value, must extend `Serializable`
 *
 * @param ns - Namespace to prevent key collisions (e.g., 'app', 'user')
 * @param key - Unique identifier within the namespace
 * @param [storeType] - Determines which Web Storage API to use:
 *                  - 'local': Uses `localStorage`
 *                  - 'session': Uses `sessionStorage`
 *
 * @returns A frozen `StoreKey<T>` object with strict type information
 *
 * @remarks
 * - The returned object is frozen with `as const` for type safety
 * - Namespace and key are combined to form the final storage key (e.g., 'app:counter')
 *
 * @see {@link StoreKey} for the interface definition
 * @see {@link strictStore} for usage examples with storage methods
 */
export function createKey<T extends Serializable>(
  ns: string,
  key: string,
  storeType: StoreType = 'local',
) {
  return {
    ns: ns,
    key: key,
    storeType: storeType,
    __type: {} as T
  } as const satisfies StoreKey<T>;
}

/**
 * @internal
 * */
const getStorage = (type: StoreType): Storage => {
  return type === 'local' ? localStorage : sessionStorage;
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
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') return typeHandlers.bigint(value);
  else if (value instanceof Map) return typeHandlers.Map(value);
  else if (value instanceof Set) return typeHandlers.Set(value);
  else if (ArrayBuffer.isView(value) && !(value instanceof DataView)) return typeHandlers.TypedArray(value);

  return value;
}

const typeHandlers = {
  bigint: (val: bigint) => ({ __type: 'bigint', value: val.toString() }),
  Map: (val: Map<any, any>) => ({ __type: 'map', value: Array.from(val.entries()) }),
  Set: (val: Set<any>) => ({ __type: 'set', value: Array.from(val) }),
  TypedArray: (val: any) => ({
    __type: 'typed_array',
    subtype: val.constructor.name,
    value: val instanceof BigInt64Array || val instanceof BigUint64Array
      ? Array.from(val).map(n => n.toString())
      : Array.from(val)
  }),
}

/**
 * @internal
 * Custom JSON reviver for BigInt deserialization
 */
function reviver(key: string, value: any) {
  if (value !== null) {
    switch (value.__type) {
      case 'bigint': return BigInt(value.value);
      case 'map': return new Map(value.value);
      case 'set': return new Set(value.value);
      case 'typed_array':
      {
        const Constructor = TYPED_ARRAY_CONSTRUCTORS[value.subtype];
        if (!Constructor) {
          throw new Error(`Unsupported TypedArray type: ${value.subtype}`);
        }
        return new Constructor(value.value);
      }
    }
  }

  return value;
}
