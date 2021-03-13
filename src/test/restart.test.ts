import { writeFileSync } from 'fs';
import { join, resolve as pathResolve } from 'path';
import getWorkDir from './lib/getWorkDir';
import lib from '../lib';
import LibEventBus from '../lib/LibEventBus';

const workDir = getWorkDir();
const touchFile = join(workDir, 'empty_touch_file.js');

let eventBus: LibEventBus;

test('Application should restart on file change', () => new Promise<void>((resolve) => {
  // For some reason test doesn't work with .ts file (executed by ts-node)
  const appFile = join(workDir, '..', 'dist', 'test', 'apps', 'test-wait.js');

  eventBus = lib({
    executable: `${appFile} 5`,
    watchdir: pathResolve(__dirname, '../../tmp'),
    delay: 10,
    logging: false,
    firstRunSync: false,
    polling: true,
    debug: true,
  });

  eventBus.on(eventBus.Events.Started, () => {
    console.log('started...');
    // Wait a bit to make sure watcher is initialized
    setTimeout(() => {
      console.log('touching...');
      writeFileSync(touchFile, `${process.hrtime.bigint()}`, { encoding: 'utf8' });
    }, 100);
  });

  eventBus.on(eventBus.Events.Restarted, () => {
    console.log('restarting...');
    expect(true).toBeTruthy();
    resolve();
  });

  // Wait for some time since the first execution does full install
}), 20 * 1000);

afterAll(() => {
  // Make sure the process is killed
  eventBus.kill();
});
