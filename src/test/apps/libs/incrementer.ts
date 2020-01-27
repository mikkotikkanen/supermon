import {
  writeFileSync, readFileSync, unlinkSync, existsSync,
} from 'fs';
import { join } from 'path';
import getWorkDir from '../../lib/getWorkDir';

const workDir = getWorkDir();

export const clean = (filename: string): void => {
  const filePath = join(workDir, filename);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
};

export const getValue = (filename: string): number => {
  const filePath = join(workDir, filename);
  let value = -1;
  if (existsSync(filePath)) {
    value = parseInt(readFileSync(filePath, { encoding: 'utf8' }), 10);
  }

  return value;
};

export const incrementer = (filename: string): void => {
  const filePath = join(workDir, filename);
  const value = getValue(filename);
  writeFileSync(filePath, value + 1, { encoding: 'utf8' });
};