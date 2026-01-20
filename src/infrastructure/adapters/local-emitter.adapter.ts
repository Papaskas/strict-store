import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';
import { EmitterPort } from '@src/domain/ports/emitter.port';
import { EventMessageInternal } from '@src/domain/entities/on-change/event-message.internal.entity';

type Listener<T extends EventMessageInternal> = (event: T) => void;

export class LocalEmitterAdapter<T extends EventMessageInternal> implements EmitterPort<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: T): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
