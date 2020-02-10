import EventBus from '../utils/EventBus';


export enum WatchEvents {
  WatchStart = 'WatchStart',
  WatchChangeEvent = 'WatchChangeEvent',
}

export default class WatchEventsBus extends EventBus {
  readonly Events = WatchEvents;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: WatchEvents, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: WatchEvents, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
