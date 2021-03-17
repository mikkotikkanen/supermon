import { grey } from 'chalk';
// import EventBus from '../utils/EventBus';
// import { WatchEventBus } from '../watch';
// import { RunEventBus } from '../run';
// import { RunEvents } from '../run/RunEventBus';
import EventBus, { ChildEvents, WatchEvents } from '../EventBus';

export type LoggerProps = {
  eventBus: EventBus,
}


const Logger = ({
  eventBus,
}: LoggerProps): void => {
  // const eventBus = new EventBus();
  const logPrefix = `[${grey('supermon')}] `;
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
      console.log('');
      console.log(`${logPrefix} File change detected. Restarting application.`);
      console.log('');
    }
  });
  eventBus.on(ChildEvents.Stopped, () => {
    isStarted = false;
    console.log('');
    console.log(`${logPrefix} Application exited.`);
  });
};


export default Logger;
