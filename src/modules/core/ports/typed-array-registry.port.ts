import { TypedArray } from 'type-fest';

export interface TypedArrayRegistryPort {
  from(subtype: string, buffer: ArrayBuffer): TypedArray;
}
