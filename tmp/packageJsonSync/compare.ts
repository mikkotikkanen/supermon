/**
 * Compare two package.json dependencies
 */

/**
 * Get differences between two objects
 *
 * @param {object} objA Object A
 * @param {object} objB Object B
 */
const objDiff = (objA, objB) => {
  const result = [];
  Object.keys(objA).map((module) => {
    if (objA[module] !== objB[module]) {
      result.push({
        name: module,
        version: objA[module],
      });
    }
    return true;
  });

  return result;
};


const pckgJsonInit = {
  name: '',
  dependencies: {},
  devDependencies: {},
};

module.exports = (pckgJsonA = pckgJsonInit, pckgJsonB = pckgJsonInit) => new Promise((resolve) => {
  // Collect changes between new and current package.json
  let missing = [];
  let extra = [];
  if (pckgJsonB.dependencies) {
    console.log('Looking for differences in dependencies...');
    // Collect modules which are missing from the current package.json
    missing = missing.concat(objDiff(pckgJsonB.dependencies, pckgJsonA.dependencies));
    // Collect modules which have been removed and should be missing from the old package.json
    extra = extra.concat(objDiff(pckgJsonA.dependencies, pckgJsonB.dependencies));
  }

  if (pckgJsonB.devDependencies) {
    console.log('Looking for differences in devDependencies...');
    // Collect modules which are missing from the current package.json
    missing = missing.concat(objDiff(pckgJsonB.devDependencies, pckgJsonA.devDependencies));
    // Collect modules which have been removed and should be missing from the old package.json
    extra = extra.concat(objDiff(pckgJsonA.devDependencies, pckgJsonB.devDependencies));
  }

  resolve({
    missingModules: missing,
    extraneousModules: extra,
  });
});