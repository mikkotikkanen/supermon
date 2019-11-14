import { EventEmitter } from 'events';
import { run, IRunProps } from "./run";
import { Events } from './Events';


const events = new EventEmitter();
let runEvents: EventEmitter;
let isRestarting = false;


/**
 * Run and setup events for restartable command
 *
 * @param command Command string
 * @param props Command properties
 */
const runAndSetEvents = (command: string, props?: IRunProps) => {
  runEvents = run(command, props);

  runEvents.on(Events.STARTED, () => {
    if (isRestarting) {
      isRestarting = false;
    }
    events.emit(Events.STARTED);
  });

  runEvents.on(Events.CLOSED, (code) => {
    if (isRestarting) {
      if (props) {
        props.autostart = true;
      }
      runAndSetEvents(command, props);
    } else {
      events.emit(Events.CLOSED, code)
    }
  });
}


export const runRestartable = (command: string, props?: IRunProps) => {

  // Set main event emitter events
  events.on(Events.START, () => runEvents.emit(Events.START));

  events.on(Events.RESTART, () => {
    isRestarting = true;
    runEvents.emit(Events.KILL);
  });

  events.on(Events.KILL, () => runEvents.emit(Events.KILL));

  setTimeout(runAndSetEvents, 0, command, props);

  return events;
};