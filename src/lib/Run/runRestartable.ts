import { EventEmitter } from 'events';
import { Run, IRunProps } from "./run";
import { Events } from './Events';


const events = new EventEmitter();
let runEvents: EventEmitter;
let isRestarting = false;


export const runRestartable = (command: string, props?: IRunProps) => {
  const run = new Run(command);

  run.events.on(Events.STARTED, () => {
    if (isRestarting) {
      isRestarting = false;
    }
    events.emit(Events.STARTED);
  });

  run.events.on(Events.CLOSED, (code) => {
    if (isRestarting) {
      if (props) {
        props.autostart = true;
      }

      events.emit(Events.START);
    } else {
      events.emit(Events.CLOSED, code)
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

  events.on(Events.KILL, () => run.events.emit(Events.KILL));

  return events;
};