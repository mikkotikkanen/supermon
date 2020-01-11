import { watch as chokidar, FSWatcher } from "chokidar";
import { EventEmitter } from "events";
import { Events } from "./Events";
import debounce from "../utils/debounce";



const events = new EventEmitter();
let watcher: FSWatcher;

export const watch = () => {
  // Watch for file changes
  // TODO: Add debounce for events
  const watchExtensions = ['js', 'mjs', 'json'];
  watcher = chokidar(watchExtensions.map(ext => `**/*.${ext}`), {
    ignored: ['./node_modules', './dist', './docs'],
    usePolling: true,
  });
  watcher.on('change', debounce(() => {
    events.emit(Events.CHANGED);
  }, 1000));

  return events;
}
