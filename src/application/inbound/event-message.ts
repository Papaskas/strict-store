import { Persistable } from '@src/core/persistable/persistable';
import { StoreKey } from '@src/core/store-key/store-key';

/**
 * Payload emitted by `onChange` when a store value changes.
 * Represents a single, effective state transition for a specific key.
 */
export type EventMessage = {
  /** Store key whose value has changed */
  key: StoreKey<Persistable>;

  /** Value after the change */
  newValue: Persistable;

  /** Value before the change */
  oldValue: Persistable;

  /** Unix timestamp (ms) when the change was emitted */
  timestamp: number;
};
