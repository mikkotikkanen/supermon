// import { writeFileSync } from 'fs';
// import { join } from 'path';
// import { clean, getValue } from './apps/libs/incrementer';
// import getWorkDir from './lib/getWorkDir';
// import lib from '../lib';

// const incrementFile = 'restart_incrementer';
// const workDir = getWorkDir();
// const touchFile = join(workDir, 'empty_touch_file.js');


// test('restart', () => {
//   clean(incrementFile);

//   lib({
//     executable: `../../dist/test/apps/restartIncrementer.js ${incrementFile}`,
//     watchDir: '../../tmp',
//   });

//   // touch file
//   writeFileSync(touchFile, process.hrtime.bigint(), { encoding: 'utf8' });

//   expect(getValue(incrementFile)).toEqual(2);
// });
