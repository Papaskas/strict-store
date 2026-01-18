import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { PartialDeep } from 'type-fest';

export interface MergePort {
  merge<T extends Persistable>(value: T, partial: PartialDeep<T>): T & PartialDeep<T>;
}
