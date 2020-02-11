import { Run } from './Run';
import RunEventBus from './RunEventBus';


const runEventBus = new RunEventBus();
let isRestarting = false;


export default (command: string): RunEventBus => {
  const run = new Run(command);

  run.eventBus.on(run.eventBus.Events.Started, () => {
    if (isRestarting) {
      isRestarting = false;
    }
    runEventBus.emit(runEventBus.Events.Started);
  });

  run.eventBus.on(run.eventBus.Events.Stopped, (code) => {
    if (isRestarting) {
      runEventBus.emit(runEventBus.Events.Start);
    } else if (!run.isRunning()) {
      runEventBus.emit(runEventBus.Events.Stopped, code);
    }
  });

  // Set main event emitter events
  runEventBus.on(runEventBus.Events.Start, () => {
    run.execute();
  });

  runEventBus.on(runEventBus.Events.Restart, () => {
    isRestarting = true;
    run.eventBus.emit(run.eventBus.Events.Stop);
  });

  runEventBus.on(runEventBus.Events.Stop, () => {
    run.eventBus.emit(run.eventBus.Events.Stop);
  });

  return runEventBus;
};
