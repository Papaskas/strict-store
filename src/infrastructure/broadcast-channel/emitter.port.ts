import { Unsubscribe } from '@src/application/inbound/unsubscribe.entity';

export interface EmitterPort<T> {
  subscribe(listener: (event: T) => void): Unsubscribe;

  emit(event: T): void;
  
  clear(): void;
}
