import { Unsubscribe } from '@src/domain/entities/on-change/unsubscribe.entity';
import { EVENT_NAME } from '@src/domain/constants/app.constants';
import { EventPort } from '@src/domain/ports/event.port';
import { EventMessageInternal } from '@src/domain/entities/on-change/event-message.internal.entity';
import { EmitterPort } from '@src/domain/ports/emitter.port';

export class BroadcastChannelEventStorageAdapter implements EventPort {
  constructor(
    private readonly emitterPort: EmitterPort<EventMessageInternal>,
    private readonly name = EVENT_NAME,
    private readonly channel: BroadcastChannel = new BroadcastChannel(this.name),
    private readonly originId = BroadcastChannelEventStorageAdapter.makeOriginId(),
  ) {}

  subscribe(
    callback: (msg: EventMessageInternal) => void,
    options: AddEventListenerOptions = {},
  ): Unsubscribe {
    if (!this.channel) return () => {};

    const handler = (ev: MessageEvent<EventMessageInternal>) => {
      if (!ev.data || ev.data.originId === this.originId) return;

      this.emitterPort.emit(ev.data);
    };

    const unsubLocal = this.emitterPort.subscribe(callback);
    this.channel.addEventListener('message', handler, options);

    return () => {
      unsubLocal();
      this.channel?.removeEventListener('message', handler, options);
    };
  }

  publish(msg: Omit<EventMessageInternal, 'originId'>): void {
    if (!this.channel) return;

    const payload: EventMessageInternal = {
      originId: this.originId,
      key: msg.key,
      newValue: msg.newValue,
      oldValue: msg.oldValue,
      timestamp: msg.timestamp,
    };

    this.emitterPort.emit(payload);
    this.channel.postMessage(payload);
  }

  private static makeOriginId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `origin_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}
