import {
  ComplexTypeData,
  ComplexTypeNames,
  Primitives,
  Serializable,
  StoreKey,
  TYPED_ARRAY_CONSTRUCTORS,
  TypedArray
} from '@src/types';
import { complexTypeMappers } from '@src/complex-types-mappers';
import { isTypedArray } from '@src/utils';

export const strictJson = {
  parse<T extends Serializable>(value: string): T {
    try {
      return JSON.parse(value, reviver) as T;
    } catch {
      return value as T;
    }
  },

  stringify<T extends StoreKey<Serializable>>(value: T['__type']): string {
    return JSON.stringify(value, replacer);
  },
}

const replacer = (
  key: string,
  value: Serializable,
): Serializable => {
  if (typeof value === 'bigint')
    return complexTypeMappers.bigint(value)

  else if (value instanceof Map)
    return complexTypeMappers.map(value)

  else if (value instanceof Set)
    return complexTypeMappers.set(value)

  else if (isTypedArray(value))
    return complexTypeMappers.typedArray(value)

  else
    return value
}

/**
 * @param value - All except complex types, they are stored in a different form.
 * */
const reviver = (
  key: string,
  value:
    | Primitives
    | ComplexTypeData // ComplexTypes -> ComplexTypeData
): Serializable => {
  if (
    value !== null &&
    typeof value === 'object' &&
    '__type' in value &&
    'value' in value
  ) {
    const typeName: ComplexTypeNames = (value as ComplexTypeData).__type

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
