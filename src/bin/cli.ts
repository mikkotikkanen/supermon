#!/usr/bin/env node

import yargs from 'yargs';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import updateNotifier from 'update-notifier';
import lib from '../lib/index';
import loadPackageJSON from '../lib/modules/loadPackageJSON';


const pckg = loadPackageJSON(join(__dirname, '..', '..', 'package.json'));

const argv = yargs
  .parserConfiguration({
    'unknown-options-as-args': true, // Make sure to pass all unknown options to the command
  })
  .env('SUPERMON')
  .config('config', 'Path to JSON config file', (filename: string) => {
    // Try reading potential config file
    let stringConfig = '';
    if (filename && existsSync(filename)) {
      stringConfig = readFileSync(filename, { encoding: 'utf8' });
    } else if (existsSync('nodemon.json')) {
      // If no config was found, try reading nodemon.json as well
      stringConfig = readFileSync('nodemon.json', { encoding: 'utf8' });
    }

    // Try parsing the loaded file
    let config = {};
    if (stringConfig) {
      try {
        config = JSON.parse(stringConfig);
      } catch (err) {
        console.error('Error parsing JSON configuration:', err.toString());
        console.error('Try using a JSON validator.');
        process.exit(1);
      }
    }

    return config;
  })
  .default('config', 'supermon.json')
  .pkgConf('supermon')
  .pkgConf('nodemonConfig') // If supermon config is not find, try nodemon instead
  .option('watch', {
    describe: 'Directory to watch for file changes',
    default: '.',
    type: 'string',
    alias: 'w',
  })
  .option('ext', {
    describe: 'Comma separated list of file extensions to watch',
    type: 'string',
    array: true,
    alias: 'e',
  })
  .option('ignore', {
    describe: 'Directories to ignore for file changes',
    type: 'string',
    array: true,
    alias: 'i',
  })
  .option('delay', {
    describe: 'How many ms to wait after file changes',
    default: 1000,
    type: 'number',
  })
  .option('exec', {
    describe: 'Executable to run the command on',
    type: 'string',
    alias: 'x',
  })
  .option('legacywatch', {
    describe: 'Use polling instead of FS events',
    type: 'boolean',
    alias: ['L', 'legacy-watch'],
  })
  .option('pmexec', {
    describe: 'Package manager executable to use',
    default: 'npm',
    type: 'string',
  })
  .option('skipfirstsync', {
    describe: "Don't do full sync on first run",
    type: 'boolean',
  })
  .version(true) // Set custom version option to avoid "[boolean]" flag in help
  .option('version', {
    describe: 'Show version number',
    type: 'boolean',
  })
  .help(false) // Set custom help option to avoid "[boolean]" flag in help
  .option('help', {
    describe: 'Show help',
    type: 'boolean',
  })
  .option('debug', {
    describe: 'Show debug information',
    type: 'boolean',
    alias: ['V', 'verbose'],
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
  console.log('Note: If both, supermon and application arguments are provided, it is recommended');
  console.log('      to use "--" as separator between supermon and application command & arguments.');
  console.log('      Example: "supermon --delay=2000 -- app.js --port=80"');
  console.log('');
  console.log('Note: Boolean options do not require value to be specified');
  console.log('');
  console.log('Example use: "supermon app.js"');
  console.log('Example use: "supermon --delay=2000 -- app.js --port=80"');
  process.exit(); /* eslint-disable-line no-process-exit */
}

// Set update-notifier
if (pckg) {
  updateNotifier({
    pkg: pckg,
  });
}


const { argv: args } = argv;
// args.legacywatch = args.legacyWatch || args.legacywatch;

let exec = args.exec || 'node';
let command = args._.join(' ');
let ext = args.ext || ['js', 'mjs', 'jsx', 'json'];

// Handle TypeScript commands
if (extname(command) === '.ts') {
  exec = 'ts-node';
  ext = ext || ['ts', 'tsx', 'json'];
}
// Handle NPM script as command
if (command.match(/^npm /)) {
  exec = 'npm';
  command = command.replace('npm ', '');
}

lib({
  debug: args.debug,
  delay: args.delay,
  command,
  ext,
  exec,
  pmExec: args.pmexec,
  ignore: args.ignore,
  legacywatch: args.legacywatch,
  skipFirstSync: args.skipfirstsync,
  watch: args.watch,
});
