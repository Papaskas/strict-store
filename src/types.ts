/**
 * Represents all value types that can be safely stored in StrictStore.
 * This includes both primitive JavaScript values and a set of supported complex types.
 * Any value passed to the store must conform to this type.
 *
 * @public
 */
export type Serializable =
  | BasicSerializable
  | ExtendedSerializable;

/**
 * Extends the set of storable values to include certain advanced JavaScript types.
 *
 * - `Set<Serializable>`: A Set containing only serializable values.
 * - `Map<Serializable, Serializable>`: A Map with serializable keys and values.
 * - `bigint`: Arbitrary-precision integers.
 * - `TypedArray`: Any of the standard JavaScript typed arrays (e.g., Int8Array, Float32Array, etc.).
 *
 * @remarks
 * These types are internally serialized and deserialized by StrictStore to ensure compatibility with web storage.
 *
 * @public
 */
export type ExtendedSerializable =
  | Set<Serializable>
  | Map<Serializable, Serializable>
  | bigint
  | TypedArray;

/**
 * Covers all standard JavaScript primitive types and their serializable containers.
 *
 * - `string`: Any string value.
 * - `number`: Any finite number.
 * - `boolean`: `true` or `false`.
 * - `null`: The `null` value.
 * - `Serializable[]`: Arrays containing serializable values.
 * - `{ [key: string]: Serializable }`: Plain objects with string keys and serializable values.
 *
 * @remarks
 * Functions, `undefined`, and symbols are **not** allowed.
 *
 * @public
 */
export type BasicSerializable =
  | string
  | null
  | { [key: string]: Serializable }
  | Serializable[]
  | number
  | boolean;

/** @private */
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

/** @private */
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

/** @private */
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
 * @private
 * DeepPartial<T> makes all fields of the object (and nested objects) optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

/** @private */
export type ComplexTypeNames = 'bigint' |'set' | 'map' |'typedArray';

/** @private */
export type ComplexTypeData = {
  __type: ComplexTypeNames,
  value: Serializable,
  subtype?: string,
}

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
export type StoreKey<T extends Serializable> = {
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
