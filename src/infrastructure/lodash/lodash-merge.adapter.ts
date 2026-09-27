import type { MergerPort } from '@src/application/outbound/merger.port';
import { Persistable } from '@src/core/persistable/persistable';
import { merge } from 'lodash';
import { PartialDeep } from 'type-fest';

export class LodashMergeAdapter implements MergerPort {
  merge<T extends Persistable>(value: T, partial: PartialDeep<T>) {
    return merge(value, partial);
  }
}
