import { EventEmitter } from "events"
import { Events } from "./Events";
import { runOnce } from "../Run";
import DependencyDiff, { Diff } from "./DependencyDiff";
import LoadPackageJSON from "./LoadPackageJSON";
import { join } from "path";


let events: EventEmitter;
const cwd = '.';
const packageJSONPath = join(cwd, 'package.json');
const storedPackageJSONPath = join(cwd, 'package-stored.json');


/**
 * Run npm install with logging against diff array
 *
 * @param title Logging section title
 * @param diff Diff to run the install against
 */
const runInstall = (title: string, diff: Diff[]) => new Promise((resolve, reject) => {
  console.log('install diff:', diff);
  if (diff.length) {
    console.log(`${title}`);
    const installString = diff.map(module => `${module.name}@${module.version}`).join(' ');
    runOnce(`npm install ${installString} --no-audit`)
      .then(() => {
        console.log('');
      })
      .then(() => {
        console.log('runInstall, resolving');
        resolve();
      })
      .catch((err) => {
        console.log('runInstall, rejecting', err);
        reject(err);
      });

  } else {
    console.log('nothing to install, resolving');
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
    const storedPackageJSON = LoadPackageJSON(storedPackageJSONPath);

    // Compare dependencies
    if (storedPackageJSON) {
      const diffDependencies = DependencyDiff(storedPackageJSON.dependencies, packageJSON.dependencies);
      // const diffDevDependencies = dependencyDiff(storedPackageJSON.devDependencies, packageJSON.devDependencies);
      // const diffPeerDependencies = dependencyDiff(storedPackageJSON.peerDependencies, packageJSON.peerDependencies);
      console.log('diff', diffDependencies);
      new Promise(resolve => resolve())
        .then(() => runInstall('Installing missing dependencies...', diffDependencies.added))
        .then(() => {
          console.log('installed');
          events.emit(Events.INSTALLED);
        })
        .catch(() => {
          throw new Error('Failed to install dependencies.');
          console.log('catch');
        });

    } else {
      throw new Error('Failed to load stored package.json.');
    }
  });

  return events;
}
