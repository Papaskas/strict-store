import { Persistable } from '@src/@types';

/** @private */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array

/** @private */
type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | BigInt64ArrayConstructor
  | BigUint64ArrayConstructor;

/** @private */
export const TYPED_ARRAY_CONSTRUCTORS: Record<string, TypedArrayConstructor> = {
  'Int8Array': Int8Array,
  'Uint8Array': Uint8Array,
  'Uint8ClampedArray': Uint8ClampedArray,
  'Int16Array': Int16Array,
  'Uint16Array': Uint16Array,
  'Int32Array': Int32Array,
  'Uint32Array': Uint32Array,
  'Float32Array': Float32Array,
  'Float64Array': Float64Array,
  'BigInt64Array': BigInt64Array,
  'BigUint64Array': BigUint64Array,
}

/**
 * @private
 * DeepPartial<T> makes all fields of the object (and nested objects) optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

/** @private */
export type ComplexTypeNames = 'bigint' |'set' | 'map' |'typedArray';

/** @private */
export type ComplexTypeData = {
  __type: ComplexTypeNames,
  value: Persistable,
  subtype?: string,
}
