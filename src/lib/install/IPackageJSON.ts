import { IDependencyMap } from "./IDependencyMap";

export interface IPackageJSON extends Object {
  readonly name: string;
  readonly version?: string;
  readonly dependencies: IDependencyMap;
  readonly devDependencies: IDependencyMap;
  readonly peerDependencies: IDependencyMap;
}
