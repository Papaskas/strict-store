# Strict Store

[![npm version](https://img.shields.io/npm/v/strict-store)](https://www.npmjs.com/package/strict-store)
[![license](https://img.shields.io/npm/l/strict-store?v=2)](https://github.com/Papaskas/strict-store/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/min/strict-store)](https://bundlephobia.com/package/strict-store)

A **type-safe** wrapper around localStorage and sessionStorage with TypeScript support, namespace isolation, and automatic serialization.

## ✨ Features
- 🛡 **Full Type Safety** — Compile-time type checking for all operations
- 🧠 **Smart Serialization** — Automatic handling of:
    - Primitive types
    - Complex types
    - TypedArray
- 🗂 **Namespace Isolation** — Prevent name collisions with hierarchical organization
- ⚡ **Dual Storage Support** — Switch between localStorage (persistent) and sessionStorage (session-based)
- 🗃 **Batch Operations** — Save, remove, or pick multiple keys at once
- 🔄 **Merge & Partial Update** — Merge new values into stored objects
- 🕵️ **Change Listeners** — Subscribe to storage changes
- 🔍 **forEach & getByNamespace** — Iterate and filter by namespace

### 🗃️ Supported types:

> - string
> - number
> - boolean
> - null
> - union
> - object
> - array
> - enum
> - BigInt
> - Map
> - Set
> - Int8Array
> - Uint8Array
> - Uint8ClampedArray
> - Int16Array
> - Uint16Array
> - Int32Array
> - Uint32Array
> - Float32Array
> - Float64Array
> - BigInt64Array
> - BigUint64Array

## 📦 Installation

```bash
npm install strict-store
# or
yarn add strict-store
# or
pnpm add strict-store
```

## 🛡️ Type Safety

The library enforces type safety at compile time:

```typescript
const counterKey = createKey<number>('app', 'counter');

strictStore.save(counterKey, 'string value'); // Error: Type 'string' is not assignable to type 'number'
strictStore.save(counterKey, 42); // OK
```

## 🗄️ Storage type selection

Choose between localStorage (persistent) and sessionStorage (tab-specific):

```typescript
const localKey = createKey(..., 'local');
const sessionKey = createKey(..., 'session');
```

##  🚀 Quick start

```typescript
import { createKey, StrictStore } from 'strict-store';

// Create keys for different namespaces and storage types
const themeKey = createKey<'light' | 'dark'>('app', 'theme', 'local');
const langKey = createKey<'en' | 'fr'>('app', 'lang', 'session');
const userKey = createKey<{ name: string; age: number; }>('app', 'user', 'local');

StrictStore.save(themeKey, 'dark'); // Save with type checking
StrictStore.saveBatch([ // Batch operations
  [themeKey, 'light'],
  [langKey, 'en']
]);

// Merge (partial update)
StrictStore.merge(userKey, { name: 'New Name' });

const themeValue: 'light' | 'dark' | null = StrictStore.get(themeKey); // Retrieve with correct type inference
const [theme, lang] = StrictStore.pick([themeKey, langKey]); // Retrieve batch of values

// Get all items or by namespace
const entries: { key, value }[] = StrictStore.entries();
const appEntries: { key, value }[] = StrictStore.entries(['app']);

// Get all keys or by namespace
const keys = StrictStore.keys();
const appKeys = StrictStore.keys(['app']);

// Remove item
StrictStore.remove([themeKey]);

// Check key
const hasKey: boolean = StrictStore.has(themeKey);
const hasKeys: boolean[] = StrictStore.has([themeKey, langKey]);

// Get the count of all StrictStore-managed items
const count: number = StrictStore.size();
const appCount: number = StrictStore.size(['app']);

// Clear all or by namespace
StrictStore.clear();
StrictStore.clear('app');

// Iterate over all items or by namespace
StrictStore.forEach((key, value) => {
  console.log(key, value);
}, ['app']);

// Listen for changes keys or ns
const unsubscribe = StrictStore.onChange((key, oldValue, newValue) => {
  // ...
}, [themeKey]); // keys or ns

// Unsubscribe from changes
unsubscribe();
```

## 📦 API Reference

> Below is a summary of the main methods.  
> See the [Wiki](https://github.com/Papaskas/strict-store/wiki) for detailed usage, types, and advanced examples.

### 🗝️ createKey
```typescript
  createKey<T>(
    namespace: string, // namespace for key
    name: string, // key name
    storeType?: 'local' | 'session' = 'local' // storage type: 'local' (default) or 'session'
  ): StoreKey<T>
```

### 🛠️ strictStore methods
```typescript
strictStore
  .get<T>(key: StoreKey<T>): T | null; // Retrieve a value by key.
  .pick<T>(keys: StoreKey<T>[]): (T | null)[]; // Retrieve multiple values by keys.
  .entries<T>(namespace?: string): { key: string, value: T }[]; // Retrieve all items or by namespace
  .keys(ns?: string[]): keys[]; // Get all keys or by a namespace
  .save<T>(key: StoreKey<T>, value: T): void; // Save a value by key
  .saveBatch<T>(entries: [StoreKey<T>, T][]): void; // Save multiple key-value pairs at once
  .remove<T>(key: StoreKey<T>[]): void; // Remove one or more keys.
  .has<T>(key: StoreKey<T>): boolean; // Check if key exist
  .has<T>(key: StoreKey<T>[]): boolean[]; // Check if keys exist
  .size(ns?: string[]): number; // Get the number of items, optionally filtered by namespace
  .clear(namespace?: string[]): void; // Remove all items, optionally filtered by namespace
  .merge<T>(key: StoreKey<T>, partial: DeepPartial<T>): void; // Merge a partial object into an existing stored object
  .forEach<T>(callback: (key: string, value: T) => void, ns?: string[]): void; // Iterate over all key-value pairs, optionally filtered by namespace
  .onChange(
    callback: (key, oldValue, newValue) => void,
    target?: StoreKey<unknown>[] | string[],
  ): () => void; // Subscribe to storage changes. Returns an unsubscribe function.
```

### 🧩 Complex type examples

**Arrays:**

```typescript
const tagsKey = createKey<string[]>(
  'app', 
  'tags',
);

strictStore.save(tagsKey, ['ts', 'storage', 'util']); // string[] preserved
```

**Objects:**
```typescript
type User = {
  id: number;
  name: string;
  settings: {
    darkMode: boolean
  }
};

const userKey = createKey<User>(
  'app',
  'user',
);

strictStore.save(userKey, {
  id: 1,
  name: 'Alex',
  settings: { darkMode: true }
}); // Structure is type-checked
```

## ⚠️ Key Isolation

Strict Store **only works with keys created via the `createKey` function**.  
Each key is automatically prefixed with a unique namespace, and the library only interacts with keys that have this prefix in `localStorage` or `sessionStorage`.

Keys created outside of Strict Store, or without the appropriate prefix, are **not visible** to the library and will not be processed.

This ensures data isolation and prevents accidental conflicts with other libraries or custom code that uses storage directly.

## 🚧 Limitations

- Avoid using colons (':') in namespace or name values — this symbol is reserved as a namespace delimiter.
- The `undefined` type is not supported — it will be converted to `null` during JSON serialization.
- Lodash is used under the hood.

## ⚙️ Requirements
- TypeScript >= 4.9.0

## 📚 Full documentation

Full API documentation is available in the [GitHub Wiki](https://github.com/Papaskas/strict-store/wiki).
