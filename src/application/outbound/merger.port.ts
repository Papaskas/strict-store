import { Persistable } from '@src/core/persistable/persistable';
import { PartialDeep } from 'type-fest';

export interface MergerPort {
  merge<T extends Persistable>(value: T, partial: PartialDeep<T>): T & PartialDeep<T>;
}
