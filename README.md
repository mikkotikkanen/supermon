# supermon

<p align="center">
  <img width="643" height="377" src="https://raw.githubusercontent.com/mikkotikkanen/supermon/master/screenshot.png">
</p>

![alt](https://github.com/mikkotikkanen/supermon/workflows/CI/badge.svg)


Ease your Node.js development by _automatically restarting your application on file changes_ and
_solve the notorious Docker node_modules sync issue_ as supermon monitors package.json file and
installs any missing modules to the internal Docker volume as well. 

Supports TypeScript applications out of the box through [ts-node](https://www.npmjs.com/package/ts-node).

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
  --watch          Directory to watch for file changes   [string] [default: "."]
  --ignore         Directories to ignore for file changes                [array]
  --ext            Comma separated list of file extensions to watch      [array]
  --delay          How many ms to wait after file changes[number] [default: 200]
  --exec           Executable to run the command on                     [string]
  --legacywatch    Use polling instead of FS events                    [boolean]
  --skipfirstsync  Don't do full sync on first run                     [boolean]
  --version        Show version number                                 [boolean]
  --help           Show help                                           [boolean]
  --debug          Show debug information                              [boolean]

Note: If supermon arguments are provided, it is recommended to use "--" as separator between supermon and application command

Note: Boolean options do not require value to be specified

Note: All options can also be configured through environment variables with
      "SUPERMON_" prefix. (fe. "SUPERMON_LEGACYWATCH=true")

Example use: "supermon app.js"
Example use: "supermon --watch=dist -- app.js --port=80"
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
