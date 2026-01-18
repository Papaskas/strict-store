import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { KEY_PATTERN, KEY_PREFIX } from '@src/domain/constants/key.constant';

export const keyPolicy = {
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
  isStrictStoreKey: (rawKey: string, ns: string[]): boolean => ns.some((p) => rawKey.startsWith(p)),

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
   * const fullName = keyPolicy.makeKey('user', '123');
   * // → 'strict-store/user:123'
   * ```
   */
  makeKey: (ns: string, name: string) => `${KEY_PREFIX}/${ns}:${name}`,

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
   * //   phantomTypeSymbol: 'undefined'
   * // }
   * ```
   */
  parseStoreKey: (raw: string, storeType: PersistenceType): StoreKey<Persistable> | null => {
    const m = KEY_PATTERN.exec(raw);
    if (!m) return null;

    const [, nsPart, namePart] = m;
    return {
      ns: nsPart,
      name: namePart,
      storeType,
    };
  },
};
