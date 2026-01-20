/**
 * @description
 * Type-only marker for {@link StoreKey} that binds a key to the value type at compile time.
 * This symbol MUST NOT be used for runtime logic or serialization.
 *
 * The marker exists only for TypeScript's type system:
 * - it is declared (not defined), so it is erased during compilation;
 * - it is a `unique symbol`, so it cannot accidentally unify with other markers.
 *
 * @example
 * ```ts
 * export type StoreKey<T> = {
 *   ns: string;
 *   name: string;
 *   persistenceType: PersistenceType;
 *   readonly [typeMarkerSymbol]?: T; // type link, no runtime field
 * };
 *
 * declare const key: StoreKey<number>;
 * // save(key, 123)   ✅
 * // save(key, 'x')   ❌ TypeScript error
 * ```
 *
 * @remarks
 * Despite the historical name `typeMarkerSymbol`, the marker is not runtime.
 * It exists strictly for compile-time type safety.
 */
export declare const typeMarkerSymbol: unique symbol;
