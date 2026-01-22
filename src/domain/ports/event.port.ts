import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';
import { EventMessageInternal } from '@src/domain/entities/on-change/event-message.internal.entity';

export interface EventPort {
  subscribe(
    callback: (msg: EventMessageInternal) => void,
    options: AddEventListenerOptions,
  ): Unsubscribe;

  publish(msg: Omit<EventMessageInternal, 'originId'>): void;
}
