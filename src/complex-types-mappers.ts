import { Persistable } from '@src/types';
import { ComplexTypeData, TypedArray } from '@src/iternal-types';

/**
 * Converts a bigint value to ComplexTypeData.
 *
 * @param value - The bigint value to convert.
 * @returns ComplexTypeData object representing the bigint value.
 */
const BigIntMapper = (value: bigint): ComplexTypeData => ({
  __type: 'bigint',
  value: value.toString(),
});

/**
 * Converts a Map value to ComplexTypeData.
 *
 * @param value - The Map value to convert.
 * @returns ComplexTypeData object representing the Map value.
 */
const MapMapper = (value: Map<Persistable, Persistable>): ComplexTypeData => ({
  __type: 'map',
  value: Array.from(value.entries()),
});

/**
 * Converts a Set value to ComplexTypeData.
 *
 * @param value - The Set value to convert.
 * @returns ComplexTypeData object representing the Set value.
 */
const SetMapper = (value: Set<Persistable>): ComplexTypeData => ({
  __type: 'set',
  value: Array.from(value),
});

/**
 * Converts a TypedArray value to ComplexTypeData.
 *
 * @param value - The TypedArray value to convert.
 * @returns ComplexTypeData object representing the TypedArray value.
 */
const TypedArrayMapper = (value: TypedArray): ComplexTypeData => {
  const processedValue = processTypedArray(value);
  return {
    __type: 'typedArray',
    value: processedValue,
    subtype: value.constructor.name,
  };
};

/**
 * Processes a TypedArray value and converts it to an array of Persistable.
 *
 * @param value - The TypedArray value to process.
 * @returns An array of Persistable representing the processed TypedArray value.
 */
const processTypedArray = (value: TypedArray): Persistable[] => {
  if (value instanceof BigInt64Array || value instanceof BigUint64Array)
    return Array.from(value).map(n => n.toString());

  return Array.from(value);
}

/**
 * An object containing mappers for various complex types.
 */
export const complexTypeMappers = {
  bigint: (val: bigint) => BigIntMapper(val),
  map: (val: Map<Persistable, Persistable>) => MapMapper(val),
  set: (val: Set<Persistable>) => SetMapper(val),
  typedArray: (val: TypedArray) => TypedArrayMapper(val),
}
