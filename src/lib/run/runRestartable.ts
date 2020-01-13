import { EventEmitter } from 'events';
import { Run } from './Run';
import Events from './Events';


const events = new EventEmitter();
let isRestarting = false;


export default (command: string): EventEmitter => {
  const run = new Run(command);

  run.events.on(Events.STARTED, () => {
    if (isRestarting) {
      isRestarting = false;
    }
    events.emit(Events.STARTED);
  });

  run.events.on(Events.CLOSED, (code) => {
    if (isRestarting) {
      events.emit(Events.START);
    } else if (!run.isRunning()) {
      events.emit(Events.CLOSED, code);
    }
  });

  // Set main event emitter events
  events.on(Events.START, () => {
    run.execute();
  });

  events.on(Events.RESTART, () => {
    isRestarting = true;
    run.events.emit(Events.KILL);
  });

  events.on(Events.KILL, () => {
    run.events.emit(Events.KILL);
  });

  return events;
};
