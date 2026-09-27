import { Unsubscribe } from '@src/application/inbound/unsubscribe.entity';
import { BroadcastMessage } from '@src/infrastructure/broadcast-channel/broadcast-message';

export interface EventPort {
  subscribe(
    callback: (msg: BroadcastMessage) => void,
    options: AddEventListenerOptions,
  ): Unsubscribe;

  publish(msg: Omit<BroadcastMessage, 'originId'>): void;
}
