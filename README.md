# Strict Store

[![npm version](https://img.shields.io/npm/v/strict-store)](https://www.npmjs.com/package/strict-store)
[![license](https://img.shields.io/npm/l/strict-store?v=2)](https://github.com/Papaskas/strict-store/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/min/strict-store)](https://bundlephobia.com/package/strict-store)

> 📝 **StrictStore** is a type-safe state persistence layer built on top of Web Storage.
It treats storage keys as first-class, typed entities, centralizes key management via namespaces, and removes string-based and serialization concerns from application code.
The library provides structured access, controlled mutation, and reactive change propagation across contexts

## ✨ Features

- 🛡 **Typed storage keys** — Keys are explicit objects bound to value types at compile time, eliminating string-based access and key/value mismatches.
- 📦 **Centralized serialization** — All values are serialized and deserialized through a single abstraction `SuperJSON`, removing manual JSON handling from application code.
- 🗂 **Namespace-based key organization** — Keys can be grouped by namespaces, enabling structured access, filtering, and bulk operations without relying on naming conventions alone.
- 💾 **Explicit persistence scope** — Each key declares whether it is stored in `localStorage` or `sessionStorage`; storage selection is not implicit or ad hoc.
- 🧺 **Batch operations** — Multiple keys can be read, written, or deleted in a single operation while preserving key–value relationships.
- 🔀 **Controlled object merging** — Stored object values can be partially updated using a defined merge strategy (based on lodash.merge).
- 🔔 **Change notifications** — Storage updates are broadcast via BroadcastChannel, allowing subscriptions to value changes across execution contexts.
- 🔎 **Enumeration & inspection** — Iterate over all managed entries or filter them by namespace, without exposing raw storage APIs.

## 🧩 Mental model

Think of StrictStore as:

> A **typed registry of persisted state**, with explicit keys, controlled mutation, and observable changes — where storage is a runtime detail, not a programming model.

## 🗃️ Supported types

Supported types via SuperJSON serialization:

> - string
> - union
> - number
> - boolean
> - null
> - undefined
> - object
> - array
> - enum
> - bigint
> - Map
> - Set
> - Date
> - RegExp
> - Error
> - URL

## 📦 Installation

```bash
npm install strict-store
# or
yarn add strict-store
# or
pnpm add strict-store
```

## 🧭 Overview

`StrictStore` is a fully typed persistence layer that rethinks how localStorage and sessionStorage are used in applications.

Instead of working with raw string keys and manual serialization, `StrictStore` introduces a structured, type-driven model where persisted data is accessed through explicit key definitions.
Storage becomes a managed registry of entries rather than a collection of loosely related string values.

### 🧠 Core ideas

#### 🔑 1. Keys as contracts

At the center of `StrictStore` is the concept of a `StoreKey`.

A `StoreKey<T>` is not just an identifier — it is a **contract** that defines:

- the logical **namespace** of the value,
- it's **persistence scope** (`local` or `session`),
- and the **exact value type** associated with that key.

This guarantees at compile time that a key can only be used with its corresponding value type.
Accidental mismatches between keys and values are eliminated **before runtime**.

#### 🗂 2. Centralized key system

All persisted values are accessed through **explicitly defined keys**.

This provides:

- a single source of truth for storage names,
- predictable namespace-based grouping,
- removal of “magic strings” scattered across the codebase.

Namespaces allow related keys to form a **coherent system** rather than isolated entries.

#### ⚙️ 3. Storage as an implementation detail

`StrictStore` abstracts away:

- string-based storage APIs,
- manual JSON handling,
- storage selection logic.

Serialization is handled centrally using `SuperJSON`, allowing richer data structures than plain JSON.
The choice between `localStorage` and `sessionStorage` is declarative and tied to the key itself.

Application code interacts only with **typed values**, never with raw strings.

## 🛡️ Type Safety

Type safety is derived from the key definition, not from the storage API

```ts
const counterKey = createKey<number>('app', 'counter');

StrictStore.save(counterKey, 'string value'); // Error: Type 'string' is not assignable to type 'number'
StrictStore.save(counterKey, 42); // OK
```

## 🗝️ Creating keys

All interaction with `StrictStore` starts with defining keys.

Keys are created explicitly using `createKey` (exported as an alias for `storeKeyFactory`).
A key describes what is stored, where it is stored, and which value type it is bound to.

```ts
import { createKey } from 'strict-store';

const countKey = createKey<number>('stats', 'count');
const langKey  = createKey<'en' | 'fr'>('app', 'lang', 'session');
```

Why keys matter

A `StoreKey<T>` is not just an identifier. It defines:

- the namespace of the entry,
- the storage scope (`local` or `session`),
- the value type associated with the entry (at compile time).

Once a key is defined, all `StrictStore` operations derive their type behavior from it:

```ts
StrictStore.save(countKey, 1);

const count: number | null = StrictStore.get(countKey);
```

Validation and guarantees

`createKey` enforces basic invariants:

- namespaces and names cannot be empty,
- colons (:) are disallowed to keep key encoding unambiguous.

These checks ensure that all keys are valid and consistent before they ever reach storage.

## 🛠️ Usage overview

```ts
/**
 * Read a value by key.
 * Returns `null` when the entry is missing.
 */
get<T extends Persistable>(key: StoreKey<T>): T | null {}

/**
 * Read multiple values for a tuple of keys.
 * Preserves the value type for each key position.
 */
pick<const K extends StoreKey<Persistable>[]>(keys: K): PickResult<K> {}

/**
 * Write a value by key.
 * Passing `null` removes the entry.
 * Publishes a change event when the serialized value changes.
 */
save<T extends StoreKey<Persistable>>(key: T, value: T[typeof typeMarkerSymbol]): void {}

/**
 * Write multiple key/value pairs.
 * Each value is type-checked against its corresponding key.
 */
saveBatch<Pairs extends [StoreKey<Persistable>, Persistable][]>(
  entries: BatchEntries<Pairs>,
): void {}

/**
 * Merge a partial object into an existing stored object.
 * Throws if the entry does not exist or the current value is not a plain object.
 *
 * @remarks
 * Merge behavior follows {@link https://lodash.com/docs/#merge | lodash.merge}.
 */
merge<T extends Persistable>(key: StoreKey<T>, partial: PartialDeep<T>): T | null {}

/**
 * Iterate over entries managed by StrictStore.
 * Optionally filter by namespaces.
 */
forEach(
  callback: (key: StoreKey<Persistable>, value: Persistable, index: number, array: { key: StoreKey<Persistable>; value: Persistable }[]) => void,
  ns?: string[],
): void {}

/**
 * Subscribe to changes for a specific key.
 * Receives deserialized `newValue` / `oldValue` and a timestamp.
 *
 * @remarks
 * Events are transported via {@link https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel | BroadcastChannel}
 * and mirrored locally via {@link https://github.com/Papaskas/strict-store/wiki/Class.localEmitter | localEmitter}.
 */
onChange(
  callback: (msg: EventMessage) => void,
  target: StoreKey<Persistable>,
  options: AddEventListenerOptions = {},
): Unsubscribe {}

/**
 * Check whether an entry exists for a key (value is not `null`).
 * Supports single key or a list of keys.
 */
has(key: StoreKey<Persistable>): boolean;
has(keys: StoreKey<Persistable>[]): boolean[];

/**
 * Remove an entry by key.
 * Publishes a change event when the entry existed.
 * Supports single key or a list of keys.
 */
delete(key: StoreKey<Persistable>): boolean;
delete(keys: StoreKey<Persistable>[]): boolean[];

/**
 * List all entries managed by StrictStore.
 * Optionally filter by namespaces.
 */
entries(ns?: string[]): { key: StoreKey<Persistable>; value: Persistable }[] {}

/**
 * Count entries managed by StrictStore.
 * Optionally filter by namespaces.
 */
size(ns?: string[]): number {}

/**
 * List StoreKeys for all managed entries.
 * Optionally filter by namespaces.
 *
 * Note: keys returned by this method are discovered at runtime,
 * so their original value types are not known at compile time.
 */
keys(ns?: string[]): StoreKey<Persistable>[] {}

/**
 * Remove all managed entries.
 * Optionally restrict removal to specific namespaces.
 * Returns removed keys.
 */
clear(ns?: string[]): StoreKey<Persistable>[] {}
```

## 📚 Full documentation

Full API documentation is available in the [GitHub Wiki](https://github.com/Papaskas/strict-store/wiki).
