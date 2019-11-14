import { EventEmitter } from "events"
import { Events } from "./Events";

let events: EventEmitter;

export const install = () => {
  events = new EventEmitter();

  events.on(Events.INSTALL, () => {
    console.log('Installing...');
    setTimeout(() => {
      console.log('Install done.');
      console.log('');
      events.emit(Events.INSTALLED);
    }, 1 * 1000);
  });

  return events;
}
