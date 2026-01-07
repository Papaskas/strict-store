import { Persistable } from '@core/entities/persistable.entity';
import { StoreKey } from '@core/entities/store-key.entity';
import { keyPolicy } from '@core/policies/key.policy';
import { KEY_PREFIX } from '@core/constants/key-prefix.constant';

export const onChangePolicy = {
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
   * const { keyNames } = resolveTargets(keys);
   * // keyNames = ['strict-store/app:counter']
   *
   * // Namespaces form
   * const { nsPrefixes } = resolveTargets(['user']);
   * // nsPrefixes = ['strict-store/user:']
   * ```
   */
  resolveTargets: (target?: StoreKey<Persistable>[] | string[]) => {
    if (!target) return { keyNames: undefined, nsPrefixes: undefined };
    if (target.length === 0) return { keyNames: [], nsPrefixes: [] };

    if (typeof target[0] === 'string') {
      return {
        keyNames: undefined,
        nsPrefixes: (target as string[]).map((ns) => `${KEY_PREFIX}/${ns}:`),
      };
    }

    return {
      keyNames: (target as StoreKey<Persistable>[]).map((k) => keyPolicy.makeKey(k.ns, k.name)),
      nsPrefixes: undefined,
    };
  },

  /**
   * Determines whether a given {@link StorageEvent} is relevant to StrictStore.
   *
   * A storage event is considered relevant if:
   * - Its key is non-null and starts with `"strict-store/"`.
   * - It matches at least one of the provided filters (`keyNames` or `nsPrefixes`), if they are defined.
   *
   * @internal
   *
   * @param event - The {@link StorageEvent} fired by the browser.
   * @param keyNames - Optional list of fully qualified strict-store keys to match.
   * @param nsPrefixes - Optional list of namespace prefixes to match.
   * @returns `true` if the event corresponds to a StrictStore-managed key and passes all filters, otherwise `false`.
   *
   * @example
   * ```ts
   * window.addEventListener('storage', e => {
   *   if (isStrictStoreEvent(e, ['strict-store/app:counter'])) {
   *     console.log('Counter key changed');
   *   }
   * });
   * ```
   */
  isStrictStoreEvent: (
    event: StorageEvent,
    keyNames?: string[],
    nsPrefixes?: string[],
  ): boolean => {
    if (!event.key || !event.key.startsWith(`${KEY_PREFIX}/`)) return false;
    else if (keyNames && keyNames.length > 0 && !keyNames.includes(event.key)) return false;

    return !(
      nsPrefixes &&
      nsPrefixes.length > 0 &&
      !nsPrefixes.some((prefix) => event.key!.startsWith(prefix))
    );
  },
};
