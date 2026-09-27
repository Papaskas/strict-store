/**
 * Represents the set of values that are allowed to be stored in `StrictStore`.
 *
 * `Persistable` defines the **serialization boundary** of the library.
 * Any value accepted by `StrictStore` must conform to this type so that it can be
 * safely and deterministically serialized, persisted, and restored across
 * application reloads and execution contexts.
 *
 * @public
 */
export type Persistable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: Persistable }
  | Persistable[]
  | Date
  | RegExp
  | Set<Persistable>
  | Map<Persistable, Persistable>
  | bigint
  | Error
  | URL;
