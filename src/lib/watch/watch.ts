import { watch as chokidar, FSWatcher } from "chokidar";
import { EventEmitter } from "events";
import { Events } from "./Events";
import debounce from "../utils/debounce";


/**
 * Set watch properties and defaults
 */
export interface IWatchProps {
  usePolling?: boolean,
}
const watchPropsDefaults: IWatchProps = {
  usePolling: false,
}

const events = new EventEmitter();
let watcher: FSWatcher;
let isEnabled = true;


export const watch = (props: IWatchProps = watchPropsDefaults) => {
  const defaultedProps = Object.assign({}, watchPropsDefaults, props);

  // Watch for file changes
  const watchExtensions = ['js', 'mjs', 'json'];

  watcher = chokidar(watchExtensions.map(ext => `**/*.${ext}`), {
    ignored: ['./node_modules', './dist', './docs'],
    usePolling: defaultedProps.usePolling,
  });

  // Debounced change event emitter (can't use anonymous function)
  const debouncedChangeEvent = debounce(() => {
    events.emit(Events.CHANGED);
  }, 200);

  watcher.on('change', () => {
    // Don't send events to the event emitter if watcher is disabled
    if (isEnabled) {
      debouncedChangeEvent();
    }
  });


  // Set events to enable/disable the watcher
  events.on(Events.ENABLE, () => { isEnabled = true; });
  events.on(Events.DISABLE, () => { isEnabled = false; });

  return events;
}
