import { Persistable } from '@src/core/persistable/persistable';
import { PersistenceType } from '@src/core/store-key/persistence-type';
import { storeKeyBrand } from '@src/core/store-key/store-key.brand';

/**
 * Represents a typed identifier for a value stored in `StrictStore`.
 *
 * `StoreKey` defines **what** is stored and **under which logical name**,
 * while also binding the key to the exact value type at compile time.
 * This prevents using the same key with incompatible value shapes.
 *
 * The key itself contains only naming and persistence metadata.
 * Type information is carried purely by the type system.
 *
 * @typeParam T - Value type associated with this key
 *
 * @example
 * ```ts
 * const settingsKey: StoreKey<Settings> = {
 *   ns: 'user',
 *   name: 'settings',
 *   persistenceType: 'local',
 *   raw: 'strict-store/local/user:settings',
 * };
 *
 * // ✅ correct: value matches key type
 * StrictStore.save(settingsKey, { theme: 'dark' });
 *
 * // ❌ compile-time error: incompatible value type
 * StrictStore.save(settingsKey, 'dark');
 * ```
 *
 * @public
 */
export type StoreKey<T extends Persistable> = {
  readonly ns: string;
  readonly name: string;
  readonly persistenceType: PersistenceType;
  readonly raw: string;
  readonly [storeKeyBrand]: T;
};

const KEY_PATTERN = new RegExp(`^strict-store:(?<type>local|session)\\:(?<ns>[^:]+):(?<name>.+)$`);

export const StoreKey = {
  /**
   * Creates a type-safe store name object for use with StrictStore.
   * @public
   *
   * @typeParam T - Type of the stored value, must extend `Persistable`
   *
   * @param ns - Namespace to prevent name collisions (e.g., 'app', 'user')
   * @param name - Unique identifier within the ns
   * @param persistenceType - Determines which Web Storage API to use:
   *                  - 'local': Uses `localStorage`
   *                  - 'session': Uses `sessionStorage`
   * @example
   * const countKey = createKey<number>('stats', 'count');
   *
   * @see {@link StrictStore} for usage examples with storage methods
   */
  create: <T extends Persistable>(
    ns: string,
    name: string,
    persistenceType: PersistenceType = 'local',
  ): StoreKey<T> => {
    if (ns.includes(':') || name.includes(':'))
      throw RangeError('StoreKey ns/name must not contain ":"');
    else if (ns.length === 0 || name.length === 0)
      throw RangeError('StoreKey ns and name must be non-empty');

    return Object.freeze({
      ns: ns,
      name: name,
      persistenceType: persistenceType,
      raw: `strict-store:${persistenceType}:${ns}:${name}`,
    }) as StoreKey<T>;
  },

  /**
   * Determines whether a given storage key is owned by StrictStore.
   *
   * A key is considered managed by StrictStore if it starts with
   * at least one of the provided namespace prefixes.
   *
   * This check is purely lexical and does not validate key structure
   * beyond prefix matching.
   *
   * @internal
   *
   * @param rawKey - Full key string obtained from a Web Storage backend
   * (`localStorage` or `sessionStorage`).
   * @param ns - One or more StrictStore namespace prefixes
   * used to identify managed keys.
   *
   * @returns `true` if the storage key starts with any of the namespace prefixes;
   * otherwise `false`.
   *
   * @example
   * ```ts
   * const result: boolean = keyPolicy.isStrictStoreKey('strict-store/user:profile', ['strict-store/user:']);
   * // → true
   * ```
   */
  isStoreKey: (rawKey: string): boolean => KEY_PATTERN.test(rawKey),

  /**
   * Parses a raw storage key into a strongly typed {@link StoreKey} structure.
   *
   * The key must conform to the StrictStore naming convention:
   * `"strict-store:{storage}:{namespace}:{name}"`.
   * If the format does not match, the function returns `null`.
   *
   * @internal
   *
   * @param raw - Raw storage key string (e.g. `"strict-store:{storage}:user:profile"`).
   * @returns A {@link StoreKey} object if the raw key matches the expected format, otherwise `null`.
   *
   * @example
   * ```ts
   * const parsed = parseKey('strict-store/app:theme', 'local');
   * // parsed = {
   * //   ns: 'app',
   * //   name: 'theme',
   * //   storeType: 'local',
   * // }
   * ```
   */
  parse: (raw: string): StoreKey<Persistable> | null => {
    const match = KEY_PATTERN.exec(raw);
    if (!match || !match.groups) return null;

    return StoreKey.create(match.groups.ns, match.groups.name, match.groups.type as PersistenceType);
  },

  /**
   * @internal
   */
  equals: (keyA: StoreKey<Persistable>, keyB: StoreKey<Persistable>): boolean => {
    return keyA.ns === keyB.ns && keyA.name === keyB.name && keyA.persistenceType === keyB.persistenceType;
  }
}
