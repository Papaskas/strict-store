import { EventPort } from '@src/domain/ports/event.port';
import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';

export class EventStorageAdapter implements EventPort {
  subscribe(callback: (ev: StorageEvent) => void): Unsubscribe {
    window.addEventListener('storage', callback);

    return () => {
      window.removeEventListener('storage', callback);
    };
  }
}
