import { writeFileSync, existsSync } from 'fs';
import { join, resolve as pathResolve } from 'path';
import { clean, getValue } from './apps/libs/incrementer';
import getWorkDir from './lib/getWorkDir';
import lib from '../lib';

const workDir = getWorkDir();
const appFile = join(workDir, '..', 'dist', 'test', 'apps', 'test-incrementer.js');
const incrementFile = 'restart_incrementer';
const touchFile = join(workDir, 'empty_touch_file.js');
let isStarted = false;


if (!existsSync(appFile)) {
  throw new Error('Could not find app file.');
}

clean(incrementFile);

const events = lib({
  executable: `${appFile} ${incrementFile}`,
  watchDir: pathResolve(__dirname, '../../tmp'),
  // debug: true,
});

events.on('started', () => {
  console.log('started lib...');

  console.log('workfile value:', getValue(incrementFile));

  if (!isStarted) {
    isStarted = true;

    console.log('touching file...');
    setTimeout(() => {
      writeFileSync(touchFile, process.hrtime.bigint(), { encoding: 'utf8' });
    }, 1000);
  } else {
    setTimeout(() => {
      console.log('workfile value:', getValue(incrementFile));

      events.emit('kill');

      console.log('all done');
    }, 1000);
  }
});
