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
 * const isValid = StrictStore.isStoreKey('strict-store/user:123', ['strict-store/user:']);
 * // → true
 * ```
 */
export const isStrictStoreKey = (raw: string, prefixes: string[]) =>
  prefixes.some(p => raw.startsWith(p));

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
 * const fullName = makeFullName('user', '123');
 * // → 'strict-store/user:123'
 * ```
 */
export const makeFullName = (ns: string, name: string) => `strict-store/${ns}:${name}`;
