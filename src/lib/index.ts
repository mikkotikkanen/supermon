import { extname } from 'path';
import treeKill from 'tree-kill';
import { existsSync } from 'fs';
import install from './install';
import watch from './watch';
import { runRestartable } from './run';
import logger from './logger';
import EventBus, {
  ChildEvents,
  InstallEvents,
  ProcessEvents,
  WatchEvents,
} from './EventBus';


export interface LibProps {
  /**
   * Command for child process
   */
  executable: string;

  /**
   * Directory to watch file events for
   */
  watchdir?: string;

  /**
   * File extensions to watch
   */
  extensions?: string[];

  /**
   * Use polling instead of file system events
   *
   * Useful for fe. running on Docker container where FS events arent propagated to host
   */
  polling?: boolean;

  /**
   * Log things to console
   */
  logging?: boolean;

  /**
   * Debug flag. Log all events to console
   */
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
  extensions,
}: LibProps): EventBus => {
  const isTypeScript = extname(executable) === '.ts';
  const resolvedExtensions = extensions || (isTypeScript ? ['ts', 'tsx', 'json'] : ['js', 'mjs', 'jsx', 'json']);
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

  const props: LibProps = {
    executable,
    watchdir,
    extensions: resolvedExtensions,
  };
  eventBus.emit(ProcessEvents.Start, props);

  // Setup watcher
  watch({
    eventBus,
    cwd: watchdir,
    polling,
    extensions: resolvedExtensions,
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
    isStarted = true;
    isBeingKilled = false;
  });
  eventBus.on(ChildEvents.Stopped, (code) => {
    isStarted = false;

    // If we exited succesfully or we are getting killed, stop event watcher
    if (code === 0 || isBeingKilled) {
      eventBus.emit(WatchEvents.Stop);
    }
  });

  // Start with install
  eventBus.emit(InstallEvents.Install);

  eventBus.on(ChildEvents.Stop, () => {
    isBeingKilled = true;
  });

  return eventBus;
};


// On process exit, make sure to kill the whole tree
process.on('exit', () => {
  treeKill(process.pid, 'SIGTERM');
});
