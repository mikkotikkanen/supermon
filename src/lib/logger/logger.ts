import { grey } from 'chalk';

let isEnabled = true;

/**
 * Log message with "supermon" prefix
 *
 * @param hasPrefix Has line prefix
 * @param message Message to log
 * @param args Rest of the arguments given to the function
 */
const logFnc = (hasPrefix?: boolean, message?: string) => {
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

const prefix = (message?: string): void => {
  logFnc(true, message);
};

const log = (message?: string): void => {
  logFnc(false, message);
};

export default {
  enabled,
  prefix,
  log,
};
