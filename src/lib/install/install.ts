import { EventEmitter } from "events"
import { join } from "path";
import { runOnce } from "../run";
import { Events } from "./Events";
import DependencyDiff, { Diff } from "./dependencyDiff";
import LoadPackageJSON from "./loadPackageJSON";
import { set, get } from "./store";


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

    // Setup dependency diff maps
    let missingDependencies: Diff[] = [];
    let extraDependencies: Diff[] = [];

    new Promise(resolve => resolve())
      // Do diff between stored and current package.json
      .then(() => {
        if (storedPackageJSON) {
          const diffDependencies = DependencyDiff(storedPackageJSON.dependencies, packageJSON.dependencies);
          const diffDevDependencies = DependencyDiff(storedPackageJSON.devDependencies, packageJSON.devDependencies);
          missingDependencies = missingDependencies.concat(diffDependencies.added, diffDependencies.changed, diffDevDependencies.added, diffDevDependencies.changed);
          extraDependencies = extraDependencies.concat(diffDependencies.removed, diffDevDependencies.removed);
        }
      })

      // Sync dependencies
      .then(async () => {
        if (!storedPackageJSON) {
          // No previously stored dependencies
          console.log('Could not find previous dependencies, running full sync (install & prune)...');
          await runOnce('npm install --no-audit')
          await runOnce('npm prune')

        } else if (storedPackageJSON && (missingDependencies.length || extraDependencies.length)) {
          console.log('Syncing dependencies...');
          // Previously stored dependencies with changes
          if (missingDependencies.length) {
            await runOnce(`npm install ${missingDependencies.map(module => `${module.name}@${module.version}`).join(' ')} --no-audit`);
          }
          if (extraDependencies.length) {
            await runOnce(`npm uninstall ${extraDependencies.map(module => `${module.name}@${module.version}`).join(' ')}`);
          }
        }

        // Previously stored dependencies but no changes, just continue silently
      })

      // Store the current packageJson
      .then(() => {
        set(packageJSON.name, packageJSON);
      })

      // Send installed event
      .then(() => {
        // Push installed event to message queue in order to make sure all message handlers are registered
        setTimeout(() => {
          events.emit(Events.INSTALLED);
        }, 0);
      })

      .catch((err) => {
        // TODO: Add debug flag
        console.log('Error:', err);

        throw new Error('Failed dependency sync.');
      });
  });

  return events;
}
