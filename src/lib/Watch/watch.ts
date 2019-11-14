import { watch as chokidar, FSWatcher } from "chokidar";
import { EventEmitter } from "events";
import { Events } from "./Events";



const events = new EventEmitter();
let watcher: FSWatcher;

export const watch = () => {
  // Watch for file changes
  // TODO: Add debounce for events
  const watchExtensions = ['js', 'mjs', 'json'];
  watcher = chokidar(watchExtensions.map(ext => `**/*.${ext}`), {
    ignored: ['./node_modules', './dist', './docs'],
  });
  watcher.on('change', () => {
    console.log('');
    console.log('Files changed, restarting...');
    console.log('');
    events.emit(Events.CHANGED);
  });

  return events;
}
