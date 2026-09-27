import { StrictStoreError } from "@src/core/errors/strict-store.error";

export class MergeTargetNotPlainObjectError extends StrictStoreError<'merge'> {
  constructor() {
    super('merge', 'Can only merge into plain objects');
  }
}
