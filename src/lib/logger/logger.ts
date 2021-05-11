import { grey } from 'chalk';
import { Stream } from 'stream';

let isEnabled = true;

/**
 * Log message
 *
 * @param hasPrefix Does the message have prefix
 * @param message Log message
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
 * Log lines from stream
 *
 * @param hasPrefix Do lines have prefix
 * @param stream Log stream
 */
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
 *
 * @param newIsEnabled Enabled
 */
const enabled = (newIsEnabled: boolean): void => {
  isEnabled = newIsEnabled;
};

/**
 * Log message with prefix
 *
 * @param message Log message
 */
const prefix = (message?: string): void => {
  logFnc(true, message);
};

/**
 * Log lines from log stream with prefix
 *
 * @param stream Log stream
 */
const prefixStream = (stream: Stream): void => {
  streamFnc(true, stream);
};

/**
 * Log message
 *
 * @param message Log message
 */
const log = (message?: string): void => {
  logFnc(false, message);
};

/**
 * Log lines from log stream
 *
 * @param stream Log stream
 */
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
