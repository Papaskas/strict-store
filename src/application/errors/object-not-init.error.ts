import { StrictStoreError } from "@src/core/errors/strict-store.error";

export class ObjectNotInitError extends StrictStoreError<'merge'> {
  constructor() {
    super('merge', 'Cannot initialize the object. Use save for initial value');
  }
}