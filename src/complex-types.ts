import { Serializable, TypedArray } from '@src/types';

export type ComplexTypeName = 'bigint' |'set' | 'map' |'typedArray';

export type ComplexTypeData = {
  __type: ComplexTypeName,
  value: Serializable,
  subtype?: string,
}

const BigIntData = (value: bigint): ComplexTypeData => ({
  __type: 'bigint',
  value: value.toString(),
});

const MapData = (value: Map<Serializable, Serializable>): ComplexTypeData => ({
  __type: 'map',
  value: Array.from(value.entries()),
});

const SetData = (value: Set<Serializable>): ComplexTypeData => ({
  __type: 'set',
  value: Array.from(value),
});

const TypedArrayData = (value: TypedArray): ComplexTypeData => {
  const processedValue = processTypedArray(value);
  return {
    __type: 'typedArray',
    value: processedValue,
    subtype: value.constructor.name,
  };
};

const processTypedArray = (value: TypedArray): Serializable[] => {
  if (value instanceof BigInt64Array || value instanceof BigUint64Array)
    return Array.from(value).map(n => n.toString());

  return Array.from(value);
}

export const typeHandlers = {
  bigint: (val: bigint) => BigIntData(val),
  map: (val: Map<Serializable, Serializable>) => MapData(val),
  set: (val: Set<Serializable>) => SetData(val),
  TypedArray: (val: TypedArray) => TypedArrayData(val),
}
