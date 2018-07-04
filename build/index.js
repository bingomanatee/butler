module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: external "eventemitter3"
var external__eventemitter3_ = __webpack_require__(2);
var external__eventemitter3__default = /*#__PURE__*/__webpack_require__.n(external__eventemitter3_);

// CONCATENATED MODULE: ./src/Service.js


const START_SERVICE = '___start_service';

const STOP_SERVICE = '___stop_service';

const identity = (...args) => args;

class Service extends external__eventemitter3__default.a {
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
    on, fromService = this, target = this,
    emit, action = identity, async = false
  }) {
    let bridge;

    if (async) {
      bridge = (...args) => action(...args).then(result => {
        console.log('async result: ', result);
        target.emit(emit, result);
      }).catch(err => console.log(`error on ${on} >> ${emit}: ${err.message}`));
    } else {
      bridge = (...args) => target.emit(emit, action(...args));
    }

    const enable = () => fromService.on(on, bridge);
    const disable = () => fromService.off(on, bridge);
    this.on(START_SERVICE, enable);
    this.on(STOP_SERVICE, disable);

    if (this.active) enable();
  }

  trigger({
    on, fromService = this, async = false,
    target = this, method, callType = 'pass', action = identity
  }) {
    let bridge;
    if (!method) throw new Error('method missing on trigger');
    switch (callType) {
      case 'pass':
        if (async) {
          bridge = (...args) => action(...args).then(result => target[method](result));
        } else {
          bridge = (...args) => target[method](action(...args));
        }

        break;

      case 'apply':
        if (async) {
          bridge = (...args) => action(...args).then(result => {
            console.log('async apply: ', result);
            target[method](...result);
          });
        } else {
          bridge = (...args) => {
            const targetArgs = action(...args);
            target[method](...targetArgs);
          };
        }

        break;

      default:
        bridge = (...args) => target[method](action(...args));
    }

    const enable = () => fromService.on(on, bridge);
    const disable = () => fromService.off(on, bridge);
    this.on(START_SERVICE, enable);
    this.on(STOP_SERVICE, disable);

    if (this.active) enable();
  }
}
// CONCATENATED MODULE: ./src/index.js
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Service", function() { return Service; });
/* eslint-disable import/prefer-default-export */





/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("eventemitter3");

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map