import { watch as chokidar, FSWatcher } from 'chokidar';
import debounce from '../utils/debounce';
import WatchEventBus from './WatchEventBus';


/**
 * Set watch properties and defaults
 */
export interface WatchProps {
  cwd?: string;
  polling?: boolean;
  extensions?: Array<string>;
  ignore?: Array<string>;
}
const watchPropsDefaults: WatchProps = {
  cwd: '.',
  polling: false,
  extensions: ['js', 'mjs', 'json'],
  ignore: ['./node_modules', './docs'],
};

const eventBus = new WatchEventBus();
let watcher: FSWatcher;
let isEnabled = true;


export default (props: WatchProps = watchPropsDefaults): WatchEventBus => {
  const defaultedProps = { ...watchPropsDefaults, ...props };

  // Watch for file changes
  const watchPatterns = (defaultedProps.extensions || []).map((ext) => `**/*.${ext}`);
  watcher = chokidar(watchPatterns, {
    cwd: defaultedProps.cwd,
    ignored: (defaultedProps.ignore || []),
    usePolling: defaultedProps.polling,
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
