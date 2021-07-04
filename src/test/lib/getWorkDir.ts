import { existsSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import rimraf from 'rimraf';

const dirPath = join(__dirname, '..', '..', '..', 'tmp');

export default (): string => {
  try {
    if (existsSync(dirPath)) {
      // rmdirSync(dirPath, { recursive: true });
      rimraf.sync(dirPath);
    }
    mkdirSync(dirPath);
  } catch (err) {
    // fs operations may fail silently
    console.log(err);
    throw err;
  }

  return dirPath;
};
