import EventBus from '../utils/EventBus';


export enum RunEvents {
  Start = 'Start',
  Started = 'Started',
  Restart = 'Restart',
  Stopped = 'Stopped',
}

export default class RunEventBus extends EventBus {
  static readonly Events = RunEvents;

  readonly Events = RunEvents;

  private onKillFnc: Function = () => { /* init to empty function */ };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: RunEvents, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: RunEvents, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * For synchronously killing the process
   *
   * @param fnc Callback function when kill is called
   */
  onKill(fnc: Function): void {
    this.onKillFnc = fnc;
  }

  /**
   * Call synchronous onKill function
   */
  kill(): void {
    this.onKillFnc.call(this);
  }
}
