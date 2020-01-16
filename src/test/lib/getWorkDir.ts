import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const dirPath = join(__dirname, '..', '..', '..', 'tmp');

export default (): string => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }

  return dirPath;
};
