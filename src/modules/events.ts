import Events from 'events';

import type { EventBus } from './shared';

export const createEventBus = (): EventBus => {
  const eventEmitter = new Events();

  return {
    emit(name, ...args) {
      eventEmitter.emit(name, ...args);
    },
    on(name, cb) {
      eventEmitter.addListener(name, cb);
    },
    off(name, cb) {
      eventEmitter.removeListener(name, cb);
    },
  };
};
