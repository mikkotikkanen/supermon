import { incrementer } from './libs/incrementer';

const workfile = process.argv.pop() as string;
incrementer(workfile);

setTimeout(() => {
  // Keep the app running for few seconds
}, 10 * 1000);
