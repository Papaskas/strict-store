import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';

export interface EventPort {
  subscribe(callback: (ev: StorageEvent) => void): Unsubscribe;
}
