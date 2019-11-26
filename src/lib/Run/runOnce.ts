import { Run } from "./run";
import { Events } from "./Events";

export const runOnce = (command: string) => new Promise((resolve, reject) => {
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
