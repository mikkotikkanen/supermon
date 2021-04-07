import { writeFileSync } from 'fs';
import { join } from 'path';
import getWorkDir from './lib/getWorkDir';
import lib from '../lib';
import EventBus, { ChildEvents } from '../lib/EventBus';

let workDir: string;
let appFile: string;
let touchFile: string;
let eventBus: EventBus;

beforeAll(() => {
  workDir = getWorkDir();
  appFile = join(workDir, '..', 'dist', 'test', 'apps', 'test-wait.js');
  touchFile = join(workDir, 'empty_touch_file.js');

  // Create the touchFile so that file watcher has something to watch
  writeFileSync(touchFile, '0', { encoding: 'utf8' });
});

// eslint-disable-next-line jest/expect-expect
test('Application should restart on file change', () => new Promise<void>((resolve) => {
  // The test doesn't work with .ts app file (executed by ts-node)
  appFile = join(workDir, '..', 'dist', 'test', 'apps', 'test-wait.js');
  touchFile = join(workDir, 'empty_touch_file.js');
  let isFirstStart = true;

  eventBus = lib({
    command: `${appFile} 1`,
    watch: workDir,
    delay: 10,
    logging: false,
    skipFirstSync: true,
    legacywatch: true,
    // debug: true,
  });

  eventBus.on(ChildEvents.Started, () => {
    if (isFirstStart) {
      isFirstStart = false;
      // Wait a bit to make sure watcher is initialized
      setTimeout(() => {
        writeFileSync(touchFile, `${process.hrtime.bigint()}`, { encoding: 'utf8' });
      }, 100);
    } else {
      resolve();
    }
  });
}));

afterAll(() => {
  // Make sure the process is killed
  eventBus.emit(ChildEvents.Stop);
});
