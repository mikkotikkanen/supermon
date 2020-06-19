import { watch as chokidar, FSWatcher } from 'chokidar';
import WatchEventBus from './WatchEventBus';


export type WatchProps = {
  /**
   * Working directory (default: '.')
   */
  cwd?: string;

  /**
   * Whether or not to use file polling instead of FS events (default: false)
   */
  polling?: boolean;

  /**
   * Which file extensions to watch (default: ['js', 'mjs', 'json'])
   */
  extensions?: Array<string>;

  /**
   * Which paths to ignore (default: ['./node_modules', './docs'])
   */
  ignore?: Array<string>;
}


const eventBus = new WatchEventBus();
let watcher: FSWatcher;
let isEnabled = true;

const watch = ({
  cwd = '.',
  polling = false,
  extensions = ['js', 'mjs', 'json'],
  ignore = ['./node_modules', './docs'],
}: WatchProps): WatchEventBus => {
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
        eventBus.emit(eventBus.Events.FilesChanged);
      }, 200);
    }
  });


  // Set events to enable/disable the watcher
  eventBus.on(eventBus.Events.Enable, () => { isEnabled = true; });
  eventBus.on(eventBus.Events.Disable, () => {
    clearTimeout(debounceTimer);
    isEnabled = false;
  });

  return eventBus;
};

export default watch;
