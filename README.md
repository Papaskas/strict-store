# Strict Storage

[![npm version](https://img.shields.io/npm/v/strict-store)](https://www.npmjs.com/package/strict-store)
[![license](https://img.shields.io/npm/l/strict-store)](https://github.com/Papaskas/strict-store/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/min/strict-store)](https://bundlephobia.com/package/strict-store)

A type-safe wrapper around localStorage and sessionStorage with TypeScript support, namespace isolation, and automatic serialization.

## Features
- 🛡 **Full Type Safety** - Compile-time type checking for all operations
- 🧠 **Smart Serialization** - Automatic handling of:
    - Primitive types (string/number/boolean)
    - Complex types (Objects/Arrays/Tuples/Literal)
    - Special types (BigInt/Date/Map/Set)
- 🗂 **Namespace Isolation** - Prevent key collisions with hierarchical organization
- ⚡ **Dual Storage Support** - Switch between localStorage (persistent) and sessionStorage (session-based)

### Supported types:

> - string
> - number
> - hex
> - bigint
> - boolean
> - object
> - array
> - null
> - enum
> - union

## Installation

```bash
npm install strict-storage
# or
yarn add strict-storage
# or
pnpm add strict-store
```

## Quick start

```typescript
import { createKey, strictStore } from 'strict-storage';

// Create a type-safe key
const themeKey = createKey<'light' | 'dark'>(
  'app', // namaspace
  'theme', // key name
  'light', // default type
  'local' // storage (localStorage, sessionStorage)
);

// Save with type checking
strictStore.save(themeKey, 'dark'); // Only 'light' or 'dark' allowed

// Retrieve with correct type inference
const theme = strictStore.get(themeKey); // Type: 'light' | 'dark'

// Remove when done
strictStore.remove(themeKey);

// Check key
strictStore.has(userKey);  // → true

// Get all items count
console.log(`Total items: ${strictStore.length}`);

// Clears all keys in storage that belong to a specific namespace
strictStore.clearNamespace('app');

// Clears all items from storage (including non-namespaced)
strictStore.clear();
```

## Storage type selection

Choose between localStorage (persistent) and sessionStorage (tab-specific):

```typescript
const localKey = createKey(..., 'local');
const sessionKey = createKey(..., 'session');
```

### API References

```typescript
createKey(ns, key, defaultValue, storeType?)
```

Creates a type-safe storage key.

```typescript
strictStore
.get(key) // Retrieves a value
.save(key, value) // Stores a value
.remove(key) // Removes a key
.has(key) // Checks for key existence
.length // Total items count
.clear() // Clears all storage
.clearNamespace(ns) // Clears a namespace
```

## Type Safety

The library enforces type safety at compile time:

```typescript
const counterKey = createKey('app', 'counter', 0);

strictStore.save(counterKey, 'text'); // Error: Type 'string' is not assignable to type 'number'
strictStore.save(counterKey, 42); // OK
```

### Complex Type Examples

**Arrays:**

```typescript
const tagsKey = createKey<string[]>(
  'app', 
  'tags',
  ['default']
);

strictStore.save(tagsKey, ['ts', 'storage', 'util']); // string[] preserved
```

**Objects:**
```typescript
const userKey = createKey(
  'app',
  'user',
  {
    id: 0,
    name: '',
    settings: { darkMode: false }
  }
);

strictStore.save(userKey, {
  id: 1,
  name: 'Alex',
  settings: { darkMode: true }
}); // Structure is type-checked
```

## Limitations

1. Avoid using colons (':') in namespace or key values — this symbol is reserved as a namespace delimiter.
2. The undefined type is not supported — it will be converted to null during JSON serialization

## Required
1. TypeScript >= 4.9.0
