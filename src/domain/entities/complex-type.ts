import { Persistable } from '@src/domain/entities/persistable';

export type ComplexTypeNames = 'bigint' |'set' | 'map' |'typedArray';

export type ComplexTypeData = {
  __type: ComplexTypeNames,
  value: Persistable,
  subtype?: string,
}
