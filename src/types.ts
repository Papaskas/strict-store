/**
 * @internal
 * Represents all serializable value types that can be stored in `strictStore`.
 * */
export type Serializable =
  | Primitives
  | null
  | { [key: string]: Serializable }
  | Serializable[]
  | ComplexTypes;

export type ComplexTypes =
  | Set<Serializable>
  | Map<Serializable, Serializable>
  | bigint
  | TypedArray;

export type Primitives =
  | string
  | number
  | boolean;

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array

type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | BigInt64ArrayConstructor
  | BigUint64ArrayConstructor;

export const TYPED_ARRAY_CONSTRUCTORS: Record<string, TypedArrayConstructor> = {
  'Int8Array': Int8Array,
  'Uint8Array': Uint8Array,
  'Uint8ClampedArray': Uint8ClampedArray,
  'Int16Array': Int16Array,
  'Uint16Array': Uint16Array,
  'Int32Array': Int32Array,
  'Uint32Array': Uint32Array,
  'Float32Array': Float32Array,
  'Float64Array': Float64Array,
  'BigInt64Array': BigInt64Array,
  'BigUint64Array': BigUint64Array,
}

/**
 * @internal
 * Defines a type-safe storage name structure for `strictStore` operations.
 *
 * @typeParam T Concrete serializable type for this storage entry
 *
 * @property ns Namespace prefix to prevent name collisions between modules
 * @property key Unique identifier within the ns
 * @property __type Acceptable types for a name
 *
 * @remarks
 * This type is marked as `@internal` but its shape is part of public API.
 * All fields are readonly in actual usage (enforced by `as const` assertion).
 * */
export type StoreKey<T extends Serializable> = {
  readonly ns: string;
  readonly name: string;
  readonly storeType: StoreType;
  readonly __type: T;
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
