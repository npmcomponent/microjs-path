function mochaSauceModuleLoader(module) {
  var events = [];
  window.stream = function stream() {
    var e = events;
    events = [];
    return e;
  };

  function on() {
    events.push(Array.prototype.slice.call(arguments));
  }

  /**
   * Listen to `runner` events to populate a global
   * `.stream()` function which may be used by selenium
   * to report on results.
   *
   *    cloud(mocha).run();
   *
   * @param {Mocha} mocha
   * @api public
   */

  module.exports = function mochaCloud(mocha) {
    var Mocha = mocha.constructor;
    
    window.console = window.console || {};
    var methods = ['dir', 'error', 'group', 'gropCollapsed', 'groupEnd', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn'];
    for (var i = 0; i < methods.length; i++) {
      (function (method) {
        var old = console[method] || function () {};
        console[method] = function () {
          if (typeof old === 'function') old.apply(this, arguments);
          var args = ['console ' + method];
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          events.push(clean(args));
        };
      }(methods[i]));
    }

    var HTML = Mocha.reporters.HTML;
    function SauceLabs(runner, root) {
      runner.on('start', function () {
        on('start', now());
      });
      runner.on('end', function () {
        on('end', now());
      });
      runner.on('suite', function (suite) {
        on('suite start', now(), cleanSuite(suite, runner));
      });
      runner.on('suite end', function (suite) {
        on('suite end', now(), cleanSuite(suite, runner));
      });
      runner.on('test', function (test) {
        on('test start', now(), cleanTest(test));
      });
      runner.on('pass', function (test) {
        on('pass', now(), cleanTest(test));
      });
      runner.on('pending', function (test) {
        on('pending', now(), cleanTest(test));
      });
      runner.on('fail', function (test, error) {
        on('fail', now(), cleanTest(test), encodeError(error));
      });
      runner.on('test end', function (test) {
        on('test end', now(), cleanTest(test));
      });

      HTML.call(this, runner, root);
    }
    SauceLabs.prototype = HTML.prototype;

    return mocha.reporter(SauceLabs);
  }

  /**
   * Get the current time stamp
   *
   * @return {Number}
   * @api private
   */
  function now() {
    var d = new Date();
    return d.getTime();
  }

  /**
   * Clean a test so it matches the mocha-result-spec
   * 
   * @return {Object}
   * @api private
   */
  function cleanTest(test) {
    var speed = null;
    if (test.state === 'passed') {
      var medium = test.slow() / 2;
      speed = test.duration > test.slow()
        ? 'slow'
        : test.duration > medium
          ? 'medium'
          : 'fast';
    }
    return {
      title: test.title,
      fullTitle: test.fullTitle(),
      fn: test.fn && test.fn.toString(),
      state: test.state,
      pending: test.pending,
      duration: test.duration,
      parent: { fullTitle: test.parent.fullTitle() },
      speed: speed,
      type: test.type,
      slow: test.slow()
    };
  }

  /**
   * Clean a suite so it matches the mocha-result-spec
   * 
   * @return {Object}
   * @api private
   */
  function cleanSuite(suite, runner) {
    if (typeof suite.fullTitle === 'string') return suite; //might already be clean
    if (typeof suite.fullTitle !== 'function') return suite; //pass through anything that's not really a suite
    return {
      title: suite.title,
      fullTitle: suite.fullTitle(),
      root: suite.root,
      noOfTests: runner.grepTotal(suite)
    };
  }

  function clean(data, circles) {
    circles = circles || [];
    if (typeof data === 'function') {
      return '[FUNCTION]';
    } else if (typeof data === 'object') {
      return isArray(data) ? cleanArray(data, circles) : cleanObject(data, circles);
    } else {
      return data;
    }
  }

  function contains(array, data) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === data) return true;
    }
    return false;
  }
  function cleanObject(data, circles) {
    var res = {};
    var keys = [];
    for (var key in data) {
      if (typeof data[key] != 'object') {
        keys.push(key);
      } else if (!contains(circles, data[key])) {
        circles.push(data[key]);
        keys.push(key);
      } else {
        res[key] = '[CIRCLE]';
      }
    }
    for (var i = 0; i < keys.length; i++) {
      res[keys[i]] = clean(data[keys[i]], circles);
    }
    return res;
  }
  function cleanArray(data, circles) {
    var res = [];
    var keys = {};
    for (var key = 0; key < data.length; key++) {
      if (typeof data[key] != 'object') {
        keys[key] = true;
      } else if (!contains(circles, data[key])) {
        circles.push(data[key]);
        keys[key] = true;
      } else {
        keys[key] = false;
      }
    }
    for (var i = 0; i < data.length; i++) {
      if (keys[i]) {
        res.push(clean(data[i], circles));
      } else {
        res.push('[CIRCLE]');
      }
    }
    return res;
  }
  function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  function encodeError(err) {
    var cons = '$ERROR_CONSTRUCTOR$';
    if (!(err instanceof Error)) err = new Error('You threw the ' + (typeof err) + ' ' + err + '. Throw an `Error`.');
    var out = {};

    out.message = err.message;
    out.name = err.name;

    if (typeof err.stack === 'string') out.stack = err.stack;
    if (typeof err.fileName === 'string') out.fileName = err.fileName;
    if (typeof err.lineNumber === 'string' || typeof err.stack === 'string') out.lineNumber = err.lineNumber;

    if (err instanceof EvalError) out[cons] = 'EvalError';
    else if (err instanceof RangeError) out[cons] = 'RangeError';
    else if (err instanceof ReferenceError) out[cons] = 'ReferenceError';
    else if (err instanceof SyntaxError) out[cons] = 'SyntaxError';
    else if (err instanceof TypeError) out[cons] = 'TypeError';
    else if (err instanceof URIError) out[cons] = 'URIError';
    else out[cons] = 'Error';

    return out;
  }
}

if (typeof module != 'undefined') {
  mochaSauceModuleLoader(module);
} else {
  (function () {
    var module = {exports:{}};
    mochaSauceModuleLoader(module);
    window.mochaSauce = module.exports;
  }());
}