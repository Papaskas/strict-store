import { Persistable } from '@src/domain/entities/core/persistable.entity';
import { StoreKey } from '@src/domain/entities/store-key/store-key.entity';

export interface StoreEvent {
  key: StoreKey<Persistable>;
  oldValue: Persistable;
  newValue: Persistable;
  url: string;
  isTrusted: boolean;
  timestamp: number;
}
