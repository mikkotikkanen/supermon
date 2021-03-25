import { PackageJSON } from '../types/PackageJSON';
import getStore from './getStore';


export default (packageJsonName: string, packageJson: PackageJSON): void => {
  const config = getStore(packageJsonName);

  config.set('packageJSON', packageJson);
};
