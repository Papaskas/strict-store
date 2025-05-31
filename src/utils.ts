import { DeepPartial, Serializable, StoreType, TypedArray } from '@src/types';
import { mergeWith } from 'lodash';

export const getStorage = (type: StoreType): Storage => {
  return type === 'local' ? localStorage : sessionStorage
}

export const getFullName = (ns: string, name: string): string => {
  return `strict-store/${ns}:${name}`
}

export function isTypedArray(val: unknown): val is TypedArray {
  return ArrayBuffer.isView(val) && !(val instanceof DataView);
}

export function deepMergeWithCollections<T, S>(target: T, source: S): T & S {
  return mergeWith({}, target, source, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return srcValue;
    }
    if (objValue instanceof Set && srcValue instanceof Set) {
      return srcValue;
    }
    if (objValue instanceof Map && srcValue instanceof Map) {
      return srcValue;
    }
    if (isTypedArray(objValue) && isTypedArray(srcValue)) {
      return srcValue;
    }
    return undefined; // default merge
  });
}
