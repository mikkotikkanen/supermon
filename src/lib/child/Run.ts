import { spawn } from 'child_process';
import kill from 'tree-kill';
import EventBus from '../EventBus';


export interface RunProps {
  /**
   * Command to execute the child process with
   */
  command: string;

  /**
   * Working directory
   */
  cwd?: string;

  /**
   * Should the process be started automatically
   */
  autostart?: boolean;

  /**
   * Debug flag. Log all events to console
   */
  debug?: boolean;
}

export enum Events {
  Start = 'RUN_START',
  Started = 'RUN_STARTED',
  Stop = 'RUN_STOP',
  Stopped = 'RUN_STOPPED',
}


export class Run {
  private command: string;

  private cwd?: string;

  private pid = 0;

  readonly Events = Events;

  eventBus: EventBus;

  constructor({
    command,
    cwd,
    autostart = true,
    debug = false,
  }: RunProps) {
    this.command = command;
    this.cwd = cwd;
    this.eventBus = new EventBus({
      debug,
    });

    this.eventBus.on(this.Events.Stop, (() => {
      if (!this.pid) {
        throw new Error("Can't kill child process, no process is running.");
      } else {
        kill(this.pid, 'SIGTERM');
      }
    }));

    if (autostart) {
      this.eventBus.emit(this.Events.Start);
    }

    this.eventBus.on(this.Events.Start, () => {
      this.start();
    });
  }


  isRunning(): boolean {
    return this.pid !== 0;
  }

  start(): void {
    // Start child process
    const child = spawn(this.command, { // child event handlers are left behind after restart
      cwd: this.cwd,
      shell: true,
      stdio: 'inherit',
    });
    this.pid = child.pid;

    child.on('close', (code: number) => {
      if (this.pid) {
        this.pid = 0;
        this.eventBus.emit(this.Events.Stopped, code);
      }
    });

    this.eventBus.emit(this.Events.Started);
  }
}
