import { EventEmitter } from 'events';

enum Events {
  // Module installation
  ModulesInstall = 'ModulesInstall',
  ModulesInstalling = 'ModulesInstalling',
  ModulesInstalled = 'ModulesInstalled',

  // Watching filechanges
  WatchStart = 'WatchStart',
  WatchChangeEvent = 'WatchChangeEvent',

  // Executable
  ExecutableStart = 'ExecutableStart',
  ExecutableStarted = 'ExecutableStarted',
  ExecutableStopped = 'ExecutableStopped',
  ExecutableStop = 'ExecutableStop',
}


export default class EventBus extends EventEmitter {
  static readonly Events = Events;

  readonly Events = EventBus.Events;

  /**
   * Override the default emit from EventEmitter
   *
   * @param event Event enum
   * @param args Arguments to pass to listeners
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: Events, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Override default on handler from EventEmitter
   *
   * @param event Event enum
   * @param listener Event listener
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: Events, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
