#!/usr/bin/env node

import yargs from 'yargs';
import lib from '../lib/index';
import isDocker from '../lib/utils/isDocker';


// Detect if we are running inside docker container
// TODO: Can this really detect all docker images or should it be just a flag?
if (isDocker()) {
  console.log('running inside docker container');
  // also watch package.json
}

// if (argv._.length === 0) {
//   console.log('One executable must be provided.');
//   process.exit();
// }

// if (argv._.length > 1) {
//   console.log('Only one executable is allowed.');
//   process.exit();
// }

yargs.demandCommand(1);

yargs
  .option('usepolling', {
    describe: 'Use polling instead of filesystem events. (CPU and memory tax)',
  });

const { argv } = yargs;
lib({
  // executable: argv._[0],
  executable: process.argv.slice(2).join(' '),
  usepolling: argv.usepolling as boolean,
  debug: argv.debug as boolean,
});
