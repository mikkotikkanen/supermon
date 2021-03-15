import EventEmitter from 'events';

export type EventBusProps = {
  /**
   * Log events out
   */
  debug?: boolean;
}


export enum ChildEvents {
  Start = 'ChildStart',
  Started = 'ChildStarted',
  Restart = 'ChildRestart',
  Restarted = 'ChildRestarted',
  Stop = 'ChildStop',
  Stopped = 'ChildStopped',
}

export enum InstallEvents {
  Install = 'Install',
  Installing = 'Installing',
  Installed = 'Installed',
}

export enum WatchEvents {
  Start = 'WatchStart',
  FilesChanged = 'WatchFilesChanged',
  Enable = 'WatchEnable',
  Disable = 'WatchDisable',
  Stop = 'WatchStop',
  Stopped = 'WatchStopped',
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
      console.log(`Event emitted. (${event})`);
    }

    return super.emit(event, ...args);
  }
}
