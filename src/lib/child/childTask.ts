import EventBus, { LogEvents } from '../EventBus';
import { Run } from './Run';

type childTaskProps = {
  /**
   * Event bus
   */
  eventBus: EventBus;

  /**
   * Command
   */
  command: string;
}

export default ({
  eventBus,
  command,
}: childTaskProps): Promise<void> => new Promise((resolve, reject) => {
  const run = new Run({
    command,
    useLogger: true,
  });

  run.eventBus.on(run.Events.Stopped, (code) => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });

  run.eventBus.on(run.Events.Log, (message) => {
    eventBus.emit(LogEvents.Message, message);
  });

  run.start();
});
