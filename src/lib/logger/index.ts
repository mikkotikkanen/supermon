import { grey } from 'chalk';
import { join } from 'path';
import EventBus, {
  ChildEvents,
  ProcessEvents,
  WatchEvents,
} from '../EventBus';
import loadPackageJSON from '../install/loadPackageJSON';

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

/**
 * Log messages to console
 */
const Logger = ({
  eventBus,
}: LoggerProps): void => {
  let isRunning = false;


  /**
   * Process events
   */
  eventBus.on(ProcessEvents.Start, () => {
    const pckg = loadPackageJSON(join(__dirname, '..', '..', '..', 'package.json'));
    if (!pckg) {
      throw new Error('Failed to load module package.json');
    }

    log();
    log(pckg.version);
    log();
  });

  /**
   * Child events
   */
  eventBus.on(ChildEvents.Started, () => {
    isRunning = true;
  });
  eventBus.on(ChildEvents.Stopped, () => {
    isRunning = false;
  });


  /**
   * Watch events
   */
  eventBus.on(WatchEvents.FilesChanged, () => {
    if (isRunning) {
      log();
      log('File change(s) detected. Restarting child process...');
      log();
    }
  });
  eventBus.on(ChildEvents.Stopped, () => {
    isRunning = false;
    log();
    log('Child process exited.');
  });
};


export default Logger;
