# supermon

![alt](https://github.com/mikkotikkanen/supermon/workflows/CI/badge.svg)

## Note! Currently in development and testing, not ready for use yet

nodemon replacement for pure Node.js use cases with automated new module installation detection
and automated installation upon restart, tailored for Docker usecases where node_modules is run as
internal volume and local npm install commands aren't reflected to internal volume.

## Options

```help
Options:
  --watchdir  Which directory to watch for changes                      [string]
  --polling   Use polling (CPU and memory tax)                         [boolean]
  --version   Show version number
  --help      Show help

Note: If supermon arguments are provided, you need to separate them from the executable and any parameters it might have with "--"

Note: [boolean] options do not require value to be specified

Note: All options can also be configured through environment variables with
      "SUPERMON_" prefix. (fe. "SUPERMON_POLLING=true")

Example use: "supermon app.js"
Example use: "supermon --watchdir=dist -- app.js"
```
