import { TypedArray } from '@core/entities/typed-array.entity';

export const typedArrayPolicy = {
  isTypedArray: (val: unknown): val is TypedArray =>
    ArrayBuffer.isView(val) && !(val instanceof DataView),
};
