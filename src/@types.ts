import { TypedArray } from '@src/iternal-types';

/**
 * Represents all value types that can be safely stored in StrictStore.
 * This includes both primitive JavaScript values and a set of supported complex types.
 * Any value passed to the store must conform to this type.
 *
 * @public
 */
export type Persistable =
  | BasicPersistable
  | ExtendedPersistable;

/**
 * Extends the set of storable values to include certain advanced JavaScript types.
 *
 * - `Set<Persistable>`: A Set containing only serializable values.
 * - `Map<Persistable, Persistable>`: A Map with serializable keys and values.
 * - `bigint`: Arbitrary-precision integers.
 * - `TypedArray`: Any of the standard JavaScript typed arrays (e.g., Int8Array, Float32Array, etc.).
 *
 * @remarks
 * These types are internally serialized and deserialized by StrictStore to ensure compatibility with web storage.
 *
 * @public
 */
export type ExtendedPersistable =
  | Set<Persistable>
  | Map<Persistable, Persistable>
  | bigint
  | TypedArray;

/**
 * Covers all standard JavaScript primitive types and their serializable containers.
 *
 * - `string`: Any string value.
 * - `number`: Any finite number.
 * - `boolean`: `true` or `false`.
 * - `null`: The `null` value.
 * - `Persistable[]`: Arrays containing serializable values.
 * - `{ [key: string]: Persistable }`: Plain objects with string keys and serializable values.
 *
 * @remarks
 * Functions, `undefined`, and symbols are **not** allowed.
 *
 * @public
 */
export type BasicPersistable =
  | string
  | null
  | { [key: string]: Persistable }
  | Persistable[]
  | number
  | boolean;

/**
 * Defines a type-safe storage name structure for `StrictStore` operations.
 * @public
 *
 * @typeParam T - Concrete serializable type for this storage entry
 *
 * @param ns - Namespace prefix to prevent name collisions between modules
 * @param name - Name of the storage entry
 * @param key - Unique identifier within the ns
 * @param __type - Acceptable types for key
 * */
export type StoreKey<T extends Persistable> = {
  readonly ns: string;
  readonly name: string;
  readonly storeType: StoreType;
  readonly __type: T;
};

/**
 * Specifies the type of web storage to use for persistence.
 * @public
 *
 * @param local - Uses `localStorage` for persistent storage:
 *   - Data persists across browser sessions
 *   - Available until explicitly cleared
 *   - Storage limit typically ~5-10MB per domain
 *
 * @param session - Uses `sessionStorage` for temporary storage:
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
 */
export type StoreType = 'local' | 'session';
