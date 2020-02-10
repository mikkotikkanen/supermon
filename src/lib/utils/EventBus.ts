/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';

// enum Events {
//   // Module installation
//   ModulesInstall = 'ModulesInstall',
//   ModulesInstalling = 'ModulesInstalling',
//   ModulesInstalled = 'ModulesInstalled',

//   // Watching filechanges
//   WatchStart = 'WatchStart',
//   WatchChangeEvent = 'WatchChangeEvent',

//   // Executable
//   ExecutableStart = 'ExecutableStart',
//   ExecutableStarted = 'ExecutableStarted',
//   ExecutableStopped = 'ExecutableStopped',
//   ExecutableStop = 'ExecutableStop',
// }


export default class EventBus extends EventEmitter {
  // static readonly Events = Events;

  // readonly Events = EventBus.Events;

  pipes: EventEmitter[] = [];

  /**
   * Override the default emit from EventEmitter
   *
   * @param event Event enum
   * @param args Arguments to pass to listeners
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]): boolean {
    const result = super.emit(event, ...args);

    // Also emit events to other pipes
    this.pipes.forEach((bus) => {
      bus.emit(event, ...args);
    });
    return result;
  }

  pipe(target: EventEmitter): this {
    this.pipes.push(target);
    return this;
  }
}
