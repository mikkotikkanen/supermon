# nodewatcher

nodemon replacement for pure Node.js use cases with automated new module installation detection
and automated installation upon restart, tailored for Docker usecases where node_modules is run as
internal volume and local npm install commands aren't reflected to internal volume.


TODO:
- first run sync (npm install, npm prune)?
- unbounce change events
- check if the current node_modules already has the requested module installed to avoid double installs on local use