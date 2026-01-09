import { STRICT_STORE_ERROR_CODE } from '@src/domain/entities/errors/strict-store.error.code';

export const STRICT_STORE_ERROR_MESSAGE: Record<STRICT_STORE_ERROR_CODE, string> = {
  [STRICT_STORE_ERROR_CODE.STORE_KEY_CONTAINS_COLON]: 'StoreKey ns/name must not contain ":"',
  [STRICT_STORE_ERROR_CODE.STORE_KEY_EMPTY_NAME_OR_NAMESPACE]: 'StoreKey ns and name must be non-empty',
  [STRICT_STORE_ERROR_CODE.MERGE_NOT_INITIALIZED]: 'Cannot initialize the object. Use save for initial value',
  [STRICT_STORE_ERROR_CODE.MERGE_TARGET_NOT_PLAIN_OBJECT]: 'Can only merge into plain objects',
};
