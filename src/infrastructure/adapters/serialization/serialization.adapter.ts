import { complexTypeMappers } from '@src/infrastructure/mappers/complex-type.mapper';
import { NativePersistable, Persistable } from '@src/domain/entities/persistable.entity';
import { ComplexTypeData, ComplexTypeNames } from '@src/domain/entities/complex-type.entity';
import { StoreKey } from '@src/domain/entities/store-key.entity';
import { SerializerPort } from '@src/app/ports/serializer.port';
import { TYPED_ARRAY_CONSTRUCTORS, TypedArray } from '@src/domain/entities/typed-array.entity';
import { typedArrayPolicy } from '@src/domain/policies/typed-array.policy';

/**
 * A strict JSON serializer that handles complex types like bigint, Map, Set, and TypedArray.
 */
export const strictJson: SerializerPort = {
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

  else if (typedArrayPolicy.isTypedArray(value))
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
    | NativePersistable
    | ComplexTypeData // ExtendedPersistable -> ComplexTypeData
): Persistable => {
  if (
    value !== null &&
    typeof value === 'object' &&
    '__type' in value &&
    'value' in value
  ) {
    const typeName = (value as ComplexTypeData).__type

    switch (typeName) {
      case 'bigint':
        return BigInt((value.value) as bigint)
      case 'map':
        return new Map((value.value) as Map<Persistable, Persistable>)
      case 'set':
        return new Set((value.value) as Set<Persistable>)
      case 'typedArray': {
        const Ctor = TYPED_ARRAY_CONSTRUCTORS[value.subtype as keyof typeof TYPED_ARRAY_CONSTRUCTORS];
        if (!Ctor) throw new Error(`Unsupported TypedArray type: ${value.subtype}`);

        const ta = value.value as TypedArray;
        const ab = toArrayBuffer(ta);

        return new Ctor(ab);
      }

      default:
        throw new Error(`Unknown __type: ${typeName}`)
    }
  }

  return value;
}

const toArrayBuffer = (view: ArrayBufferView): ArrayBuffer => {
  // view.buffer is ArrayBufferLike = ArrayBuffer | SharedArrayBuffer
  if (view.buffer instanceof ArrayBuffer)
    return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);

  // SharedArrayBuffer: copy bytes into a new ArrayBuffer
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return ab;
}
