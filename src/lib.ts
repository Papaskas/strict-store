import { StoreType } from '@src/types';

/**
 * @internal
 * */
export const getStorage = (type: StoreType): Storage => {
  return type === 'local' ? localStorage : sessionStorage;
}

/**
 * @internal
 * Generates full storage key by combining namespace and key
 */
export function getFullKey(ns: string, key: string): string {
  return `${ns}:${key}`
}

/**
 * @internal
 * Custom JSON replacer for BigInt serialization
 */
export function replacer(key: any, value: any) {
  if (typeof value === 'bigint') {
    return { __type: 'BigInt', value: value.toString() };
  }
  return value;
}

/**
 * @internal
 * Custom JSON reviver for BigInt deserialization
 */
export function reviver(key: any, value: any) {
  if (typeof value === 'object' && value?.__type === 'BigInt') {
    return BigInt(value.value);
  }
  return value;
}
