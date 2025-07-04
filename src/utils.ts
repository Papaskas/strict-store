import { mergeWith } from 'lodash';
import { TypedArray } from '@src/internal-types';
import { StoreType } from '@src/types';

export const getStorage = (type: StoreType): Storage => {
  return type === 'local' ? localStorage : sessionStorage
}

export const getFullName = (ns: string, name: string): string => {
  return `strict-store/${ns}:${name}`
}

export function isTypedArray(val: unknown): val is TypedArray {
  return ArrayBuffer.isView(val) && !(val instanceof DataView);
}

export function deepMerge<T, S>(target: T, source: S): T & S {
  return mergeWith({}, target, source, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue))
      return srcValue;

    else if (objValue instanceof Set && srcValue instanceof Set)
      return srcValue;

    else if (objValue instanceof Map && srcValue instanceof Map)
      return srcValue;

    else if (isTypedArray(objValue) && isTypedArray(srcValue))
      return srcValue;

    return undefined; // default merge
  });
}
