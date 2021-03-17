import EventEmitter from 'events';

export type EventBusProps = {
  /**
   * Log events out
   */
  debug?: boolean;
}

export enum ProcessEvents {
  Start = 'PROCESS_START',
}

export enum ChildEvents {
  Start = 'CHILD_START',
  Started = 'CHILD_STARTED',
  Restart = 'CHILD_RESTART',
  Restarted = 'CHILD_RESTARTED',
  Stop = 'CHILD_STOP',
  Stopped = 'CHILD_STOPPED',
}

export enum InstallEvents {
  Install = 'INSTALL_INSTALL',
  Installing = 'INSTALL_INSTALLING',
  Installed = 'INSTALL_INSTALLED',
}

export enum WatchEvents {
  Start = 'WATCH_START',
  FilesChanged = 'WATCH_FILESCHANGED',
  Enable = 'WATCH_ENABLE',
  Disable = 'WATCH_DISABLE',
  Stop = 'WATCH_STOP',
  Stopped = 'WATCH_STOPPED',
}


export default class EventBus extends EventEmitter {
  private debug = false;

  constructor({
    debug = false,
  }: EventBusProps = {}) {
    super();
    this.debug = debug;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]): boolean {
    if (this.debug) {
      console.log(`Eventbus event emit. "${event}"`);
    }

    return super.emit(event, ...args);
  }
}
