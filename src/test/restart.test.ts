import { writeFileSync } from 'fs';
import { join } from 'path';
import getWorkDir from './lib/getWorkDir';
import lib from '../lib';
import EventBus, { ChildEvents } from '../lib/EventBus';
// import LibEventBus from '../lib/LibEventBus';

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

test('Application should restart on file change', () => new Promise<void>((resolve) => {
  // The test doesn't work with .ts app file (executed by ts-node)
  appFile = join(workDir, '..', 'dist', 'test', 'apps', 'test-wait.js');
  touchFile = join(workDir, 'empty_touch_file.js');

  eventBus = lib({
    executable: `${appFile} 1`,
    watchdir: workDir,
    delay: 10,
    logging: false,
    firstRunSync: false,
    polling: true,
    // debug: true,
  });

  eventBus.on(ChildEvents.Started, () => {
    // Wait a bit to make sure watcher is initialized
    setTimeout(() => {
      writeFileSync(touchFile, `${process.hrtime.bigint()}`, { encoding: 'utf8' });
    }, 100);
  });

  eventBus.on(ChildEvents.Restarted, () => {
    expect(true).toBeTruthy();
    resolve();
  });
}));

afterAll(() => {
  // Make sure the process is killed
  // eventBus.kill();
  eventBus.emit(ChildEvents.Stop);
});
