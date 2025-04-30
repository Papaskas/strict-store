/**
 * @internal
 * Represents all serializable value types that can be stored in `strictStore`.
 *
 * @remarks
 * This type is marked as `@internal` and should not be referenced directly in public API.
 * Includes all JSON-compatible types plus BigInt (with custom serialization).
 * */
export type Serializable = string | number | bigint | boolean | object | [] | null;

/**
 * @internal
 * Defines a type-safe storage key structure for `strictStore` operations.
 *
 * @typeParam T - Concrete serializable type for this storage entry
 *
 * @property ns - Namespace prefix to prevent key collisions between modules
 * @property key - Unique identifier within the namespace
 * @property defaultValue - Fallback value when key is not found
 *
 * @remarks
 * This type is marked as `@internal` but its shape is part of public API.
 * All fields are readonly in actual usage (enforced by `as const` assertion).
 * */
export type StoreKey<T extends Serializable> = {
  ns: string;
  key: string;
  defaultValue: T;
  storeType: StoreType;
};

/**
 * @Internal
 * */
export type StoreType = 'local' | 'session';
