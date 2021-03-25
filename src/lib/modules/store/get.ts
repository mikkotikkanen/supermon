import getStore from './getStore';
import { PackageJSON } from '../types/PackageJSON';


export default (packageJsonName: string): PackageJSON => {
  const config = getStore(packageJsonName);

  return config.get('packageJSON');
};
