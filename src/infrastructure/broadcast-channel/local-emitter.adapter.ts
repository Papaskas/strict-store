import { Unsubscribe } from '@src/application/inbound/unsubscribe.entity';
import { EmitterPort } from '@src/infrastructure/broadcast-channel/emitter.port';
import { BroadcastMessage } from '@src/infrastructure/broadcast-channel/broadcast-message';

type Listener<T extends BroadcastMessage> = (event: T) => void;

export class LocalEmitterAdapter<T extends BroadcastMessage> implements EmitterPort<T> {
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
