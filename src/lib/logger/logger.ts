import EventBus from '../utils/EventBus';
import { WatchEventBus } from '../watch';
import { RunEventBus } from '../run';


export default (): EventBus => {
  const eventBus = new EventBus();
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
      console.log('[supermon] Files changed, restarting...');
      console.log('');
    }
  });
  eventBus.on(RunEventBus.Events.Stopped, () => {
    isStarted = false;
    console.log('');
    console.log('supermon] Process exited.');
  });

  return eventBus;
};
