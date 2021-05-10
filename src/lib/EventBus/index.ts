import EventEmitter from 'events';
import logger from '../logger/logger';

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

export enum ModulesEvents {
  Install = 'MODULES_INSTALL',
  Installing = 'MODULES_INSTALLING',
  Installed = 'MODULES_INSTALLED',
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
      logger.prefix(`Eventbus event emit. "${event}"`);
    }

    return super.emit(event, ...args);
  }
}
