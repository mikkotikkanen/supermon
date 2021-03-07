/* eslint-disable jest/no-done-callback */
/* eslint-disable jest/no-conditional-expect */
import { writeFileSync } from 'fs';
import { join, resolve as pathResolve } from 'path';
import { clean, getValue } from './apps/libs/incrementer';
import getWorkDir from './lib/getWorkDir';
import lib from '../lib';
import LibEventBus from '../lib/LibEventBus';

const workDir = getWorkDir();
const appFile = join(workDir, '..', 'dist', 'test', 'apps', 'test-incrementer.js');
const incrementFile = 'restart_incrementer';
const touchFile = join(workDir, 'empty_touch_file.js');
let isStarted = false;


let eventBus: LibEventBus;

beforeAll(() => {
  clean(incrementFile);
});

test('restart', (done) => {
  eventBus = lib({
    executable: `${appFile} ${incrementFile}`,
    watchdir: pathResolve(__dirname, '../../tmp'),
    // debug: true,
    logging: false,
  });

  eventBus.on(eventBus.Events.Started, () => {
    if (!isStarted) {
      isStarted = true;

      expect(getValue(incrementFile)).toEqual(0);

      // Wait a bit to make sure watcher is initialized
      setTimeout(() => {
        writeFileSync(touchFile, `${process.hrtime.bigint()}`, { encoding: 'utf8' });
      }, 100);
    } else {
      // Wait a bit to make sure incrementer has written the file
      setTimeout(() => {
        expect(getValue(incrementFile)).toEqual(2);

        // setTimeout(done, 100);
        done();
      }, 100);
    }
  });
}, 10 * 1000);

afterAll(() => {
  eventBus.kill();
});
