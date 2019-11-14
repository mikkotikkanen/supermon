const { spawn } = require('child_process');

module.exports = (cmd = '', args = [], opts = { cwd: '.' }) => new Promise((resolve, reject) => {
  if (!cmd) {
    return reject(new Error('cmd must be defined'));
  }

  // Run the command (make sure we have colors and pipe output to process buffer)
  const cmdArgs = [cmd, ...args, '--no-save', '--color always'];
  const child = spawn('npm', cmdArgs, {
    cwd: opts.cwd,
    shell: true,
    stdio: 'inherit',
  });

  // Handle promise on exit
  child.on('close', (code) => {
    const exitCode = code.toString();
    // console.log(`npm process exited with code ${exitCode}`);
    if (parseInt(exitCode, 10) === 0) {
      return resolve();
    }
    return reject();
  });

  return true;
});
