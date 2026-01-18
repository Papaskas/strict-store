# Update

- [x] Add `Date` type
- [x] Add `saveBatch` method
- [x] Add `pick` method
- [x] Add `entries` method
- [x] Add `delete` method
- [x] Add `merge` method - Merges a value into an existing object stored under the specified key
- [x] Add `forEach` method - Iterates over all key-value pairs in the storage and executes a callback for each
- [x] Add `onChange` method - Allows you to listen for changes to the storage (this may require additional implementation for event handling)
- [x] Add a void check for name and ns
- [x] Add `Clear` and `Length` methods

## Major v5

- [ ] Refactor the code to follow Clean Architecture
- [x] Remove the unnecessary `stress.test.ts` file
- [ ] Rewrite `README.md`
- [ ] Create new tests
- [ ] Merge Dependabot pull requests
- [x] Set up ESLint configuration
- [ ] Fix `baseUrl` in `tsconfig.json`
- [x] Replace jest with vitest
- [x] Replace custom serialization with SuperJSON

### Refactor

- [ ] Split `strict-store.service` into multiple files
- [x] Refactor `serialization.adapter`
- [x] Refactor `deepMerge` method
- [ ] Refactor return type in `parseKey` method
- [x] Simplify `entries` method
- [ ] Simplify `onChange` method
- [x] Refactor `DeepPartial` type
- [ ] Rename `phantomType` type

### Types

- [ ] Simplify `pick` method types
- [ ] Simplify `saveBatch` method types

### Docs

- [ ] Refactor TSDoc from 'StoreKey'
- [ ] Refactor TSDoc `strict-store`

### Tests

- [x] Fix imports
