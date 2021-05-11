import logger from '../logger/logger';
import { Run } from './Run';

export default (command: string): Promise<void> => new Promise((resolve, reject) => {
  const run = new Run({
    command,
    prefixLogs: true,
  });

  run.eventBus.on(run.Events.Stopped, (code) => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });

  run.eventBus.on(run.Events.Log, (message) => {
    logger.log(message);
  });

  run.start();
});
