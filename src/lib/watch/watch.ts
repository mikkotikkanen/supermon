import { watch as chokidar, FSWatcher } from 'chokidar';
import EventBus, { WatchEvents } from '../EventBus';


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
  extensions?: Array<string>;

  /**
   * Which paths to ignore
   *
   * Default: ['./node_modules', './docs']
   */
  ignore?: Array<string>;

  /**
   * How long to sleep (in ms) when file change event is detected
   *
   * Used to avoid triggering events on every file modifications on fe. `npm install`
   *
   * Default: 200
   */
  delay?: number;
}


// const eventBus = new WatchEventBus();
let watcher: FSWatcher;
let isEnabled = true;

const watch = ({
  eventBus,
  cwd = '.',
  polling = false,
  extensions = ['js', 'mjs', 'json'],
  ignore = ['./node_modules', './docs'],
  delay = 200,
}: WatchProps): void => {
  // const defaultedProps = { ...watchPropsDefaults, ...props };
  let debounceTimer: NodeJS.Timeout;

  // Watch for file changes
  const watchPatterns = (extensions || []).map((ext) => `**/*.${ext}`);
  watcher = chokidar(watchPatterns, {
    cwd,
    ignored: (ignore || []),
    usePolling: polling,
  });

  watcher.on('change', () => {
    // Don't send events to the event emitter if watcher is disabled
    if (isEnabled) {
      // Debounce repeating events
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
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
