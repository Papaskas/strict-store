/**
 * Compile-time type marker used to bind a {@link StoreKey} to its value type.
 *
 * This marker allows the storage API to enforce that a key and its value
 * always belong to the same domain type.
 *
 * It does not exist at runtime and must not be used in logic,
 * comparisons, or serialization.
 *
 * @example
 * ```ts
 * const userKey: StoreKey<User> = createKey('user', 'profile');
 *
 * // ✅ type-safe: value matches key type
 * StrictStore.save(userKey, { id: 1, name: 'Alice' });
 *
 * // ❌ compile-time error: wrong value type
 * StrictStore.save(userKey, 123);
 * ```
 */
export declare const typeMarkerSymbol: unique symbol;
