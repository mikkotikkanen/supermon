import EventBus, { ChildEvents } from '../EventBus';
import { Run } from './Run';

type runRestartableProps = {
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
}: runRestartableProps): void => {
  const run = new Run(command);

  run.eventBus.on(run.eventBus.Events.Started, () => {
    if (isRestarting) {
      isRestarting = false;
      eventBus.emit(ChildEvents.Restarted);
    } else {
      eventBus.emit(ChildEvents.Started);
    }
  });

  run.eventBus.on(run.eventBus.Events.Stopped, (code) => {
    if (isRestarting) {
      eventBus.emit(ChildEvents.Start);
    } else if (!run.isRunning()) {
      eventBus.emit(ChildEvents.Stopped, code);
    }
  });

  // Set main event emitter events
  eventBus.on(ChildEvents.Start, () => {
    run.execute();
  });

  eventBus.on(ChildEvents.Restart, () => {
    isRestarting = true;
    run.eventBus.kill();
  });

  // Pass kill request to execution eventbus
  eventBus.on(ChildEvents.Stop, () => run.eventBus.kill());
};
