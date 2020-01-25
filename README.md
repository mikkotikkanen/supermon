# nodewatcher

![alt](https://github.com/mikkotikkanen/nodewatcher/workflows/CI/badge.svg)


nodemon replacement for pure Node.js use cases with automated new module installation detection
and automated installation upon restart, tailored for Docker usecases where node_modules is run as
internal volume and local npm install commands aren't reflected to internal volume.


TODO:
- keep tap of files on change, only run install when package.json has changed
- check if the current node_modules already has the requested module installed to avoid double installs on local use
- add common event bus
- add restart test
- add package.json diff test
- add programmatic use
