import Configstore from 'configstore';


export default (packageJsonName: string) => {
  const config = new Configstore(`nodewatcher-${packageJsonName}`);

  return config;
}

