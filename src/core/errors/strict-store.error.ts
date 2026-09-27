export class StrictStoreError<C extends string> extends Error {
  override readonly name = 'strict-store:error';
  constructor(readonly code: C, message: string) { super(message); }
}
