import { TypedArray } from 'type-fest';

export const typedArrayPolicy = {
  isTypedArray: (val: unknown): val is TypedArray =>
    ArrayBuffer.isView(val) && !(val instanceof DataView),
};
