import { spawn } from 'child_process';
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


export class Run {
  private command: string;
  private props: IRunProps;
  private pid = 0;
  events = new EventEmitter();

  constructor(command: string, props?: IRunProps) {

    const defaultedProps = Object.assign({}, runPropsDefaults, props);

    this.command = command;
    this.props = defaultedProps;

    this.events.on(Events.START, () => {
      // this.execute();
    });

    this.events.on(Events.KILL, () => {
      if (!this.pid) {
        throw new Error("Can't kill child process, no process is running.");
      } else {
        // Make sure we wait until all processes are killed before sending CLOSED event
        kill(this.pid, 'SIGTERM');
      }
    });

    if (defaultedProps.autostart) {
      this.events.emit(Events.START);
    }
  }

  isRunning() {
    return this.pid !== 0;
  }

  execute() {

    // Start child process
    const child = spawn(this.command, { // child event handlers are left behind after restart
      cwd: this.props.cwd,
      shell: true,
      stdio: 'inherit',
    });
    this.pid = child.pid;

    child.on('close', (code: Number) => {
      if (this.pid) {
        this.pid = 0;
        this.events.emit(Events.CLOSED, code);
      }
    });

    this.events.emit(Events.STARTED);
  }
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