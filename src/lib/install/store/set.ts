import { PackageJSON } from '../types/PackageJSON';
import getStore from './getStore';


export const set = (packageJsonName: string, packageJson: PackageJSON) => {
  const config = getStore(packageJsonName);

  config.set('packageJSON', packageJson);
};
