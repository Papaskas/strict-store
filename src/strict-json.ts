import { Primitives, Serializable, StoreKey, TYPED_ARRAY_CONSTRUCTORS } from '@src/types';
import { SpecialType, SpecialTypeName, typeHandlers } from '@src/lib';
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

const replacer = (key: string, value: Serializable)=> {
  if (typeof value === 'bigint')
    return typeHandlers.bigint(value)

  else if (value instanceof Map)
    return typeHandlers.map(value)

  else if (value instanceof Set)
    return typeHandlers.set(value)

  else if (ArrayBuffer.isView(value) && !(value instanceof DataView))
    return typeHandlers.TypedArray(value)

  else
    return value
}

const reviver = (key: string, value: any) => {
  if (
    value !== null &&
    typeof value === 'object' &&
    '__type' in value &&
    'value' in value
  ) {
    const typeName: SpecialTypeName = value.__type

    switch (typeName) {
      case 'bigint':
        return BigInt(value.value)
      case 'map':
        return new Map(value.value)
      case 'set':
        return new Set(value.value)
      case 'typedArray': {
        const Constructor = TYPED_ARRAY_CONSTRUCTORS[value.subtype]
        if (!Constructor) throw new Error(`Unsupported TypedArray type: ${value.subtype}`)

        return new Constructor(value.value)
      }

      default:
        throw new Error(`Unknown __type: ${typeName}`)
    }
  }

  return value;
}
