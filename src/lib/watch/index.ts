import { watch as chokidar, FSWatcher } from 'chokidar';
import EventBus, { WatchEvents } from '../EventBus';
import logger from '../logger/logger';


export type WatchProps = {
  /**
   * Event bus
   */
  eventBus: EventBus;

  /**
   * Working directory
   *
   * Default: '.'
   */
  cwd?: string;

  /**
   * Whether or not to use file polling instead of FS events
   *
   * Default: false
   */
  polling?: boolean;

  /**
   * Which file extensions to watch
   *
   * Default: ['js', 'mjs', 'json']
   */
  extensions?: string[];

  /**
   * Which paths to ignore
   *
   * Default: ['./node_modules', './docs', './git']
   */
  ignore?: string[];

  /**
   * How long to sleep (in ms) when file change event is detected
   *
   * Used to avoid triggering events on every file modifications on fe. `npm install`
   *
   * Default: 200
   */
  delay?: number;
}


let watcher: FSWatcher;
let isEnabled = true;

const watch = ({
  eventBus,
  cwd = '.',
  polling = false,
  extensions = ['js', 'mjs', 'json'],
  ignore = [],
  delay = 200,
}: WatchProps): void => {
  let debounceTimer: NodeJS.Timeout;
  const defaultIgnore = ['./node_modules', './docs', './git'];

  // Watch for file changes
  const watchPatterns = (extensions || []).map((ext) => `**/*.${ext}`);
  const ignorePatterns = [...ignore, ...defaultIgnore];
  watcher = chokidar(watchPatterns, {
    cwd,
    ignored: ignorePatterns,
    usePolling: polling,
  });

  watcher.on('change', () => {
    // Don't send events to the event emitter if watcher is disabled
    if (isEnabled) {
      // Debounce repeating events
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        logger.prefix();
        logger.prefix('File change(s) detected. Restarting child process...');
        logger.prefix();
        eventBus.emit(WatchEvents.FilesChanged);
      }, delay);
    }
  });


  // Set events to enable/disable the watcher
  eventBus.on(WatchEvents.Enable, () => { isEnabled = true; });
  eventBus.on(WatchEvents.Disable, () => {
    clearTimeout(debounceTimer);
    isEnabled = false;
  });

  eventBus.on(WatchEvents.Stop, () => {
    watcher.close();
    eventBus.emit(WatchEvents.Stopped);
  });
};

export default watch;
