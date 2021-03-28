import { grey } from 'chalk';
import { join } from 'path';
import { LibProps } from '..';
import EventBus, {
  ChildEvents,
  LogEvents,
  ProcessEvents,
  WatchEvents,
} from '../EventBus';
import loadPackageJSON from '../modules/loadPackageJSON';

export type LoggerProps = {
  /**
   * Event bus
   */
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
const logger = ({
  eventBus,
}: LoggerProps): void => {
  let isRunning = false;


  /**
   * Process events
   */
  eventBus.on(ProcessEvents.Start, ({
    command: executable,
    watchdir,
    extensions,
  }: LibProps) => {
    const pckg = loadPackageJSON(join(__dirname, '..', '..', '..', 'package.json'));
    if (!pckg) {
      throw new Error('Failed to load module package.json');
    }

    log();
    log(`v${pckg.version}`);
    log(`Child process: ${executable}`);
    log(`Watching directory: ${watchdir}`);
    log(`Watching extensions: ${extensions?.join(',')}`);
    log();
  });

  /**
   * Log events
   */
  eventBus.on(LogEvents.Message, (message) => {
    log(message);
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


export default logger;
