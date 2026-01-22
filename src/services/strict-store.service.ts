import { keyPolicy } from '@src/domain/policies/key.policy';
import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';
import { PersistenceType } from '@src/domain/entities/core/persistence-type.entity';
import { SerializerPort } from '@src/domain/ports/serializer.port';
import { StorageResolverPort } from '@src/domain/ports/storage.resolver.port';
import { typeMarkerSymbol } from '@src/domain/types/type-marker.symbol';
import { StrictStoreError } from '@src/domain/entities/errors/strict-store.error';
import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { MergePort } from '@src/domain/ports/merge.port';
import { PartialDeep } from 'type-fest';
import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';
import { EventMessage } from '@src/domain/entities/on-change/event-message.entity';
import { EventPort } from '@src/domain/ports/event.port';
import { isEqual } from 'lodash';
import { PickResult } from '@src/domain/types/pick-result.type';
import { BatchEntries } from '@src/domain/types/batch-entries.type';

/**
 * A typed persistence layer built on top of Web Storage.
 *
 * StrictStore treats storage keys as explicit contracts:
 * each key defines its namespace, persistence scope, and value type.
 *
 * The service provides structured access, controlled mutation,
 * and observable change events, while hiding raw storage APIs
 * and serialization details from application code.
 *
 * @public
 */
export class StrictStoreService {
  constructor(
    private readonly storagePort: StorageResolverPort,
    private readonly serializerPort: SerializerPort,
    private readonly mergePort: MergePort,
    private readonly eventPort: EventPort,
  ) {}

  /**
   * Read a value by key.
   *
   * The return type is inferred from the provided StoreKey.
   * Returns `null` if the entry does not exist.
   *
   * @public
   */
  get<T extends Persistable>(key: StoreKey<T>): T | null {
    const storage = this.storagePort.resolve(key.persistenceType);
    const raw = storage.get(keyPolicy.makeKey(key.ns, key.name, key.persistenceType));

    if (!raw) return null;
    return this.serializerPort.parse<T>(raw);
  }

  /**
   * Read multiple values for a tuple of keys.
   *
   * Preserves positional typing: each returned value
   * corresponds to the value type of its key.
   *
   * @example
   * const [count, lang] = StrictStore.pick([countKey, langKey]);
   * // count: number | null
   * // lang: 'en' | 'ru' | null
   *
   * @public
   */
  pick<const K extends StoreKey<Persistable>[]>(keys: K): PickResult<K> {
    const out = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) out[i] = this.get(keys[i]);

