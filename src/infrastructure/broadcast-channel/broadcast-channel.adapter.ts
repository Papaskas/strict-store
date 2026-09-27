import { Unsubscribe } from '@src/application/inbound/unsubscribe.entity';
import { EventPort } from '@src/application/outbound/change-broadcast.port';
import { BroadcastMessage } from '@src/infrastructure/broadcast-channel/broadcast-message';
import { EmitterPort } from '@src/infrastructure/broadcast-channel/emitter.port';

export class BroadcastChannelEventStorageAdapter implements EventPort {
  constructor(
    private readonly emitterPort: EmitterPort<BroadcastMessage>,
    private readonly name = 'strict-store:events',
    private readonly channel: BroadcastChannel = new BroadcastChannel(this.name),
    private readonly originId = BroadcastChannelEventStorageAdapter.makeOriginId(),
  ) {}

  subscribe(
    callback: (msg: BroadcastMessage) => void,
    options: AddEventListenerOptions = {},
  ): Unsubscribe {
    if (!this.channel) return () => {};

    const handler = (ev: MessageEvent<BroadcastMessage>) => {
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

  publish(msg: Omit<BroadcastMessage, 'originId'>): void {
    if (!this.channel) return;

    const payload: BroadcastMessage = {
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
