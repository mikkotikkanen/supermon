import { EventEmitter } from 'events';
import { install, InstallEventBus } from './install';
import { watch, WatchEventBus } from './watch';
import { runRestartable, RunEventBus } from './run';


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
let runEventBus: RunEventBus;
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
      runEventBus.emit(runEventBus.Events.Restart);
    } else {
      runEventBus.emit(runEventBus.Events.Start);
    }
  });


  // Setup the requested command
  runEventBus = runRestartable(`node ${props.executable}`);
  runEventBus.on(runEventBus.Events.Started, () => {
    libEvents.emit('started'); // Temporary
    isStarted = true;
  });
  runEventBus.on(runEventBus.Events.Stopped, () => {
    isStarted = false;
    console.log('');
    console.log('Process exited');

    // Make sure we clean up all dangling processes
    process.exit(0);
  });

  // Start with install
  installEventBus.emit(installEventBus.Events.Install);

  libEvents.on('kill', () => { // Temporary
    runEventBus.emit(runEventBus.Events.Stop);
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
    runEventBus.emit(runEventBus.Events.Stop);
  }
};

// Set system signals
const sysSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
sysSignals.forEach((eventType) => {
  process.on(eventType, cleanup);
});

// Set process exit event (not valid system signal so set it separately)
process.on('exit', cleanup);
