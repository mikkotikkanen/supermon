#!/usr/bin/env node

import yargs from 'yargs';
import { readFileSync } from 'fs';
import { join } from 'path';
import updateNotifier from 'update-notifier';
import lib from '../lib/index';
import loadPackageJSON from '../lib/modules/loadPackageJSON';

const pckg = loadPackageJSON(join(__dirname, '..', '..', 'package.json'));

yargs
  .parserConfiguration({
    'unknown-options-as-args': true, // Make sure to pass all unknown options to the executable
  })
  .env('SUPERMON')
  .option('watchdir', {
    // type: 'string',
    describe: 'Which directory to watch for changes',
    default: '.',
  })
  .option('extensions', {
    // type: 'string',
    describe: 'Comma separated list of file extensions to watch',
  })
  .option('delay', {
    // type: 'number',
    describe: 'How many ms to wait after file changes',
    default: 200,
  })
  .option('polling', {
    // type: 'boolean',
    describe: 'Use polling (CPU and memory tax)',
  })
  .option('noFirstRunSync', {
    // type: 'boolean',
    describe: "Don't do full sync on first run",
  })
  .option('debug', {
    // type: 'boolean',
    describe: 'Show debug information',
  })
  .version(false) // Set custom version option to avoid "[boolean]" flag in help
  .option('version', {
    describe: 'Show version number',
  })
  .help(false) // Set custom help option to avoid "[boolean]" flag in help
  .option('help', {
    describe: 'Show help',
  });

// Show help and version manually
if (yargs.argv.version) {
  const packageJsonString = readFileSync(join(__dirname, '../../package.json'), { encoding: 'utf8' });
  const packageJson = JSON.parse(packageJsonString);
  console.log(packageJson.version);
  process.exit(); /* eslint-disable-line no-process-exit */
}
if (yargs.argv.help) {
  yargs.showHelp('log');
  console.log('');
  console.log('Note: If supermon arguments are provided, it is recommended to use "--" as separator between supermon and application');
  console.log('');
  console.log('Note: [boolean] options do not require value to be specified');
  console.log('');
  console.log('Note: All options can also be configured through environment variables with');
  console.log('      "SUPERMON_" prefix. (fe. "SUPERMON_POLLING=true")');
  console.log('');
  console.log('Example use: "supermon app.js"');
  console.log('Example use: "supermon --watchdir=dist -- app.js --port=80"');
  process.exit(); /* eslint-disable-line no-process-exit */
}

// Set update-notifier
if (pckg) {
  updateNotifier({
    pkg: pckg,
  });
}


const { argv } = yargs;

let extensions;
if (argv.extensions) {
  extensions = (argv.extensions as string || '').split(',');
}

lib({
  command: argv._.join(' '),
  debug: argv.debug as boolean,
  delay: argv.delay as number,
  extensions,
  firstRunSync: argv.firstRunSync as boolean,
  polling: !argv.noFirstRunSync as boolean,
  watchdir: argv.watchdir as string,
});
