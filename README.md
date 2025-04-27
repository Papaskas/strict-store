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
> - array< any >
> - array< T >
> - null
> - enum
> - union

## Remarks
- The undefined type is not supported, because JSON converts it to null
- When using complex types, avoid using undefined

## Samples

### Usage example

```typescript
StrictStore.save(keys.username, 'papaska') // Only the string is allowed
const username: string = StrictStore.get(keys.username) // Return the string type

type User = {
  first_name: string | null;
  last_name: string | null;
};

StrictStore.get(keys.user) // Return default value (first_name: null, last_name: null)

const user: User = {
  first_name: 'Pavel',
  last_name: 'Dev',
};

StrictStore.save(keys.user, user) // Only the User type is allowed
const newUser: User = StrictStore.get(keys.user) // Return object value 
```

### Sample keys
```typescript
enum Theme {
  Light, Dark
}

export const keys = {
  username: {
    ns: 'app',
    key: 'user_name',
    defaultValue: '',
  } as StoreKey<string>,

  user: {
    ns: 'app',
    key: 'user',
    defaultValue: { first_name: null, last_name: null },
  } as StoreKey<User>,

  theme: {
    ns: 'app',
    key: 'theme',
    defaultValue: Theme.Light,
  } as StoreKey<Theme>,
} as const;
```
