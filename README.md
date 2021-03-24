# supermon

nodemon replacement for pure Node.js use cases with automated new module installation detection
and automated installation upon restart, tailored for Docker usecases where node_modules is run as
internal volume and local npm install commands aren't reflected to internal volume. Supports
TypeScript out of the box through [ts-node](https://www.npmjs.com/package/ts-node).

![TypeScript](https://img.shields.io/badge/-TypeScript-2F74C0)
![ESLint](https://img.shields.io/badge/-ESLint-4B32C3)
![Jest](https://img.shields.io/badge/-Jest-99425A)

![alt](https://github.com/mikkotikkanen/supermon/workflows/CI/badge.svg)


## Install

```bash
npm install supermon --save-dev
```

To use supermon with TypeScript you also need to install `ts-node`

```bash
npm install ts-node --save-dev
```

## Usage

```bash
supermon <application file>
```

Examples

```bash
supermon app.js
supermon app.ts
```

## Options

```help
Options:
  --watchdir        Which directory to watch for changes                [string]
  --polling         Use polling (CPU and memory tax)                   [boolean]
  --noFirstRunSync  Don't do full sync on first run                    [boolean]
  --version         Show version number
  --help            Show help

Note: If supermon arguments are provided, it is recommended to use "--" as separator between supermon and application

Note: [boolean] options do not require value to be specified

Note: All options can also be configured through environment variables with
      "SUPERMON_" prefix. (fe. "SUPERMON_POLLING=true")

Example use: "supermon app.js"
Example use: "supermon --watchdir=dist -- app.js --port=80"
```

## Contributing

### Master branch

Master branch must always represent the current deployed state, no commits are allowed directly to
master.

### Feature branches

All work should be done in feature branches. Branches should have human readable name.

### Merging

Merging to master should happen through pull requests. Any pull request should have working tests
for any new added feature added in the branch, should pass existing tests and should have been
approved by at least one person before merging.