    return out as PickResult<K>;
  }

  /**
   * Write a value by key.
   *
   * The value type is enforced by the key definition.
   * Passing `null` removes the entry.
   *
   * A change event is published if the serialized value changes.
   *
   * @public
   */
  save<T extends StoreKey<Persistable>>(key: T, value: T[typeof typeMarkerSymbol]): void {
    if (value === null) this.delete(key);
    else {
      const storage = this.storagePort.resolve(key.persistenceType);

      const oldValue = this.get(key as StoreKey<Persistable>);
      const rawOldValue = this.serializerPort.stringify(oldValue);

      const rawValue = this.serializerPort.stringify(value);
      const rawKey = keyPolicy.makeKey(key.ns, key.name, key.persistenceType);

      storage.set(rawKey, rawValue);

      if (rawValue !== rawOldValue)
        this.eventPort.publish({
          key: rawKey,
          timestamp: Date.now(),
          newValue: rawValue,
          oldValue: rawOldValue,
        });
    }
  }

  /**
   * Write multiple key/value pairs in a single operation.
   *
   * Each value is type-checked against its corresponding key.
   *
   * @public
   */
  saveBatch<Pairs extends [StoreKey<Persistable>, Persistable][]>(
    entries: BatchEntries<Pairs>,
  ): void {
    for (const [key, value] of entries) this.save(key, value);
  }

  /**
   * Merge a partial value into an existing stored object.
   *
   * Throws if the entry does not exist or if the current value
   * is not a plain object.
   *
   * @example
   * StrictStore.save(userKey, { name: 'Tom', age: 42 });
   * StrictStore.merge(userKey, { name: 'Alex' });
   *
   * @remarks
   * - Merge behavior is based on {@link https://lodash.com/docs/#merge | lodash.merge}.
   * - Arrays are replaced entirely, not merged by index.
   *
   * @public
   */
  merge<T extends Persistable>(key: StoreKey<T>, partial: PartialDeep<T>): T | null {
    const value = this.get(key);

    if (!value) {
      throw new StrictStoreError(STRICT_STORE_ERROR_CODE.MERGE_NOT_INITIALIZED);
    } else if (typeof value !== 'object' || Array.isArray(value)) {
      throw new StrictStoreError(STRICT_STORE_ERROR_CODE.MERGE_TARGET_NOT_PLAIN_OBJECT);
    }

    const merged = this.mergePort.merge(value, partial);
    this.save(key, merged);

    return this.get(key);
  }

  /**
   * Iterate over entries managed by StrictStore.
   *
   * Executes `callback` for each `{ key, value }` pair returned by {@link entries}.
   * Optionally restrict iteration to specific namespaces.
   *
   * @public
   */
  forEach(
    callback: (
      key: StoreKey<Persistable>,
      value: Persistable,
      index: number,
      array: {
        key: StoreKey<Persistable>;
        value: Persistable;
      }[],
    ) => void,
    ns?: string[],
  ): void {
    this.entries(ns).forEach(({ key, value }, index, array) => {
      callback(key, value, index, array);
    });
  }

  /**
   * Subscribe to changes of a specific StoreKey.
   *
   * Emits deserialized values along with a timestamp.
   *
   * @example
   * const unsubscribe = StrictStore.onChange(
   *   ({ newValue, oldValue }) => { ... },
   *   themeKey
   * );
   *
   * @remarks
   * Events are transported via {@link https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel | BroadcastChannel}
   * and mirrored locally via localEmitter.
   *
   * @public
   */
  onChange(
    callback: (msg: EventMessage) => void,
    target: StoreKey<Persistable>,
    options: AddEventListenerOptions = {},
  ): Unsubscribe {
    return this.eventPort.subscribe((msg) => {
      if (!isEqual(keyPolicy.parseKey(msg.key), target)) return;

      const result: EventMessage = {
        key: keyPolicy.parseKey(msg.key)!,
        newValue: msg.newValue && this.serializerPort.parse(msg.newValue),
        oldValue: msg.oldValue && this.serializerPort.parse(msg.oldValue),
        timestamp: msg.timestamp,
      };

      callback(result);
    }, options);
  }

  /**
   * Check whether an entry exists for a key.
   *
   * Returns `false` when the entry is missing or stored value is `null`.
   * Supports a single key or a list of keys.
   *
   * @public
   */
  has(key: StoreKey<Persistable>): boolean;
  has(keys: StoreKey<Persistable>[]): boolean[];
  has(value: StoreKey<Persistable> | StoreKey<Persistable>[]): boolean | boolean[] {
    if (Array.isArray(value)) return value.map((storeKey) => this.get(storeKey) !== null);

    return this.get(value) !== null;
  }

  /**
   * Remove an entry by key.
   *
   * Returns `true` if the entry existed, otherwise `false`.
   * Supports a single key or a list of keys.
   *
   * Publishes a change event (`newValue: null`) when an entry existed.
   *
   * @public
   */
  delete(key: StoreKey<Persistable>): boolean;
  delete(keys: StoreKey<Persistable>[]): boolean[];
  delete(value: StoreKey<Persistable> | StoreKey<Persistable>[]): boolean | boolean[] {
    const isBatch = Array.isArray(value);
    const keys = isBatch ? value : [value];

    const results = keys.map((key) => {
      const storage = this.storagePort.resolve(key.persistenceType);
      const storageKey = keyPolicy.makeKey(key.ns, key.name, key.persistenceType);

      const existed = this.has(key);

      if (existed)
        this.eventPort.publish({
          key: storageKey,
          newValue: null,
          oldValue: storage.get(storageKey),
          timestamp: Date.now(),
        });

      storage.remove(storageKey);

      return existed;
    });

    return isBatch ? results : results[0];
  }

  /**
   * List all entries managed by StrictStore.
   *
   * Entries are discovered by scanning storage at runtime.
   * Returned keys are not associated with their original value types.
   *
   * @public
   */
  entries(ns?: string[]): { key: StoreKey<Persistable>; value: Persistable }[] {
    if (Array.isArray(ns) && ns.length === 0) return [];

    const result: { key: StoreKey<Persistable>; value: Persistable }[] = [];

    const sources: { storage: Storage; type: PersistenceType }[] = [
      { storage: localStorage, type: 'local' },
      { storage: sessionStorage, type: 'session' },
    ];

    for (const source of sources) {
      const allKeys = Object.keys(source.storage);

      for (const rawKey of allKeys) {
        if (!keyPolicy.isStoreKey(rawKey)) continue;

        const parsedKey = keyPolicy.parseKey(rawKey);
        if (parsedKey === null) continue;

        if (ns && ns.length > 0 && !ns.includes(parsedKey.ns)) continue;

        const rawValue = source.storage.getItem(rawKey);
        if (rawValue === null) continue;

        const value = this.serializerPort.parse(rawValue);
        result.push({
          key: parsedKey,
          value: value,
        });
      }
    }

    return result;
  }

  /**
   * Count entries managed by StrictStore.
   *
   * Counts only StrictStore-managed keys in both `localStorage` and `sessionStorage`.
   * Optionally restrict the count to specific namespaces.
   *
   * @public
   */
  size(ns?: string[]): number {
    return this.entries(ns).length;
  }

  /**
   * List all StoreKeys managed by StrictStore.
   *
   * Keys are discovered dynamically, so their original
   * generic value types are not known at compile time.
   *
   * @public
   */
  keys(ns?: string[]): StoreKey<Persistable>[] {
    return this.entries(ns).map(({ key }) => key);
  }

  /**
   * Remove all entries managed by StrictStore.
   *
   * Optionally restrict removal to specific namespaces.
   * Returns the list of removed keys.
   *
   * @public
   */
  clear(ns?: string[]): StoreKey<Persistable>[] {
    const items = this.entries(ns);
    for (const { key } of items) this.delete([key]);

    return items.map((item) => item.key);
  }
}
