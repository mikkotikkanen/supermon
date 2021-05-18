import treeKill from 'tree-kill';
import { existsSync } from 'fs';
import { join } from 'path';
import modules from './modules';
import watch from './watch';
import { childProcess } from './child';
import EventBus, {
  ChildEvents,
  ModulesEvents,
  ProcessEvents,
  WatchEvents,
} from './EventBus';
import logger from './logger/logger';
import loadPackageJSON from './modules/loadPackageJSON';


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
   * Which file paths to ignore
   */
  ignore?: string[];

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
   * Wheter or not to do full sync on first run
   *
   * Default: false
   */
  skipFirstSync?: boolean;

  /**
   * Directory to watch file events for
   */
  watch?: string;

  /**
   * Package manager (fe. "npm", "yarn", "pnpm")
   */
  pmExec?: string;
}


let isStarted = false;
let isBeingKilled = false;

const pckg = loadPackageJSON(join(__dirname, '..', '..', 'package.json'));
if (!pckg) {
  throw new Error('Failed to load module package.json');
}

/**
 * Setup main process
 *
 * Set sensible defaults
 */
export default ({
  command,
  debug = false,
  delay = 200,
  exec = 'node',
  ext = ['js', 'mjs', 'jsx', 'json'],
  legacywatch = false,
  logging = true,
  skipFirstSync = false,
  pmExec = 'npm',
  watch: watchdir = '.',
  ignore = [],
}: LibProps): EventBus => {
  const eventBus = new EventBus({
    debug,
  });

  if (!existsSync(watchdir)) {
    throw new Error(`Path "${watchdir}" does not exist.`);
  }

  // Enable/disable logger
  logger.enabled(logging);

  const props: LibProps = {
    command,
    delay,
    exec,
    ext,
    legacywatch,
    watch: watchdir,
  };
  eventBus.emit(ProcessEvents.Start, props);

  // Setup watcher
  watch({
    eventBus,
    cwd: watchdir,
    extensions: ext,
    delay,
    ignore,
    polling: legacywatch,
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
    pmExec,
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
  childProcess({
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
  eventBus.on(ChildEvents.Stopped, () => {
    logger.prefix('Child process exited.');
  });

  logger.prefix();
  logger.prefix(`v${pckg.version}`);
  logger.prefix(`Child process: ${exec} ${command}`);
  logger.prefix(`Watching directory: ${watchdir}`);
  logger.prefix(`Watching extensions: ${ext?.join(',')}`);
  logger.prefix(`Watch delay: ${delay}ms`);
  if (legacywatch) {
    logger.prefix('Using legacywatch');
  }
  logger.prefix();

  return eventBus;
};


// On process exit, make sure to kill the whole tree
process.on('exit', () => {
  treeKill(process.pid, 'SIGTERM');
});
