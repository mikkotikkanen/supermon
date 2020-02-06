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

  // Override the default emit from EventEmitter
  emit(event: Events): boolean {
    return super.emit(event);
  }
}


const bus = new EventBus();
bus.emit(bus.Events.ExecutableStart);
