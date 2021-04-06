import treeKill from 'tree-kill';
import { existsSync } from 'fs';
import modules from './modules';
import watch from './watch';
import { runRestartable } from './child';
import logger from './logger';
import EventBus, {
  ChildEvents,
  ModulesEvents,
  ProcessEvents,
  WatchEvents,
} from './EventBus';


export interface LibProps {
  /**
   * Command for child process
   */
  command: string;

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
   * Executable to run the command with
   *
   * Default: "node"
   */
  exec?: string;

  /**
   * File extensions to watch
   */
  ext?: string[];

  /**
   * Wheter or not to do full sync on first run
   *
   * Default: false
   */
  skipFirstSync?: boolean;

  /**
   * Log things to console
   */
  logging?: boolean;

  /**
   * Use polling instead of file system events
   *
   * Useful for fe. running on Docker container where FS events arent propagated to host
   */
  legacywatch?: boolean;

  /**
   * Directory to watch file events for
   */
  watch?: string;
}


let isStarted = false;
let isBeingKilled = false;


/**
 * Setup main process
 */
export default ({
  command,
  debug = false,
  delay = 200,
  exec = 'node',
  ext,
  skipFirstSync = true,
  logging = true,
  legacywatch = false,
  watch: watchdir = '.',
}: LibProps): EventBus => {
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
    command,
    watch: watchdir,
    ext,
  };
  eventBus.emit(ProcessEvents.Start, props);

  // Setup watcher
  watch({
    eventBus,
    cwd: watchdir,
    polling: legacywatch,
    extensions: ext,
    delay,
  });
  eventBus.on(WatchEvents.FilesChanged, () => {
    // Only start emitting watch events once the child process is running
    if (isStarted) {
      eventBus.emit(ModulesEvents.Install);
    }
  });


  // Setup module handler
  modules({
    eventBus,
    firstRunSync: !skipFirstSync,
  });
  eventBus.on(ModulesEvents.Install, () => {
    eventBus.emit(WatchEvents.Disable);
  });
  eventBus.on(ModulesEvents.Installed, () => {
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
  runRestartable({
    eventBus,
    command: `${exec} ${command}`,
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
  eventBus.emit(ModulesEvents.Install);

  eventBus.on(ChildEvents.Stop, () => {
    isBeingKilled = true;
  });

  return eventBus;
};


// On process exit, make sure to kill the whole tree
process.on('exit', () => {
  treeKill(process.pid, 'SIGTERM');
});
