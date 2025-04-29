# A type-safe wrapper around localStorage that provides:
 - Automatic JSON serialization/deserialization
 - Namespace support to prevent key collisions
 - Strict typing for all operations
 - Default value support

Supported types:
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

## Remarks
- The undefined type is not supported, because JSON converts it to null
- When using complex types, avoid using undefined
- The createKey method uses `satisfies`

## Required
- TypeScript >=4.9.0

## Samples

### Sample keys

```typescript
enum Theme {
  Light, Dark
}

type User = {
  first_name: string | null;
  last_name: string | null;
  age: number | null;
}

export const keys = {
  username: createKey<string | null>(
    'app',
    'username',
    null,
  ),

  soundEnabled: createKey<boolean>(
    'app',
    'soundEnabled',
    true,
  ),
  
  favouriteColor: createKey<number>(
    'app',
    'favourite-color',
    0XFFFFFF,
  ),

  user: createKey<User>(
    'app',
    'user',
    { first_name: null, last_name: null, age: null },
  ),

  theme: createKey<Theme>(
    'app',
    'theme',
    Theme.Dark,
  ),

  themeAlt: createKey<'light' | 'dark'>(
    'app',
    'themeAlt',
    'dark',
  ),

  bigIntKey: createKey<BigInt>(
    'test-ns',
    'bigInt',
    BigInt(88888888888888888),
  ),

  arrayIntKey: createKey<number[]>(
    'app',
    'arrayInt',
    [100, 45]
  ),
} as const
```

### Usage example

#### Primitive types
```typescript
strictStore.save(keys.username, 'John') // Only the string is allowed
const username: string = StrictStore.get(keys.username) // Return the string type

strictStore.save(keys.soundEnabled, false) // Only the boolean is allowed
const user_age: boolean = StrictStore.get(keys.soundEnabled) // Return the boolean type
```

#### Advanced types
```typescript
// Object
const user: User = {
  first_name: 'John',
  last_name: 'Dev',
  age: 35,
}

StrictStore.save(keys.user, user) // Only the User type is allowed
const savedUser: User = StrictStore.get(keys.user) // Return object value

// Enum
StrictStore.save(keys.theme, Theme.Dark) // Only the enum is allowed
const savedTheme: Theme = StrictStore.get(keys.theme) // Return enum value

// Literal type
StrictStore.save(keys.themeAlt, 'light') // Only the literal type is allowed ('light' | 'dark' | null)
const savedUserRole: 'light' | 'dark' | null = StrictStore.get(keys.themeAlt) // Return literal value
```
