import { run, Run } from "./run";
import { Events } from "./Events";

export const runOnce = (command: string) => new Promise((resolve, reject) => {
  console.log('runOnce');
  const run = new Run(command);

  // const runEvents = run(command);
  run.events.on(Events.CLOSED, (code) => {
    console.log('runOnce closed, code', code);
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });

  run.execute();
});
