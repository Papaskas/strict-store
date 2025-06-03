import { complexTypeMappers } from '@src/complex-types-mappers';
import { isTypedArray } from '@src/utils';
import { BasicPersistable, Persistable, StoreKey } from '@src/@types';
import { ComplexTypeData, ComplexTypeNames, TYPED_ARRAY_CONSTRUCTORS, TypedArray } from '@src/iternal-types';

export const strictJson = {
  parse<T extends Persistable>(value: string): T {
    try {
      return JSON.parse(value, reviver) as T;
    } catch {
      return value as T;
    }
  },

  stringify<T extends StoreKey<Persistable>>(value: T['__type']): string {
    return JSON.stringify(value, replacer);
  },
}

const replacer = (
  key: string,
  value: Persistable,
): Persistable => {
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
    | BasicPersistable
    | ComplexTypeData // ExtendedPersistable -> ComplexTypeData
): Persistable => {
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
        return new Map((value.value) as Map<Persistable, Persistable>)
      case 'set':
        return new Set((value.value) as Set<Persistable>)
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
