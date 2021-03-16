import { extname } from 'path';
import treeKill from 'tree-kill';
import { existsSync } from 'fs';
import { install } from './install';
import { watch } from './watch';
import { runRestartable } from './run';
import logger from './logger';
import LibEventBus from './LibEventBus';
import EventBus, { ChildEvents, InstallEvents, WatchEvents } from './EventBus';


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
   *
   * Default: true
   */
  firstRunSync?: boolean;
}


const libEventBus = new LibEventBus();
let isStarted = false;
let isBeingKilled = false;


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
  const eventBus = new EventBus({
    debug,
  });

  if (!existsSync(watchdir)) {
    throw new Error(`Path "${watchdir}" does not exist.`);
  }

  if (logging) {
    logger({
      eventBus,
    });
  }

  // Setup watcher
  watch({
    eventBus,
    cwd: watchdir,
    polling,
    extensions: (isTypeScript ? ['ts', 'tsx', 'json'] : ['js', 'mjs', 'jsx', 'json']),
    delay,
  });
  eventBus.on(WatchEvents.FilesChanged, () => {
    // Only start emitting watch events once the child process is running
    if (isStarted) {
      eventBus.emit(InstallEvents.Install);
    }
  });


  // Setup installer
  install({
    eventBus,
    firstRunSync,
  });
  eventBus.on(InstallEvents.Install, () => {
    eventBus.emit(WatchEvents.Disable);
  });
  eventBus.on(InstallEvents.Installed, () => {
    eventBus.emit(WatchEvents.Enable);

    // Only trigger restart if child process has been started already
    if (isStarted) {
      isStarted = false;
      eventBus.emit(ChildEvents.Restart);
    } else {
      eventBus.emit(ChildEvents.Start);
    }
  });


  // Setup the requested command
  const engine = (isTypeScript ? 'ts-node' : 'node');
  runRestartable({
    eventBus,
    command: `${engine} ${executable}`,
  });

  eventBus.on(ChildEvents.Started, () => {
    libEventBus.emit(libEventBus.Events.Started); // Temporary
    isStarted = true;
  });
  eventBus.on(ChildEvents.Restarted, () => {
    libEventBus.emit(libEventBus.Events.Restarted);
  });
  eventBus.on(ChildEvents.Stopped, (code) => {
    libEventBus.emit(libEventBus.Events.Stopped); // Temporary
    isStarted = false;

    // If we exited succesfully or we are getting killed, stop event watcher
    if (code === 0 || isBeingKilled) {
      eventBus.emit(WatchEvents.Stop);
    }
  });

  // Start with install
  eventBus.emit(InstallEvents.Install);

  libEventBus.onKill(() => {
    isBeingKilled = true;
    isStarted = false;
    eventBus.emit(ChildEvents.Stop);
  });

  return libEventBus;
};


// On process exit, make sure to kill the whole tree
process.on('exit', () => {
  treeKill(process.pid, 'SIGTERM');
});
