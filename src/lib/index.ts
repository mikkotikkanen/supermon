import { extname } from 'path';
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
   * File extensions to watch
   */
  extensions?: string[];

  /**
   * Wheter or not to do full sync on first run
   *
   * Default: true
   */
  firstRunSync?: boolean;

  /**
   * Log things to console
   */
  logging?: boolean;

  /**
   * Use polling instead of file system events
   *
   * Useful for fe. running on Docker container where FS events arent propagated to host
   */
  polling?: boolean;

  /**
   * Directory to watch file events for
   */
  watchdir?: string;
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
  extensions,
  firstRunSync = true,
  logging = true,
  polling = false,
  watchdir = '.',
}: LibProps): EventBus => {
  // Default to node
  let executable = 'node';
  let resolvedExtensions = extensions || ['js', 'mjs', 'jsx', 'json'];
  if (command.match(/^npm /)) {
    // NPM script
    executable = ''; // Command includes executable
  } else if (extname(command) === '.ts') {
    // TypeScript
    executable = 'ts-node';
    resolvedExtensions = extensions || ['ts', 'tsx', 'json'];
  }

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
      eventBus.emit(ModulesEvents.Install);
    }
  });


  // Setup installer
  modules({
    eventBus,
    firstRunSync,
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
    // If no executable is defined, just run command
    command: (executable === '' ? `${command}` : `${executable} ${command}`),
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
