# Strict Store

[![npm version](https://img.shields.io/npm/v/strict-store)](https://www.npmjs.com/package/strict-store)
[![license](https://img.shields.io/npm/l/strict-store?v=2)](https://github.com/Papaskas/strict-store/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/min/strict-store)](https://bundlephobia.com/package/strict-store)

A **type-safe** wrapper around localStorage and sessionStorage with TypeScript support, namespace isolation, and automatic serialization.

## Features
- 🛡 **Full Type Safety** - Compile-time type checking for all operations
- 🧠 **Smart Serialization** - Automatic handling of:
    - Primitive types
    - Complex types
    - TypedArray
- 🗂 **Namespace Isolation** - Prevent name collisions with hierarchical organization
- ⚡ **Dual Storage Support** - Switch between localStorage (persistent) and sessionStorage (session-based)

### Supported types:

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

## Installation

```bash
npm install strict-store
# or
yarn add strict-store
# or
pnpm add strict-store
```

## Type Safety

The library enforces type safety at compile time:

```typescript
const counterKey = createKey<number>('app', 'counter');

strictStore.save(counterKey, 'string value'); // Error: Type 'string' is not assignable to type 'number'
strictStore.save(counterKey, 42); // OK
```

## Storage type selection

Choose between localStorage (persistent) and sessionStorage (tab-specific):

```typescript
const localKey = createKey(..., 'local');
const sessionKey = createKey(..., 'session');
```

## Quick start

```typescript
import { createKey, strictStore } from 'strict-store';

const themeKey = createKey<'light' | 'dark'>(
  'app',
  'theme',
  'local'
);

const langKey = createKey<'en' | 'fr'>(
  'app',
  'lang',
  'session'
);

// Save with type checking
strictStore.save(themeKey, 'dark'); // Only 'light' or 'dark' allowed

// Retrieve with correct type inference
const themeValue: 'light' | 'dark' | null = strictStore.get(themeKey); // Type: 'light' | 'dark' | null

// Retrieves values from storage for a tuple of keys, preserving the type for each key.
const [theme, lang] = strictStore.pick([themeKey, langKey]);

// Returns all strictStore-managed items, optionally filtered by namespace
strictStore.getAll();
strictStore.getAll('app'); // app is namespace

// Remove when done
strictStore.remove(themeKey);
strictStore.remove([themeKey, langKey]);

// Check key
const hasKey: boolean = strictStore.has(themeKey);

// Get the count of all strictStore-managed items
const count: number = strictStore.length;

// Clear all strictStore-managed keys, or only those in a specific namespace, from storage
strictStore.clear(); // all keys
strictStore.clear('app'); // only `app` namespace keys
```

## API Reference

### createKey
```typescript
  createKey<T>(
    namespace: string, // namespace for key
    name: string, // key name
    storeType?: 'local' | 'session' = 'local' // storage type: 'local' (default) or 'session'
  ): StoreKey<T>
```

### strictStore methods
```typescript
strictStore
  .get<T>(key: StoreKey<T>): T | null // Get a value by key
  .save<T>(key: StoreKey<T>, value: T): void // Save a value by key
  .remove<T>(key: StoreKey<T> | StoreKey<T>[]): void // Remove one or multiple keys
  .has<T>(key: StoreKey<T>): boolean // Check if a key exists
  .length: number // Get the count of all strictStore-managed items
  .clear(namespace?: string): void // Clear all strictStore-managed keys, or only those in a namespace
  .getAll<T>(namespace?: string): { key: string, value: T }[] // Returns all strictStore-managed items, optionally filtered by namespace
  .pick<T>(keys: StoreKey<T>[]): (T | null)[] // Get multiple values by keys
```

### Complex type examples

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

## Limitations

- Avoid using colons (':') in namespace or name values — this symbol is reserved as a namespace delimiter.
- The undefined type is not supported — it will be converted to null during JSON serialization.
- Lodash is used under the hood.

## Requirements
- TypeScript >= 4.9.0
