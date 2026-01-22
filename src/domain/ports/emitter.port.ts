import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';

export interface EmitterPort<T> {
  subscribe(listener: (event: T) => void): Unsubscribe;
  emit(event: T): void;
  clear(): void;
}
