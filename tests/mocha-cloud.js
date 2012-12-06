;(function(){
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-object/index.js", function(module, exports, require){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
});
require.register("ForbesLindesay-jssn/index.js", function(module, exports, require){
function type(val){
  var toString = Object.prototype.toString;
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
}
var keys = Object.keys || require('object').keys;

exports.stringify = stringify;
exports.parse = parse;

function stringify(obj) {
  var circular = [{
    encoded: null,
    original: obj
  }];
  circular[0].encoded = encode(obj, circular, true);
  return JSON.stringify(circular.map(function (o) {
    return o.encoded;
  }));
}

function encode(obj, circular, root) {
  switch (type(obj)) {
    case 'string':
      return 's' + obj;
    case 'date':
      return 'd' + obj.getTime();
    case 'regexp':
      return 'r/' + obj.source + '/' + (obj.global?'g':'') + (obj.ignoreCase?'i':'') + (obj.multiline?'m':'');
    case 'function':
      return encodeFunction(obj, circular);
    case 'arguments':
    case 'array':
    case 'object':
      return encodeCircular(obj, circular, root);
    default:
      return obj;
  }
}
function encodeCircular(obj, circular, root) {
  if (!root) {
    for (var i = 0; i < circular.length; i++) {
      if (circular[i].original === obj) {
        return 'c' + i;
      }
    }
  }
  var encoded = type(obj) === 'object' ? {} : [];
  var ref = 'c' + circular.length;
  if (!root) {
    circular.push({
      encoded: encoded,
      original: obj
    });
  }

  if (type(obj) === 'object') {
    encodeObject(obj, encoded, circular);
  } else {
    encodeArray(obj, encoded, circular);
  }

  return root ? encoded : ref;
}

function encodeArray(from, to, circular) {
  for (var i = 0; i < from.length; i++) {
    to.push(encode(from[i], circular));
  }
}
function encodeObject(from, to, circular) {
  if (from.constructor != Object) {
    to['_jssn_proto'] = /^function([^\(]+)\(/.exec(from.constructor.toString())[1].trim();
  }
  var k = keys(from);
  for (var i = 0; i < k.length; i++) {
    (function (key) {
      to[key] = encode(from[key], circular);
    }(k[i]));
  }
}
function encodeFunction(obj, circular) {
  var str = obj.toString();
  for (var i = 0; i < circular.length; i++) {
    if (circular[i].original === str) {
      return 'f' + i;
    }
  }
  circular.push({encoded: str, original: str});
  return 'f' + (circular.length - 1);
}

function parse(str, constructors) {
  var source = JSON.parse(str).map(function (o, i) {
    if (type(o) === 'array') {
      return {
        encoded: o,
        decoded: false,
        original: []
      };
    }
    if (type(o) === 'object') {
      var original = {};

      if (o['_jssn_proto'] && constructors[o['_jssn_proto']]) {
        original = Object.create(constructors[o['_jssn_proto']].prototype);
      }
      return {
        encoded: o,
        decoded: false,
        original: original
      };
    }
    if (type(o) === 'string' && i != 0) {
      var parsed = /^function[^\(]*\(([^\)]*)\) ?\{((?:\n|\r|.)*)\}$/.exec(o);
      if (!parsed) console.log(JSON.stringify(o));
      var args = parsed[1].split(',')
        .map(function (a) { return a.trim(); })
        .filter(function (a) { return a; });
      args.push(parsed[2]);
      return Function.apply(null, args);
    } else {
      return {encoded: o, decoded: false, original: null};
    }
  });
  return decode(source[0].encoded, source, source[0]);
}

function decode(obj, circular, ref) {
  if (ref) ref.decoded = true;
  if (type(obj) === 'string') {
    switch (obj.substring(0, 1)) {
      case 's': return obj.substring(1);
      case 'd': return new Date(+obj.substring(1));
      case 'r': return new RegExp(obj.split('/')[1], obj.split('/')[2]);
      case 'f': return circular[obj.substring(1)];
      case 'c':
        var ref = circular[obj.substring(1)];
        if (!ref.decoded) {
          decode(ref.encoded, circular, ref);
        }
        return ref.original;

    }
  } else if (type(obj) === 'object') {
    return decodeObject(obj, ref.original, circular);
  } else if (type(obj) === 'array') {
    return decodeArray(obj, ref.original, circular);
  } else {
    return obj;
  }
}
function decodeArray(from, to, circular) {
  for (var i = 0; i < from.length; i++) {
    to.push(decode(from[i], circular));
  }
  return to;
}
function decodeObject(from, to, circular) {
  var k = keys(from);
  for (var i = 0; i < k.length; i++) {
    (function (key) {
      if (key === '_jssn_proto') return;
      to[key] = decode(from[key], circular);
    }(k[i]));
  }
  return to;
}
});
require.register("mocha-cloud/client.js", function(module, exports, require){
var jssn = require('jssn');

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
  
  var events = [];
  window.stream = function () {
    var e = jssn.stringify(events);
    events = [];
    return e;
  };

  window.console = window.console || {};
  var methods = ['dir', 'error', 'group', 'gropCollapsed', 'groupEnd', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn'];
  for (var i = 0; i < methods.length; i++) {
    (function (method) {
      var old = console[method] || function () {};
      console[method] = function () {
        if (typeof old === 'function') old.apply(this, arguments);
        var args = ['console-' + method];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        events.push(args);
      };
    }(methods[i]));
  }

  var HTML = Mocha.reporters.HTML;
  function SauceLabs(runner, root) {
    var emit = runner.emit;
    runner.emit = function () {
      emit.apply(this, arguments);
      events.push(arguments)
    };
    HTML.call(this, runner, root);
  }
  SauceLabs.prototype = HTML.prototype;

  return mocha.reporter(SauceLabs);
}
});
require.alias("ForbesLindesay-jssn/index.js", "mocha-cloud/deps/jssn/index.js");
require.alias("component-object/index.js", "ForbesLindesay-jssn/deps/object/index.js");

require.alias("mocha-cloud/client.js", "mocha-cloud/index.js");
  if ("undefined" == typeof module) {
    window.mochaCloud = require("mocha-cloud");
  } else {
    module.exports = require("mocha-cloud");
  }
})();