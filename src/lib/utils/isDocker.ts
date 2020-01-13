const fs = require('fs');

let isDocker = false;

function hasDockerEnv() {
  try {
    fs.statSync('/.dockerenv');
    return true;
  } catch (err) {
    return false;
  }
}

function hasDockerCGroup() {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch (err) {
    return false;
  }
}

export default () => {
  if (isDocker === undefined) {
    isDocker = hasDockerEnv() || hasDockerCGroup();
  }

  return isDocker;
};
