import { EventEmitter } from 'events';
import { watch, WatchEvents } from './Watch';
import { runRestartable, RunEvents } from './Run';
import { install, InstallEvents } from './install';
import kill from 'tree-kill';


export interface ILibProps {
  executable: string
}

let runEvents: EventEmitter;
let watchEvents: EventEmitter;
let installEvents: EventEmitter;
let isStarted = false;
let isInstalling = false;

export default (args: ILibProps) => {

  // Setup watcher
  watchEvents = watch();
  watchEvents.on(WatchEvents.CHANGED, () => {
    // Only start emitting watch events once the child process is running
    if (isStarted && !isInstalling) {
      console.log('');
      console.log('Files changed, restarting...');
      console.log('');

      installEvents.emit(InstallEvents.INSTALL);
    }
  });


  // Setup installer
  installEvents = install();
  installEvents.on(InstallEvents.INSTALL, () => {
    isInstalling = true;
  });
  installEvents.on(InstallEvents.INSTALLED, () => {
    isInstalling = false;

    // Only trigger restart if child process has been started already
    if (isStarted) {
      isStarted = false;
      runEvents.emit(RunEvents.RESTART);
    } else {
      runEvents.emit(RunEvents.START);
    }
  });


  // Setup the requested command
  runEvents = runRestartable(`node ${args.executable}`, { autostart: false });
  runEvents.on(RunEvents.STARTED, () => {
    isStarted = true;
  });
  runEvents.on(RunEvents.CLOSED, (code) => {
    console.log('');
    console.log('Process exited.', code);

    // Make sure we clean up all dangling processes
    kill(process.pid);
  });

  // Start with install
  installEvents.emit(InstallEvents.INSTALL);
}


/**
 * Setup signal handling
 */
const cleanup = () => {
  // Make sure we trigger kill events to both main and child processes
  runEvents.emit(RunEvents.KILL);
  runEvents.emit(RunEvents.CLOSED, 0);
}

// Set system signals
const sysSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
sysSignals.forEach((eventType) => {
  process.on(eventType, cleanup);
});

// Set process exit event (not valid system signal so set it separately)
process.on('exit', cleanup);
