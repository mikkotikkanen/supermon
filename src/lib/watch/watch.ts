import { watch as chokidar, FSWatcher } from "chokidar";
import { EventEmitter } from "events";
import { Events } from "./Events";
import debounce from "../utils/debounce";


export interface IWatchProps {
  usePolling: boolean,
}
const watchPropsDefaults: IWatchProps = {
  usePolling: false,
}

const events = new EventEmitter();
let watcher: FSWatcher;

export const watch = (props: IWatchProps = watchPropsDefaults) => {

  const defaultedProps = Object.assign({}, watchPropsDefaults, props);

  // Watch for file changes
  // TODO: Add debounce for events
  const watchExtensions = ['js', 'mjs', 'json'];
  watcher = chokidar(watchExtensions.map(ext => `**/*.${ext}`), {
    ignored: ['./node_modules', './dist', './docs'],
    usePolling: defaultedProps.usePolling,
  });
  watcher.on('change', debounce(() => {
    events.emit(Events.CHANGED);
  }, 1000));

  return events;
}
