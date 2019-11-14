const path = require('path');
const { EventEmitter } = require('events');
const shelljs = require('shelljs');
const touch = require('touch');
const packageJsonCompare = require('./compare');
const packageJsonLoad = require('./load');
const installUninstall = require('../npm/installUninstall');

let pckgStoredFilename = ''; // Defined after app package.json is loaded
let pckgCurrent = {
  name: '',
  dependencies: {},
  devDependencies: {},
};
let pckgStored = {
  name: '',
  dependencies: {},
  devDependencies: {},
};
let pckgDiff = {
  missingModules: [],
  extraneousModules: [],
};


/**
 *
 * @param {object} opts
 * @param {string} opts.packageJsonFilename
 * @param {string} opts.appDir
 * @param {string} opts.dataDir
 * @param {string} opts.notifyFileWatchers
 */
const packageJsonSync = (opts) => {
  const eventStream = new EventEmitter();

  new Promise(resolve => resolve())
    // Load current application package.json
    .then(async () => {
      console.log('Loading current application package.json file...');
      pckgCurrent = await packageJsonLoad(opts.packageJsonFilename);
    })

    // Load stored package.json
    .then(async () => {
      // Make sure the directory exists
      shelljs.mkdir('-p', path.resolve(opts.dataDir, pckgCurrent.name));

      console.log('Loading stored package.json file...');
      pckgStoredFilename = path.resolve(opts.dataDir, pckgCurrent.name, 'package.json');
      pckgStored = await packageJsonLoad(pckgStoredFilename)
        // If file not found
        .catch((err) => {
          if (err.message === `File not found. (${pckgStoredFilename})`) {
            console.log('No previously stored package.json file found...');
          } else {
            throw err;
          }
        });
    })

    // Compare current and previously stored applications
    .then(async () => {
      pckgDiff = await packageJsonCompare(pckgStored, pckgCurrent);
    })

    // Install/uninstall things
    .then(() =>
      installUninstall(pckgDiff.missingModules, pckgDiff.extraneousModules, { cwd: opts.appDir }))

    .then(() => {
      // Store new package.json to the data volume
      if (pckgDiff.missingModules.length || pckgDiff.extraneousModules.length) {
        console.log('Storing current application package.json...');
        shelljs.cp(opts.packageJsonFilename, pckgStoredFilename);

        // Once installation is complete, touch files to let anyone watching know
        console.log(`All done. Notifying file watchers (${opts.notifyFileWatchers})...`);
        opts.notifyFileWatchers.split(',').forEach((file) => {
          touch(path.resolve(opts.appDir, file.trim()));
        });
      } else {
        console.log('No package.json mismatches found, all good.');
      }
    })

    // Handle errors
    .catch((err) => {
      console.log(err);
    });

  return eventStream;
};


module.exports = packageJsonSync;