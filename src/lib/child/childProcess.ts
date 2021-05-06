import EventBus, { ChildEvents } from '../EventBus';
import { Run } from './Run';

type childProcessProps = {
  /**
   * Event bus
   */
  eventBus: EventBus;

  /**
   * Command
   */
  command: string;
}

let isRestarting = false;


export default ({
  eventBus,
  command,
}: childProcessProps): void => {
  const run = new Run({ command });

  run.eventBus.on(run.Events.Started, () => {
    if (isRestarting) {
      isRestarting = false;
    }
    eventBus.emit(ChildEvents.Started);
  });

  run.eventBus.on(run.Events.Stopped, (code) => {
    if (isRestarting) {
      run.eventBus.emit(run.Events.Start);
    } else if (!run.isRunning()) {
      eventBus.emit(ChildEvents.Stopped, code);
    }
  });

  // Set main event emitter events
  eventBus.on(ChildEvents.Start, () => {
    run.start();
  });

  eventBus.on(ChildEvents.Restart, () => {
    isRestarting = true;
    run.eventBus.emit(run.Events.Stop);
  });

  // Pass kill request to execution eventbus
  eventBus.on(ChildEvents.Stop, () => run.eventBus.emit(run.Events.Stop));
};
