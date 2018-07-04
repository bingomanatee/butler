import EventEmitter from 'eventemitter3';

export const START_SERVICE = '___start_service';

export const STOP_SERVICE = '___stop_service';

const identity = (...args) => args;

export default class Service extends EventEmitter {
  constructor() {
    super();
    this.on(START_SERVICE, () => {
      this.active = true;
    });

    this.on(STOP_SERVICE, () => {
      this.active = false;
    });
  }

  startService() {
    if (this.active) {
      return;
    }
    this.emit(START_SERVICE);
  }

  stopService() {
    if (!this.active) {
      return;
    }
    this.emit(STOP_SERVICE);
  }

  bridge({
    on, fromService = this, toService = this,
    emit, action = identity, async = false,
  }) {
    let bridge;

    if (async) {
      bridge = (...args) => action(args)
        .then(result => toService.emit(emit, result))
        .catch(err => console.log(`error on ${on} >> ${emit}: ${err.message}`));
    } else {
      bridge = (...args) => toService.emit(emit, action(args));
    }

    const enable = () => fromService.on(on, bridge);
    const disable = () => fromService.off(on, bridge);
    this.on(START_SERVICE, enable);
    this.on(STOP_SERVICE, disable);

    if (this.active) enable();
  }

  trigger({
    on, fromService = this, target = this, method, callType = 'pass', action = identity,
  }) {
    let bridge;
    if (!method) throw new Error('method missing on trigger');
    switch (callType) {
      case 'pass':
        bridge = (...args) => target[method](action(...args));
        break;

      case 'apply':
        bridge = (...args) => {
          const actionValue = action(args);
          target[method](...actionValue);
        };
        break;

      default:
        bridge = (...args) => target[method](action(args));
    }

    const enable = () => fromService.on(on, bridge);
    const disable = () => fromService.off(on, bridge);
    this.on(START_SERVICE, enable);
    this.on(STOP_SERVICE, disable);

    if (this.active) enable();
  }
}

