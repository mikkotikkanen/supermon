import { readFileSync, statSync, existsSync } from "fs";

export interface IPackageJSON extends Object {
  readonly name: string;
  readonly version?: string,
  readonly dependencies: IDependencyMap,
  readonly devDependencies: IDependencyMap,
  readonly peerDependencies: IDependencyMap,
}

export interface IDependencyMap {
  [dependencyName: string]: string;
}

export default (filename: string) => {
  if (!existsSync(filename)) {
    return null;

  } else {
    const file = readFileSync(filename, { encoding: 'utf8' });

    let json: IPackageJSON;
    try {
      json = JSON.parse(file);
    } catch (err) {
      throw err;
    }

    // Create final packageJSON
    const packageJSON: IPackageJSON = {
      name: json.name,
      version: json.version,
      dependencies: json.dependencies,
      devDependencies: json.devDependencies,
      peerDependencies: json.peerDependencies,
    }

    return packageJSON;
  }
}
