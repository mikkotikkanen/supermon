import { grey } from 'chalk';
import EventBus from '../utils/EventBus';
import { WatchEventBus } from '../watch';
import { RunEventBus } from '../run';


export default (): EventBus => {
  const eventBus = new EventBus();
  const logPrefix = `[${grey('supermon')}] `;
  let isStarted = false;


  /**
   * Run events
   */
  eventBus.on(RunEventBus.Events.Started, () => {
    isStarted = true;
  });
  eventBus.on(RunEventBus.Events.Stopped, () => {
    isStarted = false;
  });


  /**
   * Watch events
   */
  eventBus.on(WatchEventBus.Events.FilesChanged, () => {
    if (isStarted) {
      console.log('');
      console.log(`${logPrefix} File change detected. Restarting application.`);
      console.log('');
    }
  });
  eventBus.on(RunEventBus.Events.Stopped, () => {
    isStarted = false;
    console.log('');
    console.log(`${logPrefix} Application exited.`);
  });

  return eventBus;
};
