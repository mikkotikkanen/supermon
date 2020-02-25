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
    watchDir: pathResolve(__dirname, '../../tmp'),
    // debug: true,
    logging: false,
  });

  eventBus.on(eventBus.Events.Started, () => {
    console.log('started lib...');
    if (!isStarted) {
      isStarted = true;

      // Even though process is running, wait a bit for it to initialize properly
      setTimeout(() => {
        console.log('touching file...');
        writeFileSync(touchFile, process.hrtime.bigint(), { encoding: 'utf8' });
      }, 100);
    } else {
      // Even though process is running, wait a bit for it to initialize properly
      setTimeout(() => {
        console.log('workfile value:', getValue(incrementFile));

        expect(getValue(incrementFile)).toEqual(1);

        setTimeout(done, 100);
      }, 100);
    }
  });
}, 10 * 1000);

afterAll(() => {
  eventBus.kill();
});
