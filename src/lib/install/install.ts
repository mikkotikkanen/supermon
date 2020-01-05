import { EventEmitter } from "events"
import { join } from "path";
import { runOnce } from "../Run";
import { Events } from "./Events";
import DependencyDiff, { Diff } from "./dependencyDiff";
import LoadPackageJSON from "./loadPackageJSON";
import { set, get } from "../store";


let events: EventEmitter;
const cwd = '.';
const packageJSONPath = join(cwd, 'package.json');
const storedPackageJSONPath = join(cwd, 'package-stored.json');


/**
 * Run npm install with logging against diff array
 *
 * @param diff Diff to run the install against
 * @param extraParams Extra params for npm install
 */
const runNpmCommand = (cmd: string, diff: Diff[], extraParams: string = '') => new Promise((resolve, reject) => {
  if (diff.length) {
    const installString = diff.map(module => `${module.name}@${module.version}`).join(' ');
    runOnce(`npm ${cmd} ${installString} --no-audit ${extraParams}`)
      .then(() => {
        console.log('');
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });

  } else {
    resolve();
  }
});


export const install = () => {
  events = new EventEmitter();

  events.on(Events.INSTALL, () => {
    // Load main package.json
    const packageJSON = LoadPackageJSON(packageJSONPath);
    if (!packageJSON) {
      throw new Error('Failed to load package.json');
    }

    // Load stored package.json
    const storedPackageJSON = get(packageJSON.name);

    // Compare dependencies
    if (storedPackageJSON) {
      // Do diff between stored and current package.json
      const diffDependencies = DependencyDiff(storedPackageJSON.dependencies, packageJSON.dependencies);
      const diffDevDependencies = DependencyDiff(storedPackageJSON.devDependencies, packageJSON.devDependencies);

      // Collect missing and extra dependencies
      let missingDependencies: Diff[] = [];
      missingDependencies = missingDependencies.concat(diffDependencies.added, diffDependencies.changed, diffDevDependencies.added, diffDevDependencies.changed);
      let extraDependencies: Diff[] = [];
      extraDependencies = extraDependencies.concat(diffDependencies.removed, diffDevDependencies.removed);

      if (missingDependencies.length || extraDependencies.length) {
        new Promise(resolve => resolve())
          .then(() => { console.log('Installing missing dependencies...'); })
          .then(() => runNpmCommand('install', missingDependencies))
          .then(() => runNpmCommand('uninstall', extraDependencies))
          .then(() => {
            set(packageJSON.name, packageJSON);
          })
          .then(() => {
            events.emit(Events.INSTALLED);
          })
          .catch(() => {
            throw new Error('Failed to install dependencies.');
          });
      } else {
        // Push instant installed event to message queue in order to make sure all message handlers are registered
        setTimeout(() => {
          events.emit(Events.INSTALLED);
        }, 0);
      }

    } else {
      throw new Error('Failed to load stored package.json.');
    }
  });

  return events;
}
