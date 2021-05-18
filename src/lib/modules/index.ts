import { join } from 'path';
import { existsSync } from 'fs';
import { satisfies } from 'semver';
import { childTask } from '../child';
import dependencyDiff, { Diff } from './dependencyDiff';
import LoadPackageJSON from './loadPackageJSON';
import { set, get } from './store';
import EventBus, { ModulesEvents } from '../EventBus';
import logger from '../logger/logger';

type modulesProps = {
  /**
   * Event bus
   */
  eventBus: EventBus;

  /**
   * Wheter or not do to the first run full sync
   */
  firstRunSync: boolean;

  /**
   * Package manager (fe. "npm", "yarn", "pnpm")
   */
  pmExec?: string;
}

const cwd = '.';
const packageJSONPath = join(cwd, 'package.json');
const nodeModulesPath = join(cwd, 'node_modules');


const modules = ({
  eventBus,
  pmExec = 'npm',
  firstRunSync = true,
}: modulesProps): void => {
  eventBus.on(ModulesEvents.Install, () => {
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

    new Promise<void>((resolve) => resolve())
      // Do diff between stored and current package.json
      .then(() => {
        if (storedPackageJSON) {
          const diffDependencies = dependencyDiff(
            storedPackageJSON.dependencies || {},
            packageJSON.dependencies || {},
          );
          const diffDevDependencies = dependencyDiff(
            storedPackageJSON.devDependencies || {},
            packageJSON.devDependencies || {},
          );
          // Combine dependency diffs
          missingDependencies = missingDependencies.concat(
            diffDependencies.added,
            diffDependencies.changed,
            diffDevDependencies.added,
            diffDevDependencies.changed,
          );
          extraDependencies = extraDependencies.concat(
            diffDependencies.removed,
            diffDevDependencies.removed,
          );
        }
      })

      // Filter out already handled modules
      .then(() => {
        missingDependencies = missingDependencies.filter((dependency) => {
          if (existsSync(join(nodeModulesPath, dependency.name))) {
            // Try to load the package.json for the module
            const modulePackageJson = LoadPackageJSON(join(nodeModulesPath, dependency.name, 'package.json'));

            // If the installed module package.json version satisfies the requested, skip it
            if (modulePackageJson && satisfies(modulePackageJson.version, dependency.version)) {
              return false;
            }
          }
          return true;
        });

        extraDependencies = extraDependencies.filter((dependency) => {
          // Skip any modules that are already uninstalled
          if (!existsSync(join(nodeModulesPath, dependency.name))) {
            return false;
          }
          return true;
        });
      })

      // Sync dependencies
      .then(async () => {
        if (!storedPackageJSON) {
          // No previously stored dependencies
          if (firstRunSync) {
            // eslint-disable-next-line max-len
            logger.prefix('First execution. Running full sync (install & prune)...');
            await childTask(`${pmExec} install --no-audit`);
            await childTask(`${pmExec} prune`);
          }
        } else if (storedPackageJSON && (missingDependencies.length || extraDependencies.length)) {
          logger.prefix('Syncing dependencies...');
          // Previously stored dependencies with changes
          if (missingDependencies.length) {
            await childTask(`${pmExec} install ${missingDependencies.map((module) => `${module.name}@${module.version}`).join(' ')} --no-audit`);
          }
          if (extraDependencies.length) {
            await childTask(`${pmExec} uninstall ${extraDependencies.map((module) => `${module.name}@${module.version}`).join(' ')}`);
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
        // Push installed event to message queue (make sure all message handlers are registered)
        setTimeout(() => {
          eventBus.emit(ModulesEvents.Installed);
        }, 0);
      })

      .catch(() => {
        logger.prefix('Failed dependency sync.');
      });
  });
};

export default modules;
