import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import kill from 'tree-kill';
import { Events } from './Events';


export interface IRunProps {
  cwd?: string,
  autostart: boolean,
}
const runPropsDefaults: IRunProps = {
  cwd: '.',
  autostart: true,
}


let events: EventEmitter;
let child: ChildProcess;
let isBeingKilled = false;


/**
 * Execute the command
 *
 * @param command Command to run
 * @param props Command properties
 */
const execute = (command: string, props: IRunProps) => {
  // Start child process
  child = spawn(command, {
    cwd: props.cwd,
    shell: true,
    stdio: 'inherit',
  });

  child.on('close', (code: Number) => {
    if (!isBeingKilled) {
      events.emit(Events.CLOSED, code);
    }
  });

  events.emit(Events.STARTED);
}


/**
 * Run the given command
 *
 * @param command Command to run
 * @param props Command properties
 */
export const run = (command: string, props?: IRunProps) => {
  const defaultedProps = Object.assign({}, runPropsDefaults, props);

  // Create event emitter
  events = new EventEmitter();

  events.on(Events.START, () => {
    execute(command, defaultedProps);
  });

  events.on(Events.KILL, () => {
    if (!child) {
      throw new Error("Can't kill child process, no process is running.");
    } else {
      // Make sure we wait until all processes are killed before sending CLOSED event
      isBeingKilled = true;
      kill(child.pid, 'SIGKILL', () => {
        isBeingKilled = false;
        child.emit('close', 0);
      });
    }
  });

  // Push execute function to call stack so that event emitter can be returned immediately
  if (defaultedProps.autostart) {
    setTimeout(execute, 0, command, defaultedProps);
  }

  return events;
}


// Make sure child is killed when process exits
// TODO: Handle all the events, including exceptions
// TODO: Test if this can be set within the Run function (does it set itself over and over again)
// process.on('SIGINT', () => events.emit(Events.KILL));


// const termSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
// termSignals.forEach((eventType) => {
//   process.on(eventType, () => {
//     console.log('process exit no2, PID', child.pid);
//     kill(child.pid)
//   });
// });