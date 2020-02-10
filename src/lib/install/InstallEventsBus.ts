import EventBus from '../utils/EventBus';


export enum InstallEvents {
  Install = 'Install',
  Installing = 'Installing',
  Installed = 'Installed',
}

export default class InstallEventsBus extends EventBus {
  readonly Events = InstallEvents;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: InstallEvents, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: InstallEvents, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
