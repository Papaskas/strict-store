import { Persistable } from '@src/domain/entities/persistable.entity';

export type ComplexTypeNames = 'bigint' | 'set' | 'map' | 'typedArray';

export type ComplexTypeData = {
  __type: ComplexTypeNames;
  value: Persistable;
  subtype?: string;
};
