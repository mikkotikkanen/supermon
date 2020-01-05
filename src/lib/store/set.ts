import { IPackageJSON } from '../install/IPackageJSON';
import getStore from './getStore';


export const set = (packageJsonName: string, packageJson: IPackageJSON) => {
  const config = getStore(packageJsonName);

  config.set('packageJSON', packageJson);
}
