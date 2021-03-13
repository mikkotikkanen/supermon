import EventBus from './utils/EventBus';


export enum LibEvents {
  Started = 'Started',
  Stopped = 'Stopped',
  Restarted = 'Restarted',
}

export default class LibEventBus extends EventBus {
  static readonly Events = LibEvents;

  readonly Events = LibEvents;

  private onKillFnc = () => { /* init to empty function */ };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: LibEvents, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: LibEvents, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * For synchronously killing the process
   *
   * @param fnc Callback function when kill is called
   */
  onKill(fnc: () => void): void {
    this.onKillFnc = fnc;
  }

  /**
   * Call synchronous onKill function
   */
  kill(): void {
    this.onKillFnc.call(this);
  }
}
