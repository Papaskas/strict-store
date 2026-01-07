import { TypedArray } from '@core/entities/typed-array.entity';

export interface TypedArrayRegistryPort {
  from(subtype: string, buffer: ArrayBuffer): TypedArray;
}
