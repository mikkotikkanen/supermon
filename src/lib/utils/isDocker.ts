import { statSync, readFileSync } from 'fs';

let isDocker = false;

function hasDockerEnv(): boolean {
  try {
    statSync('/.dockerenv');
    return true;
  } catch (err) {
    return false;
  }
}

function hasDockerCGroup(): boolean {
  try {
    return readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch (err) {
    return false;
  }
}

export default (): boolean => {
  if (isDocker === undefined) {
    isDocker = hasDockerEnv() || hasDockerCGroup();
  }

  return isDocker;
};
