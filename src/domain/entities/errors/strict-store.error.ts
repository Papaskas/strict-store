import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';
import { STRICT_STORE_ERROR_MESSAGE } from '@src/domain/entities/errors/strict-store.error.msg';

type StrictStoreErrorCode = typeof STRICT_STORE_ERROR_CODE[keyof typeof STRICT_STORE_ERROR_CODE];

export class StrictStoreError extends Error {
  override readonly name = 'StrictStoreError';

  constructor(
    readonly code: StrictStoreErrorCode,
  ) { super(STRICT_STORE_ERROR_MESSAGE[code]); }
}
