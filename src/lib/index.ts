import { EventEmitter } from 'events';
import install from './install';
import watch from './watch';
import { runRestartable, Events as RunEvents } from './run';
import WatchEventBus from './watch/WatchEventBus';
import InstallEventBus from './install/InstallEventBus';


export interface LibProps {
  executable: string;
  debug?: boolean;
  usepolling?: boolean;
  watchDir?: string;
}

const libPropsDefaults = {
  debug: false,
  usepolling: false,
  watchDir: '.',
};


const libEvents = new EventEmitter();
let runEvents: EventEmitter;
let watchEventBus: WatchEventBus;
let installEventBus: InstallEventBus;
let isStarted = false;
// const isInstalling = false;


/**
 * Setup main process
 */
export default (props: LibProps): EventEmitter => {
  const defaultedProps = { ...libPropsDefaults, ...props };

  // Setup watcher
  watchEventBus = watch({
    cwd: props.watchDir,
    usePolling: defaultedProps.usepolling,
  });
  watchEventBus.on(watchEventBus.Events.FilesChanged, () => {
    if (defaultedProps.debug) {
      console.log('index, CHANGED');
    }

    // Only start emitting watch events once the child process is running
    if (isStarted) {
      console.log('');
      console.log('Files changed, restarting...');
      console.log('');

      installEventBus.emit(installEventBus.Events.Install);
    }
  });


  // Setup installer
  installEventBus = install();
  installEventBus.on(installEventBus.Events.Install, () => {
    if (defaultedProps.debug) {
      console.log('index, INSTALL');
    }
    watchEventBus.emit(watchEventBus.Events.Disable);
  });
  installEventBus.on(installEventBus.Events.Installed, () => {
    if (defaultedProps.debug) {
      console.log('index, INSTALLED');
    }
    watchEventBus.emit(watchEventBus.Events.Enable);

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
    libEvents.emit('started'); // Temporary
    isStarted = true;
  });
  runEvents.on(RunEvents.CLOSED, () => {
    isStarted = false;
    console.log('');
    console.log('Process exited');

    // Make sure we clean up all dangling processes
    process.exit(0);
  });

  // Start with install
  installEventBus.emit(installEventBus.Events.Install);

  libEvents.on('kill', () => { // Temporary
    runEvents.emit(RunEvents.KILL);
  });

  return libEvents;
};


/**
 * Setup signal handling
 */
let isCleanupInProgress = false;
const cleanup = (): void => {
  // Only when we are already running, do the cleanup
  if (isStarted && !isCleanupInProgress) {
    isCleanupInProgress = true;

    // Kill child process which will trigger tree-kill on main process
    runEvents.emit(RunEvents.KILL);
  }
};

// Set system signals
const sysSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
sysSignals.forEach((eventType) => {
  process.on(eventType, cleanup);
});

// Set process exit event (not valid system signal so set it separately)
process.on('exit', cleanup);
