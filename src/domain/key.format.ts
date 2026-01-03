import { KEY_PATTERN } from '@src/domain/entities/key-pattern.entity';
import { Persistable } from '@src/domain/entities/persistable';
import { StoreKey } from '@src/domain/entities/store-keys';
import { StoreType } from '@src/domain/entities/store-type';

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
 * const parsed = StrictStore.parseStoreKey('strict-store/app:theme', 'local');
 * // parsed = {
 * //   ns: 'app',
 * //   name: 'theme',
 * //   storeType: 'local',
 * //   __type: undefined
 * // }
 * ```
 */
export const parseStoreKey = (
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
}

/**
 * Normalizes the `target` filter passed to {@link StrictStore.onChange}.
 *
 * The `target` parameter can be:
 * - An array of {@link StoreKey} objects → will be resolved into exact key names.
 * - An array of namespaces (`string[]`) → will be resolved into namespace prefixes.
 * - `undefined` → means "listen to all strict-store keys".
 * - An empty array → means 'do not listen to anything'.
 *
 * @internal
 *
 * @param target - Keys or namespaces to listen for. If omitted, all keys are observed.
 * @returns An object with two optional arrays:
 * - `keyNames` — Fully qualified strict-store key names.
 * - `nsPrefixes` — Namespace prefixes (e.g. `'strict-store/user:'`).
 *
 * @example
 * ```ts
 * // Keys form
 * const keys = [createKey<number>('app', 'counter')];
 * const { keyNames } = StrictStore.resolveTargets(keys);
 * // keyNames = ['strict-store/app:counter']
 *
 * // Namespaces form
 * const { nsPrefixes } = StrictStore.resolveTargets(['user']);
 * // nsPrefixes = ['strict-store/user:']
 * ```
 */
export const resolveTargets = (target?: StoreKey<Persistable>[] | string[]) => {
  if (!target) return { keyNames: undefined, nsPrefixes: undefined }
  if (target.length === 0) return { keyNames: [], nsPrefixes: [] }

  if (typeof target[0] === 'string') {
    return {
      keyNames: undefined,
      nsPrefixes: (target as string[]).map(ns => `strict-store/${ns}:`),
    };
  }

  return {
    keyNames: (target as StoreKey<Persistable>[]).map(k =>
      makeFullName(k.ns, k.name),
    ),
    nsPrefixes: undefined,
  };
}

/**
 * Determines whether a given {@link StorageEvent} is relevant to StrictStore.
 *
 * A storage event is considered relevant if:
 * - Its key is non-null and starts with `"strict-store/"`.
 * - It matches at least one of the provided filters (`keyNames` or `nsPrefixes`), if they are defined.
 *
 * @internal
 *
 * @param e - The {@link StorageEvent} fired by the browser.
 * @param keyNames - Optional list of fully qualified strict-store keys to match.
 * @param nsPrefixes - Optional list of namespace prefixes to match.
 * @returns `true` if the event corresponds to a StrictStore-managed key and passes all filters, otherwise `false`.
 *
 * @example
 * ```ts
 * window.addEventListener('storage', e => {
 *   if (StrictStore.isStrictStoreEvent(e, ['strict-store/app:counter'])) {
 *     console.log('Counter key changed');
 *   }
 * });
 * ```
 */
export const isStrictStoreEvent = (
  e: StorageEvent,
  keyNames?: string[],
  nsPrefixes?: string[],
): boolean => {
  if (!e.key || !e.key.startsWith('strict-store/')) return false
  else if (keyNames && keyNames.length > 0 && !keyNames.includes(e.key)) return false

  return !(nsPrefixes &&
    nsPrefixes.length > 0 &&
    !nsPrefixes.some(prefix => e.key!.startsWith(prefix)));
}
