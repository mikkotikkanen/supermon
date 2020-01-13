import { Run } from './Run';
import Events from './Events';

export default (command: string): Promise<void> => new Promise((resolve, reject) => {
  const run = new Run(command);

  run.events.on(Events.CLOSED, (code) => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });

  run.execute();
});
