import { Primitives, Serializable, StoreKey, TYPED_ARRAY_CONSTRUCTORS, TypedArray } from '@src/types';
import { ComplexTypeData, ComplexTypeName, typeComplexHandlers } from '@src/complex-types';
import * as console from 'node:console';

export const strictJson = {
  parse<T extends Serializable>(value: string): T {
    try {
      return JSON.parse(value, reviver) as T;
    } catch {
      return value as T;
    }
  },

  stringify<T extends StoreKey<any>>(value: T['__type']): string {
    return JSON.stringify(value, replacer);
  },
}

const replacer = (
  key: string,
  value: Serializable,
): Serializable => {
  if (typeof value === 'bigint')
    return typeComplexHandlers.bigint(value)

  else if (value instanceof Map)
    return typeComplexHandlers.map(value)

  else if (value instanceof Set)
    return typeComplexHandlers.set(value)

  else if (ArrayBuffer.isView(value) && !(value instanceof DataView))
    return typeComplexHandlers.TypedArray(value)

  else
    return value
}

const reviver = (
  key: string,
  value: Serializable | ComplexTypeData
): Serializable => {
  if (
    value !== null &&
    typeof value === 'object' &&
    '__type' in value &&
    'value' in value
  ) {
    const typeName: ComplexTypeName = (value as ComplexTypeData).__type

    switch (typeName) {
      case 'bigint':
        return BigInt((value.value) as bigint)
      case 'map':
        return new Map((value.value) as Map<Serializable, Serializable>)
      case 'set':
        return new Set((value.value) as Set<Serializable>)
      case 'typedArray': {
        const Constructor = TYPED_ARRAY_CONSTRUCTORS[(value.subtype) as string]
        if (!Constructor) throw new Error(`Unsupported TypedArray type: ${value.subtype}`)

        return new Constructor((value.value) as TypedArray)
      }

      default:
        throw new Error(`Unknown __type: ${typeName}`)
    }
  }

  return value;
}
