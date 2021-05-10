import { spawn } from 'child_process';
import kill from 'tree-kill';
import EventBus from '../EventBus';
import logger from '../logger/logger';


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
   * Send logs to the logger instead of plain console.log
   */
  useLogger?: boolean;

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
  Log = 'RUN_LOG',
}


export class Run {
  private command: string;

  private cwd?: string;

  private useLogger: boolean;

  private pid = 0;

  readonly Events = Events;

  eventBus: EventBus;

  constructor({
    command,
    cwd,
    useLogger = false,
    autostart = true,
    debug = false,
  }: RunProps) {
    this.command = command;
    this.cwd = cwd;
    this.useLogger = useLogger;
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

  log(message: string): void {
    if (this.useLogger) {
      logger.prefix(message);
    } else {
      logger.log(message);
    }
  }

  start(): void {
    // Start child process
    const child = spawn(this.command, { // child event handlers are left behind after restart
      cwd: this.cwd,
      shell: true,
      stdio: 'pipe',
    });
    this.pid = child.pid;

    // Log out stdout data as lines
    let stdoutBuffer = '';
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk;

      // Log completed lines out
      const lines = stdoutBuffer.split('\n');
      while (lines.length > 1) {
        const line = lines.shift() as string;
        this.log(line);
      }

      // Set last piece as new buffer
      stdoutBuffer = lines.shift() as string;
    });
    child.stdout.on('end', () => {
      // When stdout ends, log out remaining buffer
      if (stdoutBuffer) {
        this.log(stdoutBuffer);
      }
    });

    // Log out stderr data as lines
    let stderrBuffer = '';
    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk;

      // Log completed lines out
      const lines = stderrBuffer.split('\n');
      while (lines.length > 1) {
        const line = lines.shift() as string;
        this.log(line);
      }

      // Set last piece as new buffer
      stderrBuffer = lines.shift() as string;
    });
    child.stderr.on('end', () => {
      // When stdout ends, log out remaining buffer
      if (stderrBuffer) {
        this.log(stderrBuffer);
      }
    });

    // When child exists, send corresponding event to eventbus
    child.on('close', (code: number) => {
      if (this.pid) {
        this.pid = 0;
        this.eventBus.emit(this.Events.Stopped, code);
      }
    });

    // Notify eventbus that child has started when everything is set
    this.eventBus.emit(this.Events.Started);
  }
}
