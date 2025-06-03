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
import { createKey, strictStore } from 'strict-store';

const themeKey = createKey<'light' | 'dark'>('app', 'theme', 'local');
const langKey = createKey<'en' | 'fr'>('app', 'lang', 'session');
const userKey = createKey<{ name: string; age: number; }>('app', 'user', 'local');

// Save with type checking
strictStore.save(themeKey, 'dark');

// Retrieve with correct type inference
const themeValue: 'light' | 'dark' | null = strictStore.get(themeKey);

// Batch operations
strictStore.saveMany([
  [themeKey, 'light'],
  [langKey, 'en']
]);
strictStore.remove([themeKey, langKey]);
const [theme, lang] = strictStore.pick([themeKey, langKey]);

// Merge (partial update)
strictStore.merge(userKey, { name: 'New Name' });

// Get all items or by namespace
strictStore.getAll();
strictStore.getAll(['app']);

// Remove
strictStore.remove([themeKey]);

// Check key
const hasKey: boolean = strictStore.has(themeKey);
const hasKeys: boolean[] = strictStore.has([themeKey, langKey]);

// Get the count of all strictStore-managed items
const count: number = strictStore.size();
const countsByNs: number = strictStore.size(['namespace']);

// Clear all or by namespace
strictStore.clear();
strictStore.clear('app');

// Iterate over all items
strictStore.forEach((key, value) => {
  console.log(key, value);
});

// Listen for changes
const unsubscribe = strictStore.onChange((event) => {
  console.log('Storage changed:', event);
});
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
  .getAll<T>(namespace?: string): { key: string, value: T }[]; // Retrieve all items or by namespace
  .save<T>(key: StoreKey<T>, value: T): void; // Save a value by key
  .saveMany<T>(entries: [StoreKey<T>, T][]): void; // Save multiple key-value pairs at once
  .remove<T>(key: StoreKey<T>[]): void; // Remove one or more keys.
  .has<T>(key: StoreKey<T>): boolean; // Check if key(s) exist
  .has<T>(key: StoreKey<T>[]): boolean[]; // Check if key(s) exist
  .size(ns?: string[]): number; // Get the number of items, optionally filtered by namespace
  .clear(namespace?: string[]): void; // Remove all items, optionally filtered by namespace
  .merge<T>(key: StoreKey<T>, partial: DeepPartial<T>): void; // Merge a partial object into an existing stored object
  .forEach<T>(callback: (key: string, value: T) => void): void; // Iterate over all key-value pairs, optionally filtered by namespace
  .onChange(
    callback: (event) => void,
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

## 🚧 Limitations

- Avoid using colons (':') in namespace or name values — this symbol is reserved as a namespace delimiter.
- The `undefined` type is not supported — it will be converted to `null` during JSON serialization.
- Lodash is used under the hood.

## ⚙️ Requirements
- TypeScript >= 4.9.0

## 📚 Full documentation

Full API documentation is available in the [GitHub Wiki](https://github.com/Papaskas/strict-store/wiki).
