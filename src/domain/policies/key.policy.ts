import { KEY_PATTERN } from '@src/domain/entities/key-pattern.entity';
import { Persistable } from '@src/domain/entities/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key.entity';
import { StoreType } from '@src/domain/entities/store-type.entity';

export const keyPolicy = {
  /**
   * Checks whether a raw storage key is managed by {@link StrictStore}.
   *
   * The method validates that the given key starts with at least one of the allowed
   * StrictStore prefixes (e.g. `"strict-store/user:"`).
   *
   * @internal
   *
   * @param raw - Raw storage key string as retrieved from `localStorage.key()` or `sessionStorage.key()`.
   * @param prefixes - One or more allowed StrictStore prefixes to match against.
   * @returns `true` if the key belongs to StrictStore and matches any prefix, otherwise `false`.
   *
   * @example
   * ```ts
   * const isValid = keyPolicy.isStrictStoreKey('strict-store/user:123', ['strict-store/user:']);
   * // → true
   * ```
   */
  isStrictStoreKey: (raw: string, prefixes: string[]) =>
    prefixes.some(p => raw.startsWith(p)),

  /**
   * Creates a full storage key name for StrictStore by combining namespace and name.
   *
   * @internal
   *
   * @param ns - Namespace of the store key.
   * @param name - Name of the store key.
   * @returns Full storage key string in the format `strict-store/{ns}:{name}`.
   *
   * @example
   * ```ts
   * const fullName = keyPolicy.makeFullName('user', '123');
   * // → 'strict-store/user:123'
   * ```
   */
  makeFullName: (ns: string, name: string) => `strict-store/${ns}:${name}`,

  /**
   * Parses a raw storage key into a strongly typed {@link StoreKey} structure.
   *
   * The key must conform to the StrictStore naming convention:
   * `"strict-store/{namespace}:{name}"`.
   * If the format does not match, the function returns `null`.
   *
   * @internal
   *
   * @param raw - Raw storage key string (e.g. `"strict-store/user:profile"`).
   * @param storeType - Storage type (`'local'` or `'session'`) associated with the key.
   * @returns A {@link StoreKey} object if the raw key matches the expected format, otherwise `null`.
   *
   * @example
   * ```ts
   * const parsed = keyPolicy.parseStoreKey('strict-store/app:theme', 'local');
   * // parsed = {
   * //   ns: 'app',
   * //   name: 'theme',
   * //   storeType: 'local',
   * //   __type: 'undefined'
   * // }
   * ```
   */
  parseStoreKey: (
    raw: string,
    storeType: StoreType
  ): StoreKey<Persistable> | null =>{
    const m = KEY_PATTERN.exec(raw)
    if (!m) return null

    const [, nsPart, namePart] = m
    return {
      ns: nsPart,
      name: namePart,
      storeType,
      __type: undefined as any,
    }
  },
};
