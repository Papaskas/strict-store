import type { MergePort } from '@src/domain/ports/merge.port';
import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { merge } from 'lodash';
import { PartialDeep } from 'type-fest';

export class LodashMergeAdapter implements MergePort {
  merge<T extends Persistable>(value: T, partial: PartialDeep<T>) {
    return merge(value, partial);
  }
}
