import { EventEmitter } from 'events';
// import kill from 'tree-kill';
import { watch, Events as WatchEvents } from './watch';
import { runRestartable, Events as RunEvents } from './run';
import { install, Events as InstallEvents } from './install';


export interface LibProps {
  executable: string;
  debug?: boolean;
  usepolling?: boolean;
  watchDir?: string;
}

const libPropsDefaults = {
  debug: false,
  usepolling: true,
  watchDir: '.',
};


let runEvents: EventEmitter;
let watchEvents: EventEmitter;
let installEvents: EventEmitter;
let isStarted = false;
// const isInstalling = false;


/**
 * Setup main process
 */
export default (props: LibProps): void => {
  const defaultedProps = { ...libPropsDefaults, ...props };

  // Setup watcher
  watchEvents = watch({
    cwd: props.watchDir,
    usePolling: defaultedProps.usepolling,
  });
  watchEvents.on(WatchEvents.CHANGED, () => {
    if (defaultedProps.debug) {
      console.log('index, CHANGED');
    }

    // Only start emitting watch events once the child process is running
    if (isStarted) {
      console.log('');
      console.log('Files changed, restarting...');
      console.log('');

      installEvents.emit(InstallEvents.INSTALL);
    }
  });


  // Setup installer
  installEvents = install();
  installEvents.on(InstallEvents.INSTALL, () => {
    if (defaultedProps.debug) {
      console.log('index, INSTALL');
    }
    watchEvents.emit(WatchEvents.DISABLE);
  });
  installEvents.on(InstallEvents.INSTALLED, () => {
    if (defaultedProps.debug) {
      console.log('index, INSTALLED');
    }
    watchEvents.emit(WatchEvents.ENABLE);

    // Only trigger restart if child process has been started already
    if (isStarted) {
      isStarted = false;
      runEvents.emit(RunEvents.RESTART);
    } else {
      runEvents.emit(RunEvents.START);
    }
  });


  // Setup the requested command
  runEvents = runRestartable(`node ${props.executable}`);
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
};


/**
 * Setup signal handling
 */
const cleanup = (): void => {
  // Kill child process which will trigger tree-kill on main process
  runEvents.emit(RunEvents.KILL);
};

// Set system signals
const sysSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
sysSignals.forEach((eventType) => {
  process.on(eventType, cleanup);
});

// Set process exit event (not valid system signal so set it separately)
process.on('exit', cleanup);
