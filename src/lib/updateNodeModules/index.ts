import { join } from 'path';
import dependencyDiff from './DependencyDiff';
import LoadPackageJSON from './LoadPackageJSON';
import { runOnce } from '../Run';
import { Diff } from '../Install/DependencyDiff';

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
  if (diff.length) {
    console.log(`${title}`);
    const installString = diff.map(module => `${module.name}@${module.version}`).join(' ');
    return runOnce(`npm install ${installString} --no-audit`)
      .then(() => {
        console.log('');
      })
      .then(resolve)
      .catch(reject);

  } else {
    resolve();
  }
});


export default () => new Promise((resolve, reject) => {

  // Load main package.json
  const packageJSON = LoadPackageJSON(packageJSONPath);
  if (!packageJSON) {
    throw new Error('Failed to load package.json');
  }

  // Load stored package.json
  const storedPackageJSON = LoadPackageJSON(storedPackageJSONPath);

  // Compare dependencies
  if (storedPackageJSON) {
    const diffDependencies = dependencyDiff(storedPackageJSON.dependencies, packageJSON.dependencies);
    // const diffDevDependencies = dependencyDiff(storedPackageJSON.devDependencies, packageJSON.devDependencies);
    // const diffPeerDependencies = dependencyDiff(storedPackageJSON.peerDependencies, packageJSON.peerDependencies);

    new Promise(resolve => resolve())
      .then(() => runInstall('Installing missing dependencies...', diffDependencies.added))
      .then(resolve)
      .catch(reject);

  } else {
    console.log('No previously stored package.json found.');
    resolve();
  }
});
