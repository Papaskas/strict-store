import { Serializable, TypedArray } from '@src/types';

export type SpecialTypeName = 'bigint' |'set' | 'map' |'typedArray';

export type SpecialType = {
  __type: SpecialTypeName,
  value: Serializable,
  subtype?: string,
}

abstract class SerializedData implements SpecialType {
  constructor(
    public readonly __type: SpecialTypeName,
    public readonly value: Serializable,
    public readonly subtype?: string
  ) {}
}

class BigIntData extends SerializedData {
  constructor(value: bigint) {
    super('bigint', value.toString());
  }
}

class MapData extends SerializedData {
  constructor(value: Map<Serializable, Serializable>) {
    super('map', Array.from(value.entries()));
  }
}

class SetData extends SerializedData {
  constructor(value: Set<Serializable>) {
    super('set', Array.from(value));
  }
}

class TypedArrayData extends SerializedData {
  constructor(value: TypedArray) {
    const processedValue = value instanceof BigInt64Array || value instanceof BigUint64Array
      ? Array.from(value).map(n => n.toString())
      : Array.from(value);
    super('typedArray', processedValue, value.constructor.name);
  }
}

export const typeHandlers = {
  bigint: (val: bigint) => new BigIntData(val),
  map: (val: Map<Serializable, Serializable>) => new MapData(val),
  set: (val: Set<Serializable>) => new SetData(val),
  TypedArray: (val: TypedArray) => new TypedArrayData(val),
}
