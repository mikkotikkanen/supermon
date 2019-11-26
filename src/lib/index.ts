import { EventEmitter } from 'events';
import { watch, WatchEvents } from './Watch';
import { runRestartable, RunEvents } from './Run';
import { install, InstallEvents } from './Install';
import updateNodeModules from './updateNodeModules';
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

  // Run watcher
  watchEvents = watch();
  watchEvents.on(WatchEvents.CHANGED, () => {
    // Only start emitting watch events once the child process is running
    if (isStarted && !isInstalling) {
      isInstalling = true;
      installEvents.emit(InstallEvents.INSTALL);
    }
  });


  // Run installer
  installEvents = install();
  installEvents.emit(InstallEvents.INSTALL);
  installEvents.on(InstallEvents.INSTALLED, () => {
    isInstalling = false;

    // Only trigger restart if child process has been started already
    if (isStarted) {
      runEvents.emit(RunEvents.RESTART);
    } else {
      runEvents.emit(RunEvents.START);
    }
  });


  // Run the requested command
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
}


// Make sure we trigger kill events to both main and child processes
const cleanup = () => {
  runEvents.emit(RunEvents.KILL);
  runEvents.emit(RunEvents.CLOSED, 0);
}

const termSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
termSignals.forEach((eventType) => {
  process.on(eventType, cleanup);
});
process.on('exit', cleanup);
