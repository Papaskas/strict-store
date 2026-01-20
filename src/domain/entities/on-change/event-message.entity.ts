import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';

export type EventMessage = {
  key: StoreKey<Persistable>;
  newValue: Persistable;
  oldValue: Persistable;
  timestamp: number;
};
