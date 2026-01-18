/**
 * Represents the set of values that are allowed to be stored in `StrictStore`.
 *
 * @remarks
 * `Persistable` defines the **serialization boundary** of the library.
 * Any value accepted by `StrictStore` must conform to this type so that it can be
 * safely and deterministically serialized, persisted, and restored across
 * application reloads and execution contexts.
 *
 * This type exists to:
 * - make the storage contract explicit and self-documenting;
 * - prevent accidental persistence of unsupported or non-deterministic values;
 * - provide a single, centralized place to evolve storage capabilities
 *   without leaking serialization concerns into business logic.
 *
 * Values outside `Persistable` are intentionally rejected to preserve
 * correctness, predictability, and long-term compatibility of stored data.
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
