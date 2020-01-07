/**
 * Compare two package.json dependencies
 */
interface IDependencyMap {
  [dependencyName: string]: string;
}

export interface Diff {
  name: string;
  version: string;
}

export interface DiffObject {
  added: Diff[];
  removed: Diff[];
  changed: Diff[];
}


/**
 * Get difference between two dependency maps
 *
 * @param mapA Depencency map to compare to
 * @param mapB Depencency map to compare from
 * @param strict Wheter to compare values as well
 */
const dependencyMapDiff = (mapA: IDependencyMap, mapB: IDependencyMap, strict = false) => {
  const result: Diff[] = [];

  Object.keys(mapA).map((name) => {
    const diff = {
      name: name,
      version: mapA[name],
    };

    if (strict) {
      // Strict diff, compare version as well
      if (mapA[name] !== mapB[name]) {
        result.push(diff);
      }
    } else {
      // Non-strict diff, just compare existence
      if (!mapB[name]) {
        result.push(diff);
      }
    }
  });

  return result;
};



export default (mapA: IDependencyMap, mapB: IDependencyMap) => {
  let added: Diff[] = [];
  let removed: Diff[] = [];
  let changed: Diff[] = [];

  added = added.concat(dependencyMapDiff(mapB, mapA));
  removed = removed.concat(dependencyMapDiff(mapA, mapB));
  changed = changed.concat(dependencyMapDiff(mapA, mapB, true));

  // Clean already existing diffs from strict diff
  const nonStrictList = added.concat(removed).map(diff => diff.name);
  changed = changed.reduce((reducer, diff) => {
    if (!nonStrictList.includes(diff.name)) {
      reducer.push(diff);
    }
    return reducer;
  }, <Diff[]>[]);

  const diff: DiffObject = {
    added,
    removed,
    changed,
  }

  return diff
}
