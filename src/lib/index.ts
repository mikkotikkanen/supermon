import { extname } from 'path';
import { install, InstallEventBus } from './install';
import { watch, WatchEventBus } from './watch';
import { runRestartable, RunEventBus } from './run';
import logger from './logger';
import LibEventBus from './LibEventBus';


export interface LibProps {
  executable: string;
  watchdir?: string;
  polling?: boolean;
  logging?: boolean;
  debug?: boolean;

  /**
   * How long to sleep (in ms) when file change event is detected
   *
   * Used to avoid triggering events on every file modifications on fe. `npm install`
   *
   * Default: 200
   */
    delay?: number;
}


const libEventBus = new LibEventBus();
let runEventBus: RunEventBus;
let watchEventBus: WatchEventBus;
let installEventBus: InstallEventBus;
const logEventBus = logger();
let isStarted = false;
// const isInstalling = false;


/**
 * Setup main process
 */
export default ({
  executable,
  debug = false,
  delay = 200,
  logging = true,
  polling = false,
  watchdir = '.',
}: LibProps): LibEventBus => {
  const isTypeScript = extname(executable) === '.ts';

  // Setup watcher
  watchEventBus = watch({
    cwd: watchdir,
    polling,
    extensions: (isTypeScript ? ['ts', 'json'] : ['js', 'mjs', 'json']),
    delay,
  });
  watchEventBus.on(watchEventBus.Events.FilesChanged, () => {
    if (debug) {
      console.log('index, CHANGED');
    }

    // Only start emitting watch events once the child process is running
    if (isStarted) {
      installEventBus.emit(installEventBus.Events.Install);
    }
  });
  if (logging) {
    watchEventBus.pipe(logEventBus);
  }


  // Setup installer
  installEventBus = install();
  installEventBus.on(installEventBus.Events.Install, () => {
    if (debug) {
      console.log('index, INSTALL');
    }
    watchEventBus.emit(watchEventBus.Events.Disable);
  });
  installEventBus.on(installEventBus.Events.Installed, () => {
    if (debug) {
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
  const engine = (isTypeScript ? 'ts-node' : 'node');
  runEventBus = runRestartable(`${engine} ${executable}`);
  runEventBus.on(runEventBus.Events.Started, () => {
    libEventBus.emit(libEventBus.Events.Started); // Temporary
    isStarted = true;
  });
  runEventBus.on(runEventBus.Events.Stopped, (code) => {
    isStarted = false;

    if (code === 0) {
      // Make sure we clean up all dangling processes when application finishes
      process.exit(0);
    }
  });
  if (logging) {
    runEventBus.pipe(logEventBus);
  }

  // Start with install
  installEventBus.emit(installEventBus.Events.Install);

  libEventBus.onKill(() => {
    isStarted = false;
    runEventBus.kill();
  });

  return libEventBus;
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
    runEventBus.kill();
  }
};

// Set system signals
const sysSignals: NodeJS.Signals[] = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
sysSignals.forEach((eventType) => {
  process.on(eventType, cleanup);
});

// Set process exit event (not valid system signal so set it separately)
process.on('exit', cleanup);
