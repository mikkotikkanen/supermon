# supermon

![alt](https://github.com/mikkotikkanen/supermon/workflows/CI/badge.svg)

Ease your Node.js development by automatically restarting your application and installing any missing modules on file changes. supermon is tailored for Docker usecases where node_modules are stored in internal Docker volume and npm install commands on host machine aren't reflected to internal volume.

Supports TypeScript out of the box through [ts-node](https://www.npmjs.com/package/ts-node).

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
supermon [application file]
supermon [npm script command]
```

Examples

```bash
supermon app.js
supermon app.ts
supermon npm run server
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