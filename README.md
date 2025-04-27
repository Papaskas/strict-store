# A type-safe wrapper around localStorage that provides:
 - Automatic JSON serialization/deserialization
 - Namespace support to prevent key collisions
 - Strict typing for all operations

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
