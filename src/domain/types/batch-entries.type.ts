import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';

export type BatchEntries<Pairs> = Pairs & {
  [K in keyof Pairs]: Pairs[K] extends [infer Key, unknown]
    ? Key extends StoreKey<infer T>
      ? [Key, T]
      : never
    : never;
};
