import { spawn } from 'child_process';
import kill from 'tree-kill';
import RunEventBus from './RunEventBus';


export interface RunProps {
  cwd?: string;
  autostart: boolean;
}
const runPropsDefaults: RunProps = {
  cwd: '.',
  autostart: true,
};


export class Run {
  private command: string;

  private props: RunProps;

  private pid = 0;

  eventBus = new RunEventBus();

  constructor(command: string, props?: RunProps) {
    const defaultedProps = { ...runPropsDefaults, ...props };

    this.command = command;
    this.props = defaultedProps;

    this.eventBus.on(this.eventBus.Events.Start, () => {
      // this.execute();
    });

    this.eventBus.onKill(() => {
      if (!this.pid) {
        throw new Error("Can't kill child process, no process is running.");
      } else {
        kill(this.pid, 'SIGTERM');
      }
    });

    if (defaultedProps.autostart) {
      this.eventBus.emit(this.eventBus.Events.Start);
    }
  }


  isRunning(): boolean {
    return this.pid !== 0;
  }

  execute(): void {
    // Start child process
    const child = spawn(this.command, { // child event handlers are left behind after restart
      cwd: this.props.cwd,
      shell: true,
      stdio: 'inherit',
    });
    this.pid = child.pid;

    child.on('close', (code: number) => {
      if (this.pid) {
        this.pid = 0;
        this.eventBus.emit(this.eventBus.Events.Stopped, code);
      }
    });

    this.eventBus.emit(this.eventBus.Events.Started);
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
