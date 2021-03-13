#!/usr/bin/env node
/**
 * Application for testing purposes
 *
 * Only waits for given amount of time
 *
 * Wait time can be defined as an cmd argument
 * (fe. wait for 5 seconds `ts-node test-wait.ts 5`)
 *
 * Defaults to 1 second wait time
 */
const arg = process.argv.pop() as string;
const waitInSeconds = parseInt(arg, 10) || 1; // Default to 1 second
let temp = 1;

setTimeout(() => {
  // Keep the app running for set time
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  temp += 1;
}, waitInSeconds * 1000);
