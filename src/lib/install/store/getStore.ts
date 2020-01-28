import Configstore from 'configstore';


export default (packageJsonName: string): Configstore => {
  const config = new Configstore(`supermon-${packageJsonName}`);

  return config;
};
