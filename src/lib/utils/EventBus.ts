import { EventEmitter } from 'events';


export default class EventBus extends EventEmitter {
  pipes: EventEmitter[] = [];

  /**
   * Override the default emit from EventBus
   *
   * @param event Event enum
   * @param args Arguments to pass to listeners
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]): boolean {
    const result = super.emit(event, ...args);

    // Also emit events to piped event emitters
    this.pipes.forEach((bus) => {
      bus.emit(event, ...args);
    });
    return result;
  }

  /**
   * Pipes all emitted events also to target event emitters
   *
   * @param target Target Event emitter
   */
  pipe(target: EventEmitter): this {
    this.pipes.push(target);
    return this;
  }
}
