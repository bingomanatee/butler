import { Service } from '../build';

const EVENT_SET = 'set';
const EVENT_LOG = 'log';
const EVENT_ADD = 'add';

const wait100ticks = () => (new Promise(resolve => setTimeout(() => process.nextTick(resolve), 100)));
describe('Service', () => {
  let dataService;
  let dataBase;
  let tally;
  let logger;
  let log;
  describe('bridge', () => {
    beforeEach(() => {
      dataService = new Service();
      logger = new Service();
      tally = new Service();
      log = [];


      logger.on(EVENT_LOG, message => log.push(message));
    });

    describe('listening to another service', () => {
      beforeEach(() => {
        logger.bridge({
          fromService: dataService,
          on: EVENT_SET,
          emit: EVENT_LOG,
          action: (key, value) => `${key} set to ${value}`,
        });
      });

      it('should not log before starting logger', () => {
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(log).toEqual([]);
      });

      it('should log after staring logger', () => {
        logger.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(log).toEqual(['foo set to 1']);
      });

      it('should log after stopping logger', () => {
        logger.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        logger.stopService();
        dataService.emit(EVENT_SET, 'foo', 2);
        expect(log).toEqual(['foo set to 1']);
      });

      it('should be able to be restarted', () => {
        logger.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        logger.stopService();
        dataService.emit(EVENT_SET, 'foo', 2);
        logger.startService();
        dataService.emit(EVENT_SET, 'foo', 3);
        expect(log).toEqual([
          'foo set to 1',
          'foo set to 3',
        ]);
      });
    });

    describe('async listening', () => {
      beforeEach(() => {
        logger.bridge({
          fromService: dataService,
          on: EVENT_SET,
          emit: EVENT_LOG,
          async: true,
          action: (key, value) => new Promise(resolve => resolve(`${key} set to ${value}`)),
        });
      });

      it('should not log before starting logger', async () => {
        expect.assertions(2);
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(log).toEqual([]);
        await wait100ticks();
        expect(log).toEqual([]);
      });

      it('should log async after staring logger', async () => {
        expect.assertions(2);
        logger.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(log).toEqual([]);
        await wait100ticks();
        expect(log).toEqual(['foo set to 1']);
      });
    });

    describe('sending to another service', () => {
      beforeEach(() => {
        tally.sum = 0;
        dataService.bridge({
          target: tally,
          on: EVENT_SET,
          emit: EVENT_ADD,
          action: (key, value) => value,
        });

        tally.on(EVENT_ADD, (value) => {
          tally.sum += value;
        });
      });

      it('should not add before start', () => {
        dataService.emit(EVENT_SET, 'foo', 1);
        dataService.emit(EVENT_SET, 'foo', 2);
        expect(tally.sum).toEqual(0);
      });

      it('should add after start', () => {
        dataService.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        dataService.emit(EVENT_SET, 'foo', 2);
        expect(tally.sum).toEqual(3);
      });

      it('should not add after start', () => {
        dataService.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        dataService.emit(EVENT_SET, 'foo', 2);
        dataService.stopService();
        dataService.emit(EVENT_SET, 'foo', 5);
        expect(tally.sum).toEqual(3);
      });
    });
  });

  describe('trigger', () => {
    describe('synchronous', () => {
      beforeEach(() => {
        dataBase = new Map();
        class DB extends Service {
          constructor() {
            super();

            this.trigger({
              on: EVENT_SET,
              callType: 'apply',
              method: 'set',
              target: dataBase,
            });
          }
        }

        dataService = new DB();
      });

      it('should do nothing before start', () => {
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(dataBase.has('foo')).toBeFalsy();
      });

      it('should set foo after start', () => {
        dataService.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(dataBase.get('foo')).toEqual(1);
      });

      it('should not set foo after end', () => {
        dataService.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        dataService.stopService();
        dataService.emit(EVENT_SET, 'foo', 2);
        expect(dataBase.get('foo')).toEqual(1);
      });
    });

    describe('async', () => {
      beforeEach(() => {
        dataBase = new Map();
        class DB extends Service {
          constructor() {
            super();

            this.trigger({
              on: EVENT_SET,
              callType: 'apply',
              async: true,
              method: 'set',
              action: (...args) => new Promise(respond => respond(args)),
              target: dataBase,
            });
          }
        }

        dataService = new DB();
      });

      it('should do nothing before start', async () => {
        expect.assertions(2);
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(dataBase.has('foo')).toBeFalsy();
        await wait100ticks();
        expect(dataBase.has('foo')).toBeFalsy();
      });

      it('should async set foo after start', async () => {
        expect.assertions(2);
        dataService.startService();
        dataService.emit(EVENT_SET, 'foo', 1);
        expect(dataBase.has('foo')).toBeFalsy();
        await wait100ticks();
        expect(dataBase.get('foo')).toEqual(1);
      });

      /*      it('should not set foo after end', () => {
              dataService.startService();
              dataService.emit(EVENT_SET, 'foo', 1);
              dataService.stopService();
              dataService.emit(EVENT_SET, 'foo', 2);
              expect(dataBase.get('foo')).toEqual(1);
            }); */
    });
  });
});
