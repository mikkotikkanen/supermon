import EventBus from '../utils/EventBus';


export enum WatchEvents {
  Start = 'Start',
  FilesChanged = 'FilesChanged',
  Enable = 'Enable',
  Disable = 'Disable',
}

export default class WatchEventBus extends EventBus {
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
