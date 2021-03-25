import { readFileSync, existsSync } from 'fs';
import { PackageJSON } from './types/PackageJSON';

export default (filename: string): PackageJSON | null => {
  if (!existsSync(filename)) {
    return null;
  }
  const file = readFileSync(filename, { encoding: 'utf8' });

  const json: PackageJSON = JSON.parse(file);

  // Create final packageJSON
  const packageJSON: PackageJSON = {
    name: json.name,
    version: json.version,
    dependencies: json.dependencies,
    devDependencies: json.devDependencies,
    peerDependencies: json.peerDependencies,
  };

  return packageJSON;
};
