import { EventEmitter } from "events"
import { join } from "path";
import { runOnce } from "../run";
import { Events } from "./Events";
import DependencyDiff, { Diff } from "./dependencyDiff";
import LoadPackageJSON from "./loadPackageJSON";
import { set, get } from "../store";


let events: EventEmitter;
const cwd = '.';
const packageJSONPath = join(cwd, 'package.json');


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
        // Sync missing/extra dependencies
        new Promise(resolve => resolve())
          .then(() => { console.log('Syncing dependencies...'); })
          .then(() => runOnce(`npm install ${missingDependencies.map(module => `${module.name}@${module.version}`).join(' ')} --no-audit`))
          .then(() => runOnce(`npm uninstall ${extraDependencies.map(module => `${module.name}@${module.version}`).join(' ')}`))
          .then(() => {
            set(packageJSON.name, packageJSON);
          })
          .then(() => {
            events.emit(Events.INSTALLED);
          })
          .catch(() => {
            throw new Error('Failed dependency sync.');
          });
      } else {
        // No dependencies to sync, continue
        // Push instant installed event to message queue in order to make sure all message handlers are registered
        setTimeout(() => {
          events.emit(Events.INSTALLED);
        }, 0);
      }

    } else {
      // First run, do full sync
      new Promise(resolve => resolve())
        .then(() => { console.log('Could not find previous dependencies, running full sync (install & prune)...'); })
        .then(() => runOnce('npm install --no-audit'))
        .then(() => runOnce('npm prune'))
        .then(() => {
          set(packageJSON.name, packageJSON);
        })
        .then(() => {
          events.emit(Events.INSTALLED);
        })
        .catch(() => {
          throw new Error('Failed first run dependency sync.');
        });
    }
  });

  return events;
}
