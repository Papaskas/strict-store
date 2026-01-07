export const nsPolicy = {
  /**
   * Resolves namespace filters key prefixes.
   *
   * This function normalizes an optional list of namespaces into
   * fully qualified key prefixes used for key matching and filtering.
   *
   * Rules:
   * - If namespaces are provided and non-empty, each namespace is converted
   *   into a scoped prefix: `"{prefix}/{namespace}:"`.
   *
   * @param ns - Optional list of namespaces to scope the prefixes.
   * @param {string} prefix - Root prefix.
   *
   * @returns An array of key prefixes suitable for prefix-based matching.
   *
   * @example
   * ```ts
   * resolveNamespacePrefixes(['user', 'settings'], 'strict-store');
   * // ['strict-store/user:', 'strict-store/settings:']
   *
   * resolveNamespacePrefixes(undefined, 'strict-store');
   * // ['strict-store/']
   * ```
   */
  resolveNamespacePrefixes: (prefix: string, ns: string[]): string[] => {
    return ns.map((n) => `${prefix}/${n}:`);
  },
};
