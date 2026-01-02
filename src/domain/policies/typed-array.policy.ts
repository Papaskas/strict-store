import { TypedArray } from '@src/domain/entities/typed-array';

export const isTypedArray = (val: unknown): val is TypedArray =>{
  return ArrayBuffer.isView(val) && !(val instanceof DataView);
}
