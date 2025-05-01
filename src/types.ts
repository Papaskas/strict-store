/**
 * @internal
 * Represents all serializable value types that can be stored in `strictStore`.
 *
 * @remarks
 * This type is marked as `@internal` and should not be referenced directly in public API.
 * Includes all JSON-compatible types plus BigInt (with custom serialization).
 * */
export type Serializable =
  | string
  | number
  | bigint
  | boolean
  | { [key: string]: Serializable }
  | Serializable[]
  | null;

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
 * Specifies the type of web storage to use for persistence.
 *
 * @property local - Uses `localStorage` for persistent storage:
 *   - Data persists across browser sessions
 *   - Available until explicitly cleared
 *   - Storage limit typically ~5-10MB per domain
 *
 * @property session - Uses `sessionStorage` for temporary storage:
 *   - Data cleared when tab/browser closes
 *   - Scoped to current browsing session
 *   - Useful for sensitive/short-lived data
 *
 * @remarks
 * - Defaults to 'local' when not specified
 * - Consider security implications when choosing storage type
 * - Session storage prevents "ghost logins" when tabs are closed
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API | MDN Web Storage API}
 * @see {@link createKey} for usage with store keys
 * @see {@link strictStore} for storage operations
 */
export type StoreType = 'local' | 'session';
