import type { TypedArray } from '@src/domain/entities/typed-array';

/**
 * Covers all standard JavaScript primitive types and their serializable containers.
 *
 * - `string`: Any string value.
 * - `number`: Any finite number.
 * - `boolean`: `true` or `false`.
 * - `null`: The `null` value.
 *
 * @public
 */
export type NativePersistable = string | number | boolean | null;

/**
 * Extends the set of storable values to include certain advanced JavaScript types.
 *
 * - `{ [key: string]: Persistable }`: Plain objects with string keys and serializable values.
 * - `Persistable[]`: Arrays containing serializable values.
 * - `Set<Persistable>`: A Set containing only serializable values.
 * - `Map<Persistable, Persistable>`: A Map with serializable keys and values.
 * - `bigint`: Arbitrary-precision integers.
 * - `TypedArray`: Any of the standard JavaScript typed arrays (e.g., Int8Array, Float32Array, etc.).
 *
 * @remarks
 * - These types are internally serialized and deserialized by `StrictStore` to ensure compatibility with web storage.
 * - `undefined` and `symbols` are **not** allowed.
 *
 * @public
 */
export type AdvancedPersistable =
  | { [key: string]: Persistable }
  | Persistable[]
  | Set<Persistable>
  | Map<Persistable, Persistable>
  | bigint
  | TypedArray;

/**
 * Represents all value types that can be safely stored in StrictStore.
 * This includes both primitive JavaScript values and a set of supported complex types.
 * Any value passed to the store must conform to this type.
 *
 * @public
 */
export type Persistable =
  | NativePersistable
  | AdvancedPersistable;
