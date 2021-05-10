import { grey } from 'chalk';

let isEnabled = true;

/**
 * Log message with "supermon" prefix
 *
 * @param hasPrefix Has line prefix
 * @param message Message to log
 * @param args Rest of the arguments given to the function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logFnc = (hasPrefix?: boolean, message?: string, ...args: any[]) => {
  if (isEnabled) {
    const logPrefix = (hasPrefix ? `[${grey('supermon')}] ` : '');
    if (message) {
      console.log(`${logPrefix}${message}`);
    } else {
      console.log('');
    }
  }
};

/**
 * Enable/disable logging
 */
const enabled = (newIsEnabled: boolean): void => {
  isEnabled = newIsEnabled;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prefix = (message?: string, ...args: any[]): void => {
  logFnc(true, message, args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (message?: string, ...args: any[]): void => {
  logFnc(false, message, args);
};

export default {
  enabled,
  prefix,
  log,
};
