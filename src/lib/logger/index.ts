import { grey } from 'chalk';
import EventBus, { ChildEvents, WatchEvents } from '../EventBus';

export type LoggerProps = {
  eventBus: EventBus,
}


/**
 * Log message with "supermon" prefix
 *
 * @param message Message to log
 * @param args Rest of the arguments given to the function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (message?: string, ...args: any[]) => {
  const logPrefix = `[${grey('supermon')}] `;
  if (message) {
    console.log(`${logPrefix} ${message}`, ...args);
  } else {
    console.log('');
  }
};

const Logger = ({
  eventBus,
}: LoggerProps): void => {
  let isStarted = false;


  /**
   * Run events
   */
  eventBus.on(ChildEvents.Started, () => {
    isStarted = true;
  });
  eventBus.on(ChildEvents.Stopped, () => {
    isStarted = false;
  });


  /**
   * Watch events
   */
  eventBus.on(WatchEvents.FilesChanged, () => {
    if (isStarted) {
      log();
      log('File change detected. Restarting child process.');
      log();
    }
  });
  eventBus.on(ChildEvents.Stopped, () => {
    isStarted = false;
    log();
    log('Child process exited.');
  });
};


export default Logger;
