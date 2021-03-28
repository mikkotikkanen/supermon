import { Run } from './Run';

export default (command: string): Promise<void> => new Promise((resolve, reject) => {
  const run = new Run({ command });

  run.eventBus.on(run.Events.Stopped, (code) => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });

  run.start();
});