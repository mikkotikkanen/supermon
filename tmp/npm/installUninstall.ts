const npmCmd = require('./runCmd');

const defaultOpts = {
  cwd: '.',
};

const installUninstall = async (install = [], uninstall = [], opts = defaultOpts) => {
  // pckgDiff.extraneousModules.push({ name: 'async' });
  if (install.length) {
    const missingModulesArr = install.map(module => `${module.name}@${module.version}`);
    console.log(`Installing missing/mismatched modules: ${missingModulesArr.join(' ')}`);
    await npmCmd('install', missingModulesArr, opts);
  }
  if (uninstall.length) {
    const extraneousModulesArr = uninstall.map(module => module.name);
    console.log(`Uninstalling extraneous modules: ${extraneousModulesArr.join(' ')}`);
    await npmCmd('uninstall', extraneousModulesArr, opts);
  }
};

module.exports = installUninstall;
