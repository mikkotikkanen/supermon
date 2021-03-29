import { DependencyMap } from './DependencyMap';

export interface PackageJSON extends Object {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: DependencyMap;
  readonly devDependencies?: DependencyMap;
  readonly peerDependencies?: DependencyMap;
}
