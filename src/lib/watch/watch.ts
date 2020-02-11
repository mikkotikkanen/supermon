import { watch as chokidar, FSWatcher } from 'chokidar';
import debounce from '../utils/debounce';
import WatchEventBus from './WatchEventBus';


/**
 * Set watch properties and defaults
 */
export interface WatchProps {
  cwd?: string;
  usePolling?: boolean;
}
const watchPropsDefaults: WatchProps = {
  cwd: '.',
  usePolling: false,
};

const eventBus = new WatchEventBus();
let watcher: FSWatcher;
let isEnabled = true;


export const watch = (props: WatchProps = watchPropsDefaults): WatchEventBus => {
  const defaultedProps = { ...watchPropsDefaults, ...props };

  // Watch for file changes
  const watchExtensions = ['js', 'mjs', 'json'];

  watcher = chokidar(watchExtensions.map((ext) => `**/*.${ext}`), {
    cwd: defaultedProps.cwd,
    ignored: ['./node_modules', './docs'],
    usePolling: defaultedProps.usePolling,
  });

  // Debounced change event emitter (can't use anonymous function)
  const debouncedChangeEvent = debounce(() => {
    eventBus.emit(eventBus.Events.FilesChanged);
  }, 200);

  watcher.on('change', () => {
    // Don't send events to the event emitter if watcher is disabled
    if (isEnabled) {
      debouncedChangeEvent();
    }
  });


  // Set events to enable/disable the watcher
  eventBus.on(eventBus.Events.Enable, () => { isEnabled = true; });
  eventBus.on(eventBus.Events.Disable, () => { isEnabled = false; });

  return eventBus;
};
