import { run } from "./run";
import { Events } from "./Events";

export const runOnce = (command: string) => new Promise((resolve, reject) => {
  const runEvents = run(command);
  runEvents.on(Events.CLOSED, (code) => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });
});
