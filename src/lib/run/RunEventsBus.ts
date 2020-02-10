import EventBus from '../utils/EventBus';


export enum RunEvents {
  Start = 'Start',
  Started = 'Started',
  Stop = 'Stop',
  Stopped = 'Stopped',
}

export default class RunEventsBus extends EventBus {
  readonly Events = RunEvents;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: RunEvents, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: RunEvents, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
