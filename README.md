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

## Samples

### Sample keys

```typescript
import { StoreKey } from './@types';

enum Theme {
  Light, Dark
}

type User = {
  first_name: string | null;
  last_name: string | null;
  age: number | null;
}

type UserRole = 'guest' | 'user' | 'verified'

export const keys = {
  username: {
    ns: 'app',
    key: 'user_name',
    defaultValue: '',
  } as StoreKey<string>,

  user_age: {
    ns: 'app',
    key: 'user_age',
    defaultValue: 0,
  } as StoreKey<number>,

  user: {
    ns: 'app',
    key: 'user',
    defaultValue: { first_name: null, last_name: null, age: null },
  } as StoreKey<User>,

  user_role: {
    ns: 'app',
    key: 'user_role',
    defaultValue: 'guest',
  } as StoreKey<UserRole>,

  theme: {
    ns: 'app',
    key: 'theme',
    defaultValue: Theme.Light,
  } as StoreKey<Theme>,
} as const
```

### Usage example

#### Primitive types
```typescript
StrictStore.save(keys.username, 'John') // Only the string is allowed
const username: string = StrictStore.get(keys.username) // Return the string type

StrictStore.save(keys.user_age, 35) // Only the number is allowed
const user_age: number = StrictStore.get(keys.user_age) // Return the number type
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
StrictStore.save(keys.user_role, 'verified') // Only the literal type is allowed ('guest' 'user' 'verified')
const savedUserRole: UserRole = StrictStore.get(keys.user_role) // Return literal value
```
