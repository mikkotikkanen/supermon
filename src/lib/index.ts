import { extname } from 'path';
import treeKill from 'tree-kill';
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

  /**
   * Wheter or not to do full sync on first run
   */
  firstRunSync?: boolean;
}


const libEventBus = new LibEventBus();
let runEventBus: RunEventBus;
let watchEventBus: WatchEventBus;
let installEventBus: InstallEventBus;
const logEventBus = logger();
let isStarted = false;
let isBeingKilled = false;
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
  firstRunSync = true,
  watchdir = '.',
}: LibProps): LibEventBus => {
  const isTypeScript = extname(executable) === '.ts';

  // Setup watcher
  watchEventBus = watch({
    cwd: watchdir,
    polling,
    extensions: (isTypeScript ? ['ts', 'tsx', 'json'] : ['js', 'mjs', 'jsx', 'json']),
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
  installEventBus = install({
    firstRunSync,
  });
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
    if (debug) {
      console.log('index, STARTED');
    }

    libEventBus.emit(libEventBus.Events.Started); // Temporary
    isStarted = true;
  });
  runEventBus.on(runEventBus.Events.Restarted, () => {
    if (debug) {
      console.log('index, RESTARTED');
    }

    libEventBus.emit(libEventBus.Events.Restarted);
  });
  runEventBus.on(runEventBus.Events.Stopped, (code) => {
    if (debug) {
      console.log(`index, STOPPED (code: ${code})`);
    }

    libEventBus.emit(libEventBus.Events.Stopped); // Temporary
    isStarted = false;

    if (code === 0 || isBeingKilled) {
      // If we exited succesfully or we are getting killed, stop event watcher
      watchEventBus.emit(watchEventBus.Events.Stop);
    }
  });
  if (logging) {
    runEventBus.pipe(logEventBus);
  }

  // Start with install
  installEventBus.emit(installEventBus.Events.Install);

  libEventBus.onKill(() => {
    isBeingKilled = true;
    isStarted = false;
    runEventBus.kill();
  });

  return libEventBus;
};


// On process exit, make sure to kill the whole tree
process.on('exit', () => {
  treeKill(process.pid, 'SIGTERM');
});
