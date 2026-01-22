import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { typeMarkerSymbol } from '@src/domain/types/type-marker.symbol';

/**
 * Represents a typed identifier for a value stored in `StrictStore`.
 *
 * `StoreKey` defines **what** is stored and **under which logical name**,
 * while also binding the key to the exact value type at compile time.
 * This prevents using the same key with incompatible value shapes.
 *
 * The key itself contains only naming and persistence metadata.
 * Type information is carried purely by the type system.
 *
 * @typeParam T - Value type associated with this key
 *
 * @example
 * ```ts
 * const settingsKey: StoreKey<Settings> = {
 *   ns: 'user',
 *   name: 'settings',
 *   persistenceType: 'local',
 * };
 *
 * // ✅ correct: value matches key type
 * StrictStore.save(settingsKey, { theme: 'dark' });
 *
 * // ❌ compile-time error: incompatible value type
 * StrictStore.save(settingsKey, 'dark');
 * ```
 *
 * @public
 */
export type StoreKey<T extends Persistable> = {
  readonly ns: string;
  readonly name: string;
  readonly persistenceType: PersistenceType;
} & TypeMarker<T>;

/**
 * Internal compile-time helper that binds a {@link StoreKey}
 * to its associated value type.
 *
 * This type exists only to support type safety
 * and must not be used directly.
 **/
type TypeMarker<T> = {
  readonly [typeMarkerSymbol]: T;
};
