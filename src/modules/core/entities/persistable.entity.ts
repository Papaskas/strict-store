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
export type NativePersistable = string | number | boolean | null | undefined;

/**
 * Extends the set of storable values to include certain advanced JavaScript types.
 *
 * - `{ [key: string]: Persistable }`: Plain objects with string keys and serializable values.
 * - `Persistable[]`: Arrays containing serializable values.
 * - `Set<Persistable>`: A Set containing only serializable values.
 * - `Map<Persistable, Persistable>`: A Map with serializable keys and values.
 * - `bigint`: Arbitrary-precision integers.
 *
 * @public
 */
export type AdvancedPersistable =
  | { [key: string]: Persistable }
  | Persistable[]
  | Date
  | RegExp
  | Set<Persistable>
  | Map<Persistable, Persistable>
  | bigint
  | Error
  | URL;

/**
 * Represents all value types that can be safely stored in StrictStore.
 * This includes both primitive JavaScript values and a set of supported complex types.
 * Any value passed to the store must conform to this type.
 *
 * @public
 */
export type Persistable = NativePersistable | AdvancedPersistable;
