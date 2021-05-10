import { grey } from 'chalk';
import { Stream } from 'stream';

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

const streamFnc = (hasPrefix: boolean, stream: Stream) => {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk;

    // Log completed lines out
    const lines = buffer.split('\n');
    while (lines.length > 1) {
      const line = lines.shift() as string;
      logFnc(hasPrefix, line);
    }

    // Set last piece as new buffer
    buffer = lines.shift() as string;
  });
  stream.on('end', () => {
    // When stdout ends, log out remaining buffer
    if (buffer) {
      logFnc(hasPrefix, buffer);
    }
  });
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

const prefixStream = (stream: Stream): void => {
  streamFnc(true, stream);
};

const log = (message?: string): void => {
  logFnc(false, message);
};

const logStream = (stream: Stream): void => {
  streamFnc(false, stream);
};


export default {
  enabled,
  prefix,
  prefixStream,
  log,
  logStream,
};
