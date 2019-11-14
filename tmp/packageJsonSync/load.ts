const fs = require('fs');

const defaultOpts = {
  throwIfNonExisting: true,
};
module.exports = (filename = '', opts = defaultOpts) => new Promise((resolve) => {
  // Load new package.json (default to empty)
  let pckg = {
    name: '',
    dependencies: {},
    devDependencies: {},
  };
  if (fs.existsSync(filename)) {
    const pckgString = fs.readFileSync(filename, { encoding: 'utf8' });
    try {
      pckg = JSON.parse(pckgString);
    } catch (err) {
      throw (err);
    }
  } else if (opts.throwIfNonExisting) {
    throw new Error(`File not found. (${filename})`);
  }

  resolve(pckg);
});