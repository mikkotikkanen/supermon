import getStore from './getStore';


export const get = (packageJsonName: string) => {
  const config = getStore(packageJsonName);

  return config.get('packageJSON');
}
