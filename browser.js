(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.App = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(require,module,exports){
// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var antlr4 = require('antlr4/index');


var serializedATN = ["\3\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd",
    "\2k\u042a\b\1\4\2\t\2\4\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t",
    "\b\4\t\t\t\4\n\t\n\4\13\t\13\4\f\t\f\4\r\t\r\4\16\t\16\4\17\t\17\4\20",
    "\t\20\4\21\t\21\4\22\t\22\4\23\t\23\4\24\t\24\4\25\t\25\4\26\t\26\4",
    "\27\t\27\4\30\t\30\4\31\t\31\4\32\t\32\4\33\t\33\4\34\t\34\4\35\t\35",
    "\4\36\t\36\4\37\t\37\4 \t \4!\t!\4\"\t\"\4#\t#\4$\t$\4%\t%\4&\t&\4\'",
    "\t\'\4(\t(\4)\t)\4*\t*\4+\t+\4,\t,\4-\t-\4.\t.\4/\t/\4\60\t\60\4\61",
    "\t\61\4\62\t\62\4\63\t\63\4\64\t\64\4\65\t\65\4\66\t\66\4\67\t\67\4",
    "8\t8\49\t9\4:\t:\4;\t;\4<\t<\4=\t=\4>\t>\4?\t?\4@\t@\4A\tA\4B\tB\4C",
    "\tC\4D\tD\4E\tE\4F\tF\4G\tG\4H\tH\4I\tI\4J\tJ\4K\tK\4L\tL\4M\tM\4N\t",
    "N\4O\tO\4P\tP\4Q\tQ\4R\tR\4S\tS\4T\tT\4U\tU\4V\tV\4W\tW\4X\tX\4Y\tY",
    "\4Z\tZ\4[\t[\4\\\t\\\4]\t]\4^\t^\4_\t_\4`\t`\4a\ta\4b\tb\4c\tc\4d\t",
    "d\4e\te\4f\tf\4g\tg\4h\th\4i\ti\4j\tj\4k\tk\4l\tl\4m\tm\4n\tn\4o\to",
    "\4p\tp\4q\tq\4r\tr\4s\ts\4t\tt\4u\tu\4v\tv\4w\tw\4x\tx\4y\ty\4z\tz\4",
    "{\t{\4|\t|\4}\t}\4~\t~\4\177\t\177\4\u0080\t\u0080\4\u0081\t\u0081\4",
    "\u0082\t\u0082\4\u0083\t\u0083\4\u0084\t\u0084\4\u0085\t\u0085\4\u0086",
    "\t\u0086\4\u0087\t\u0087\4\u0088\t\u0088\4\u0089\t\u0089\4\u008a\t\u008a",
    "\4\u008b\t\u008b\4\u008c\t\u008c\4\u008d\t\u008d\4\u008e\t\u008e\4\u008f",
    "\t\u008f\4\u0090\t\u0090\4\u0091\t\u0091\4\u0092\t\u0092\4\u0093\t\u0093",
    "\4\u0094\t\u0094\3\2\3\2\3\2\3\2\3\2\3\2\3\2\3\2\3\2\3\3\3\3\3\3\3\3",
    "\3\3\3\3\3\3\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\5\3\5\3\5\3\5\3\5\3\5",
    "\3\6\3\6\3\6\3\6\3\6\3\7\3\7\3\7\3\7\3\7\3\b\3\b\3\b\3\b\3\b\3\b\3\t",
    "\3\t\3\t\3\t\3\t\3\n\3\n\3\n\3\n\3\n\3\n\3\13\3\13\3\13\3\13\3\13\3",
    "\13\3\f\3\f\3\f\3\f\3\f\3\f\3\f\3\f\3\f\3\r\3\r\3\r\3\r\3\r\3\r\3\r",
    "\3\r\3\16\3\16\3\16\3\17\3\17\3\17\3\17\3\17\3\17\3\17\3\20\3\20\3\20",
    "\3\20\3\20\3\21\3\21\3\21\3\21\3\21\3\22\3\22\3\22\3\22\3\22\3\22\3",
    "\22\3\22\3\23\3\23\3\23\3\23\3\23\3\23\3\24\3\24\3\24\3\24\3\24\3\24",
    "\3\24\3\24\3\25\3\25\3\25\3\25\3\25\3\25\3\26\3\26\3\26\3\26\3\27\3",
    "\27\3\27\3\30\3\30\3\30\3\30\3\30\3\31\3\31\3\31\3\31\3\31\3\31\3\31",
    "\3\31\3\31\3\31\3\31\3\32\3\32\3\32\3\32\3\32\3\32\3\32\3\33\3\33\3",
    "\33\3\33\3\33\3\33\3\33\3\33\3\33\3\33\3\33\3\34\3\34\3\34\3\34\3\35",
    "\3\35\3\35\3\35\3\35\3\35\3\35\3\35\3\35\3\35\3\36\3\36\3\36\3\36\3",
    "\36\3\37\3\37\3\37\3\37\3\37\3\37\3\37\3 \3 \3 \3 \3!\3!\3!\3!\3!\3",
    "!\3!\3!\3\"\3\"\3\"\3\"\3\"\3\"\3\"\3\"\3#\3#\3#\3#\3#\3#\3#\3#\3#\3",
    "#\3$\3$\3$\3$\3$\3$\3$\3%\3%\3%\3%\3%\3%\3%\3&\3&\3&\3&\3&\3&\3\'\3",
    "\'\3\'\3\'\3\'\3\'\3\'\3(\3(\3(\3(\3(\3(\3(\3(\3(\3)\3)\3)\3)\3)\3)",
    "\3*\3*\3*\3*\3*\3*\3*\3+\3+\3+\3+\3+\3+\3+\3+\3+\3+\3+\3+\3+\3,\3,\3",
    ",\3,\3,\3-\3-\3-\3-\3-\3-\3.\3.\3.\3.\3.\3.\3.\3/\3/\3/\3/\3/\3/\3/",
    "\3/\3/\3/\3\60\3\60\3\60\3\60\3\61\3\61\3\61\3\61\3\61\3\62\3\62\3\62",
    "\3\62\3\62\3\62\3\62\3\62\3\62\3\63\3\63\3\63\3\63\3\63\3\63\3\64\3",
    "\64\3\64\3\64\5\64\u0281\n\64\3\65\3\65\5\65\u0285\n\65\3\66\3\66\5",
    "\66\u0289\n\66\3\67\3\67\5\67\u028d\n\67\38\38\58\u0291\n8\39\39\3:",
    "\3:\3:\5:\u0298\n:\3:\3:\3:\5:\u029d\n:\5:\u029f\n:\3;\3;\7;\u02a3\n",
    ";\f;\16;\u02a6\13;\3;\5;\u02a9\n;\3<\3<\5<\u02ad\n<\3=\3=\3>\3>\5>\u02b3",
    "\n>\3?\6?\u02b6\n?\r?\16?\u02b7\3@\3@\3@\3@\3A\3A\7A\u02c0\nA\fA\16",
    "A\u02c3\13A\3A\5A\u02c6\nA\3B\3B\3C\3C\5C\u02cc\nC\3D\3D\5D\u02d0\n",
    "D\3D\3D\3E\3E\7E\u02d6\nE\fE\16E\u02d9\13E\3E\5E\u02dc\nE\3F\3F\3G\3",
    "G\5G\u02e2\nG\3H\3H\3H\3H\3I\3I\7I\u02ea\nI\fI\16I\u02ed\13I\3I\5I\u02f0",
    "\nI\3J\3J\3K\3K\5K\u02f6\nK\3L\3L\5L\u02fa\nL\3M\3M\3M\5M\u02ff\nM\3",
    "M\5M\u0302\nM\3M\5M\u0305\nM\3M\3M\3M\5M\u030a\nM\3M\5M\u030d\nM\3M",
    "\3M\3M\5M\u0312\nM\3M\3M\3M\5M\u0317\nM\3N\3N\3N\3O\3O\3P\5P\u031f\n",
    "P\3P\3P\3Q\3Q\3R\3R\3S\3S\3S\5S\u032a\nS\3T\3T\5T\u032e\nT\3T\3T\3T",
    "\5T\u0333\nT\3T\3T\5T\u0337\nT\3U\3U\3U\3V\3V\3W\3W\3W\3W\3W\3W\3W\3",
    "W\3W\5W\u0347\nW\3X\3X\3X\3X\3X\3X\3X\3X\5X\u0351\nX\3Y\3Y\3Z\3Z\5Z",
    "\u0357\nZ\3Z\3Z\3[\6[\u035c\n[\r[\16[\u035d\3\\\3\\\5\\\u0362\n\\\3",
    "]\3]\3]\3]\5]\u0368\n]\3^\3^\3^\3^\3^\3^\3^\3^\3^\3^\3^\5^\u0375\n^",
    "\3_\3_\3_\3_\3_\3_\3_\3`\3`\3a\3a\3a\3a\3a\3b\3b\3c\3c\3d\3d\3e\3e\3",
    "f\3f\3g\3g\3h\3h\3i\3i\3j\3j\3k\3k\3l\3l\3m\3m\3n\3n\3o\3o\3p\3p\3q",
    "\3q\3r\3r\3r\3s\3s\3s\3t\3t\3t\3u\3u\3u\3v\3v\3v\3w\3w\3w\3x\3x\3x\3",
    "y\3y\3y\3z\3z\3{\3{\3|\3|\3}\3}\3~\3~\3\177\3\177\3\u0080\3\u0080\3",
    "\u0081\3\u0081\3\u0082\3\u0082\3\u0082\3\u0083\3\u0083\3\u0083\3\u0084",
    "\3\u0084\3\u0084\3\u0085\3\u0085\3\u0085\3\u0086\3\u0086\3\u0086\3\u0087",
    "\3\u0087\3\u0087\3\u0088\3\u0088\3\u0088\3\u0089\3\u0089\3\u0089\3\u008a",
    "\3\u008a\3\u008a\3\u008a\3\u008b\3\u008b\3\u008b\3\u008b\3\u008c\3\u008c",
    "\3\u008c\3\u008c\3\u008c\3\u008d\3\u008d\7\u008d\u03f4\n\u008d\f\u008d",
    "\16\u008d\u03f7\13\u008d\3\u008e\3\u008e\3\u008e\3\u008e\5\u008e\u03fd",
    "\n\u008e\3\u008f\3\u008f\3\u008f\3\u008f\5\u008f\u0403\n\u008f\3\u0090",
    "\3\u0090\3\u0091\3\u0091\3\u0091\3\u0091\3\u0092\6\u0092\u040c\n\u0092",
    "\r\u0092\16\u0092\u040d\3\u0092\3\u0092\3\u0093\3\u0093\3\u0093\3\u0093",
    "\7\u0093\u0416\n\u0093\f\u0093\16\u0093\u0419\13\u0093\3\u0093\3\u0093",
    "\3\u0093\3\u0093\3\u0093\3\u0094\3\u0094\3\u0094\3\u0094\7\u0094\u0424",
    "\n\u0094\f\u0094\16\u0094\u0427\13\u0094\3\u0094\3\u0094\3\u0417\2\u0095",
    "\3\3\5\4\7\5\t\6\13\7\r\b\17\t\21\n\23\13\25\f\27\r\31\16\33\17\35\20",
    "\37\21!\22#\23%\24\'\25)\26+\27-\30/\31\61\32\63\33\65\34\67\359\36",
    ";\37= ?!A\"C#E$G%I&K\'M(O)Q*S+U,W-Y.[/]\60_\61a\62c\63e\64g\65i\2k\2",
    "m\2o\2q\2s\2u\2w\2y\2{\2}\2\177\2\u0081\2\u0083\2\u0085\2\u0087\2\u0089",
    "\2\u008b\2\u008d\2\u008f\2\u0091\2\u0093\2\u0095\2\u0097\66\u0099\2",
    "\u009b\2\u009d\2\u009f\2\u00a1\2\u00a3\2\u00a5\2\u00a7\2\u00a9\2\u00ab",
    "\2\u00ad\67\u00af8\u00b1\2\u00b39\u00b5\2\u00b7\2\u00b9\2\u00bb\2\u00bd",
    "\2\u00bf\2\u00c1:\u00c3;\u00c5<\u00c7=\u00c9>\u00cb?\u00cd@\u00cfA\u00d1",
    "B\u00d3C\u00d5D\u00d7E\u00d9F\u00dbG\u00ddH\u00dfI\u00e1J\u00e3K\u00e5",
    "L\u00e7M\u00e9N\u00ebO\u00edP\u00efQ\u00f1R\u00f3S\u00f5T\u00f7U\u00f9",
    "V\u00fbW\u00fdX\u00ffY\u0101Z\u0103[\u0105\\\u0107]\u0109^\u010b_\u010d",
    "`\u010fa\u0111b\u0113c\u0115d\u0117e\u0119f\u011b\2\u011d\2\u011fg\u0121",
    "h\u0123i\u0125j\u0127k\3\2\30\4\2NNnn\3\2\63;\4\2ZZzz\5\2\62;CHch\3",
    "\2\629\4\2DDdd\3\2\62\63\4\2GGgg\4\2--//\6\2FFHHffhh\4\2RRrr\4\2))^",
    "^\4\2$$^^\n\2$$))^^ddhhppttvv\3\2\62\65\6\2&&C\\aac|\4\2\2\u0101\ud802",
    "\udc01\3\2\ud802\udc01\3\2\udc02\ue001\7\2&&\62;C\\aac|\5\2\13\f\16",
    "\17\"\"\4\2\f\f\17\17\u0438\2\3\3\2\2\2\2\5\3\2\2\2\2\7\3\2\2\2\2\t",
    "\3\2\2\2\2\13\3\2\2\2\2\r\3\2\2\2\2\17\3\2\2\2\2\21\3\2\2\2\2\23\3\2",
    "\2\2\2\25\3\2\2\2\2\27\3\2\2\2\2\31\3\2\2\2\2\33\3\2\2\2\2\35\3\2\2",
    "\2\2\37\3\2\2\2\2!\3\2\2\2\2#\3\2\2\2\2%\3\2\2\2\2\'\3\2\2\2\2)\3\2",
    "\2\2\2+\3\2\2\2\2-\3\2\2\2\2/\3\2\2\2\2\61\3\2\2\2\2\63\3\2\2\2\2\65",
    "\3\2\2\2\2\67\3\2\2\2\29\3\2\2\2\2;\3\2\2\2\2=\3\2\2\2\2?\3\2\2\2\2",
    "A\3\2\2\2\2C\3\2\2\2\2E\3\2\2\2\2G\3\2\2\2\2I\3\2\2\2\2K\3\2\2\2\2M",
    "\3\2\2\2\2O\3\2\2\2\2Q\3\2\2\2\2S\3\2\2\2\2U\3\2\2\2\2W\3\2\2\2\2Y\3",
    "\2\2\2\2[\3\2\2\2\2]\3\2\2\2\2_\3\2\2\2\2a\3\2\2\2\2c\3\2\2\2\2e\3\2",
    "\2\2\2g\3\2\2\2\2\u0097\3\2\2\2\2\u00ad\3\2\2\2\2\u00af\3\2\2\2\2\u00b3",
    "\3\2\2\2\2\u00c1\3\2\2\2\2\u00c3\3\2\2\2\2\u00c5\3\2\2\2\2\u00c7\3\2",
    "\2\2\2\u00c9\3\2\2\2\2\u00cb\3\2\2\2\2\u00cd\3\2\2\2\2\u00cf\3\2\2\2",
    "\2\u00d1\3\2\2\2\2\u00d3\3\2\2\2\2\u00d5\3\2\2\2\2\u00d7\3\2\2\2\2\u00d9",
    "\3\2\2\2\2\u00db\3\2\2\2\2\u00dd\3\2\2\2\2\u00df\3\2\2\2\2\u00e1\3\2",
    "\2\2\2\u00e3\3\2\2\2\2\u00e5\3\2\2\2\2\u00e7\3\2\2\2\2\u00e9\3\2\2\2",
    "\2\u00eb\3\2\2\2\2\u00ed\3\2\2\2\2\u00ef\3\2\2\2\2\u00f1\3\2\2\2\2\u00f3",
    "\3\2\2\2\2\u00f5\3\2\2\2\2\u00f7\3\2\2\2\2\u00f9\3\2\2\2\2\u00fb\3\2",
    "\2\2\2\u00fd\3\2\2\2\2\u00ff\3\2\2\2\2\u0101\3\2\2\2\2\u0103\3\2\2\2",
    "\2\u0105\3\2\2\2\2\u0107\3\2\2\2\2\u0109\3\2\2\2\2\u010b\3\2\2\2\2\u010d",
    "\3\2\2\2\2\u010f\3\2\2\2\2\u0111\3\2\2\2\2\u0113\3\2\2\2\2\u0115\3\2",
    "\2\2\2\u0117\3\2\2\2\2\u0119\3\2\2\2\2\u011f\3\2\2\2\2\u0121\3\2\2\2",
    "\2\u0123\3\2\2\2\2\u0125\3\2\2\2\2\u0127\3\2\2\2\3\u0129\3\2\2\2\5\u0132",
    "\3\2\2\2\7\u0139\3\2\2\2\t\u0141\3\2\2\2\13\u0147\3\2\2\2\r\u014c\3",
    "\2\2\2\17\u0151\3\2\2\2\21\u0157\3\2\2\2\23\u015c\3\2\2\2\25\u0162\3",
    "\2\2\2\27\u0168\3\2\2\2\31\u0171\3\2\2\2\33\u0179\3\2\2\2\35\u017c\3",
    "\2\2\2\37\u0183\3\2\2\2!\u0188\3\2\2\2#\u018d\3\2\2\2%\u0195\3\2\2\2",
    "\'\u019b\3\2\2\2)\u01a3\3\2\2\2+\u01a9\3\2\2\2-\u01ad\3\2\2\2/\u01b0",
    "\3\2\2\2\61\u01b5\3\2\2\2\63\u01c0\3\2\2\2\65\u01c7\3\2\2\2\67\u01d2",
    "\3\2\2\29\u01d6\3\2\2\2;\u01e0\3\2\2\2=\u01e5\3\2\2\2?\u01ec\3\2\2\2",
    "A\u01f0\3\2\2\2C\u01f8\3\2\2\2E\u0200\3\2\2\2G\u020a\3\2\2\2I\u0211",
    "\3\2\2\2K\u0218\3\2\2\2M\u021e\3\2\2\2O\u0225\3\2\2\2Q\u022e\3\2\2\2",
    "S\u0234\3\2\2\2U\u023b\3\2\2\2W\u0248\3\2\2\2Y\u024d\3\2\2\2[\u0253",
    "\3\2\2\2]\u025a\3\2\2\2_\u0264\3\2\2\2a\u0268\3\2\2\2c\u026d\3\2\2\2",
    "e\u0276\3\2\2\2g\u0280\3\2\2\2i\u0282\3\2\2\2k\u0286\3\2\2\2m\u028a",
    "\3\2\2\2o\u028e\3\2\2\2q\u0292\3\2\2\2s\u029e\3\2\2\2u\u02a0\3\2\2\2",
    "w\u02ac\3\2\2\2y\u02ae\3\2\2\2{\u02b2\3\2\2\2}\u02b5\3\2\2\2\177\u02b9",
    "\3\2\2\2\u0081\u02bd\3\2\2\2\u0083\u02c7\3\2\2\2\u0085\u02cb\3\2\2\2",
    "\u0087\u02cd\3\2\2\2\u0089\u02d3\3\2\2\2\u008b\u02dd\3\2\2\2\u008d\u02e1",
    "\3\2\2\2\u008f\u02e3\3\2\2\2\u0091\u02e7\3\2\2\2\u0093\u02f1\3\2\2\2",
    "\u0095\u02f5\3\2\2\2\u0097\u02f9\3\2\2\2\u0099\u0316\3\2\2\2\u009b\u0318",
    "\3\2\2\2\u009d\u031b\3\2\2\2\u009f\u031e\3\2\2\2\u00a1\u0322\3\2\2\2",
    "\u00a3\u0324\3\2\2\2\u00a5\u0326\3\2\2\2\u00a7\u0336\3\2\2\2\u00a9\u0338",
    "\3\2\2\2\u00ab\u033b\3\2\2\2\u00ad\u0346\3\2\2\2\u00af\u0350\3\2\2\2",
    "\u00b1\u0352\3\2\2\2\u00b3\u0354\3\2\2\2\u00b5\u035b\3\2\2\2\u00b7\u0361",
    "\3\2\2\2\u00b9\u0367\3\2\2\2\u00bb\u0374\3\2\2\2\u00bd\u0376\3\2\2\2",
    "\u00bf\u037d\3\2\2\2\u00c1\u037f\3\2\2\2\u00c3\u0384\3\2\2\2\u00c5\u0386",
    "\3\2\2\2\u00c7\u0388\3\2\2\2\u00c9\u038a\3\2\2\2\u00cb\u038c\3\2\2\2",
    "\u00cd\u038e\3\2\2\2\u00cf\u0390\3\2\2\2\u00d1\u0392\3\2\2\2\u00d3\u0394",
    "\3\2\2\2\u00d5\u0396\3\2\2\2\u00d7\u0398\3\2\2\2\u00d9\u039a\3\2\2\2",
    "\u00db\u039c\3\2\2\2\u00dd\u039e\3\2\2\2\u00df\u03a0\3\2\2\2\u00e1\u03a2",
    "\3\2\2\2\u00e3\u03a4\3\2\2\2\u00e5\u03a7\3\2\2\2\u00e7\u03aa\3\2\2\2",
    "\u00e9\u03ad\3\2\2\2\u00eb\u03b0\3\2\2\2\u00ed\u03b3\3\2\2\2\u00ef\u03b6",
    "\3\2\2\2\u00f1\u03b9\3\2\2\2\u00f3\u03bc\3\2\2\2\u00f5\u03be\3\2\2\2",
    "\u00f7\u03c0\3\2\2\2\u00f9\u03c2\3\2\2\2\u00fb\u03c4\3\2\2\2\u00fd\u03c6",
    "\3\2\2\2\u00ff\u03c8\3\2\2\2\u0101\u03ca\3\2\2\2\u0103\u03cc\3\2\2\2",
    "\u0105\u03cf\3\2\2\2\u0107\u03d2\3\2\2\2\u0109\u03d5\3\2\2\2\u010b\u03d8",
    "\3\2\2\2\u010d\u03db\3\2\2\2\u010f\u03de\3\2\2\2\u0111\u03e1\3\2\2\2",
    "\u0113\u03e4\3\2\2\2\u0115\u03e8\3\2\2\2\u0117\u03ec\3\2\2\2\u0119\u03f1",
    "\3\2\2\2\u011b\u03fc\3\2\2\2\u011d\u0402\3\2\2\2\u011f\u0404\3\2\2\2",
    "\u0121\u0406\3\2\2\2\u0123\u040b\3\2\2\2\u0125\u0411\3\2\2\2\u0127\u041f",
    "\3\2\2\2\u0129\u012a\7c\2\2\u012a\u012b\7d\2\2\u012b\u012c\7u\2\2\u012c",
    "\u012d\7v\2\2\u012d\u012e\7t\2\2\u012e\u012f\7c\2\2\u012f\u0130\7e\2",
    "\2\u0130\u0131\7v\2\2\u0131\4\3\2\2\2\u0132\u0133\7c\2\2\u0133\u0134",
    "\7u\2\2\u0134\u0135\7u\2\2\u0135\u0136\7g\2\2\u0136\u0137\7t\2\2\u0137",
    "\u0138\7v\2\2\u0138\6\3\2\2\2\u0139\u013a\7d\2\2\u013a\u013b\7q\2\2",
    "\u013b\u013c\7q\2\2\u013c\u013d\7n\2\2\u013d\u013e\7g\2\2\u013e\u013f",
    "\7c\2\2\u013f\u0140\7p\2\2\u0140\b\3\2\2\2\u0141\u0142\7d\2\2\u0142",
    "\u0143\7t\2\2\u0143\u0144\7g\2\2\u0144\u0145\7c\2\2\u0145\u0146\7m\2",
    "\2\u0146\n\3\2\2\2\u0147\u0148\7d\2\2\u0148\u0149\7{\2\2\u0149\u014a",
    "\7v\2\2\u014a\u014b\7g\2\2\u014b\f\3\2\2\2\u014c\u014d\7e\2\2\u014d",
    "\u014e\7c\2\2\u014e\u014f\7u\2\2\u014f\u0150\7g\2\2\u0150\16\3\2\2\2",
    "\u0151\u0152\7e\2\2\u0152\u0153\7c\2\2\u0153\u0154\7v\2\2\u0154\u0155",
    "\7e\2\2\u0155\u0156\7j\2\2\u0156\20\3\2\2\2\u0157\u0158\7e\2\2\u0158",
    "\u0159\7j\2\2\u0159\u015a\7c\2\2\u015a\u015b\7t\2\2\u015b\22\3\2\2\2",
    "\u015c\u015d\7e\2\2\u015d\u015e\7n\2\2\u015e\u015f\7c\2\2\u015f\u0160",
    "\7u\2\2\u0160\u0161\7u\2\2\u0161\24\3\2\2\2\u0162\u0163\7e\2\2\u0163",
    "\u0164\7q\2\2\u0164\u0165\7p\2\2\u0165\u0166\7u\2\2\u0166\u0167\7v\2",
    "\2\u0167\26\3\2\2\2\u0168\u0169\7e\2\2\u0169\u016a\7q\2\2\u016a\u016b",
    "\7p\2\2\u016b\u016c\7v\2\2\u016c\u016d\7k\2\2\u016d\u016e\7p\2\2\u016e",
    "\u016f\7w\2\2\u016f\u0170\7g\2\2\u0170\30\3\2\2\2\u0171\u0172\7f\2\2",
    "\u0172\u0173\7g\2\2\u0173\u0174\7h\2\2\u0174\u0175\7c\2\2\u0175\u0176",
    "\7w\2\2\u0176\u0177\7n\2\2\u0177\u0178\7v\2\2\u0178\32\3\2\2\2\u0179",
    "\u017a\7f\2\2\u017a\u017b\7q\2\2\u017b\34\3\2\2\2\u017c\u017d\7f\2\2",
    "\u017d\u017e\7q\2\2\u017e\u017f\7w\2\2\u017f\u0180\7d\2\2\u0180\u0181",
    "\7n\2\2\u0181\u0182\7g\2\2\u0182\36\3\2\2\2\u0183\u0184\7g\2\2\u0184",
    "\u0185\7n\2\2\u0185\u0186\7u\2\2\u0186\u0187\7g\2\2\u0187 \3\2\2\2\u0188",
    "\u0189\7g\2\2\u0189\u018a\7p\2\2\u018a\u018b\7w\2\2\u018b\u018c\7o\2",
    "\2\u018c\"\3\2\2\2\u018d\u018e\7g\2\2\u018e\u018f\7z\2\2\u018f\u0190",
    "\7v\2\2\u0190\u0191\7g\2\2\u0191\u0192\7p\2\2\u0192\u0193\7f\2\2\u0193",
    "\u0194\7u\2\2\u0194$\3\2\2\2\u0195\u0196\7h\2\2\u0196\u0197\7k\2\2\u0197",
    "\u0198\7p\2\2\u0198\u0199\7c\2\2\u0199\u019a\7n\2\2\u019a&\3\2\2\2\u019b",
    "\u019c\7h\2\2\u019c\u019d\7k\2\2\u019d\u019e\7p\2\2\u019e\u019f\7c\2",
    "\2\u019f\u01a0\7n\2\2\u01a0\u01a1\7n\2\2\u01a1\u01a2\7{\2\2\u01a2(\3",
    "\2\2\2\u01a3\u01a4\7h\2\2\u01a4\u01a5\7n\2\2\u01a5\u01a6\7q\2\2\u01a6",
    "\u01a7\7c\2\2\u01a7\u01a8\7v\2\2\u01a8*\3\2\2\2\u01a9\u01aa\7h\2\2\u01aa",
    "\u01ab\7q\2\2\u01ab\u01ac\7t\2\2\u01ac,\3\2\2\2\u01ad\u01ae\7k\2\2\u01ae",
    "\u01af\7h\2\2\u01af.\3\2\2\2\u01b0\u01b1\7i\2\2\u01b1\u01b2\7q\2\2\u01b2",
    "\u01b3\7v\2\2\u01b3\u01b4\7q\2\2\u01b4\60\3\2\2\2\u01b5\u01b6\7k\2\2",
    "\u01b6\u01b7\7o\2\2\u01b7\u01b8\7r\2\2\u01b8\u01b9\7n\2\2\u01b9\u01ba",
    "\7g\2\2\u01ba\u01bb\7o\2\2\u01bb\u01bc\7g\2\2\u01bc\u01bd\7p\2\2\u01bd",
    "\u01be\7v\2\2\u01be\u01bf\7u\2\2\u01bf\62\3\2\2\2\u01c0\u01c1\7k\2\2",
    "\u01c1\u01c2\7o\2\2\u01c2\u01c3\7r\2\2\u01c3\u01c4\7q\2\2\u01c4\u01c5",
    "\7t\2\2\u01c5\u01c6\7v\2\2\u01c6\64\3\2\2\2\u01c7\u01c8\7k\2\2\u01c8",
    "\u01c9\7p\2\2\u01c9\u01ca\7u\2\2\u01ca\u01cb\7v\2\2\u01cb\u01cc\7c\2",
    "\2\u01cc\u01cd\7p\2\2\u01cd\u01ce\7e\2\2\u01ce\u01cf\7g\2\2\u01cf\u01d0",
    "\7q\2\2\u01d0\u01d1\7h\2\2\u01d1\66\3\2\2\2\u01d2\u01d3\7k\2\2\u01d3",
    "\u01d4\7p\2\2\u01d4\u01d5\7v\2\2\u01d58\3\2\2\2\u01d6\u01d7\7k\2\2\u01d7",
    "\u01d8\7p\2\2\u01d8\u01d9\7v\2\2\u01d9\u01da\7g\2\2\u01da\u01db\7t\2",
    "\2\u01db\u01dc\7h\2\2\u01dc\u01dd\7c\2\2\u01dd\u01de\7e\2\2\u01de\u01df",
    "\7g\2\2\u01df:\3\2\2\2\u01e0\u01e1\7n\2\2\u01e1\u01e2\7q\2\2\u01e2\u01e3",
    "\7p\2\2\u01e3\u01e4\7i\2\2\u01e4<\3\2\2\2\u01e5\u01e6\7p\2\2\u01e6\u01e7",
    "\7c\2\2\u01e7\u01e8\7v\2\2\u01e8\u01e9\7k\2\2\u01e9\u01ea\7x\2\2\u01ea",
    "\u01eb\7g\2\2\u01eb>\3\2\2\2\u01ec\u01ed\7p\2\2\u01ed\u01ee\7g\2\2\u01ee",
    "\u01ef\7y\2\2\u01ef@\3\2\2\2\u01f0\u01f1\7r\2\2\u01f1\u01f2\7c\2\2\u01f2",
    "\u01f3\7e\2\2\u01f3\u01f4\7m\2\2\u01f4\u01f5\7c\2\2\u01f5\u01f6\7i\2",
    "\2\u01f6\u01f7\7g\2\2\u01f7B\3\2\2\2\u01f8\u01f9\7r\2\2\u01f9\u01fa",
    "\7t\2\2\u01fa\u01fb\7k\2\2\u01fb\u01fc\7x\2\2\u01fc\u01fd\7c\2\2\u01fd",
    "\u01fe\7v\2\2\u01fe\u01ff\7g\2\2\u01ffD\3\2\2\2\u0200\u0201\7r\2\2\u0201",
    "\u0202\7t\2\2\u0202\u0203\7q\2\2\u0203\u0204\7v\2\2\u0204\u0205\7g\2",
    "\2\u0205\u0206\7e\2\2\u0206\u0207\7v\2\2\u0207\u0208\7g\2\2\u0208\u0209",
    "\7f\2\2\u0209F\3\2\2\2\u020a\u020b\7r\2\2\u020b\u020c\7w\2\2\u020c\u020d",
    "\7d\2\2\u020d\u020e\7n\2\2\u020e\u020f\7k\2\2\u020f\u0210\7e\2\2\u0210",
    "H\3\2\2\2\u0211\u0212\7t\2\2\u0212\u0213\7g\2\2\u0213\u0214\7v\2\2\u0214",
    "\u0215\7w\2\2\u0215\u0216\7t\2\2\u0216\u0217\7p\2\2\u0217J\3\2\2\2\u0218",
    "\u0219\7u\2\2\u0219\u021a\7j\2\2\u021a\u021b\7q\2\2\u021b\u021c\7t\2",
    "\2\u021c\u021d\7v\2\2\u021dL\3\2\2\2\u021e\u021f\7u\2\2\u021f\u0220",
    "\7v\2\2\u0220\u0221\7c\2\2\u0221\u0222\7v\2\2\u0222\u0223\7k\2\2\u0223",
    "\u0224\7e\2\2\u0224N\3\2\2\2\u0225\u0226\7u\2\2\u0226\u0227\7v\2\2\u0227",
    "\u0228\7t\2\2\u0228\u0229\7k\2\2\u0229\u022a\7e\2\2\u022a\u022b\7v\2",
    "\2\u022b\u022c\7h\2\2\u022c\u022d\7r\2\2\u022dP\3\2\2\2\u022e\u022f",
    "\7u\2\2\u022f\u0230\7w\2\2\u0230\u0231\7r\2\2\u0231\u0232\7g\2\2\u0232",
    "\u0233\7t\2\2\u0233R\3\2\2\2\u0234\u0235\7u\2\2\u0235\u0236\7y\2\2\u0236",
    "\u0237\7k\2\2\u0237\u0238\7v\2\2\u0238\u0239\7e\2\2\u0239\u023a\7j\2",
    "\2\u023aT\3\2\2\2\u023b\u023c\7u\2\2\u023c\u023d\7{\2\2\u023d\u023e",
    "\7p\2\2\u023e\u023f\7e\2\2\u023f\u0240\7j\2\2\u0240\u0241\7t\2\2\u0241",
    "\u0242\7q\2\2\u0242\u0243\7p\2\2\u0243\u0244\7k\2\2\u0244\u0245\7|\2",
    "\2\u0245\u0246\7g\2\2\u0246\u0247\7f\2\2\u0247V\3\2\2\2\u0248\u0249",
    "\7v\2\2\u0249\u024a\7j\2\2\u024a\u024b\7k\2\2\u024b\u024c\7u\2\2\u024c",
    "X\3\2\2\2\u024d\u024e\7v\2\2\u024e\u024f\7j\2\2\u024f\u0250\7t\2\2\u0250",
    "\u0251\7q\2\2\u0251\u0252\7y\2\2\u0252Z\3\2\2\2\u0253\u0254\7v\2\2\u0254",
    "\u0255\7j\2\2\u0255\u0256\7t\2\2\u0256\u0257\7q\2\2\u0257\u0258\7y\2",
    "\2\u0258\u0259\7u\2\2\u0259\\\3\2\2\2\u025a\u025b\7v\2\2\u025b\u025c",
    "\7t\2\2\u025c\u025d\7c\2\2\u025d\u025e\7p\2\2\u025e\u025f\7u\2\2\u025f",
    "\u0260\7k\2\2\u0260\u0261\7g\2\2\u0261\u0262\7p\2\2\u0262\u0263\7v\2",
    "\2\u0263^\3\2\2\2\u0264\u0265\7v\2\2\u0265\u0266\7t\2\2\u0266\u0267",
    "\7{\2\2\u0267`\3\2\2\2\u0268\u0269\7x\2\2\u0269\u026a\7q\2\2\u026a\u026b",
    "\7k\2\2\u026b\u026c\7f\2\2\u026cb\3\2\2\2\u026d\u026e\7x\2\2\u026e\u026f",
    "\7q\2\2\u026f\u0270\7n\2\2\u0270\u0271\7c\2\2\u0271\u0272\7v\2\2\u0272",
    "\u0273\7k\2\2\u0273\u0274\7n\2\2\u0274\u0275\7g\2\2\u0275d\3\2\2\2\u0276",
    "\u0277\7y\2\2\u0277\u0278\7j\2\2\u0278\u0279\7k\2\2\u0279\u027a\7n\2",
    "\2\u027a\u027b\7g\2\2\u027bf\3\2\2\2\u027c\u0281\5i\65\2\u027d\u0281",
    "\5k\66\2\u027e\u0281\5m\67\2\u027f\u0281\5o8\2\u0280\u027c\3\2\2\2\u0280",
    "\u027d\3\2\2\2\u0280\u027e\3\2\2\2\u0280\u027f\3\2\2\2\u0281h\3\2\2",
    "\2\u0282\u0284\5s:\2\u0283\u0285\5q9\2\u0284\u0283\3\2\2\2\u0284\u0285",
    "\3\2\2\2\u0285j\3\2\2\2\u0286\u0288\5\177@\2\u0287\u0289\5q9\2\u0288",
    "\u0287\3\2\2\2\u0288\u0289\3\2\2\2\u0289l\3\2\2\2\u028a\u028c\5\u0087",
    "D\2\u028b\u028d\5q9\2\u028c\u028b\3\2\2\2\u028c\u028d\3\2\2\2\u028d",
    "n\3\2\2\2\u028e\u0290\5\u008fH\2\u028f\u0291\5q9\2\u0290\u028f\3\2\2",
    "\2\u0290\u0291\3\2\2\2\u0291p\3\2\2\2\u0292\u0293\t\2\2\2\u0293r\3\2",
    "\2\2\u0294\u029f\7\62\2\2\u0295\u029c\5y=\2\u0296\u0298\5u;\2\u0297",
    "\u0296\3\2\2\2\u0297\u0298\3\2\2\2\u0298\u029d\3\2\2\2\u0299\u029a\5",
    "}?\2\u029a\u029b\5u;\2\u029b\u029d\3\2\2\2\u029c\u0297\3\2\2\2\u029c",
    "\u0299\3\2\2\2\u029d\u029f\3\2\2\2\u029e\u0294\3\2\2\2\u029e\u0295\3",
    "\2\2\2\u029ft\3\2\2\2\u02a0\u02a8\5w<\2\u02a1\u02a3\5{>\2\u02a2\u02a1",
    "\3\2\2\2\u02a3\u02a6\3\2\2\2\u02a4\u02a2\3\2\2\2\u02a4\u02a5\3\2\2\2",
    "\u02a5\u02a7\3\2\2\2\u02a6\u02a4\3\2\2\2\u02a7\u02a9\5w<\2\u02a8\u02a4",
    "\3\2\2\2\u02a8\u02a9\3\2\2\2\u02a9v\3\2\2\2\u02aa\u02ad\7\62\2\2\u02ab",
    "\u02ad\5y=\2\u02ac\u02aa\3\2\2\2\u02ac\u02ab\3\2\2\2\u02adx\3\2\2\2",
    "\u02ae\u02af\t\3\2\2\u02afz\3\2\2\2\u02b0\u02b3\5w<\2\u02b1\u02b3\7",
    "a\2\2\u02b2\u02b0\3\2\2\2\u02b2\u02b1\3\2\2\2\u02b3|\3\2\2\2\u02b4\u02b6",
    "\7a\2\2\u02b5\u02b4\3\2\2\2\u02b6\u02b7\3\2\2\2\u02b7\u02b5\3\2\2\2",
    "\u02b7\u02b8\3\2\2\2\u02b8~\3\2\2\2\u02b9\u02ba\7\62\2\2\u02ba\u02bb",
    "\t\4\2\2\u02bb\u02bc\5\u0081A\2\u02bc\u0080\3\2\2\2\u02bd\u02c5\5\u0083",
    "B\2\u02be\u02c0\5\u0085C\2\u02bf\u02be\3\2\2\2\u02c0\u02c3\3\2\2\2\u02c1",
    "\u02bf\3\2\2\2\u02c1\u02c2\3\2\2\2\u02c2\u02c4\3\2\2\2\u02c3\u02c1\3",
    "\2\2\2\u02c4\u02c6\5\u0083B\2\u02c5\u02c1\3\2\2\2\u02c5\u02c6\3\2\2",
    "\2\u02c6\u0082\3\2\2\2\u02c7\u02c8\t\5\2\2\u02c8\u0084\3\2\2\2\u02c9",
    "\u02cc\5\u0083B\2\u02ca\u02cc\7a\2\2\u02cb\u02c9\3\2\2\2\u02cb\u02ca",
    "\3\2\2\2\u02cc\u0086\3\2\2\2\u02cd\u02cf\7\62\2\2\u02ce\u02d0\5}?\2",
    "\u02cf\u02ce\3\2\2\2\u02cf\u02d0\3\2\2\2\u02d0\u02d1\3\2\2\2\u02d1\u02d2",
    "\5\u0089E\2\u02d2\u0088\3\2\2\2\u02d3\u02db\5\u008bF\2\u02d4\u02d6\5",
    "\u008dG\2\u02d5\u02d4\3\2\2\2\u02d6\u02d9\3\2\2\2\u02d7\u02d5\3\2\2",
    "\2\u02d7\u02d8\3\2\2\2\u02d8\u02da\3\2\2\2\u02d9\u02d7\3\2\2\2\u02da",
    "\u02dc\5\u008bF\2\u02db\u02d7\3\2\2\2\u02db\u02dc\3\2\2\2\u02dc\u008a",
    "\3\2\2\2\u02dd\u02de\t\6\2\2\u02de\u008c\3\2\2\2\u02df\u02e2\5\u008b",
    "F\2\u02e0\u02e2\7a\2\2\u02e1\u02df\3\2\2\2\u02e1\u02e0\3\2\2\2\u02e2",
    "\u008e\3\2\2\2\u02e3\u02e4\7\62\2\2\u02e4\u02e5\t\7\2\2\u02e5\u02e6",
    "\5\u0091I\2\u02e6\u0090\3\2\2\2\u02e7\u02ef\5\u0093J\2\u02e8\u02ea\5",
    "\u0095K\2\u02e9\u02e8\3\2\2\2\u02ea\u02ed\3\2\2\2\u02eb\u02e9\3\2\2",
    "\2\u02eb\u02ec\3\2\2\2\u02ec\u02ee\3\2\2\2\u02ed\u02eb\3\2\2\2\u02ee",
    "\u02f0\5\u0093J\2\u02ef\u02eb\3\2\2\2\u02ef\u02f0\3\2\2\2\u02f0\u0092",
    "\3\2\2\2\u02f1\u02f2\t\b\2\2\u02f2\u0094\3\2\2\2\u02f3\u02f6\5\u0093",
    "J\2\u02f4\u02f6\7a\2\2\u02f5\u02f3\3\2\2\2\u02f5\u02f4\3\2\2\2\u02f6",
    "\u0096\3\2\2\2\u02f7\u02fa\5\u0099M\2\u02f8\u02fa\5\u00a5S\2\u02f9\u02f7",
    "\3\2\2\2\u02f9\u02f8\3\2\2\2\u02fa\u0098\3\2\2\2\u02fb\u02fc\5u;\2\u02fc",
    "\u02fe\7\60\2\2\u02fd\u02ff\5u;\2\u02fe\u02fd\3\2\2\2\u02fe\u02ff\3",
    "\2\2\2\u02ff\u0301\3\2\2\2\u0300\u0302\5\u009bN\2\u0301\u0300\3\2\2",
    "\2\u0301\u0302\3\2\2\2\u0302\u0304\3\2\2\2\u0303\u0305\5\u00a3R\2\u0304",
    "\u0303\3\2\2\2\u0304\u0305\3\2\2\2\u0305\u0317\3\2\2\2\u0306\u0307\7",
    "\60\2\2\u0307\u0309\5u;\2\u0308\u030a\5\u009bN\2\u0309\u0308\3\2\2\2",
    "\u0309\u030a\3\2\2\2\u030a\u030c\3\2\2\2\u030b\u030d\5\u00a3R\2\u030c",
    "\u030b\3\2\2\2\u030c\u030d\3\2\2\2\u030d\u0317\3\2\2\2\u030e\u030f\5",
    "u;\2\u030f\u0311\5\u009bN\2\u0310\u0312\5\u00a3R\2\u0311\u0310\3\2\2",
    "\2\u0311\u0312\3\2\2\2\u0312\u0317\3\2\2\2\u0313\u0314\5u;\2\u0314\u0315",
    "\5\u00a3R\2\u0315\u0317\3\2\2\2\u0316\u02fb\3\2\2\2\u0316\u0306\3\2",
    "\2\2\u0316\u030e\3\2\2\2\u0316\u0313\3\2\2\2\u0317\u009a\3\2\2\2\u0318",
    "\u0319\5\u009dO\2\u0319\u031a\5\u009fP\2\u031a\u009c\3\2\2\2\u031b\u031c",
    "\t\t\2\2\u031c\u009e\3\2\2\2\u031d\u031f\5\u00a1Q\2\u031e\u031d\3\2",
    "\2\2\u031e\u031f\3\2\2\2\u031f\u0320\3\2\2\2\u0320\u0321\5u;\2\u0321",
    "\u00a0\3\2\2\2\u0322\u0323\t\n\2\2\u0323\u00a2\3\2\2\2\u0324\u0325\t",
    "\13\2\2\u0325\u00a4\3\2\2\2\u0326\u0327\5\u00a7T\2\u0327\u0329\5\u00a9",
    "U\2\u0328\u032a\5\u00a3R\2\u0329\u0328\3\2\2\2\u0329\u032a\3\2\2\2\u032a",
    "\u00a6\3\2\2\2\u032b\u032d\5\177@\2\u032c\u032e\7\60\2\2\u032d\u032c",
    "\3\2\2\2\u032d\u032e\3\2\2\2\u032e\u0337\3\2\2\2\u032f\u0330\7\62\2",
    "\2\u0330\u0332\t\4\2\2\u0331\u0333\5\u0081A\2\u0332\u0331\3\2\2\2\u0332",
    "\u0333\3\2\2\2\u0333\u0334\3\2\2\2\u0334\u0335\7\60\2\2\u0335\u0337",
    "\5\u0081A\2\u0336\u032b\3\2\2\2\u0336\u032f\3\2\2\2\u0337\u00a8\3\2",
    "\2\2\u0338\u0339\5\u00abV\2\u0339\u033a\5\u009fP\2\u033a\u00aa\3\2\2",
    "\2\u033b\u033c\t\f\2\2\u033c\u00ac\3\2\2\2\u033d\u033e\7v\2\2\u033e",
    "\u033f\7t\2\2\u033f\u0340\7w\2\2\u0340\u0347\7g\2\2\u0341\u0342\7h\2",
    "\2\u0342\u0343\7c\2\2\u0343\u0344\7n\2\2\u0344\u0345\7u\2\2\u0345\u0347",
    "\7g\2\2\u0346\u033d\3\2\2\2\u0346\u0341\3\2\2\2\u0347\u00ae\3\2\2\2",
    "\u0348\u0349\7)\2\2\u0349\u034a\5\u00b1Y\2\u034a\u034b\7)\2\2\u034b",
    "\u0351\3\2\2\2\u034c\u034d\7)\2\2\u034d\u034e\5\u00b9]\2\u034e\u034f",
    "\7)\2\2\u034f\u0351\3\2\2\2\u0350\u0348\3\2\2\2\u0350\u034c\3\2\2\2",
    "\u0351\u00b0\3\2\2\2\u0352\u0353\n\r\2\2\u0353\u00b2\3\2\2\2\u0354\u0356",
    "\7$\2\2\u0355\u0357\5\u00b5[\2\u0356\u0355\3\2\2\2\u0356\u0357\3\2\2",
    "\2\u0357\u0358\3\2\2\2\u0358\u0359\7$\2\2\u0359\u00b4\3\2\2\2\u035a",
    "\u035c\5\u00b7\\\2\u035b\u035a\3\2\2\2\u035c\u035d\3\2\2\2\u035d\u035b",
    "\3\2\2\2\u035d\u035e\3\2\2\2\u035e\u00b6\3\2\2\2\u035f\u0362\n\16\2",
    "\2\u0360\u0362\5\u00b9]\2\u0361\u035f\3\2\2\2\u0361\u0360\3\2\2\2\u0362",
    "\u00b8\3\2\2\2\u0363\u0364\7^\2\2\u0364\u0368\t\17\2\2\u0365\u0368\5",
    "\u00bb^\2\u0366\u0368\5\u00bd_\2\u0367\u0363\3\2\2\2\u0367\u0365\3\2",
    "\2\2\u0367\u0366\3\2\2\2\u0368\u00ba\3\2\2\2\u0369\u036a\7^\2\2\u036a",
    "\u0375\5\u008bF\2\u036b\u036c\7^\2\2\u036c\u036d\5\u008bF\2\u036d\u036e",
    "\5\u008bF\2\u036e\u0375\3\2\2\2\u036f\u0370\7^\2\2\u0370\u0371\5\u00bf",
    "`\2\u0371\u0372\5\u008bF\2\u0372\u0373\5\u008bF\2\u0373\u0375\3\2\2",
    "\2\u0374\u0369\3\2\2\2\u0374\u036b\3\2\2\2\u0374\u036f\3\2\2\2\u0375",
    "\u00bc\3\2\2\2\u0376\u0377\7^\2\2\u0377\u0378\7w\2\2\u0378\u0379\5\u0083",
    "B\2\u0379\u037a\5\u0083B\2\u037a\u037b\5\u0083B\2\u037b\u037c\5\u0083",
    "B\2\u037c\u00be\3\2\2\2\u037d\u037e\t\20\2\2\u037e\u00c0\3\2\2\2\u037f",
    "\u0380\7p\2\2\u0380\u0381\7w\2\2\u0381\u0382\7n\2\2\u0382\u0383\7n\2",
    "\2\u0383\u00c2\3\2\2\2\u0384\u0385\7*\2\2\u0385\u00c4\3\2\2\2\u0386",
    "\u0387\7+\2\2\u0387\u00c6\3\2\2\2\u0388\u0389\7}\2\2\u0389\u00c8\3\2",
    "\2\2\u038a\u038b\7\177\2\2\u038b\u00ca\3\2\2\2\u038c\u038d\7]\2\2\u038d",
    "\u00cc\3\2\2\2\u038e\u038f\7_\2\2\u038f\u00ce\3\2\2\2\u0390\u0391\7",
    "=\2\2\u0391\u00d0\3\2\2\2\u0392\u0393\7.\2\2\u0393\u00d2\3\2\2\2\u0394",
    "\u0395\7\60\2\2\u0395\u00d4\3\2\2\2\u0396\u0397\7?\2\2\u0397\u00d6\3",
    "\2\2\2\u0398\u0399\7@\2\2\u0399\u00d8\3\2\2\2\u039a\u039b\7>\2\2\u039b",
    "\u00da\3\2\2\2\u039c\u039d\7#\2\2\u039d\u00dc\3\2\2\2\u039e\u039f\7",
    "\u0080\2\2\u039f\u00de\3\2\2\2\u03a0\u03a1\7A\2\2\u03a1\u00e0\3\2\2",
    "\2\u03a2\u03a3\7<\2\2\u03a3\u00e2\3\2\2\2\u03a4\u03a5\7?\2\2\u03a5\u03a6",
    "\7?\2\2\u03a6\u00e4\3\2\2\2\u03a7\u03a8\7>\2\2\u03a8\u03a9\7?\2\2\u03a9",
    "\u00e6\3\2\2\2\u03aa\u03ab\7@\2\2\u03ab\u03ac\7?\2\2\u03ac\u00e8\3\2",
    "\2\2\u03ad\u03ae\7#\2\2\u03ae\u03af\7?\2\2\u03af\u00ea\3\2\2\2\u03b0",
    "\u03b1\7(\2\2\u03b1\u03b2\7(\2\2\u03b2\u00ec\3\2\2\2\u03b3\u03b4\7~",
    "\2\2\u03b4\u03b5\7~\2\2\u03b5\u00ee\3\2\2\2\u03b6\u03b7\7-\2\2\u03b7",
    "\u03b8\7-\2\2\u03b8\u00f0\3\2\2\2\u03b9\u03ba\7/\2\2\u03ba\u03bb\7/",
    "\2\2\u03bb\u00f2\3\2\2\2\u03bc\u03bd\7-\2\2\u03bd\u00f4\3\2\2\2\u03be",
    "\u03bf\7/\2\2\u03bf\u00f6\3\2\2\2\u03c0\u03c1\7,\2\2\u03c1\u00f8\3\2",
    "\2\2\u03c2\u03c3\7\61\2\2\u03c3\u00fa\3\2\2\2\u03c4\u03c5\7(\2\2\u03c5",
    "\u00fc\3\2\2\2\u03c6\u03c7\7~\2\2\u03c7\u00fe\3\2\2\2\u03c8\u03c9\7",
    "`\2\2\u03c9\u0100\3\2\2\2\u03ca\u03cb\7\'\2\2\u03cb\u0102\3\2\2\2\u03cc",
    "\u03cd\7-\2\2\u03cd\u03ce\7?\2\2\u03ce\u0104\3\2\2\2\u03cf\u03d0\7/",
    "\2\2\u03d0\u03d1\7?\2\2\u03d1\u0106\3\2\2\2\u03d2\u03d3\7,\2\2\u03d3",
    "\u03d4\7?\2\2\u03d4\u0108\3\2\2\2\u03d5\u03d6\7\61\2\2\u03d6\u03d7\7",
    "?\2\2\u03d7\u010a\3\2\2\2\u03d8\u03d9\7(\2\2\u03d9\u03da\7?\2\2\u03da",
    "\u010c\3\2\2\2\u03db\u03dc\7~\2\2\u03dc\u03dd\7?\2\2\u03dd\u010e\3\2",
    "\2\2\u03de\u03df\7`\2\2\u03df\u03e0\7?\2\2\u03e0\u0110\3\2\2\2\u03e1",
    "\u03e2\7\'\2\2\u03e2\u03e3\7?\2\2\u03e3\u0112\3\2\2\2\u03e4\u03e5\7",
    ">\2\2\u03e5\u03e6\7>\2\2\u03e6\u03e7\7?\2\2\u03e7\u0114\3\2\2\2\u03e8",
    "\u03e9\7@\2\2\u03e9\u03ea\7@\2\2\u03ea\u03eb\7?\2\2\u03eb\u0116\3\2",
    "\2\2\u03ec\u03ed\7@\2\2\u03ed\u03ee\7@\2\2\u03ee\u03ef\7@\2\2\u03ef",
    "\u03f0\7?\2\2\u03f0\u0118\3\2\2\2\u03f1\u03f5\5\u011b\u008e\2\u03f2",
    "\u03f4\5\u011d\u008f\2\u03f3\u03f2\3\2\2\2\u03f4\u03f7\3\2\2\2\u03f5",
    "\u03f3\3\2\2\2\u03f5\u03f6\3\2\2\2\u03f6\u011a\3\2\2\2\u03f7\u03f5\3",
    "\2\2\2\u03f8\u03fd\t\21\2\2\u03f9\u03fd\n\22\2\2\u03fa\u03fb\t\23\2",
    "\2\u03fb\u03fd\t\24\2\2\u03fc\u03f8\3\2\2\2\u03fc\u03f9\3\2\2\2\u03fc",
    "\u03fa\3\2\2\2\u03fd\u011c\3\2\2\2\u03fe\u0403\t\25\2\2\u03ff\u0403",
    "\n\22\2\2\u0400\u0401\t\23\2\2\u0401\u0403\t\24\2\2\u0402\u03fe\3\2",
    "\2\2\u0402\u03ff\3\2\2\2\u0402\u0400\3\2\2\2\u0403\u011e\3\2\2\2\u0404",
    "\u0405\7B\2\2\u0405\u0120\3\2\2\2\u0406\u0407\7\60\2\2\u0407\u0408\7",
    "\60\2\2\u0408\u0409\7\60\2\2\u0409\u0122\3\2\2\2\u040a\u040c\t\26\2",
    "\2\u040b\u040a\3\2\2\2\u040c\u040d\3\2\2\2\u040d\u040b\3\2\2\2\u040d",
    "\u040e\3\2\2\2\u040e\u040f\3\2\2\2\u040f\u0410\b\u0092\2\2\u0410\u0124",
    "\3\2\2\2\u0411\u0412\7\61\2\2\u0412\u0413\7,\2\2\u0413\u0417\3\2\2\2",
    "\u0414\u0416\13\2\2\2\u0415\u0414\3\2\2\2\u0416\u0419\3\2\2\2\u0417",
    "\u0418\3\2\2\2\u0417\u0415\3\2\2\2\u0418\u041a\3\2\2\2\u0419\u0417\3",
    "\2\2\2\u041a\u041b\7,\2\2\u041b\u041c\7\61\2\2\u041c\u041d\3\2\2\2\u041d",
    "\u041e\b\u0093\2\2\u041e\u0126\3\2\2\2\u041f\u0420\7\61\2\2\u0420\u0421",
    "\7\61\2\2\u0421\u0425\3\2\2\2\u0422\u0424\n\27\2\2\u0423\u0422\3\2\2",
    "\2\u0424\u0427\3\2\2\2\u0425\u0423\3\2\2\2\u0425\u0426\3\2\2\2\u0426",
    "\u0428\3\2\2\2\u0427\u0425\3\2\2\2\u0428\u0429\b\u0094\2\2\u0429\u0128",
    "\3\2\2\2\64\2\u0280\u0284\u0288\u028c\u0290\u0297\u029c\u029e\u02a4",
    "\u02a8\u02ac\u02b2\u02b7\u02c1\u02c5\u02cb\u02cf\u02d7\u02db\u02e1\u02eb",
    "\u02ef\u02f5\u02f9\u02fe\u0301\u0304\u0309\u030c\u0311\u0316\u031e\u0329",
    "\u032d\u0332\u0336\u0346\u0350\u0356\u035d\u0361\u0367\u0374\u03f5\u03fc",
    "\u0402\u040d\u0417\u0425\3\b\2\2"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

function JavaLexer(input) {
	antlr4.Lexer.call(this, input);
    this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    return this;
}

JavaLexer.prototype = Object.create(antlr4.Lexer.prototype);
JavaLexer.prototype.constructor = JavaLexer;

JavaLexer.EOF = antlr4.Token.EOF;
JavaLexer.ABSTRACT = 1;
JavaLexer.ASSERT = 2;
JavaLexer.BOOLEAN = 3;
JavaLexer.BREAK = 4;
JavaLexer.BYTE = 5;
JavaLexer.CASE = 6;
JavaLexer.CATCH = 7;
JavaLexer.CHAR = 8;
JavaLexer.CLASS = 9;
JavaLexer.CONST = 10;
JavaLexer.CONTINUE = 11;
JavaLexer.DEFAULT = 12;
JavaLexer.DO = 13;
JavaLexer.DOUBLE = 14;
JavaLexer.ELSE = 15;
JavaLexer.ENUM = 16;
JavaLexer.EXTENDS = 17;
JavaLexer.FINAL = 18;
JavaLexer.FINALLY = 19;
JavaLexer.FLOAT = 20;
JavaLexer.FOR = 21;
JavaLexer.IF = 22;
JavaLexer.GOTO = 23;
JavaLexer.IMPLEMENTS = 24;
JavaLexer.IMPORT = 25;
JavaLexer.INSTANCEOF = 26;
JavaLexer.INT = 27;
JavaLexer.INTERFACE = 28;
JavaLexer.LONG = 29;
JavaLexer.NATIVE = 30;
JavaLexer.NEW = 31;
JavaLexer.PACKAGE = 32;
JavaLexer.PRIVATE = 33;
JavaLexer.PROTECTED = 34;
JavaLexer.PUBLIC = 35;
JavaLexer.RETURN = 36;
JavaLexer.SHORT = 37;
JavaLexer.STATIC = 38;
JavaLexer.STRICTFP = 39;
JavaLexer.SUPER = 40;
JavaLexer.SWITCH = 41;
JavaLexer.SYNCHRONIZED = 42;
JavaLexer.THIS = 43;
JavaLexer.THROW = 44;
JavaLexer.THROWS = 45;
JavaLexer.TRANSIENT = 46;
JavaLexer.TRY = 47;
JavaLexer.VOID = 48;
JavaLexer.VOLATILE = 49;
JavaLexer.WHILE = 50;
JavaLexer.IntegerLiteral = 51;
JavaLexer.FloatingPointLiteral = 52;
JavaLexer.BooleanLiteral = 53;
JavaLexer.CharacterLiteral = 54;
JavaLexer.StringLiteral = 55;
JavaLexer.NullLiteral = 56;
JavaLexer.LPAREN = 57;
JavaLexer.RPAREN = 58;
JavaLexer.LBRACE = 59;
JavaLexer.RBRACE = 60;
JavaLexer.LBRACK = 61;
JavaLexer.RBRACK = 62;
JavaLexer.SEMI = 63;
JavaLexer.COMMA = 64;
JavaLexer.DOT = 65;
JavaLexer.ASSIGN = 66;
JavaLexer.GT = 67;
JavaLexer.LT = 68;
JavaLexer.BANG = 69;
JavaLexer.TILDE = 70;
JavaLexer.QUESTION = 71;
JavaLexer.COLON = 72;
JavaLexer.EQUAL = 73;
JavaLexer.LE = 74;
JavaLexer.GE = 75;
JavaLexer.NOTEQUAL = 76;
JavaLexer.AND = 77;
JavaLexer.OR = 78;
JavaLexer.INC = 79;
JavaLexer.DEC = 80;
JavaLexer.ADD = 81;
JavaLexer.SUB = 82;
JavaLexer.MUL = 83;
JavaLexer.DIV = 84;
JavaLexer.BITAND = 85;
JavaLexer.BITOR = 86;
JavaLexer.CARET = 87;
JavaLexer.MOD = 88;
JavaLexer.ADD_ASSIGN = 89;
JavaLexer.SUB_ASSIGN = 90;
JavaLexer.MUL_ASSIGN = 91;
JavaLexer.DIV_ASSIGN = 92;
JavaLexer.AND_ASSIGN = 93;
JavaLexer.OR_ASSIGN = 94;
JavaLexer.XOR_ASSIGN = 95;
JavaLexer.MOD_ASSIGN = 96;
JavaLexer.LSHIFT_ASSIGN = 97;
JavaLexer.RSHIFT_ASSIGN = 98;
JavaLexer.URSHIFT_ASSIGN = 99;
JavaLexer.Identifier = 100;
JavaLexer.AT = 101;
JavaLexer.ELLIPSIS = 102;
JavaLexer.WS = 103;
JavaLexer.COMMENT = 104;
JavaLexer.LINE_COMMENT = 105;


JavaLexer.modeNames = [ "DEFAULT_MODE" ];

JavaLexer.literalNames = [ 'null', "'abstract'", "'assert'", "'boolean'", 
                           "'break'", "'byte'", "'case'", "'catch'", "'char'", 
                           "'class'", "'const'", "'continue'", "'default'", 
                           "'do'", "'double'", "'else'", "'enum'", "'extends'", 
                           "'final'", "'finally'", "'float'", "'for'", "'if'", 
                           "'goto'", "'implements'", "'import'", "'instanceof'", 
                           "'int'", "'interface'", "'long'", "'native'", 
                           "'new'", "'package'", "'private'", "'protected'", 
                           "'public'", "'return'", "'short'", "'static'", 
                           "'strictfp'", "'super'", "'switch'", "'synchronized'", 
                           "'this'", "'throw'", "'throws'", "'transient'", 
                           "'try'", "'void'", "'volatile'", "'while'", 'null', 
                           'null', 'null', 'null', 'null', "'null'", "'('", 
                           "')'", "'{'", "'}'", "'['", "']'", "';'", "','", 
                           "'.'", "'='", "'>'", "'<'", "'!'", "'~'", "'?'", 
                           "':'", "'=='", "'<='", "'>='", "'!='", "'&&'", 
                           "'||'", "'++'", "'--'", "'+'", "'-'", "'*'", 
                           "'/'", "'&'", "'|'", "'^'", "'%'", "'+='", "'-='", 
                           "'*='", "'/='", "'&='", "'|='", "'^='", "'%='", 
                           "'<<='", "'>>='", "'>>>='", 'null', "'@'", "'...'" ];

JavaLexer.symbolicNames = [ 'null', "ABSTRACT", "ASSERT", "BOOLEAN", "BREAK", 
                            "BYTE", "CASE", "CATCH", "CHAR", "CLASS", "CONST", 
                            "CONTINUE", "DEFAULT", "DO", "DOUBLE", "ELSE", 
                            "ENUM", "EXTENDS", "FINAL", "FINALLY", "FLOAT", 
                            "FOR", "IF", "GOTO", "IMPLEMENTS", "IMPORT", 
                            "INSTANCEOF", "INT", "INTERFACE", "LONG", "NATIVE", 
                            "NEW", "PACKAGE", "PRIVATE", "PROTECTED", "PUBLIC", 
                            "RETURN", "SHORT", "STATIC", "STRICTFP", "SUPER", 
                            "SWITCH", "SYNCHRONIZED", "THIS", "THROW", "THROWS", 
                            "TRANSIENT", "TRY", "VOID", "VOLATILE", "WHILE", 
                            "IntegerLiteral", "FloatingPointLiteral", "BooleanLiteral", 
                            "CharacterLiteral", "StringLiteral", "NullLiteral", 
                            "LPAREN", "RPAREN", "LBRACE", "RBRACE", "LBRACK", 
                            "RBRACK", "SEMI", "COMMA", "DOT", "ASSIGN", 
                            "GT", "LT", "BANG", "TILDE", "QUESTION", "COLON", 
                            "EQUAL", "LE", "GE", "NOTEQUAL", "AND", "OR", 
                            "INC", "DEC", "ADD", "SUB", "MUL", "DIV", "BITAND", 
                            "BITOR", "CARET", "MOD", "ADD_ASSIGN", "SUB_ASSIGN", 
                            "MUL_ASSIGN", "DIV_ASSIGN", "AND_ASSIGN", "OR_ASSIGN", 
                            "XOR_ASSIGN", "MOD_ASSIGN", "LSHIFT_ASSIGN", 
                            "RSHIFT_ASSIGN", "URSHIFT_ASSIGN", "Identifier", 
                            "AT", "ELLIPSIS", "WS", "COMMENT", "LINE_COMMENT" ];

JavaLexer.ruleNames = [ "ABSTRACT", "ASSERT", "BOOLEAN", "BREAK", "BYTE", 
                        "CASE", "CATCH", "CHAR", "CLASS", "CONST", "CONTINUE", 
                        "DEFAULT", "DO", "DOUBLE", "ELSE", "ENUM", "EXTENDS", 
                        "FINAL", "FINALLY", "FLOAT", "FOR", "IF", "GOTO", 
                        "IMPLEMENTS", "IMPORT", "INSTANCEOF", "INT", "INTERFACE", 
                        "LONG", "NATIVE", "NEW", "PACKAGE", "PRIVATE", "PROTECTED", 
                        "PUBLIC", "RETURN", "SHORT", "STATIC", "STRICTFP", 
                        "SUPER", "SWITCH", "SYNCHRONIZED", "THIS", "THROW", 
                        "THROWS", "TRANSIENT", "TRY", "VOID", "VOLATILE", 
                        "WHILE", "IntegerLiteral", "DecimalIntegerLiteral", 
                        "HexIntegerLiteral", "OctalIntegerLiteral", "BinaryIntegerLiteral", 
                        "IntegerTypeSuffix", "DecimalNumeral", "Digits", 
                        "Digit", "NonZeroDigit", "DigitOrUnderscore", "Underscores", 
                        "HexNumeral", "HexDigits", "HexDigit", "HexDigitOrUnderscore", 
                        "OctalNumeral", "OctalDigits", "OctalDigit", "OctalDigitOrUnderscore", 
                        "BinaryNumeral", "BinaryDigits", "BinaryDigit", 
                        "BinaryDigitOrUnderscore", "FloatingPointLiteral", 
                        "DecimalFloatingPointLiteral", "ExponentPart", "ExponentIndicator", 
                        "SignedInteger", "Sign", "FloatTypeSuffix", "HexadecimalFloatingPointLiteral", 
                        "HexSignificand", "BinaryExponent", "BinaryExponentIndicator", 
                        "BooleanLiteral", "CharacterLiteral", "SingleCharacter", 
                        "StringLiteral", "StringCharacters", "StringCharacter", 
                        "EscapeSequence", "OctalEscape", "UnicodeEscape", 
                        "ZeroToThree", "NullLiteral", "LPAREN", "RPAREN", 
                        "LBRACE", "RBRACE", "LBRACK", "RBRACK", "SEMI", 
                        "COMMA", "DOT", "ASSIGN", "GT", "LT", "BANG", "TILDE", 
                        "QUESTION", "COLON", "EQUAL", "LE", "GE", "NOTEQUAL", 
                        "AND", "OR", "INC", "DEC", "ADD", "SUB", "MUL", 
                        "DIV", "BITAND", "BITOR", "CARET", "MOD", "ADD_ASSIGN", 
                        "SUB_ASSIGN", "MUL_ASSIGN", "DIV_ASSIGN", "AND_ASSIGN", 
                        "OR_ASSIGN", "XOR_ASSIGN", "MOD_ASSIGN", "LSHIFT_ASSIGN", 
                        "RSHIFT_ASSIGN", "URSHIFT_ASSIGN", "Identifier", 
                        "JavaLetter", "JavaLetterOrDigit", "AT", "ELLIPSIS", 
                        "WS", "COMMENT", "LINE_COMMENT" ];

JavaLexer.grammarFileName = "Java.g4";



exports.JavaLexer = JavaLexer;


},{"antlr4/index":49}],7:[function(require,module,exports){
// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by JavaParser.
function JavaListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

JavaListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
JavaListener.prototype.constructor = JavaListener;

// Enter a parse tree produced by JavaParser#compilationUnit.
JavaListener.prototype.enterCompilationUnit = function(ctx) {
};

// Exit a parse tree produced by JavaParser#compilationUnit.
JavaListener.prototype.exitCompilationUnit = function(ctx) {
};


// Enter a parse tree produced by JavaParser#packageDeclaration.
JavaListener.prototype.enterPackageDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#packageDeclaration.
JavaListener.prototype.exitPackageDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#importDeclaration.
JavaListener.prototype.enterImportDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#importDeclaration.
JavaListener.prototype.exitImportDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeDeclaration.
JavaListener.prototype.enterTypeDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeDeclaration.
JavaListener.prototype.exitTypeDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#modifier.
JavaListener.prototype.enterModifier = function(ctx) {
};

// Exit a parse tree produced by JavaParser#modifier.
JavaListener.prototype.exitModifier = function(ctx) {
};


// Enter a parse tree produced by JavaParser#classOrInterfaceModifier.
JavaListener.prototype.enterClassOrInterfaceModifier = function(ctx) {
};

// Exit a parse tree produced by JavaParser#classOrInterfaceModifier.
JavaListener.prototype.exitClassOrInterfaceModifier = function(ctx) {
};


// Enter a parse tree produced by JavaParser#variableModifier.
JavaListener.prototype.enterVariableModifier = function(ctx) {
};

// Exit a parse tree produced by JavaParser#variableModifier.
JavaListener.prototype.exitVariableModifier = function(ctx) {
};


// Enter a parse tree produced by JavaParser#classDeclaration.
JavaListener.prototype.enterClassDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#classDeclaration.
JavaListener.prototype.exitClassDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeParameters.
JavaListener.prototype.enterTypeParameters = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeParameters.
JavaListener.prototype.exitTypeParameters = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeParameter.
JavaListener.prototype.enterTypeParameter = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeParameter.
JavaListener.prototype.exitTypeParameter = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeBound.
JavaListener.prototype.enterTypeBound = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeBound.
JavaListener.prototype.exitTypeBound = function(ctx) {
};


// Enter a parse tree produced by JavaParser#enumDeclaration.
JavaListener.prototype.enterEnumDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#enumDeclaration.
JavaListener.prototype.exitEnumDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#enumConstants.
JavaListener.prototype.enterEnumConstants = function(ctx) {
};

// Exit a parse tree produced by JavaParser#enumConstants.
JavaListener.prototype.exitEnumConstants = function(ctx) {
};


// Enter a parse tree produced by JavaParser#enumConstant.
JavaListener.prototype.enterEnumConstant = function(ctx) {
};

// Exit a parse tree produced by JavaParser#enumConstant.
JavaListener.prototype.exitEnumConstant = function(ctx) {
};


// Enter a parse tree produced by JavaParser#enumBodyDeclarations.
JavaListener.prototype.enterEnumBodyDeclarations = function(ctx) {
};

// Exit a parse tree produced by JavaParser#enumBodyDeclarations.
JavaListener.prototype.exitEnumBodyDeclarations = function(ctx) {
};


// Enter a parse tree produced by JavaParser#interfaceDeclaration.
JavaListener.prototype.enterInterfaceDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#interfaceDeclaration.
JavaListener.prototype.exitInterfaceDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeList.
JavaListener.prototype.enterTypeList = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeList.
JavaListener.prototype.exitTypeList = function(ctx) {
};


// Enter a parse tree produced by JavaParser#classBody.
JavaListener.prototype.enterClassBody = function(ctx) {
};

// Exit a parse tree produced by JavaParser#classBody.
JavaListener.prototype.exitClassBody = function(ctx) {
};


// Enter a parse tree produced by JavaParser#interfaceBody.
JavaListener.prototype.enterInterfaceBody = function(ctx) {
};

// Exit a parse tree produced by JavaParser#interfaceBody.
JavaListener.prototype.exitInterfaceBody = function(ctx) {
};


// Enter a parse tree produced by JavaParser#classBodyDeclaration.
JavaListener.prototype.enterClassBodyDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#classBodyDeclaration.
JavaListener.prototype.exitClassBodyDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#memberDeclaration.
JavaListener.prototype.enterMemberDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#memberDeclaration.
JavaListener.prototype.exitMemberDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#methodDeclaration.
JavaListener.prototype.enterMethodDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#methodDeclaration.
JavaListener.prototype.exitMethodDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#genericMethodDeclaration.
JavaListener.prototype.enterGenericMethodDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#genericMethodDeclaration.
JavaListener.prototype.exitGenericMethodDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#constructorDeclaration.
JavaListener.prototype.enterConstructorDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#constructorDeclaration.
JavaListener.prototype.exitConstructorDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#genericConstructorDeclaration.
JavaListener.prototype.enterGenericConstructorDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#genericConstructorDeclaration.
JavaListener.prototype.exitGenericConstructorDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#fieldDeclaration.
JavaListener.prototype.enterFieldDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#fieldDeclaration.
JavaListener.prototype.exitFieldDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#interfaceBodyDeclaration.
JavaListener.prototype.enterInterfaceBodyDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#interfaceBodyDeclaration.
JavaListener.prototype.exitInterfaceBodyDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#interfaceMemberDeclaration.
JavaListener.prototype.enterInterfaceMemberDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#interfaceMemberDeclaration.
JavaListener.prototype.exitInterfaceMemberDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#constDeclaration.
JavaListener.prototype.enterConstDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#constDeclaration.
JavaListener.prototype.exitConstDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#constantDeclarator.
JavaListener.prototype.enterConstantDeclarator = function(ctx) {
};

// Exit a parse tree produced by JavaParser#constantDeclarator.
JavaListener.prototype.exitConstantDeclarator = function(ctx) {
};


// Enter a parse tree produced by JavaParser#interfaceMethodDeclaration.
JavaListener.prototype.enterInterfaceMethodDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#interfaceMethodDeclaration.
JavaListener.prototype.exitInterfaceMethodDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#genericInterfaceMethodDeclaration.
JavaListener.prototype.enterGenericInterfaceMethodDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#genericInterfaceMethodDeclaration.
JavaListener.prototype.exitGenericInterfaceMethodDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#variableDeclarators.
JavaListener.prototype.enterVariableDeclarators = function(ctx) {
};

// Exit a parse tree produced by JavaParser#variableDeclarators.
JavaListener.prototype.exitVariableDeclarators = function(ctx) {
};


// Enter a parse tree produced by JavaParser#variableDeclarator.
JavaListener.prototype.enterVariableDeclarator = function(ctx) {
};

// Exit a parse tree produced by JavaParser#variableDeclarator.
JavaListener.prototype.exitVariableDeclarator = function(ctx) {
};


// Enter a parse tree produced by JavaParser#variableDeclaratorId.
JavaListener.prototype.enterVariableDeclaratorId = function(ctx) {
};

// Exit a parse tree produced by JavaParser#variableDeclaratorId.
JavaListener.prototype.exitVariableDeclaratorId = function(ctx) {
};


// Enter a parse tree produced by JavaParser#variableInitializer.
JavaListener.prototype.enterVariableInitializer = function(ctx) {
};

// Exit a parse tree produced by JavaParser#variableInitializer.
JavaListener.prototype.exitVariableInitializer = function(ctx) {
};


// Enter a parse tree produced by JavaParser#arrayInitializer.
JavaListener.prototype.enterArrayInitializer = function(ctx) {
};

// Exit a parse tree produced by JavaParser#arrayInitializer.
JavaListener.prototype.exitArrayInitializer = function(ctx) {
};


// Enter a parse tree produced by JavaParser#enumConstantName.
JavaListener.prototype.enterEnumConstantName = function(ctx) {
};

// Exit a parse tree produced by JavaParser#enumConstantName.
JavaListener.prototype.exitEnumConstantName = function(ctx) {
};


// Enter a parse tree produced by JavaParser#type.
JavaListener.prototype.enterType = function(ctx) {
};

// Exit a parse tree produced by JavaParser#type.
JavaListener.prototype.exitType = function(ctx) {
};


// Enter a parse tree produced by JavaParser#classOrInterfaceType.
JavaListener.prototype.enterClassOrInterfaceType = function(ctx) {
};

// Exit a parse tree produced by JavaParser#classOrInterfaceType.
JavaListener.prototype.exitClassOrInterfaceType = function(ctx) {
};


// Enter a parse tree produced by JavaParser#primitiveType.
JavaListener.prototype.enterPrimitiveType = function(ctx) {
};

// Exit a parse tree produced by JavaParser#primitiveType.
JavaListener.prototype.exitPrimitiveType = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeArguments.
JavaListener.prototype.enterTypeArguments = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeArguments.
JavaListener.prototype.exitTypeArguments = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeArgument.
JavaListener.prototype.enterTypeArgument = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeArgument.
JavaListener.prototype.exitTypeArgument = function(ctx) {
};


// Enter a parse tree produced by JavaParser#qualifiedNameList.
JavaListener.prototype.enterQualifiedNameList = function(ctx) {
};

// Exit a parse tree produced by JavaParser#qualifiedNameList.
JavaListener.prototype.exitQualifiedNameList = function(ctx) {
};


// Enter a parse tree produced by JavaParser#formalParameters.
JavaListener.prototype.enterFormalParameters = function(ctx) {
};

// Exit a parse tree produced by JavaParser#formalParameters.
JavaListener.prototype.exitFormalParameters = function(ctx) {
};


// Enter a parse tree produced by JavaParser#formalParameterList.
JavaListener.prototype.enterFormalParameterList = function(ctx) {
};

// Exit a parse tree produced by JavaParser#formalParameterList.
JavaListener.prototype.exitFormalParameterList = function(ctx) {
};


// Enter a parse tree produced by JavaParser#formalParameter.
JavaListener.prototype.enterFormalParameter = function(ctx) {
};

// Exit a parse tree produced by JavaParser#formalParameter.
JavaListener.prototype.exitFormalParameter = function(ctx) {
};


// Enter a parse tree produced by JavaParser#lastFormalParameter.
JavaListener.prototype.enterLastFormalParameter = function(ctx) {
};

// Exit a parse tree produced by JavaParser#lastFormalParameter.
JavaListener.prototype.exitLastFormalParameter = function(ctx) {
};


// Enter a parse tree produced by JavaParser#methodBody.
JavaListener.prototype.enterMethodBody = function(ctx) {
};

// Exit a parse tree produced by JavaParser#methodBody.
JavaListener.prototype.exitMethodBody = function(ctx) {
};


// Enter a parse tree produced by JavaParser#constructorBody.
JavaListener.prototype.enterConstructorBody = function(ctx) {
};

// Exit a parse tree produced by JavaParser#constructorBody.
JavaListener.prototype.exitConstructorBody = function(ctx) {
};


// Enter a parse tree produced by JavaParser#qualifiedName.
JavaListener.prototype.enterQualifiedName = function(ctx) {
};

// Exit a parse tree produced by JavaParser#qualifiedName.
JavaListener.prototype.exitQualifiedName = function(ctx) {
};


// Enter a parse tree produced by JavaParser#literal.
JavaListener.prototype.enterLiteral = function(ctx) {
};

// Exit a parse tree produced by JavaParser#literal.
JavaListener.prototype.exitLiteral = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotation.
JavaListener.prototype.enterAnnotation = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotation.
JavaListener.prototype.exitAnnotation = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationName.
JavaListener.prototype.enterAnnotationName = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationName.
JavaListener.prototype.exitAnnotationName = function(ctx) {
};


// Enter a parse tree produced by JavaParser#elementValuePairs.
JavaListener.prototype.enterElementValuePairs = function(ctx) {
};

// Exit a parse tree produced by JavaParser#elementValuePairs.
JavaListener.prototype.exitElementValuePairs = function(ctx) {
};


// Enter a parse tree produced by JavaParser#elementValuePair.
JavaListener.prototype.enterElementValuePair = function(ctx) {
};

// Exit a parse tree produced by JavaParser#elementValuePair.
JavaListener.prototype.exitElementValuePair = function(ctx) {
};


// Enter a parse tree produced by JavaParser#elementValue.
JavaListener.prototype.enterElementValue = function(ctx) {
};

// Exit a parse tree produced by JavaParser#elementValue.
JavaListener.prototype.exitElementValue = function(ctx) {
};


// Enter a parse tree produced by JavaParser#elementValueArrayInitializer.
JavaListener.prototype.enterElementValueArrayInitializer = function(ctx) {
};

// Exit a parse tree produced by JavaParser#elementValueArrayInitializer.
JavaListener.prototype.exitElementValueArrayInitializer = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationTypeDeclaration.
JavaListener.prototype.enterAnnotationTypeDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationTypeDeclaration.
JavaListener.prototype.exitAnnotationTypeDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationTypeBody.
JavaListener.prototype.enterAnnotationTypeBody = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationTypeBody.
JavaListener.prototype.exitAnnotationTypeBody = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationTypeElementDeclaration.
JavaListener.prototype.enterAnnotationTypeElementDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationTypeElementDeclaration.
JavaListener.prototype.exitAnnotationTypeElementDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationTypeElementRest.
JavaListener.prototype.enterAnnotationTypeElementRest = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationTypeElementRest.
JavaListener.prototype.exitAnnotationTypeElementRest = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationMethodOrConstantRest.
JavaListener.prototype.enterAnnotationMethodOrConstantRest = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationMethodOrConstantRest.
JavaListener.prototype.exitAnnotationMethodOrConstantRest = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationMethodRest.
JavaListener.prototype.enterAnnotationMethodRest = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationMethodRest.
JavaListener.prototype.exitAnnotationMethodRest = function(ctx) {
};


// Enter a parse tree produced by JavaParser#annotationConstantRest.
JavaListener.prototype.enterAnnotationConstantRest = function(ctx) {
};

// Exit a parse tree produced by JavaParser#annotationConstantRest.
JavaListener.prototype.exitAnnotationConstantRest = function(ctx) {
};


// Enter a parse tree produced by JavaParser#defaultValue.
JavaListener.prototype.enterDefaultValue = function(ctx) {
};

// Exit a parse tree produced by JavaParser#defaultValue.
JavaListener.prototype.exitDefaultValue = function(ctx) {
};


// Enter a parse tree produced by JavaParser#block.
JavaListener.prototype.enterBlock = function(ctx) {
};

// Exit a parse tree produced by JavaParser#block.
JavaListener.prototype.exitBlock = function(ctx) {
};


// Enter a parse tree produced by JavaParser#blockStatement.
JavaListener.prototype.enterBlockStatement = function(ctx) {
};

// Exit a parse tree produced by JavaParser#blockStatement.
JavaListener.prototype.exitBlockStatement = function(ctx) {
};


// Enter a parse tree produced by JavaParser#localVariableDeclarationStatement.
JavaListener.prototype.enterLocalVariableDeclarationStatement = function(ctx) {
};

// Exit a parse tree produced by JavaParser#localVariableDeclarationStatement.
JavaListener.prototype.exitLocalVariableDeclarationStatement = function(ctx) {
};


// Enter a parse tree produced by JavaParser#localVariableDeclaration.
JavaListener.prototype.enterLocalVariableDeclaration = function(ctx) {
};

// Exit a parse tree produced by JavaParser#localVariableDeclaration.
JavaListener.prototype.exitLocalVariableDeclaration = function(ctx) {
};


// Enter a parse tree produced by JavaParser#statement.
JavaListener.prototype.enterStatement = function(ctx) {
};

// Exit a parse tree produced by JavaParser#statement.
JavaListener.prototype.exitStatement = function(ctx) {
};


// Enter a parse tree produced by JavaParser#catchClause.
JavaListener.prototype.enterCatchClause = function(ctx) {
};

// Exit a parse tree produced by JavaParser#catchClause.
JavaListener.prototype.exitCatchClause = function(ctx) {
};


// Enter a parse tree produced by JavaParser#catchType.
JavaListener.prototype.enterCatchType = function(ctx) {
};

// Exit a parse tree produced by JavaParser#catchType.
JavaListener.prototype.exitCatchType = function(ctx) {
};


// Enter a parse tree produced by JavaParser#finallyBlock.
JavaListener.prototype.enterFinallyBlock = function(ctx) {
};

// Exit a parse tree produced by JavaParser#finallyBlock.
JavaListener.prototype.exitFinallyBlock = function(ctx) {
};


// Enter a parse tree produced by JavaParser#resourceSpecification.
JavaListener.prototype.enterResourceSpecification = function(ctx) {
};

// Exit a parse tree produced by JavaParser#resourceSpecification.
JavaListener.prototype.exitResourceSpecification = function(ctx) {
};


// Enter a parse tree produced by JavaParser#resources.
JavaListener.prototype.enterResources = function(ctx) {
};

// Exit a parse tree produced by JavaParser#resources.
JavaListener.prototype.exitResources = function(ctx) {
};


// Enter a parse tree produced by JavaParser#resource.
JavaListener.prototype.enterResource = function(ctx) {
};

// Exit a parse tree produced by JavaParser#resource.
JavaListener.prototype.exitResource = function(ctx) {
};


// Enter a parse tree produced by JavaParser#switchBlockStatementGroup.
JavaListener.prototype.enterSwitchBlockStatementGroup = function(ctx) {
};

// Exit a parse tree produced by JavaParser#switchBlockStatementGroup.
JavaListener.prototype.exitSwitchBlockStatementGroup = function(ctx) {
};


// Enter a parse tree produced by JavaParser#switchLabel.
JavaListener.prototype.enterSwitchLabel = function(ctx) {
};

// Exit a parse tree produced by JavaParser#switchLabel.
JavaListener.prototype.exitSwitchLabel = function(ctx) {
};


// Enter a parse tree produced by JavaParser#forControl.
JavaListener.prototype.enterForControl = function(ctx) {
};

// Exit a parse tree produced by JavaParser#forControl.
JavaListener.prototype.exitForControl = function(ctx) {
};


// Enter a parse tree produced by JavaParser#forInit.
JavaListener.prototype.enterForInit = function(ctx) {
};

// Exit a parse tree produced by JavaParser#forInit.
JavaListener.prototype.exitForInit = function(ctx) {
};


// Enter a parse tree produced by JavaParser#enhancedForControl.
JavaListener.prototype.enterEnhancedForControl = function(ctx) {
};

// Exit a parse tree produced by JavaParser#enhancedForControl.
JavaListener.prototype.exitEnhancedForControl = function(ctx) {
};


// Enter a parse tree produced by JavaParser#forUpdate.
JavaListener.prototype.enterForUpdate = function(ctx) {
};

// Exit a parse tree produced by JavaParser#forUpdate.
JavaListener.prototype.exitForUpdate = function(ctx) {
};


// Enter a parse tree produced by JavaParser#parExpression.
JavaListener.prototype.enterParExpression = function(ctx) {
};

// Exit a parse tree produced by JavaParser#parExpression.
JavaListener.prototype.exitParExpression = function(ctx) {
};


// Enter a parse tree produced by JavaParser#expressionList.
JavaListener.prototype.enterExpressionList = function(ctx) {
};

// Exit a parse tree produced by JavaParser#expressionList.
JavaListener.prototype.exitExpressionList = function(ctx) {
};


// Enter a parse tree produced by JavaParser#statementExpression.
JavaListener.prototype.enterStatementExpression = function(ctx) {
};

// Exit a parse tree produced by JavaParser#statementExpression.
JavaListener.prototype.exitStatementExpression = function(ctx) {
};


// Enter a parse tree produced by JavaParser#constantExpression.
JavaListener.prototype.enterConstantExpression = function(ctx) {
};

// Exit a parse tree produced by JavaParser#constantExpression.
JavaListener.prototype.exitConstantExpression = function(ctx) {
};


// Enter a parse tree produced by JavaParser#expression.
JavaListener.prototype.enterExpression = function(ctx) {
};

// Exit a parse tree produced by JavaParser#expression.
JavaListener.prototype.exitExpression = function(ctx) {
};


// Enter a parse tree produced by JavaParser#primary.
JavaListener.prototype.enterPrimary = function(ctx) {
};

// Exit a parse tree produced by JavaParser#primary.
JavaListener.prototype.exitPrimary = function(ctx) {
};


// Enter a parse tree produced by JavaParser#creator.
JavaListener.prototype.enterCreator = function(ctx) {
};

// Exit a parse tree produced by JavaParser#creator.
JavaListener.prototype.exitCreator = function(ctx) {
};


// Enter a parse tree produced by JavaParser#createdName.
JavaListener.prototype.enterCreatedName = function(ctx) {
};

// Exit a parse tree produced by JavaParser#createdName.
JavaListener.prototype.exitCreatedName = function(ctx) {
};


// Enter a parse tree produced by JavaParser#innerCreator.
JavaListener.prototype.enterInnerCreator = function(ctx) {
};

// Exit a parse tree produced by JavaParser#innerCreator.
JavaListener.prototype.exitInnerCreator = function(ctx) {
};


// Enter a parse tree produced by JavaParser#arrayCreatorRest.
JavaListener.prototype.enterArrayCreatorRest = function(ctx) {
};

// Exit a parse tree produced by JavaParser#arrayCreatorRest.
JavaListener.prototype.exitArrayCreatorRest = function(ctx) {
};


// Enter a parse tree produced by JavaParser#classCreatorRest.
JavaListener.prototype.enterClassCreatorRest = function(ctx) {
};

// Exit a parse tree produced by JavaParser#classCreatorRest.
JavaListener.prototype.exitClassCreatorRest = function(ctx) {
};


// Enter a parse tree produced by JavaParser#explicitGenericInvocation.
JavaListener.prototype.enterExplicitGenericInvocation = function(ctx) {
};

// Exit a parse tree produced by JavaParser#explicitGenericInvocation.
JavaListener.prototype.exitExplicitGenericInvocation = function(ctx) {
};


// Enter a parse tree produced by JavaParser#nonWildcardTypeArguments.
JavaListener.prototype.enterNonWildcardTypeArguments = function(ctx) {
};

// Exit a parse tree produced by JavaParser#nonWildcardTypeArguments.
JavaListener.prototype.exitNonWildcardTypeArguments = function(ctx) {
};


// Enter a parse tree produced by JavaParser#typeArgumentsOrDiamond.
JavaListener.prototype.enterTypeArgumentsOrDiamond = function(ctx) {
};

// Exit a parse tree produced by JavaParser#typeArgumentsOrDiamond.
JavaListener.prototype.exitTypeArgumentsOrDiamond = function(ctx) {
};


// Enter a parse tree produced by JavaParser#nonWildcardTypeArgumentsOrDiamond.
JavaListener.prototype.enterNonWildcardTypeArgumentsOrDiamond = function(ctx) {
};

// Exit a parse tree produced by JavaParser#nonWildcardTypeArgumentsOrDiamond.
JavaListener.prototype.exitNonWildcardTypeArgumentsOrDiamond = function(ctx) {
};


// Enter a parse tree produced by JavaParser#superSuffix.
JavaListener.prototype.enterSuperSuffix = function(ctx) {
};

// Exit a parse tree produced by JavaParser#superSuffix.
JavaListener.prototype.exitSuperSuffix = function(ctx) {
};


// Enter a parse tree produced by JavaParser#explicitGenericInvocationSuffix.
JavaListener.prototype.enterExplicitGenericInvocationSuffix = function(ctx) {
};

// Exit a parse tree produced by JavaParser#explicitGenericInvocationSuffix.
JavaListener.prototype.exitExplicitGenericInvocationSuffix = function(ctx) {
};


// Enter a parse tree produced by JavaParser#arguments.
JavaListener.prototype.enterArguments = function(ctx) {
};

// Exit a parse tree produced by JavaParser#arguments.
JavaListener.prototype.exitArguments = function(ctx) {
};



exports.JavaListener = JavaListener;
},{"antlr4/index":49}],8:[function(require,module,exports){
// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var antlr4 = require('antlr4/index');
var JavaListener = require('./JavaListener').JavaListener;
var grammarFileName = "Java.g4";

var serializedATN = ["\3\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd",
    "\3k\u0501\4\2\t\2\4\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4",
    "\t\t\t\4\n\t\n\4\13\t\13\4\f\t\f\4\r\t\r\4\16\t\16\4\17\t\17\4\20\t",
    "\20\4\21\t\21\4\22\t\22\4\23\t\23\4\24\t\24\4\25\t\25\4\26\t\26\4\27",
    "\t\27\4\30\t\30\4\31\t\31\4\32\t\32\4\33\t\33\4\34\t\34\4\35\t\35\4",
    "\36\t\36\4\37\t\37\4 \t \4!\t!\4\"\t\"\4#\t#\4$\t$\4%\t%\4&\t&\4\'\t",
    "\'\4(\t(\4)\t)\4*\t*\4+\t+\4,\t,\4-\t-\4.\t.\4/\t/\4\60\t\60\4\61\t",
    "\61\4\62\t\62\4\63\t\63\4\64\t\64\4\65\t\65\4\66\t\66\4\67\t\67\48\t",
    "8\49\t9\4:\t:\4;\t;\4<\t<\4=\t=\4>\t>\4?\t?\4@\t@\4A\tA\4B\tB\4C\tC",
    "\4D\tD\4E\tE\4F\tF\4G\tG\4H\tH\4I\tI\4J\tJ\4K\tK\4L\tL\4M\tM\4N\tN\4",
    "O\tO\4P\tP\4Q\tQ\4R\tR\4S\tS\4T\tT\4U\tU\4V\tV\4W\tW\4X\tX\4Y\tY\4Z",
    "\tZ\4[\t[\4\\\t\\\4]\t]\4^\t^\4_\t_\4`\t`\4a\ta\4b\tb\4c\tc\4d\td\4",
    "e\te\4f\tf\3\2\5\2\u00ce\n\2\3\2\7\2\u00d1\n\2\f\2\16\2\u00d4\13\2\3",
    "\2\7\2\u00d7\n\2\f\2\16\2\u00da\13\2\3\2\3\2\3\3\7\3\u00df\n\3\f\3\16",
    "\3\u00e2\13\3\3\3\3\3\3\3\3\3\3\4\3\4\5\4\u00ea\n\4\3\4\3\4\3\4\5\4",
    "\u00ef\n\4\3\4\3\4\3\5\7\5\u00f4\n\5\f\5\16\5\u00f7\13\5\3\5\3\5\7\5",
    "\u00fb\n\5\f\5\16\5\u00fe\13\5\3\5\3\5\7\5\u0102\n\5\f\5\16\5\u0105",
    "\13\5\3\5\3\5\7\5\u0109\n\5\f\5\16\5\u010c\13\5\3\5\3\5\5\5\u0110\n",
    "\5\3\6\3\6\5\6\u0114\n\6\3\7\3\7\5\7\u0118\n\7\3\b\3\b\5\b\u011c\n\b",
    "\3\t\3\t\3\t\5\t\u0121\n\t\3\t\3\t\5\t\u0125\n\t\3\t\3\t\5\t\u0129\n",
    "\t\3\t\3\t\3\n\3\n\3\n\3\n\7\n\u0131\n\n\f\n\16\n\u0134\13\n\3\n\3\n",
    "\3\13\3\13\3\13\5\13\u013b\n\13\3\f\3\f\3\f\7\f\u0140\n\f\f\f\16\f\u0143",
    "\13\f\3\r\3\r\3\r\3\r\5\r\u0149\n\r\3\r\3\r\5\r\u014d\n\r\3\r\5\r\u0150",
    "\n\r\3\r\5\r\u0153\n\r\3\r\3\r\3\16\3\16\3\16\7\16\u015a\n\16\f\16\16",
    "\16\u015d\13\16\3\17\7\17\u0160\n\17\f\17\16\17\u0163\13\17\3\17\3\17",
    "\5\17\u0167\n\17\3\17\5\17\u016a\n\17\3\20\3\20\7\20\u016e\n\20\f\20",
    "\16\20\u0171\13\20\3\21\3\21\3\21\5\21\u0176\n\21\3\21\3\21\5\21\u017a",
    "\n\21\3\21\3\21\3\22\3\22\3\22\7\22\u0181\n\22\f\22\16\22\u0184\13\22",
    "\3\23\3\23\7\23\u0188\n\23\f\23\16\23\u018b\13\23\3\23\3\23\3\24\3\24",
    "\7\24\u0191\n\24\f\24\16\24\u0194\13\24\3\24\3\24\3\25\3\25\5\25\u019a",
    "\n\25\3\25\3\25\7\25\u019e\n\25\f\25\16\25\u01a1\13\25\3\25\5\25\u01a4",
    "\n\25\3\26\3\26\3\26\3\26\3\26\3\26\3\26\3\26\3\26\5\26\u01af\n\26\3",
    "\27\3\27\5\27\u01b3\n\27\3\27\3\27\3\27\3\27\7\27\u01b9\n\27\f\27\16",
    "\27\u01bc\13\27\3\27\3\27\5\27\u01c0\n\27\3\27\3\27\5\27\u01c4\n\27",
    "\3\30\3\30\3\30\3\31\3\31\3\31\3\31\5\31\u01cd\n\31\3\31\3\31\3\32\3",
    "\32\3\32\3\33\3\33\3\33\3\33\3\34\7\34\u01d9\n\34\f\34\16\34\u01dc\13",
    "\34\3\34\3\34\5\34\u01e0\n\34\3\35\3\35\3\35\3\35\3\35\3\35\3\35\5\35",
    "\u01e9\n\35\3\36\3\36\3\36\3\36\7\36\u01ef\n\36\f\36\16\36\u01f2\13",
    "\36\3\36\3\36\3\37\3\37\3\37\7\37\u01f9\n\37\f\37\16\37\u01fc\13\37",
    "\3\37\3\37\3\37\3 \3 \5 \u0203\n \3 \3 \3 \3 \7 \u0209\n \f \16 \u020c",
    "\13 \3 \3 \5 \u0210\n \3 \3 \3!\3!\3!\3\"\3\"\3\"\7\"\u021a\n\"\f\"",
    "\16\"\u021d\13\"\3#\3#\3#\5#\u0222\n#\3$\3$\3$\7$\u0227\n$\f$\16$\u022a",
    "\13$\3%\3%\5%\u022e\n%\3&\3&\3&\3&\7&\u0234\n&\f&\16&\u0237\13&\3&\5",
    "&\u023a\n&\5&\u023c\n&\3&\3&\3\'\3\'\3(\3(\3(\7(\u0245\n(\f(\16(\u0248",
    "\13(\3(\3(\3(\7(\u024d\n(\f(\16(\u0250\13(\5(\u0252\n(\3)\3)\5)\u0256",
    "\n)\3)\3)\3)\5)\u025b\n)\7)\u025d\n)\f)\16)\u0260\13)\3*\3*\3+\3+\3",
    "+\3+\7+\u0268\n+\f+\16+\u026b\13+\3+\3+\3,\3,\3,\3,\5,\u0273\n,\5,\u0275",
    "\n,\3-\3-\3-\7-\u027a\n-\f-\16-\u027d\13-\3.\3.\5.\u0281\n.\3.\3.\3",
    "/\3/\3/\7/\u0288\n/\f/\16/\u028b\13/\3/\3/\5/\u028f\n/\3/\5/\u0292\n",
    "/\3\60\7\60\u0295\n\60\f\60\16\60\u0298\13\60\3\60\3\60\3\60\3\61\7",
    "\61\u029e\n\61\f\61\16\61\u02a1\13\61\3\61\3\61\3\61\3\61\3\62\3\62",
    "\3\63\3\63\3\64\3\64\3\64\7\64\u02ae\n\64\f\64\16\64\u02b1\13\64\3\65",
    "\3\65\3\66\3\66\3\66\3\66\3\66\5\66\u02ba\n\66\3\66\5\66\u02bd\n\66",
    "\3\67\3\67\38\38\38\78\u02c4\n8\f8\168\u02c7\138\39\39\39\39\3:\3:\3",
    ":\5:\u02d0\n:\3;\3;\3;\3;\7;\u02d6\n;\f;\16;\u02d9\13;\5;\u02db\n;\3",
    ";\5;\u02de\n;\3;\3;\3<\3<\3<\3<\3<\3=\3=\7=\u02e9\n=\f=\16=\u02ec\13",
    "=\3=\3=\3>\7>\u02f1\n>\f>\16>\u02f4\13>\3>\3>\5>\u02f8\n>\3?\3?\3?\3",
    "?\3?\3?\5?\u0300\n?\3?\3?\5?\u0304\n?\3?\3?\5?\u0308\n?\3?\3?\5?\u030c",
    "\n?\5?\u030e\n?\3@\3@\5@\u0312\n@\3A\3A\3A\3A\5A\u0318\nA\3B\3B\3C\3",
    "C\3C\3D\3D\7D\u0321\nD\fD\16D\u0324\13D\3D\3D\3E\3E\3E\5E\u032b\nE\3",
    "F\3F\3F\3G\7G\u0331\nG\fG\16G\u0334\13G\3G\3G\3G\3H\3H\3H\3H\3H\5H\u033e",
    "\nH\3H\3H\3H\3H\3H\3H\3H\5H\u0347\nH\3H\3H\3H\3H\3H\3H\3H\3H\3H\3H\3",
    "H\3H\3H\3H\3H\3H\3H\3H\3H\6H\u035c\nH\rH\16H\u035d\3H\5H\u0361\nH\3",
    "H\5H\u0364\nH\3H\3H\3H\3H\7H\u036a\nH\fH\16H\u036d\13H\3H\5H\u0370\n",
    "H\3H\3H\3H\3H\7H\u0376\nH\fH\16H\u0379\13H\3H\7H\u037c\nH\fH\16H\u037f",
    "\13H\3H\3H\3H\3H\3H\3H\3H\3H\5H\u0389\nH\3H\3H\3H\3H\3H\3H\3H\5H\u0392",
    "\nH\3H\3H\3H\5H\u0397\nH\3H\3H\3H\3H\3H\3H\3H\3H\5H\u03a1\nH\3I\3I\3",
    "I\7I\u03a6\nI\fI\16I\u03a9\13I\3I\3I\3I\3I\3I\3J\3J\3J\7J\u03b3\nJ\f",
    "J\16J\u03b6\13J\3K\3K\3K\3L\3L\3L\5L\u03be\nL\3L\3L\3M\3M\3M\7M\u03c5",
    "\nM\fM\16M\u03c8\13M\3N\7N\u03cb\nN\fN\16N\u03ce\13N\3N\3N\3N\3N\3N",
    "\3O\6O\u03d6\nO\rO\16O\u03d7\3O\6O\u03db\nO\rO\16O\u03dc\3P\3P\3P\3",
    "P\3P\3P\3P\3P\3P\3P\5P\u03e9\nP\3Q\3Q\5Q\u03ed\nQ\3Q\3Q\5Q\u03f1\nQ",
    "\3Q\3Q\5Q\u03f5\nQ\5Q\u03f7\nQ\3R\3R\5R\u03fb\nR\3S\7S\u03fe\nS\fS\16",
    "S\u0401\13S\3S\3S\3S\3S\3S\3T\3T\3U\3U\3U\3U\3V\3V\3V\7V\u0411\nV\f",
    "V\16V\u0414\13V\3W\3W\3X\3X\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\5",
    "Y\u0427\nY\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\5Y\u0437\nY\3Y",
    "\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3",
    "Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\5Y\u0462\nY\3Y",
    "\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\3Y\5Y\u0474\nY\3Y\3Y\3Y\3",
    "Y\3Y\3Y\7Y\u047c\nY\fY\16Y\u047f\13Y\3Z\3Z\3Z\3Z\3Z\3Z\3Z\3Z\3Z\3Z\3",
    "Z\3Z\3Z\3Z\3Z\3Z\3Z\3Z\3Z\5Z\u0494\nZ\5Z\u0496\nZ\3[\3[\3[\3[\3[\3[",
    "\3[\5[\u049f\n[\5[\u04a1\n[\3\\\3\\\5\\\u04a5\n\\\3\\\3\\\3\\\5\\\u04aa",
    "\n\\\7\\\u04ac\n\\\f\\\16\\\u04af\13\\\3\\\5\\\u04b2\n\\\3]\3]\5]\u04b6",
    "\n]\3]\3]\3^\3^\3^\3^\7^\u04be\n^\f^\16^\u04c1\13^\3^\3^\3^\3^\3^\3",
    "^\3^\7^\u04ca\n^\f^\16^\u04cd\13^\3^\3^\7^\u04d1\n^\f^\16^\u04d4\13",
    "^\5^\u04d6\n^\3_\3_\5_\u04da\n_\3`\3`\3`\3a\3a\3a\3a\3b\3b\3b\5b\u04e6",
    "\nb\3c\3c\3c\5c\u04eb\nc\3d\3d\3d\3d\5d\u04f1\nd\5d\u04f3\nd\3e\3e\3",
    "e\3e\5e\u04f9\ne\3f\3f\5f\u04fd\nf\3f\3f\3f\2\3\u00b0g\2\4\6\b\n\f\16",
    "\20\22\24\26\30\32\34\36 \"$&(*,.\60\62\64\668:<>@BDFHJLNPRTVXZ\\^`",
    "bdfhjlnprtvxz|~\u0080\u0082\u0084\u0086\u0088\u008a\u008c\u008e\u0090",
    "\u0092\u0094\u0096\u0098\u009a\u009c\u009e\u00a0\u00a2\u00a4\u00a6\u00a8",
    "\u00aa\u00ac\u00ae\u00b0\u00b2\u00b4\u00b6\u00b8\u00ba\u00bc\u00be\u00c0",
    "\u00c2\u00c4\u00c6\u00c8\u00ca\2\17\6\2  ,,\60\60\63\63\6\2\3\3\24\24",
    "#%()\n\2\5\5\7\7\n\n\20\20\26\26\35\35\37\37\'\'\4\2\23\23**\3\2\65",
    ":\3\2QT\3\2GH\4\2UVZZ\3\2ST\4\2EFLM\4\2KKNN\4\2DD[e\3\2QR\u0573\2\u00cd",
    "\3\2\2\2\4\u00e0\3\2\2\2\6\u00e7\3\2\2\2\b\u010f\3\2\2\2\n\u0113\3\2",
    "\2\2\f\u0117\3\2\2\2\16\u011b\3\2\2\2\20\u011d\3\2\2\2\22\u012c\3\2",
    "\2\2\24\u0137\3\2\2\2\26\u013c\3\2\2\2\30\u0144\3\2\2\2\32\u0156\3\2",
    "\2\2\34\u0161\3\2\2\2\36\u016b\3\2\2\2 \u0172\3\2\2\2\"\u017d\3\2\2",
    "\2$\u0185\3\2\2\2&\u018e\3\2\2\2(\u01a3\3\2\2\2*\u01ae\3\2\2\2,\u01b2",
    "\3\2\2\2.\u01c5\3\2\2\2\60\u01c8\3\2\2\2\62\u01d0\3\2\2\2\64\u01d3\3",
    "\2\2\2\66\u01df\3\2\2\28\u01e8\3\2\2\2:\u01ea\3\2\2\2<\u01f5\3\2\2\2",
    ">\u0202\3\2\2\2@\u0213\3\2\2\2B\u0216\3\2\2\2D\u021e\3\2\2\2F\u0223",
    "\3\2\2\2H\u022d\3\2\2\2J\u022f\3\2\2\2L\u023f\3\2\2\2N\u0251\3\2\2\2",
    "P\u0253\3\2\2\2R\u0261\3\2\2\2T\u0263\3\2\2\2V\u0274\3\2\2\2X\u0276",
    "\3\2\2\2Z\u027e\3\2\2\2\\\u0291\3\2\2\2^\u0296\3\2\2\2`\u029f\3\2\2",
    "\2b\u02a6\3\2\2\2d\u02a8\3\2\2\2f\u02aa\3\2\2\2h\u02b2\3\2\2\2j\u02b4",
    "\3\2\2\2l\u02be\3\2\2\2n\u02c0\3\2\2\2p\u02c8\3\2\2\2r\u02cf\3\2\2\2",
    "t\u02d1\3\2\2\2v\u02e1\3\2\2\2x\u02e6\3\2\2\2z\u02f7\3\2\2\2|\u030d",
    "\3\2\2\2~\u0311\3\2\2\2\u0080\u0313\3\2\2\2\u0082\u0319\3\2\2\2\u0084",
    "\u031b\3\2\2\2\u0086\u031e\3\2\2\2\u0088\u032a\3\2\2\2\u008a\u032c\3",
    "\2\2\2\u008c\u0332\3\2\2\2\u008e\u03a0\3\2\2\2\u0090\u03a2\3\2\2\2\u0092",
    "\u03af\3\2\2\2\u0094\u03b7\3\2\2\2\u0096\u03ba\3\2\2\2\u0098\u03c1\3",
    "\2\2\2\u009a\u03cc\3\2\2\2\u009c\u03d5\3\2\2\2\u009e\u03e8\3\2\2\2\u00a0",
    "\u03f6\3\2\2\2\u00a2\u03fa\3\2\2\2\u00a4\u03ff\3\2\2\2\u00a6\u0407\3",
    "\2\2\2\u00a8\u0409\3\2\2\2\u00aa\u040d\3\2\2\2\u00ac\u0415\3\2\2\2\u00ae",
    "\u0417\3\2\2\2\u00b0\u0426\3\2\2\2\u00b2\u0495\3\2\2\2\u00b4\u04a0\3",
    "\2\2\2\u00b6\u04b1\3\2\2\2\u00b8\u04b3\3\2\2\2\u00ba\u04b9\3\2\2\2\u00bc",
    "\u04d7\3\2\2\2\u00be\u04db\3\2\2\2\u00c0\u04de\3\2\2\2\u00c2\u04e5\3",
    "\2\2\2\u00c4\u04ea\3\2\2\2\u00c6\u04f2\3\2\2\2\u00c8\u04f8\3\2\2\2\u00ca",
    "\u04fa\3\2\2\2\u00cc\u00ce\5\4\3\2\u00cd\u00cc\3\2\2\2\u00cd\u00ce\3",
    "\2\2\2\u00ce\u00d2\3\2\2\2\u00cf\u00d1\5\6\4\2\u00d0\u00cf\3\2\2\2\u00d1",
    "\u00d4\3\2\2\2\u00d2\u00d0\3\2\2\2\u00d2\u00d3\3\2\2\2\u00d3\u00d8\3",
    "\2\2\2\u00d4\u00d2\3\2\2\2\u00d5\u00d7\5\b\5\2\u00d6\u00d5\3\2\2\2\u00d7",
    "\u00da\3\2\2\2\u00d8\u00d6\3\2\2\2\u00d8\u00d9\3\2\2\2\u00d9\u00db\3",
    "\2\2\2\u00da\u00d8\3\2\2\2\u00db\u00dc\7\2\2\3\u00dc\3\3\2\2\2\u00dd",
    "\u00df\5j\66\2\u00de\u00dd\3\2\2\2\u00df\u00e2\3\2\2\2\u00e0\u00de\3",
    "\2\2\2\u00e0\u00e1\3\2\2\2\u00e1\u00e3\3\2\2\2\u00e2\u00e0\3\2\2\2\u00e3",
    "\u00e4\7\"\2\2\u00e4\u00e5\5f\64\2\u00e5\u00e6\7A\2\2\u00e6\5\3\2\2",
    "\2\u00e7\u00e9\7\33\2\2\u00e8\u00ea\7(\2\2\u00e9\u00e8\3\2\2\2\u00e9",
    "\u00ea\3\2\2\2\u00ea\u00eb\3\2\2\2\u00eb\u00ee\5f\64\2\u00ec\u00ed\7",
    "C\2\2\u00ed\u00ef\7U\2\2\u00ee\u00ec\3\2\2\2\u00ee\u00ef\3\2\2\2\u00ef",
    "\u00f0\3\2\2\2\u00f0\u00f1\7A\2\2\u00f1\7\3\2\2\2\u00f2\u00f4\5\f\7",
    "\2\u00f3\u00f2\3\2\2\2\u00f4\u00f7\3\2\2\2\u00f5\u00f3\3\2\2\2\u00f5",
    "\u00f6\3\2\2\2\u00f6\u00f8\3\2\2\2\u00f7\u00f5\3\2\2\2\u00f8\u0110\5",
    "\20\t\2\u00f9\u00fb\5\f\7\2\u00fa\u00f9\3\2\2\2\u00fb\u00fe\3\2\2\2",
    "\u00fc\u00fa\3\2\2\2\u00fc\u00fd\3\2\2\2\u00fd\u00ff\3\2\2\2\u00fe\u00fc",
    "\3\2\2\2\u00ff\u0110\5\30\r\2\u0100\u0102\5\f\7\2\u0101\u0100\3\2\2",
    "\2\u0102\u0105\3\2\2\2\u0103\u0101\3\2\2\2\u0103\u0104\3\2\2\2\u0104",
    "\u0106\3\2\2\2\u0105\u0103\3\2\2\2\u0106\u0110\5 \21\2\u0107\u0109\5",
    "\f\7\2\u0108\u0107\3\2\2\2\u0109\u010c\3\2\2\2\u010a\u0108\3\2\2\2\u010a",
    "\u010b\3\2\2\2\u010b\u010d\3\2\2\2\u010c\u010a\3\2\2\2\u010d\u0110\5",
    "v<\2\u010e\u0110\7A\2\2\u010f\u00f5\3\2\2\2\u010f\u00fc\3\2\2\2\u010f",
    "\u0103\3\2\2\2\u010f\u010a\3\2\2\2\u010f\u010e\3\2\2\2\u0110\t\3\2\2",
    "\2\u0111\u0114\5\f\7\2\u0112\u0114\t\2\2\2\u0113\u0111\3\2\2\2\u0113",
    "\u0112\3\2\2\2\u0114\13\3\2\2\2\u0115\u0118\5j\66\2\u0116\u0118\t\3",
    "\2\2\u0117\u0115\3\2\2\2\u0117\u0116\3\2\2\2\u0118\r\3\2\2\2\u0119\u011c",
    "\7\24\2\2\u011a\u011c\5j\66\2\u011b\u0119\3\2\2\2\u011b\u011a\3\2\2",
    "\2\u011c\17\3\2\2\2\u011d\u011e\7\13\2\2\u011e\u0120\7f\2\2\u011f\u0121",
    "\5\22\n\2\u0120\u011f\3\2\2\2\u0120\u0121\3\2\2\2\u0121\u0124\3\2\2",
    "\2\u0122\u0123\7\23\2\2\u0123\u0125\5N(\2\u0124\u0122\3\2\2\2\u0124",
    "\u0125\3\2\2\2\u0125\u0128\3\2\2\2\u0126\u0127\7\32\2\2\u0127\u0129",
    "\5\"\22\2\u0128\u0126\3\2\2\2\u0128\u0129\3\2\2\2\u0129\u012a\3\2\2",
    "\2\u012a\u012b\5$\23\2\u012b\21\3\2\2\2\u012c\u012d\7F\2\2\u012d\u0132",
    "\5\24\13\2\u012e\u012f\7B\2\2\u012f\u0131\5\24\13\2\u0130\u012e\3\2",
    "\2\2\u0131\u0134\3\2\2\2\u0132\u0130\3\2\2\2\u0132\u0133\3\2\2\2\u0133",
    "\u0135\3\2\2\2\u0134\u0132\3\2\2\2\u0135\u0136\7E\2\2\u0136\23\3\2\2",
    "\2\u0137\u013a\7f\2\2\u0138\u0139\7\23\2\2\u0139\u013b\5\26\f\2\u013a",
    "\u0138\3\2\2\2\u013a\u013b\3\2\2\2\u013b\25\3\2\2\2\u013c\u0141\5N(",
    "\2\u013d\u013e\7W\2\2\u013e\u0140\5N(\2\u013f\u013d\3\2\2\2\u0140\u0143",
    "\3\2\2\2\u0141\u013f\3\2\2\2\u0141\u0142\3\2\2\2\u0142\27\3\2\2\2\u0143",
    "\u0141\3\2\2\2\u0144\u0145\7\22\2\2\u0145\u0148\7f\2\2\u0146\u0147\7",
    "\32\2\2\u0147\u0149\5\"\22\2\u0148\u0146\3\2\2\2\u0148\u0149\3\2\2\2",
    "\u0149\u014a\3\2\2\2\u014a\u014c\7=\2\2\u014b\u014d\5\32\16\2\u014c",
    "\u014b\3\2\2\2\u014c\u014d\3\2\2\2\u014d\u014f\3\2\2\2\u014e\u0150\7",
    "B\2\2\u014f\u014e\3\2\2\2\u014f\u0150\3\2\2\2\u0150\u0152\3\2\2\2\u0151",
    "\u0153\5\36\20\2\u0152\u0151\3\2\2\2\u0152\u0153\3\2\2\2\u0153\u0154",
    "\3\2\2\2\u0154\u0155\7>\2\2\u0155\31\3\2\2\2\u0156\u015b\5\34\17\2\u0157",
    "\u0158\7B\2\2\u0158\u015a\5\34\17\2\u0159\u0157\3\2\2\2\u015a\u015d",
    "\3\2\2\2\u015b\u0159\3\2\2\2\u015b\u015c\3\2\2\2\u015c\33\3\2\2\2\u015d",
    "\u015b\3\2\2\2\u015e\u0160\5j\66\2\u015f\u015e\3\2\2\2\u0160\u0163\3",
    "\2\2\2\u0161\u015f\3\2\2\2\u0161\u0162\3\2\2\2\u0162\u0164\3\2\2\2\u0163",
    "\u0161\3\2\2\2\u0164\u0166\7f\2\2\u0165\u0167\5\u00caf\2\u0166\u0165",
    "\3\2\2\2\u0166\u0167\3\2\2\2\u0167\u0169\3\2\2\2\u0168\u016a\5$\23\2",
    "\u0169\u0168\3\2\2\2\u0169\u016a\3\2\2\2\u016a\35\3\2\2\2\u016b\u016f",
    "\7A\2\2\u016c\u016e\5(\25\2\u016d\u016c\3\2\2\2\u016e\u0171\3\2\2\2",
    "\u016f\u016d\3\2\2\2\u016f\u0170\3\2\2\2\u0170\37\3\2\2\2\u0171\u016f",
    "\3\2\2\2\u0172\u0173\7\36\2\2\u0173\u0175\7f\2\2\u0174\u0176\5\22\n",
    "\2\u0175\u0174\3\2\2\2\u0175\u0176\3\2\2\2\u0176\u0179\3\2\2\2\u0177",
    "\u0178\7\23\2\2\u0178\u017a\5\"\22\2\u0179\u0177\3\2\2\2\u0179\u017a",
    "\3\2\2\2\u017a\u017b\3\2\2\2\u017b\u017c\5&\24\2\u017c!\3\2\2\2\u017d",
    "\u0182\5N(\2\u017e\u017f\7B\2\2\u017f\u0181\5N(\2\u0180\u017e\3\2\2",
    "\2\u0181\u0184\3\2\2\2\u0182\u0180\3\2\2\2\u0182\u0183\3\2\2\2\u0183",
    "#\3\2\2\2\u0184\u0182\3\2\2\2\u0185\u0189\7=\2\2\u0186\u0188\5(\25\2",
    "\u0187\u0186\3\2\2\2\u0188\u018b\3\2\2\2\u0189\u0187\3\2\2\2\u0189\u018a",
    "\3\2\2\2\u018a\u018c\3\2\2\2\u018b\u0189\3\2\2\2\u018c\u018d\7>\2\2",
    "\u018d%\3\2\2\2\u018e\u0192\7=\2\2\u018f\u0191\5\66\34\2\u0190\u018f",
    "\3\2\2\2\u0191\u0194\3\2\2\2\u0192\u0190\3\2\2\2\u0192\u0193\3\2\2\2",
    "\u0193\u0195\3\2\2\2\u0194\u0192\3\2\2\2\u0195\u0196\7>\2\2\u0196\'",
    "\3\2\2\2\u0197\u01a4\7A\2\2\u0198\u019a\7(\2\2\u0199\u0198\3\2\2\2\u0199",
    "\u019a\3\2\2\2\u019a\u019b\3\2\2\2\u019b\u01a4\5\u0086D\2\u019c\u019e",
    "\5\n\6\2\u019d\u019c\3\2\2\2\u019e\u01a1\3\2\2\2\u019f\u019d\3\2\2\2",
    "\u019f\u01a0\3\2\2\2\u01a0\u01a2\3\2\2\2\u01a1\u019f\3\2\2\2\u01a2\u01a4",
    "\5*\26\2\u01a3\u0197\3\2\2\2\u01a3\u0199\3\2\2\2\u01a3\u019f\3\2\2\2",
    "\u01a4)\3\2\2\2\u01a5\u01af\5,\27\2\u01a6\u01af\5.\30\2\u01a7\u01af",
    "\5\64\33\2\u01a8\u01af\5\60\31\2\u01a9\u01af\5\62\32\2\u01aa\u01af\5",
    " \21\2\u01ab\u01af\5v<\2\u01ac\u01af\5\20\t\2\u01ad\u01af\5\30\r\2\u01ae",
    "\u01a5\3\2\2\2\u01ae\u01a6\3\2\2\2\u01ae\u01a7\3\2\2\2\u01ae\u01a8\3",
    "\2\2\2\u01ae\u01a9\3\2\2\2\u01ae\u01aa\3\2\2\2\u01ae\u01ab\3\2\2\2\u01ae",
    "\u01ac\3\2\2\2\u01ae\u01ad\3\2\2\2\u01af+\3\2\2\2\u01b0\u01b3\5N(\2",
    "\u01b1\u01b3\7\62\2\2\u01b2\u01b0\3\2\2\2\u01b2\u01b1\3\2\2\2\u01b3",
    "\u01b4\3\2\2\2\u01b4\u01b5\7f\2\2\u01b5\u01ba\5Z.\2\u01b6\u01b7\7?\2",
    "\2\u01b7\u01b9\7@\2\2\u01b8\u01b6\3\2\2\2\u01b9\u01bc\3\2\2\2\u01ba",
    "\u01b8\3\2\2\2\u01ba\u01bb\3\2\2\2\u01bb\u01bf\3\2\2\2\u01bc\u01ba\3",
    "\2\2\2\u01bd\u01be\7/\2\2\u01be\u01c0\5X-\2\u01bf\u01bd\3\2\2\2\u01bf",
    "\u01c0\3\2\2\2\u01c0\u01c3\3\2\2\2\u01c1\u01c4\5b\62\2\u01c2\u01c4\7",
    "A\2\2\u01c3\u01c1\3\2\2\2\u01c3\u01c2\3\2\2\2\u01c4-\3\2\2\2\u01c5\u01c6",
    "\5\22\n\2\u01c6\u01c7\5,\27\2\u01c7/\3\2\2\2\u01c8\u01c9\7f\2\2\u01c9",
    "\u01cc\5Z.\2\u01ca\u01cb\7/\2\2\u01cb\u01cd\5X-\2\u01cc\u01ca\3\2\2",
    "\2\u01cc\u01cd\3\2\2\2\u01cd\u01ce\3\2\2\2\u01ce\u01cf\5d\63\2\u01cf",
    "\61\3\2\2\2\u01d0\u01d1\5\22\n\2\u01d1\u01d2\5\60\31\2\u01d2\63\3\2",
    "\2\2\u01d3\u01d4\5N(\2\u01d4\u01d5\5B\"\2\u01d5\u01d6\7A\2\2\u01d6\65",
    "\3\2\2\2\u01d7\u01d9\5\n\6\2\u01d8\u01d7\3\2\2\2\u01d9\u01dc\3\2\2\2",
    "\u01da\u01d8\3\2\2\2\u01da\u01db\3\2\2\2\u01db\u01dd\3\2\2\2\u01dc\u01da",
    "\3\2\2\2\u01dd\u01e0\58\35\2\u01de\u01e0\7A\2\2\u01df\u01da\3\2\2\2",
    "\u01df\u01de\3\2\2\2\u01e0\67\3\2\2\2\u01e1\u01e9\5:\36\2\u01e2\u01e9",
    "\5> \2\u01e3\u01e9\5@!\2\u01e4\u01e9\5 \21\2\u01e5\u01e9\5v<\2\u01e6",
    "\u01e9\5\20\t\2\u01e7\u01e9\5\30\r\2\u01e8\u01e1\3\2\2\2\u01e8\u01e2",
    "\3\2\2\2\u01e8\u01e3\3\2\2\2\u01e8\u01e4\3\2\2\2\u01e8\u01e5\3\2\2\2",
    "\u01e8\u01e6\3\2\2\2\u01e8\u01e7\3\2\2\2\u01e99\3\2\2\2\u01ea\u01eb",
    "\5N(\2\u01eb\u01f0\5<\37\2\u01ec\u01ed\7B\2\2\u01ed\u01ef\5<\37\2\u01ee",
    "\u01ec\3\2\2\2\u01ef\u01f2\3\2\2\2\u01f0\u01ee\3\2\2\2\u01f0\u01f1\3",
    "\2\2\2\u01f1\u01f3\3\2\2\2\u01f2\u01f0\3\2\2\2\u01f3\u01f4\7A\2\2\u01f4",
    ";\3\2\2\2\u01f5\u01fa\7f\2\2\u01f6\u01f7\7?\2\2\u01f7\u01f9\7@\2\2\u01f8",
    "\u01f6\3\2\2\2\u01f9\u01fc\3\2\2\2\u01fa\u01f8\3\2\2\2\u01fa\u01fb\3",
    "\2\2\2\u01fb\u01fd\3\2\2\2\u01fc\u01fa\3\2\2\2\u01fd\u01fe\7D\2\2\u01fe",
    "\u01ff\5H%\2\u01ff=\3\2\2\2\u0200\u0203\5N(\2\u0201\u0203\7\62\2\2\u0202",
    "\u0200\3\2\2\2\u0202\u0201\3\2\2\2\u0203\u0204\3\2\2\2\u0204\u0205\7",
    "f\2\2\u0205\u020a\5Z.\2\u0206\u0207\7?\2\2\u0207\u0209\7@\2\2\u0208",
    "\u0206\3\2\2\2\u0209\u020c\3\2\2\2\u020a\u0208\3\2\2\2\u020a\u020b\3",
    "\2\2\2\u020b\u020f\3\2\2\2\u020c\u020a\3\2\2\2\u020d\u020e\7/\2\2\u020e",
    "\u0210\5X-\2\u020f\u020d\3\2\2\2\u020f\u0210\3\2\2\2\u0210\u0211\3\2",
    "\2\2\u0211\u0212\7A\2\2\u0212?\3\2\2\2\u0213\u0214\5\22\n\2\u0214\u0215",
    "\5> \2\u0215A\3\2\2\2\u0216\u021b\5D#\2\u0217\u0218\7B\2\2\u0218\u021a",
    "\5D#\2\u0219\u0217\3\2\2\2\u021a\u021d\3\2\2\2\u021b\u0219\3\2\2\2\u021b",
    "\u021c\3\2\2\2\u021cC\3\2\2\2\u021d\u021b\3\2\2\2\u021e\u0221\5F$\2",
    "\u021f\u0220\7D\2\2\u0220\u0222\5H%\2\u0221\u021f\3\2\2\2\u0221\u0222",
    "\3\2\2\2\u0222E\3\2\2\2\u0223\u0228\7f\2\2\u0224\u0225\7?\2\2\u0225",
    "\u0227\7@\2\2\u0226\u0224\3\2\2\2\u0227\u022a\3\2\2\2\u0228\u0226\3",
    "\2\2\2\u0228\u0229\3\2\2\2\u0229G\3\2\2\2\u022a\u0228\3\2\2\2\u022b",
    "\u022e\5J&\2\u022c\u022e\5\u00b0Y\2\u022d\u022b\3\2\2\2\u022d\u022c",
    "\3\2\2\2\u022eI\3\2\2\2\u022f\u023b\7=\2\2\u0230\u0235\5H%\2\u0231\u0232",
    "\7B\2\2\u0232\u0234\5H%\2\u0233\u0231\3\2\2\2\u0234\u0237\3\2\2\2\u0235",
    "\u0233\3\2\2\2\u0235\u0236\3\2\2\2\u0236\u0239\3\2\2\2\u0237\u0235\3",
    "\2\2\2\u0238\u023a\7B\2\2\u0239\u0238\3\2\2\2\u0239\u023a\3\2\2\2\u023a",
    "\u023c\3\2\2\2\u023b\u0230\3\2\2\2\u023b\u023c\3\2\2\2\u023c\u023d\3",
    "\2\2\2\u023d\u023e\7>\2\2\u023eK\3\2\2\2\u023f\u0240\7f\2\2\u0240M\3",
    "\2\2\2\u0241\u0246\5P)\2\u0242\u0243\7?\2\2\u0243\u0245\7@\2\2\u0244",
    "\u0242\3\2\2\2\u0245\u0248\3\2\2\2\u0246\u0244\3\2\2\2\u0246\u0247\3",
    "\2\2\2\u0247\u0252\3\2\2\2\u0248\u0246\3\2\2\2\u0249\u024e\5R*\2\u024a",
    "\u024b\7?\2\2\u024b\u024d\7@\2\2\u024c\u024a\3\2\2\2\u024d\u0250\3\2",
    "\2\2\u024e\u024c\3\2\2\2\u024e\u024f\3\2\2\2\u024f\u0252\3\2\2\2\u0250",
    "\u024e\3\2\2\2\u0251\u0241\3\2\2\2\u0251\u0249\3\2\2\2\u0252O\3\2\2",
    "\2\u0253\u0255\7f\2\2\u0254\u0256\5T+\2\u0255\u0254\3\2\2\2\u0255\u0256",
    "\3\2\2\2\u0256\u025e\3\2\2\2\u0257\u0258\7C\2\2\u0258\u025a\7f\2\2\u0259",
    "\u025b\5T+\2\u025a\u0259\3\2\2\2\u025a\u025b\3\2\2\2\u025b\u025d\3\2",
    "\2\2\u025c\u0257\3\2\2\2\u025d\u0260\3\2\2\2\u025e\u025c\3\2\2\2\u025e",
    "\u025f\3\2\2\2\u025fQ\3\2\2\2\u0260\u025e\3\2\2\2\u0261\u0262\t\4\2",
    "\2\u0262S\3\2\2\2\u0263\u0264\7F\2\2\u0264\u0269\5V,\2\u0265\u0266\7",
    "B\2\2\u0266\u0268\5V,\2\u0267\u0265\3\2\2\2\u0268\u026b\3\2\2\2\u0269",
    "\u0267\3\2\2\2\u0269\u026a\3\2\2\2\u026a\u026c\3\2\2\2\u026b\u0269\3",
    "\2\2\2\u026c\u026d\7E\2\2\u026dU\3\2\2\2\u026e\u0275\5N(\2\u026f\u0272",
    "\7I\2\2\u0270\u0271\t\5\2\2\u0271\u0273\5N(\2\u0272\u0270\3\2\2\2\u0272",
    "\u0273\3\2\2\2\u0273\u0275\3\2\2\2\u0274\u026e\3\2\2\2\u0274\u026f\3",
    "\2\2\2\u0275W\3\2\2\2\u0276\u027b\5f\64\2\u0277\u0278\7B\2\2\u0278\u027a",
    "\5f\64\2\u0279\u0277\3\2\2\2\u027a\u027d\3\2\2\2\u027b\u0279\3\2\2\2",
    "\u027b\u027c\3\2\2\2\u027cY\3\2\2\2\u027d\u027b\3\2\2\2\u027e\u0280",
    "\7;\2\2\u027f\u0281\5\\/\2\u0280\u027f\3\2\2\2\u0280\u0281\3\2\2\2\u0281",
    "\u0282\3\2\2\2\u0282\u0283\7<\2\2\u0283[\3\2\2\2\u0284\u0289\5^\60\2",
    "\u0285\u0286\7B\2\2\u0286\u0288\5^\60\2\u0287\u0285\3\2\2\2\u0288\u028b",
    "\3\2\2\2\u0289\u0287\3\2\2\2\u0289\u028a\3\2\2\2\u028a\u028e\3\2\2\2",
    "\u028b\u0289\3\2\2\2\u028c\u028d\7B\2\2\u028d\u028f\5`\61\2\u028e\u028c",
    "\3\2\2\2\u028e\u028f\3\2\2\2\u028f\u0292\3\2\2\2\u0290\u0292\5`\61\2",
    "\u0291\u0284\3\2\2\2\u0291\u0290\3\2\2\2\u0292]\3\2\2\2\u0293\u0295",
    "\5\16\b\2\u0294\u0293\3\2\2\2\u0295\u0298\3\2\2\2\u0296\u0294\3\2\2",
    "\2\u0296\u0297\3\2\2\2\u0297\u0299\3\2\2\2\u0298\u0296\3\2\2\2\u0299",
    "\u029a\5N(\2\u029a\u029b\5F$\2\u029b_\3\2\2\2\u029c\u029e\5\16\b\2\u029d",
    "\u029c\3\2\2\2\u029e\u02a1\3\2\2\2\u029f\u029d\3\2\2\2\u029f\u02a0\3",
    "\2\2\2\u02a0\u02a2\3\2\2\2\u02a1\u029f\3\2\2\2\u02a2\u02a3\5N(\2\u02a3",
    "\u02a4\7h\2\2\u02a4\u02a5\5F$\2\u02a5a\3\2\2\2\u02a6\u02a7\5\u0086D",
    "\2\u02a7c\3\2\2\2\u02a8\u02a9\5\u0086D\2\u02a9e\3\2\2\2\u02aa\u02af",
    "\7f\2\2\u02ab\u02ac\7C\2\2\u02ac\u02ae\7f\2\2\u02ad\u02ab\3\2\2\2\u02ae",
    "\u02b1\3\2\2\2\u02af\u02ad\3\2\2\2\u02af\u02b0\3\2\2\2\u02b0g\3\2\2",
    "\2\u02b1\u02af\3\2\2\2\u02b2\u02b3\t\6\2\2\u02b3i\3\2\2\2\u02b4\u02b5",
    "\7g\2\2\u02b5\u02bc\5l\67\2\u02b6\u02b9\7;\2\2\u02b7\u02ba\5n8\2\u02b8",
    "\u02ba\5r:\2\u02b9\u02b7\3\2\2\2\u02b9\u02b8\3\2\2\2\u02b9\u02ba\3\2",
    "\2\2\u02ba\u02bb\3\2\2\2\u02bb\u02bd\7<\2\2\u02bc\u02b6\3\2\2\2\u02bc",
    "\u02bd\3\2\2\2\u02bdk\3\2\2\2\u02be\u02bf\5f\64\2\u02bfm\3\2\2\2\u02c0",
    "\u02c5\5p9\2\u02c1\u02c2\7B\2\2\u02c2\u02c4\5p9\2\u02c3\u02c1\3\2\2",
    "\2\u02c4\u02c7\3\2\2\2\u02c5\u02c3\3\2\2\2\u02c5\u02c6\3\2\2\2\u02c6",
    "o\3\2\2\2\u02c7\u02c5\3\2\2\2\u02c8\u02c9\7f\2\2\u02c9\u02ca\7D\2\2",
    "\u02ca\u02cb\5r:\2\u02cbq\3\2\2\2\u02cc\u02d0\5\u00b0Y\2\u02cd\u02d0",
    "\5j\66\2\u02ce\u02d0\5t;\2\u02cf\u02cc\3\2\2\2\u02cf\u02cd\3\2\2\2\u02cf",
    "\u02ce\3\2\2\2\u02d0s\3\2\2\2\u02d1\u02da\7=\2\2\u02d2\u02d7\5r:\2\u02d3",
    "\u02d4\7B\2\2\u02d4\u02d6\5r:\2\u02d5\u02d3\3\2\2\2\u02d6\u02d9\3\2",
    "\2\2\u02d7\u02d5\3\2\2\2\u02d7\u02d8\3\2\2\2\u02d8\u02db\3\2\2\2\u02d9",
    "\u02d7\3\2\2\2\u02da\u02d2\3\2\2\2\u02da\u02db\3\2\2\2\u02db\u02dd\3",
    "\2\2\2\u02dc\u02de\7B\2\2\u02dd\u02dc\3\2\2\2\u02dd\u02de\3\2\2\2\u02de",
    "\u02df\3\2\2\2\u02df\u02e0\7>\2\2\u02e0u\3\2\2\2\u02e1\u02e2\7g\2\2",
    "\u02e2\u02e3\7\36\2\2\u02e3\u02e4\7f\2\2\u02e4\u02e5\5x=\2\u02e5w\3",
    "\2\2\2\u02e6\u02ea\7=\2\2\u02e7\u02e9\5z>\2\u02e8\u02e7\3\2\2\2\u02e9",
    "\u02ec\3\2\2\2\u02ea\u02e8\3\2\2\2\u02ea\u02eb\3\2\2\2\u02eb\u02ed\3",
    "\2\2\2\u02ec\u02ea\3\2\2\2\u02ed\u02ee\7>\2\2\u02eey\3\2\2\2\u02ef\u02f1",
    "\5\n\6\2\u02f0\u02ef\3\2\2\2\u02f1\u02f4\3\2\2\2\u02f2\u02f0\3\2\2\2",
    "\u02f2\u02f3\3\2\2\2\u02f3\u02f5\3\2\2\2\u02f4\u02f2\3\2\2\2\u02f5\u02f8",
    "\5|?\2\u02f6\u02f8\7A\2\2\u02f7\u02f2\3\2\2\2\u02f7\u02f6\3\2\2\2\u02f8",
    "{\3\2\2\2\u02f9\u02fa\5N(\2\u02fa\u02fb\5~@\2\u02fb\u02fc\7A\2\2\u02fc",
    "\u030e\3\2\2\2\u02fd\u02ff\5\20\t\2\u02fe\u0300\7A\2\2\u02ff\u02fe\3",
    "\2\2\2\u02ff\u0300\3\2\2\2\u0300\u030e\3\2\2\2\u0301\u0303\5 \21\2\u0302",
    "\u0304\7A\2\2\u0303\u0302\3\2\2\2\u0303\u0304\3\2\2\2\u0304\u030e\3",
    "\2\2\2\u0305\u0307\5\30\r\2\u0306\u0308\7A\2\2\u0307\u0306\3\2\2\2\u0307",
    "\u0308\3\2\2\2\u0308\u030e\3\2\2\2\u0309\u030b\5v<\2\u030a\u030c\7A",
    "\2\2\u030b\u030a\3\2\2\2\u030b\u030c\3\2\2\2\u030c\u030e\3\2\2\2\u030d",
    "\u02f9\3\2\2\2\u030d\u02fd\3\2\2\2\u030d\u0301\3\2\2\2\u030d\u0305\3",
    "\2\2\2\u030d\u0309\3\2\2\2\u030e}\3\2\2\2\u030f\u0312\5\u0080A\2\u0310",
    "\u0312\5\u0082B\2\u0311\u030f\3\2\2\2\u0311\u0310\3\2\2\2\u0312\177",
    "\3\2\2\2\u0313\u0314\7f\2\2\u0314\u0315\7;\2\2\u0315\u0317\7<\2\2\u0316",
    "\u0318\5\u0084C\2\u0317\u0316\3\2\2\2\u0317\u0318\3\2\2\2\u0318\u0081",
    "\3\2\2\2\u0319\u031a\5B\"\2\u031a\u0083\3\2\2\2\u031b\u031c\7\16\2\2",
    "\u031c\u031d\5r:\2\u031d\u0085\3\2\2\2\u031e\u0322\7=\2\2\u031f\u0321",
    "\5\u0088E\2\u0320\u031f\3\2\2\2\u0321\u0324\3\2\2\2\u0322\u0320\3\2",
    "\2\2\u0322\u0323\3\2\2\2\u0323\u0325\3\2\2\2\u0324\u0322\3\2\2\2\u0325",
    "\u0326\7>\2\2\u0326\u0087\3\2\2\2\u0327\u032b\5\u008aF\2\u0328\u032b",
    "\5\u008eH\2\u0329\u032b\5\b\5\2\u032a\u0327\3\2\2\2\u032a\u0328\3\2",
    "\2\2\u032a\u0329\3\2\2\2\u032b\u0089\3\2\2\2\u032c\u032d\5\u008cG\2",
    "\u032d\u032e\7A\2\2\u032e\u008b\3\2\2\2\u032f\u0331\5\16\b\2\u0330\u032f",
    "\3\2\2\2\u0331\u0334\3\2\2\2\u0332\u0330\3\2\2\2\u0332\u0333\3\2\2\2",
    "\u0333\u0335\3\2\2\2\u0334\u0332\3\2\2\2\u0335\u0336\5N(\2\u0336\u0337",
    "\5B\"\2\u0337\u008d\3\2\2\2\u0338\u03a1\5\u0086D\2\u0339\u033a\7\4\2",
    "\2\u033a\u033d\5\u00b0Y\2\u033b\u033c\7J\2\2\u033c\u033e\5\u00b0Y\2",
    "\u033d\u033b\3\2\2\2\u033d\u033e\3\2\2\2\u033e\u033f\3\2\2\2\u033f\u0340",
    "\7A\2\2\u0340\u03a1\3\2\2\2\u0341\u0342\7\30\2\2\u0342\u0343\5\u00a8",
    "U\2\u0343\u0346\5\u008eH\2\u0344\u0345\7\21\2\2\u0345\u0347\5\u008e",
    "H\2\u0346\u0344\3\2\2\2\u0346\u0347\3\2\2\2\u0347\u03a1\3\2\2\2\u0348",
    "\u0349\7\27\2\2\u0349\u034a\7;\2\2\u034a\u034b\5\u00a0Q\2\u034b\u034c",
    "\7<\2\2\u034c\u034d\5\u008eH\2\u034d\u03a1\3\2\2\2\u034e\u034f\7\64",
    "\2\2\u034f\u0350\5\u00a8U\2\u0350\u0351\5\u008eH\2\u0351\u03a1\3\2\2",
    "\2\u0352\u0353\7\17\2\2\u0353\u0354\5\u008eH\2\u0354\u0355\7\64\2\2",
    "\u0355\u0356\5\u00a8U\2\u0356\u0357\7A\2\2\u0357\u03a1\3\2\2\2\u0358",
    "\u0359\7\61\2\2\u0359\u0363\5\u0086D\2\u035a\u035c\5\u0090I\2\u035b",
    "\u035a\3\2\2\2\u035c\u035d\3\2\2\2\u035d\u035b\3\2\2\2\u035d\u035e\3",
    "\2\2\2\u035e\u0360\3\2\2\2\u035f\u0361\5\u0094K\2\u0360\u035f\3\2\2",
    "\2\u0360\u0361\3\2\2\2\u0361\u0364\3\2\2\2\u0362\u0364\5\u0094K\2\u0363",
    "\u035b\3\2\2\2\u0363\u0362\3\2\2\2\u0364\u03a1\3\2\2\2\u0365\u0366\7",
    "\61\2\2\u0366\u0367\5\u0096L\2\u0367\u036b\5\u0086D\2\u0368\u036a\5",
    "\u0090I\2\u0369\u0368\3\2\2\2\u036a\u036d\3\2\2\2\u036b\u0369\3\2\2",
    "\2\u036b\u036c\3\2\2\2\u036c\u036f\3\2\2\2\u036d\u036b\3\2\2\2\u036e",
    "\u0370\5\u0094K\2\u036f\u036e\3\2\2\2\u036f\u0370\3\2\2\2\u0370\u03a1",
    "\3\2\2\2\u0371\u0372\7+\2\2\u0372\u0373\5\u00a8U\2\u0373\u0377\7=\2",
    "\2\u0374\u0376\5\u009cO\2\u0375\u0374\3\2\2\2\u0376\u0379\3\2\2\2\u0377",
    "\u0375\3\2\2\2\u0377\u0378\3\2\2\2\u0378\u037d\3\2\2\2\u0379\u0377\3",
    "\2\2\2\u037a\u037c\5\u009eP\2\u037b\u037a\3\2\2\2\u037c\u037f\3\2\2",
    "\2\u037d\u037b\3\2\2\2\u037d\u037e\3\2\2\2\u037e\u0380\3\2\2\2\u037f",
    "\u037d\3\2\2\2\u0380\u0381\7>\2\2\u0381\u03a1\3\2\2\2\u0382\u0383\7",
    ",\2\2\u0383\u0384\5\u00a8U\2\u0384\u0385\5\u0086D\2\u0385\u03a1\3\2",
    "\2\2\u0386\u0388\7&\2\2\u0387\u0389\5\u00b0Y\2\u0388\u0387\3\2\2\2\u0388",
    "\u0389\3\2\2\2\u0389\u038a\3\2\2\2\u038a\u03a1\7A\2\2\u038b\u038c\7",
    ".\2\2\u038c\u038d\5\u00b0Y\2\u038d\u038e\7A\2\2\u038e\u03a1\3\2\2\2",
    "\u038f\u0391\7\6\2\2\u0390\u0392\7f\2\2\u0391\u0390\3\2\2\2\u0391\u0392",
    "\3\2\2\2\u0392\u0393\3\2\2\2\u0393\u03a1\7A\2\2\u0394\u0396\7\r\2\2",
    "\u0395\u0397\7f\2\2\u0396\u0395\3\2\2\2\u0396\u0397\3\2\2\2\u0397\u0398",
    "\3\2\2\2\u0398\u03a1\7A\2\2\u0399\u03a1\7A\2\2\u039a\u039b\5\u00acW",
    "\2\u039b\u039c\7A\2\2\u039c\u03a1\3\2\2\2\u039d\u039e\7f\2\2\u039e\u039f",
    "\7J\2\2\u039f\u03a1\5\u008eH\2\u03a0\u0338\3\2\2\2\u03a0\u0339\3\2\2",
    "\2\u03a0\u0341\3\2\2\2\u03a0\u0348\3\2\2\2\u03a0\u034e\3\2\2\2\u03a0",
    "\u0352\3\2\2\2\u03a0\u0358\3\2\2\2\u03a0\u0365\3\2\2\2\u03a0\u0371\3",
    "\2\2\2\u03a0\u0382\3\2\2\2\u03a0\u0386\3\2\2\2\u03a0\u038b\3\2\2\2\u03a0",
    "\u038f\3\2\2\2\u03a0\u0394\3\2\2\2\u03a0\u0399\3\2\2\2\u03a0\u039a\3",
    "\2\2\2\u03a0\u039d\3\2\2\2\u03a1\u008f\3\2\2\2\u03a2\u03a3\7\t\2\2\u03a3",
    "\u03a7\7;\2\2\u03a4\u03a6\5\16\b\2\u03a5\u03a4\3\2\2\2\u03a6\u03a9\3",
    "\2\2\2\u03a7\u03a5\3\2\2\2\u03a7\u03a8\3\2\2\2\u03a8\u03aa\3\2\2\2\u03a9",
    "\u03a7\3\2\2\2\u03aa\u03ab\5\u0092J\2\u03ab\u03ac\7f\2\2\u03ac\u03ad",
    "\7<\2\2\u03ad\u03ae\5\u0086D\2\u03ae\u0091\3\2\2\2\u03af\u03b4\5f\64",
    "\2\u03b0\u03b1\7X\2\2\u03b1\u03b3\5f\64\2\u03b2\u03b0\3\2\2\2\u03b3",
    "\u03b6\3\2\2\2\u03b4\u03b2\3\2\2\2\u03b4\u03b5\3\2\2\2\u03b5\u0093\3",
    "\2\2\2\u03b6\u03b4\3\2\2\2\u03b7\u03b8\7\25\2\2\u03b8\u03b9\5\u0086",
    "D\2\u03b9\u0095\3\2\2\2\u03ba\u03bb\7;\2\2\u03bb\u03bd\5\u0098M\2\u03bc",
    "\u03be\7A\2\2\u03bd\u03bc\3\2\2\2\u03bd\u03be\3\2\2\2\u03be\u03bf\3",
    "\2\2\2\u03bf\u03c0\7<\2\2\u03c0\u0097\3\2\2\2\u03c1\u03c6\5\u009aN\2",
    "\u03c2\u03c3\7A\2\2\u03c3\u03c5\5\u009aN\2\u03c4\u03c2\3\2\2\2\u03c5",
    "\u03c8\3\2\2\2\u03c6\u03c4\3\2\2\2\u03c6\u03c7\3\2\2\2\u03c7\u0099\3",
    "\2\2\2\u03c8\u03c6\3\2\2\2\u03c9\u03cb\5\16\b\2\u03ca\u03c9\3\2\2\2",
    "\u03cb\u03ce\3\2\2\2\u03cc\u03ca\3\2\2\2\u03cc\u03cd\3\2\2\2\u03cd\u03cf",
    "\3\2\2\2\u03ce\u03cc\3\2\2\2\u03cf\u03d0\5P)\2\u03d0\u03d1\5F$\2\u03d1",
    "\u03d2\7D\2\2\u03d2\u03d3\5\u00b0Y\2\u03d3\u009b\3\2\2\2\u03d4\u03d6",
    "\5\u009eP\2\u03d5\u03d4\3\2\2\2\u03d6\u03d7\3\2\2\2\u03d7\u03d5\3\2",
    "\2\2\u03d7\u03d8\3\2\2\2\u03d8\u03da\3\2\2\2\u03d9\u03db\5\u0088E\2",
    "\u03da\u03d9\3\2\2\2\u03db\u03dc\3\2\2\2\u03dc\u03da\3\2\2\2\u03dc\u03dd",
    "\3\2\2\2\u03dd\u009d\3\2\2\2\u03de\u03df\7\b\2\2\u03df\u03e0\5\u00ae",
    "X\2\u03e0\u03e1\7J\2\2\u03e1\u03e9\3\2\2\2\u03e2\u03e3\7\b\2\2\u03e3",
    "\u03e4\5L\'\2\u03e4\u03e5\7J\2\2\u03e5\u03e9\3\2\2\2\u03e6\u03e7\7\16",
    "\2\2\u03e7\u03e9\7J\2\2\u03e8\u03de\3\2\2\2\u03e8\u03e2\3\2\2\2\u03e8",
    "\u03e6\3\2\2\2\u03e9\u009f\3\2\2\2\u03ea\u03f7\5\u00a4S\2\u03eb\u03ed",
    "\5\u00a2R\2\u03ec\u03eb\3\2\2\2\u03ec\u03ed\3\2\2\2\u03ed\u03ee\3\2",
    "\2\2\u03ee\u03f0\7A\2\2\u03ef\u03f1\5\u00b0Y\2\u03f0\u03ef\3\2\2\2\u03f0",
    "\u03f1\3\2\2\2\u03f1\u03f2\3\2\2\2\u03f2\u03f4\7A\2\2\u03f3\u03f5\5",
    "\u00a6T\2\u03f4\u03f3\3\2\2\2\u03f4\u03f5\3\2\2\2\u03f5\u03f7\3\2\2",
    "\2\u03f6\u03ea\3\2\2\2\u03f6\u03ec\3\2\2\2\u03f7\u00a1\3\2\2\2\u03f8",
    "\u03fb\5\u008cG\2\u03f9\u03fb\5\u00aaV\2\u03fa\u03f8\3\2\2\2\u03fa\u03f9",
    "\3\2\2\2\u03fb\u00a3\3\2\2\2\u03fc\u03fe\5\16\b\2\u03fd\u03fc\3\2\2",
    "\2\u03fe\u0401\3\2\2\2\u03ff\u03fd\3\2\2\2\u03ff\u0400\3\2\2\2\u0400",
    "\u0402\3\2\2\2\u0401\u03ff\3\2\2\2\u0402\u0403\5N(\2\u0403\u0404\5F",
    "$\2\u0404\u0405\7J\2\2\u0405\u0406\5\u00b0Y\2\u0406\u00a5\3\2\2\2\u0407",
    "\u0408\5\u00aaV\2\u0408\u00a7\3\2\2\2\u0409\u040a\7;\2\2\u040a\u040b",
    "\5\u00b0Y\2\u040b\u040c\7<\2\2\u040c\u00a9\3\2\2\2\u040d\u0412\5\u00b0",
    "Y\2\u040e\u040f\7B\2\2\u040f\u0411\5\u00b0Y\2\u0410\u040e\3\2\2\2\u0411",
    "\u0414\3\2\2\2\u0412\u0410\3\2\2\2\u0412\u0413\3\2\2\2\u0413\u00ab\3",
    "\2\2\2\u0414\u0412\3\2\2\2\u0415\u0416\5\u00b0Y\2\u0416\u00ad\3\2\2",
    "\2\u0417\u0418\5\u00b0Y\2\u0418\u00af\3\2\2\2\u0419\u041a\bY\1\2\u041a",
    "\u041b\7;\2\2\u041b\u041c\5N(\2\u041c\u041d\7<\2\2\u041d\u041e\5\u00b0",
    "Y\23\u041e\u0427\3\2\2\2\u041f\u0420\t\7\2\2\u0420\u0427\5\u00b0Y\21",
    "\u0421\u0422\t\b\2\2\u0422\u0427\5\u00b0Y\20\u0423\u0427\5\u00b2Z\2",
    "\u0424\u0425\7!\2\2\u0425\u0427\5\u00b4[\2\u0426\u0419\3\2\2\2\u0426",
    "\u041f\3\2\2\2\u0426\u0421\3\2\2\2\u0426\u0423\3\2\2\2\u0426\u0424\3",
    "\2\2\2\u0427\u047d\3\2\2\2\u0428\u0429\f\17\2\2\u0429\u042a\t\t\2\2",
    "\u042a\u047c\5\u00b0Y\20\u042b\u042c\f\16\2\2\u042c\u042d\t\n\2\2\u042d",
    "\u047c\5\u00b0Y\17\u042e\u0436\f\r\2\2\u042f\u0430\7F\2\2\u0430\u0437",
    "\7F\2\2\u0431\u0432\7E\2\2\u0432\u0433\7E\2\2\u0433\u0437\7E\2\2\u0434",
    "\u0435\7E\2\2\u0435\u0437\7E\2\2\u0436\u042f\3\2\2\2\u0436\u0431\3\2",
    "\2\2\u0436\u0434\3\2\2\2\u0437\u0438\3\2\2\2\u0438\u047c\5\u00b0Y\16",
    "\u0439\u043a\f\f\2\2\u043a\u043b\t\13\2\2\u043b\u047c\5\u00b0Y\r\u043c",
    "\u043d\f\n\2\2\u043d\u043e\t\f\2\2\u043e\u047c\5\u00b0Y\13\u043f\u0440",
    "\f\t\2\2\u0440\u0441\7W\2\2\u0441\u047c\5\u00b0Y\n\u0442\u0443\f\b\2",
    "\2\u0443\u0444\7Y\2\2\u0444\u047c\5\u00b0Y\t\u0445\u0446\f\7\2\2\u0446",
    "\u0447\7X\2\2\u0447\u047c\5\u00b0Y\b\u0448\u0449\f\6\2\2\u0449\u044a",
    "\7O\2\2\u044a\u047c\5\u00b0Y\7\u044b\u044c\f\5\2\2\u044c\u044d\7P\2",
    "\2\u044d\u047c\5\u00b0Y\6\u044e\u044f\f\4\2\2\u044f\u0450\7I\2\2\u0450",
    "\u0451\5\u00b0Y\2\u0451\u0452\7J\2\2\u0452\u0453\5\u00b0Y\5\u0453\u047c",
    "\3\2\2\2\u0454\u0455\f\3\2\2\u0455\u0456\t\r\2\2\u0456\u047c\5\u00b0",
    "Y\3\u0457\u0458\f\33\2\2\u0458\u0459\7C\2\2\u0459\u047c\7f\2\2\u045a",
    "\u045b\f\32\2\2\u045b\u045c\7C\2\2\u045c\u047c\7-\2\2\u045d\u045e\f",
    "\31\2\2\u045e\u045f\7C\2\2\u045f\u0461\7!\2\2\u0460\u0462\5\u00c0a\2",
    "\u0461\u0460\3\2\2\2\u0461\u0462\3\2\2\2\u0462\u0463\3\2\2\2\u0463\u047c",
    "\5\u00b8]\2\u0464\u0465\f\30\2\2\u0465\u0466\7C\2\2\u0466\u0467\7*\2",
    "\2\u0467\u047c\5\u00c6d\2\u0468\u0469\f\27\2\2\u0469\u046a\7C\2\2\u046a",
    "\u047c\5\u00be`\2\u046b\u046c\f\26\2\2\u046c\u046d\7?\2\2\u046d\u046e",
    "\5\u00b0Y\2\u046e\u046f\7@\2\2\u046f\u047c\3\2\2\2\u0470\u0471\f\25",
    "\2\2\u0471\u0473\7;\2\2\u0472\u0474\5\u00aaV\2\u0473\u0472\3\2\2\2\u0473",
    "\u0474\3\2\2\2\u0474\u0475\3\2\2\2\u0475\u047c\7<\2\2\u0476\u0477\f",
    "\22\2\2\u0477\u047c\t\16\2\2\u0478\u0479\f\13\2\2\u0479\u047a\7\34\2",
    "\2\u047a\u047c\5N(\2\u047b\u0428\3\2\2\2\u047b\u042b\3\2\2\2\u047b\u042e",
    "\3\2\2\2\u047b\u0439\3\2\2\2\u047b\u043c\3\2\2\2\u047b\u043f\3\2\2\2",
    "\u047b\u0442\3\2\2\2\u047b\u0445\3\2\2\2\u047b\u0448\3\2\2\2\u047b\u044b",
    "\3\2\2\2\u047b\u044e\3\2\2\2\u047b\u0454\3\2\2\2\u047b\u0457\3\2\2\2",
    "\u047b\u045a\3\2\2\2\u047b\u045d\3\2\2\2\u047b\u0464\3\2\2\2\u047b\u0468",
    "\3\2\2\2\u047b\u046b\3\2\2\2\u047b\u0470\3\2\2\2\u047b\u0476\3\2\2\2",
    "\u047b\u0478\3\2\2\2\u047c\u047f\3\2\2\2\u047d\u047b\3\2\2\2\u047d\u047e",
    "\3\2\2\2\u047e\u00b1\3\2\2\2\u047f\u047d\3\2\2\2\u0480\u0481\7;\2\2",
    "\u0481\u0482\5\u00b0Y\2\u0482\u0483\7<\2\2\u0483\u0496\3\2\2\2\u0484",
    "\u0496\7-\2\2\u0485\u0496\7*\2\2\u0486\u0496\5h\65\2\u0487\u0496\7f",
    "\2\2\u0488\u0489\5N(\2\u0489\u048a\7C\2\2\u048a\u048b\7\13\2\2\u048b",
    "\u0496\3\2\2\2\u048c\u048d\7\62\2\2\u048d\u048e\7C\2\2\u048e\u0496\7",
    "\13\2\2\u048f\u0493\5\u00c0a\2\u0490\u0494\5\u00c8e\2\u0491\u0492\7",
    "-\2\2\u0492\u0494\5\u00caf\2\u0493\u0490\3\2\2\2\u0493\u0491\3\2\2\2",
    "\u0494\u0496\3\2\2\2\u0495\u0480\3\2\2\2\u0495\u0484\3\2\2\2\u0495\u0485",
    "\3\2\2\2\u0495\u0486\3\2\2\2\u0495\u0487\3\2\2\2\u0495\u0488\3\2\2\2",
    "\u0495\u048c\3\2\2\2\u0495\u048f\3\2\2\2\u0496\u00b3\3\2\2\2\u0497\u0498",
    "\5\u00c0a\2\u0498\u0499\5\u00b6\\\2\u0499\u049a\5\u00bc_\2\u049a\u04a1",
    "\3\2\2\2\u049b\u049e\5\u00b6\\\2\u049c\u049f\5\u00ba^\2\u049d\u049f",
    "\5\u00bc_\2\u049e\u049c\3\2\2\2\u049e\u049d\3\2\2\2\u049f\u04a1\3\2",
    "\2\2\u04a0\u0497\3\2\2\2\u04a0\u049b\3\2\2\2\u04a1\u00b5\3\2\2\2\u04a2",
    "\u04a4\7f\2\2\u04a3\u04a5\5\u00c2b\2\u04a4\u04a3\3\2\2\2\u04a4\u04a5",
    "\3\2\2\2\u04a5\u04ad\3\2\2\2\u04a6\u04a7\7C\2\2\u04a7\u04a9\7f\2\2\u04a8",
    "\u04aa\5\u00c2b\2\u04a9\u04a8\3\2\2\2\u04a9\u04aa\3\2\2\2\u04aa\u04ac",
    "\3\2\2\2\u04ab\u04a6\3\2\2\2\u04ac\u04af\3\2\2\2\u04ad\u04ab\3\2\2\2",
    "\u04ad\u04ae\3\2\2\2\u04ae\u04b2\3\2\2\2\u04af\u04ad\3\2\2\2\u04b0\u04b2",
    "\5R*\2\u04b1\u04a2\3\2\2\2\u04b1\u04b0\3\2\2\2\u04b2\u00b7\3\2\2\2\u04b3",
    "\u04b5\7f\2\2\u04b4\u04b6\5\u00c4c\2\u04b5\u04b4\3\2\2\2\u04b5\u04b6",
    "\3\2\2\2\u04b6\u04b7\3\2\2\2\u04b7\u04b8\5\u00bc_\2\u04b8\u00b9\3\2",
    "\2\2\u04b9\u04d5\7?\2\2\u04ba\u04bf\7@\2\2\u04bb\u04bc\7?\2\2\u04bc",
    "\u04be\7@\2\2\u04bd\u04bb\3\2\2\2\u04be\u04c1\3\2\2\2\u04bf\u04bd\3",
    "\2\2\2\u04bf\u04c0\3\2\2\2\u04c0\u04c2\3\2\2\2\u04c1\u04bf\3\2\2\2\u04c2",
    "\u04d6\5J&\2\u04c3\u04c4\5\u00b0Y\2\u04c4\u04cb\7@\2\2\u04c5\u04c6\7",
    "?\2\2\u04c6\u04c7\5\u00b0Y\2\u04c7\u04c8\7@\2\2\u04c8\u04ca\3\2\2\2",
    "\u04c9\u04c5\3\2\2\2\u04ca\u04cd\3\2\2\2\u04cb\u04c9\3\2\2\2\u04cb\u04cc",
    "\3\2\2\2\u04cc\u04d2\3\2\2\2\u04cd\u04cb\3\2\2\2\u04ce\u04cf\7?\2\2",
    "\u04cf\u04d1\7@\2\2\u04d0\u04ce\3\2\2\2\u04d1\u04d4\3\2\2\2\u04d2\u04d0",
    "\3\2\2\2\u04d2\u04d3\3\2\2\2\u04d3\u04d6\3\2\2\2\u04d4\u04d2\3\2\2\2",
    "\u04d5\u04ba\3\2\2\2\u04d5\u04c3\3\2\2\2\u04d6\u00bb\3\2\2\2\u04d7\u04d9",
    "\5\u00caf\2\u04d8\u04da\5$\23\2\u04d9\u04d8\3\2\2\2\u04d9\u04da\3\2",
    "\2\2\u04da\u00bd\3\2\2\2\u04db\u04dc\5\u00c0a\2\u04dc\u04dd\5\u00c8",
    "e\2\u04dd\u00bf\3\2\2\2\u04de\u04df\7F\2\2\u04df\u04e0\5\"\22\2\u04e0",
    "\u04e1\7E\2\2\u04e1\u00c1\3\2\2\2\u04e2\u04e3\7F\2\2\u04e3\u04e6\7E",
    "\2\2\u04e4\u04e6\5T+\2\u04e5\u04e2\3\2\2\2\u04e5\u04e4\3\2\2\2\u04e6",
    "\u00c3\3\2\2\2\u04e7\u04e8\7F\2\2\u04e8\u04eb\7E\2\2\u04e9\u04eb\5\u00c0",
    "a\2\u04ea\u04e7\3\2\2\2\u04ea\u04e9\3\2\2\2\u04eb\u00c5\3\2\2\2\u04ec",
    "\u04f3\5\u00caf\2\u04ed\u04ee\7C\2\2\u04ee\u04f0\7f\2\2\u04ef\u04f1",
    "\5\u00caf\2\u04f0\u04ef\3\2\2\2\u04f0\u04f1\3\2\2\2\u04f1\u04f3\3\2",
    "\2\2\u04f2\u04ec\3\2\2\2\u04f2\u04ed\3\2\2\2\u04f3\u00c7\3\2\2\2\u04f4",
    "\u04f5\7*\2\2\u04f5\u04f9\5\u00c6d\2\u04f6\u04f7\7f\2\2\u04f7\u04f9",
    "\5\u00caf\2\u04f8\u04f4\3\2\2\2\u04f8\u04f6\3\2\2\2\u04f9\u00c9\3\2",
    "\2\2\u04fa\u04fc\7;\2\2\u04fb\u04fd\5\u00aaV\2\u04fc\u04fb\3\2\2\2\u04fc",
    "\u04fd\3\2\2\2\u04fd\u04fe\3\2\2\2\u04fe\u04ff\7<\2\2\u04ff\u00cb\3",
    "\2\2\2\u0097\u00cd\u00d2\u00d8\u00e0\u00e9\u00ee\u00f5\u00fc\u0103\u010a",
    "\u010f\u0113\u0117\u011b\u0120\u0124\u0128\u0132\u013a\u0141\u0148\u014c",
    "\u014f\u0152\u015b\u0161\u0166\u0169\u016f\u0175\u0179\u0182\u0189\u0192",
    "\u0199\u019f\u01a3\u01ae\u01b2\u01ba\u01bf\u01c3\u01cc\u01da\u01df\u01e8",
    "\u01f0\u01fa\u0202\u020a\u020f\u021b\u0221\u0228\u022d\u0235\u0239\u023b",
    "\u0246\u024e\u0251\u0255\u025a\u025e\u0269\u0272\u0274\u027b\u0280\u0289",
    "\u028e\u0291\u0296\u029f\u02af\u02b9\u02bc\u02c5\u02cf\u02d7\u02da\u02dd",
    "\u02ea\u02f2\u02f7\u02ff\u0303\u0307\u030b\u030d\u0311\u0317\u0322\u032a",
    "\u0332\u033d\u0346\u035d\u0360\u0363\u036b\u036f\u0377\u037d\u0388\u0391",
    "\u0396\u03a0\u03a7\u03b4\u03bd\u03c6\u03cc\u03d7\u03dc\u03e8\u03ec\u03f0",
    "\u03f4\u03f6\u03fa\u03ff\u0412\u0426\u0436\u0461\u0473\u047b\u047d\u0493",
    "\u0495\u049e\u04a0\u04a4\u04a9\u04ad\u04b1\u04b5\u04bf\u04cb\u04d2\u04d5",
    "\u04d9\u04e5\u04ea\u04f0\u04f2\u04f8\u04fc"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ 'null', "'abstract'", "'assert'", "'boolean'", "'break'", 
                     "'byte'", "'case'", "'catch'", "'char'", "'class'", 
                     "'const'", "'continue'", "'default'", "'do'", "'double'", 
                     "'else'", "'enum'", "'extends'", "'final'", "'finally'", 
                     "'float'", "'for'", "'if'", "'goto'", "'implements'", 
                     "'import'", "'instanceof'", "'int'", "'interface'", 
                     "'long'", "'native'", "'new'", "'package'", "'private'", 
                     "'protected'", "'public'", "'return'", "'short'", "'static'", 
                     "'strictfp'", "'super'", "'switch'", "'synchronized'", 
                     "'this'", "'throw'", "'throws'", "'transient'", "'try'", 
                     "'void'", "'volatile'", "'while'", 'null', 'null', 
                     'null', 'null', 'null', "'null'", "'('", "')'", "'{'", 
                     "'}'", "'['", "']'", "';'", "','", "'.'", "'='", "'>'", 
                     "'<'", "'!'", "'~'", "'?'", "':'", "'=='", "'<='", 
                     "'>='", "'!='", "'&&'", "'||'", "'++'", "'--'", "'+'", 
                     "'-'", "'*'", "'/'", "'&'", "'|'", "'^'", "'%'", "'+='", 
                     "'-='", "'*='", "'/='", "'&='", "'|='", "'^='", "'%='", 
                     "'<<='", "'>>='", "'>>>='", 'null', "'@'", "'...'" ];

var symbolicNames = [ 'null', "ABSTRACT", "ASSERT", "BOOLEAN", "BREAK", 
                      "BYTE", "CASE", "CATCH", "CHAR", "CLASS", "CONST", 
                      "CONTINUE", "DEFAULT", "DO", "DOUBLE", "ELSE", "ENUM", 
                      "EXTENDS", "FINAL", "FINALLY", "FLOAT", "FOR", "IF", 
                      "GOTO", "IMPLEMENTS", "IMPORT", "INSTANCEOF", "INT", 
                      "INTERFACE", "LONG", "NATIVE", "NEW", "PACKAGE", "PRIVATE", 
                      "PROTECTED", "PUBLIC", "RETURN", "SHORT", "STATIC", 
                      "STRICTFP", "SUPER", "SWITCH", "SYNCHRONIZED", "THIS", 
                      "THROW", "THROWS", "TRANSIENT", "TRY", "VOID", "VOLATILE", 
                      "WHILE", "IntegerLiteral", "FloatingPointLiteral", 
                      "BooleanLiteral", "CharacterLiteral", "StringLiteral", 
                      "NullLiteral", "LPAREN", "RPAREN", "LBRACE", "RBRACE", 
                      "LBRACK", "RBRACK", "SEMI", "COMMA", "DOT", "ASSIGN", 
                      "GT", "LT", "BANG", "TILDE", "QUESTION", "COLON", 
                      "EQUAL", "LE", "GE", "NOTEQUAL", "AND", "OR", "INC", 
                      "DEC", "ADD", "SUB", "MUL", "DIV", "BITAND", "BITOR", 
                      "CARET", "MOD", "ADD_ASSIGN", "SUB_ASSIGN", "MUL_ASSIGN", 
                      "DIV_ASSIGN", "AND_ASSIGN", "OR_ASSIGN", "XOR_ASSIGN", 
                      "MOD_ASSIGN", "LSHIFT_ASSIGN", "RSHIFT_ASSIGN", "URSHIFT_ASSIGN", 
                      "Identifier", "AT", "ELLIPSIS", "WS", "COMMENT", "LINE_COMMENT" ];

var ruleNames =  [ "compilationUnit", "packageDeclaration", "importDeclaration", 
                   "typeDeclaration", "modifier", "classOrInterfaceModifier", 
                   "variableModifier", "classDeclaration", "typeParameters", 
                   "typeParameter", "typeBound", "enumDeclaration", "enumConstants", 
                   "enumConstant", "enumBodyDeclarations", "interfaceDeclaration", 
                   "typeList", "classBody", "interfaceBody", "classBodyDeclaration", 
                   "memberDeclaration", "methodDeclaration", "genericMethodDeclaration", 
                   "constructorDeclaration", "genericConstructorDeclaration", 
                   "fieldDeclaration", "interfaceBodyDeclaration", "interfaceMemberDeclaration", 
                   "constDeclaration", "constantDeclarator", "interfaceMethodDeclaration", 
                   "genericInterfaceMethodDeclaration", "variableDeclarators", 
                   "variableDeclarator", "variableDeclaratorId", "variableInitializer", 
                   "arrayInitializer", "enumConstantName", "type", "classOrInterfaceType", 
                   "primitiveType", "typeArguments", "typeArgument", "qualifiedNameList", 
                   "formalParameters", "formalParameterList", "formalParameter", 
                   "lastFormalParameter", "methodBody", "constructorBody", 
                   "qualifiedName", "literal", "annotation", "annotationName", 
                   "elementValuePairs", "elementValuePair", "elementValue", 
                   "elementValueArrayInitializer", "annotationTypeDeclaration", 
                   "annotationTypeBody", "annotationTypeElementDeclaration", 
                   "annotationTypeElementRest", "annotationMethodOrConstantRest", 
                   "annotationMethodRest", "annotationConstantRest", "defaultValue", 
                   "block", "blockStatement", "localVariableDeclarationStatement", 
                   "localVariableDeclaration", "statement", "catchClause", 
                   "catchType", "finallyBlock", "resourceSpecification", 
                   "resources", "resource", "switchBlockStatementGroup", 
                   "switchLabel", "forControl", "forInit", "enhancedForControl", 
                   "forUpdate", "parExpression", "expressionList", "statementExpression", 
                   "constantExpression", "expression", "primary", "creator", 
                   "createdName", "innerCreator", "arrayCreatorRest", "classCreatorRest", 
                   "explicitGenericInvocation", "nonWildcardTypeArguments", 
                   "typeArgumentsOrDiamond", "nonWildcardTypeArgumentsOrDiamond", 
                   "superSuffix", "explicitGenericInvocationSuffix", "arguments" ];

function JavaParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

JavaParser.prototype = Object.create(antlr4.Parser.prototype);
JavaParser.prototype.constructor = JavaParser;

Object.defineProperty(JavaParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

JavaParser.EOF = antlr4.Token.EOF;
JavaParser.ABSTRACT = 1;
JavaParser.ASSERT = 2;
JavaParser.BOOLEAN = 3;
JavaParser.BREAK = 4;
JavaParser.BYTE = 5;
JavaParser.CASE = 6;
JavaParser.CATCH = 7;
JavaParser.CHAR = 8;
JavaParser.CLASS = 9;
JavaParser.CONST = 10;
JavaParser.CONTINUE = 11;
JavaParser.DEFAULT = 12;
JavaParser.DO = 13;
JavaParser.DOUBLE = 14;
JavaParser.ELSE = 15;
JavaParser.ENUM = 16;
JavaParser.EXTENDS = 17;
JavaParser.FINAL = 18;
JavaParser.FINALLY = 19;
JavaParser.FLOAT = 20;
JavaParser.FOR = 21;
JavaParser.IF = 22;
JavaParser.GOTO = 23;
JavaParser.IMPLEMENTS = 24;
JavaParser.IMPORT = 25;
JavaParser.INSTANCEOF = 26;
JavaParser.INT = 27;
JavaParser.INTERFACE = 28;
JavaParser.LONG = 29;
JavaParser.NATIVE = 30;
JavaParser.NEW = 31;
JavaParser.PACKAGE = 32;
JavaParser.PRIVATE = 33;
JavaParser.PROTECTED = 34;
JavaParser.PUBLIC = 35;
JavaParser.RETURN = 36;
JavaParser.SHORT = 37;
JavaParser.STATIC = 38;
JavaParser.STRICTFP = 39;
JavaParser.SUPER = 40;
JavaParser.SWITCH = 41;
JavaParser.SYNCHRONIZED = 42;
JavaParser.THIS = 43;
JavaParser.THROW = 44;
JavaParser.THROWS = 45;
JavaParser.TRANSIENT = 46;
JavaParser.TRY = 47;
JavaParser.VOID = 48;
JavaParser.VOLATILE = 49;
JavaParser.WHILE = 50;
JavaParser.IntegerLiteral = 51;
JavaParser.FloatingPointLiteral = 52;
JavaParser.BooleanLiteral = 53;
JavaParser.CharacterLiteral = 54;
JavaParser.StringLiteral = 55;
JavaParser.NullLiteral = 56;
JavaParser.LPAREN = 57;
JavaParser.RPAREN = 58;
JavaParser.LBRACE = 59;
JavaParser.RBRACE = 60;
JavaParser.LBRACK = 61;
JavaParser.RBRACK = 62;
JavaParser.SEMI = 63;
JavaParser.COMMA = 64;
JavaParser.DOT = 65;
JavaParser.ASSIGN = 66;
JavaParser.GT = 67;
JavaParser.LT = 68;
JavaParser.BANG = 69;
JavaParser.TILDE = 70;
JavaParser.QUESTION = 71;
JavaParser.COLON = 72;
JavaParser.EQUAL = 73;
JavaParser.LE = 74;
JavaParser.GE = 75;
JavaParser.NOTEQUAL = 76;
JavaParser.AND = 77;
JavaParser.OR = 78;
JavaParser.INC = 79;
JavaParser.DEC = 80;
JavaParser.ADD = 81;
JavaParser.SUB = 82;
JavaParser.MUL = 83;
JavaParser.DIV = 84;
JavaParser.BITAND = 85;
JavaParser.BITOR = 86;
JavaParser.CARET = 87;
JavaParser.MOD = 88;
JavaParser.ADD_ASSIGN = 89;
JavaParser.SUB_ASSIGN = 90;
JavaParser.MUL_ASSIGN = 91;
JavaParser.DIV_ASSIGN = 92;
JavaParser.AND_ASSIGN = 93;
JavaParser.OR_ASSIGN = 94;
JavaParser.XOR_ASSIGN = 95;
JavaParser.MOD_ASSIGN = 96;
JavaParser.LSHIFT_ASSIGN = 97;
JavaParser.RSHIFT_ASSIGN = 98;
JavaParser.URSHIFT_ASSIGN = 99;
JavaParser.Identifier = 100;
JavaParser.AT = 101;
JavaParser.ELLIPSIS = 102;
JavaParser.WS = 103;
JavaParser.COMMENT = 104;
JavaParser.LINE_COMMENT = 105;

JavaParser.RULE_compilationUnit = 0;
JavaParser.RULE_packageDeclaration = 1;
JavaParser.RULE_importDeclaration = 2;
JavaParser.RULE_typeDeclaration = 3;
JavaParser.RULE_modifier = 4;
JavaParser.RULE_classOrInterfaceModifier = 5;
JavaParser.RULE_variableModifier = 6;
JavaParser.RULE_classDeclaration = 7;
JavaParser.RULE_typeParameters = 8;
JavaParser.RULE_typeParameter = 9;
JavaParser.RULE_typeBound = 10;
JavaParser.RULE_enumDeclaration = 11;
JavaParser.RULE_enumConstants = 12;
JavaParser.RULE_enumConstant = 13;
JavaParser.RULE_enumBodyDeclarations = 14;
JavaParser.RULE_interfaceDeclaration = 15;
JavaParser.RULE_typeList = 16;
JavaParser.RULE_classBody = 17;
JavaParser.RULE_interfaceBody = 18;
JavaParser.RULE_classBodyDeclaration = 19;
JavaParser.RULE_memberDeclaration = 20;
JavaParser.RULE_methodDeclaration = 21;
JavaParser.RULE_genericMethodDeclaration = 22;
JavaParser.RULE_constructorDeclaration = 23;
JavaParser.RULE_genericConstructorDeclaration = 24;
JavaParser.RULE_fieldDeclaration = 25;
JavaParser.RULE_interfaceBodyDeclaration = 26;
JavaParser.RULE_interfaceMemberDeclaration = 27;
JavaParser.RULE_constDeclaration = 28;
JavaParser.RULE_constantDeclarator = 29;
JavaParser.RULE_interfaceMethodDeclaration = 30;
JavaParser.RULE_genericInterfaceMethodDeclaration = 31;
JavaParser.RULE_variableDeclarators = 32;
JavaParser.RULE_variableDeclarator = 33;
JavaParser.RULE_variableDeclaratorId = 34;
JavaParser.RULE_variableInitializer = 35;
JavaParser.RULE_arrayInitializer = 36;
JavaParser.RULE_enumConstantName = 37;
JavaParser.RULE_type = 38;
JavaParser.RULE_classOrInterfaceType = 39;
JavaParser.RULE_primitiveType = 40;
JavaParser.RULE_typeArguments = 41;
JavaParser.RULE_typeArgument = 42;
JavaParser.RULE_qualifiedNameList = 43;
JavaParser.RULE_formalParameters = 44;
JavaParser.RULE_formalParameterList = 45;
JavaParser.RULE_formalParameter = 46;
JavaParser.RULE_lastFormalParameter = 47;
JavaParser.RULE_methodBody = 48;
JavaParser.RULE_constructorBody = 49;
JavaParser.RULE_qualifiedName = 50;
JavaParser.RULE_literal = 51;
JavaParser.RULE_annotation = 52;
JavaParser.RULE_annotationName = 53;
JavaParser.RULE_elementValuePairs = 54;
JavaParser.RULE_elementValuePair = 55;
JavaParser.RULE_elementValue = 56;
JavaParser.RULE_elementValueArrayInitializer = 57;
JavaParser.RULE_annotationTypeDeclaration = 58;
JavaParser.RULE_annotationTypeBody = 59;
JavaParser.RULE_annotationTypeElementDeclaration = 60;
JavaParser.RULE_annotationTypeElementRest = 61;
JavaParser.RULE_annotationMethodOrConstantRest = 62;
JavaParser.RULE_annotationMethodRest = 63;
JavaParser.RULE_annotationConstantRest = 64;
JavaParser.RULE_defaultValue = 65;
JavaParser.RULE_block = 66;
JavaParser.RULE_blockStatement = 67;
JavaParser.RULE_localVariableDeclarationStatement = 68;
JavaParser.RULE_localVariableDeclaration = 69;
JavaParser.RULE_statement = 70;
JavaParser.RULE_catchClause = 71;
JavaParser.RULE_catchType = 72;
JavaParser.RULE_finallyBlock = 73;
JavaParser.RULE_resourceSpecification = 74;
JavaParser.RULE_resources = 75;
JavaParser.RULE_resource = 76;
JavaParser.RULE_switchBlockStatementGroup = 77;
JavaParser.RULE_switchLabel = 78;
JavaParser.RULE_forControl = 79;
JavaParser.RULE_forInit = 80;
JavaParser.RULE_enhancedForControl = 81;
JavaParser.RULE_forUpdate = 82;
JavaParser.RULE_parExpression = 83;
JavaParser.RULE_expressionList = 84;
JavaParser.RULE_statementExpression = 85;
JavaParser.RULE_constantExpression = 86;
JavaParser.RULE_expression = 87;
JavaParser.RULE_primary = 88;
JavaParser.RULE_creator = 89;
JavaParser.RULE_createdName = 90;
JavaParser.RULE_innerCreator = 91;
JavaParser.RULE_arrayCreatorRest = 92;
JavaParser.RULE_classCreatorRest = 93;
JavaParser.RULE_explicitGenericInvocation = 94;
JavaParser.RULE_nonWildcardTypeArguments = 95;
JavaParser.RULE_typeArgumentsOrDiamond = 96;
JavaParser.RULE_nonWildcardTypeArgumentsOrDiamond = 97;
JavaParser.RULE_superSuffix = 98;
JavaParser.RULE_explicitGenericInvocationSuffix = 99;
JavaParser.RULE_arguments = 100;

function CompilationUnitContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_compilationUnit;
    return this;
}

CompilationUnitContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CompilationUnitContext.prototype.constructor = CompilationUnitContext;

CompilationUnitContext.prototype.EOF = function() {
    return this.getToken(JavaParser.EOF, 0);
};

CompilationUnitContext.prototype.packageDeclaration = function() {
    return this.getTypedRuleContext(PackageDeclarationContext,0);
};

CompilationUnitContext.prototype.importDeclaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ImportDeclarationContext);
    } else {
        return this.getTypedRuleContext(ImportDeclarationContext,i);
    }
};

CompilationUnitContext.prototype.typeDeclaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeDeclarationContext);
    } else {
        return this.getTypedRuleContext(TypeDeclarationContext,i);
    }
};

CompilationUnitContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterCompilationUnit(this);
	}
};

CompilationUnitContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitCompilationUnit(this);
	}
};




JavaParser.CompilationUnitContext = CompilationUnitContext;

JavaParser.prototype.compilationUnit = function() {

    var localctx = new CompilationUnitContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, JavaParser.RULE_compilationUnit);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 203;
        var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
        if(la_===1) {
            this.state = 202;
            this.packageDeclaration();

        }
        this.state = 208;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.IMPORT) {
            this.state = 205;
            this.importDeclaration();
            this.state = 210;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 214;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.CLASS) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.INTERFACE))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || _la===JavaParser.AT) {
            this.state = 211;
            this.typeDeclaration();
            this.state = 216;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 217;
        this.match(JavaParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function PackageDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_packageDeclaration;
    return this;
}

PackageDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PackageDeclarationContext.prototype.constructor = PackageDeclarationContext;

PackageDeclarationContext.prototype.qualifiedName = function() {
    return this.getTypedRuleContext(QualifiedNameContext,0);
};

PackageDeclarationContext.prototype.annotation = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(AnnotationContext);
    } else {
        return this.getTypedRuleContext(AnnotationContext,i);
    }
};

PackageDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterPackageDeclaration(this);
	}
};

PackageDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitPackageDeclaration(this);
	}
};




JavaParser.PackageDeclarationContext = PackageDeclarationContext;

JavaParser.prototype.packageDeclaration = function() {

    var localctx = new PackageDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, JavaParser.RULE_packageDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 222;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.AT) {
            this.state = 219;
            this.annotation();
            this.state = 224;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 225;
        this.match(JavaParser.PACKAGE);
        this.state = 226;
        this.qualifiedName();
        this.state = 227;
        this.match(JavaParser.SEMI);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ImportDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_importDeclaration;
    return this;
}

ImportDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ImportDeclarationContext.prototype.constructor = ImportDeclarationContext;

ImportDeclarationContext.prototype.qualifiedName = function() {
    return this.getTypedRuleContext(QualifiedNameContext,0);
};

ImportDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterImportDeclaration(this);
	}
};

ImportDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitImportDeclaration(this);
	}
};




JavaParser.ImportDeclarationContext = ImportDeclarationContext;

JavaParser.prototype.importDeclaration = function() {

    var localctx = new ImportDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, JavaParser.RULE_importDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 229;
        this.match(JavaParser.IMPORT);
        this.state = 231;
        _la = this._input.LA(1);
        if(_la===JavaParser.STATIC) {
            this.state = 230;
            this.match(JavaParser.STATIC);
        }

        this.state = 233;
        this.qualifiedName();
        this.state = 236;
        _la = this._input.LA(1);
        if(_la===JavaParser.DOT) {
            this.state = 234;
            this.match(JavaParser.DOT);
            this.state = 235;
            this.match(JavaParser.MUL);
        }

        this.state = 238;
        this.match(JavaParser.SEMI);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeDeclaration;
    return this;
}

TypeDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeDeclarationContext.prototype.constructor = TypeDeclarationContext;

TypeDeclarationContext.prototype.classDeclaration = function() {
    return this.getTypedRuleContext(ClassDeclarationContext,0);
};

TypeDeclarationContext.prototype.classOrInterfaceModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ClassOrInterfaceModifierContext);
    } else {
        return this.getTypedRuleContext(ClassOrInterfaceModifierContext,i);
    }
};

TypeDeclarationContext.prototype.enumDeclaration = function() {
    return this.getTypedRuleContext(EnumDeclarationContext,0);
};

TypeDeclarationContext.prototype.interfaceDeclaration = function() {
    return this.getTypedRuleContext(InterfaceDeclarationContext,0);
};

TypeDeclarationContext.prototype.annotationTypeDeclaration = function() {
    return this.getTypedRuleContext(AnnotationTypeDeclarationContext,0);
};

TypeDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeDeclaration(this);
	}
};

TypeDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeDeclaration(this);
	}
};




JavaParser.TypeDeclarationContext = TypeDeclarationContext;

JavaParser.prototype.typeDeclaration = function() {

    var localctx = new TypeDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, JavaParser.RULE_typeDeclaration);
    var _la = 0; // Token type
    try {
        this.state = 269;
        var la_ = this._interp.adaptivePredict(this._input,10,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 243;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.ABSTRACT || _la===JavaParser.FINAL || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)))) !== 0) || _la===JavaParser.AT) {
                this.state = 240;
                this.classOrInterfaceModifier();
                this.state = 245;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 246;
            this.classDeclaration();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 250;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.ABSTRACT || _la===JavaParser.FINAL || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)))) !== 0) || _la===JavaParser.AT) {
                this.state = 247;
                this.classOrInterfaceModifier();
                this.state = 252;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 253;
            this.enumDeclaration();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 257;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.ABSTRACT || _la===JavaParser.FINAL || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)))) !== 0) || _la===JavaParser.AT) {
                this.state = 254;
                this.classOrInterfaceModifier();
                this.state = 259;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 260;
            this.interfaceDeclaration();
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 264;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,9,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 261;
                    this.classOrInterfaceModifier(); 
                }
                this.state = 266;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,9,this._ctx);
            }

            this.state = 267;
            this.annotationTypeDeclaration();
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 268;
            this.match(JavaParser.SEMI);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ModifierContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_modifier;
    return this;
}

ModifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ModifierContext.prototype.constructor = ModifierContext;

ModifierContext.prototype.classOrInterfaceModifier = function() {
    return this.getTypedRuleContext(ClassOrInterfaceModifierContext,0);
};

ModifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterModifier(this);
	}
};

ModifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitModifier(this);
	}
};




JavaParser.ModifierContext = ModifierContext;

JavaParser.prototype.modifier = function() {

    var localctx = new ModifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, JavaParser.RULE_modifier);
    var _la = 0; // Token type
    try {
        this.state = 273;
        switch(this._input.LA(1)) {
        case JavaParser.ABSTRACT:
        case JavaParser.FINAL:
        case JavaParser.PRIVATE:
        case JavaParser.PROTECTED:
        case JavaParser.PUBLIC:
        case JavaParser.STATIC:
        case JavaParser.STRICTFP:
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 1);
            this.state = 271;
            this.classOrInterfaceModifier();
            break;
        case JavaParser.NATIVE:
        case JavaParser.SYNCHRONIZED:
        case JavaParser.TRANSIENT:
        case JavaParser.VOLATILE:
            this.enterOuterAlt(localctx, 2);
            this.state = 272;
            _la = this._input.LA(1);
            if(!(((((_la - 30)) & ~0x1f) == 0 && ((1 << (_la - 30)) & ((1 << (JavaParser.NATIVE - 30)) | (1 << (JavaParser.SYNCHRONIZED - 30)) | (1 << (JavaParser.TRANSIENT - 30)) | (1 << (JavaParser.VOLATILE - 30)))) !== 0))) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ClassOrInterfaceModifierContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_classOrInterfaceModifier;
    return this;
}

ClassOrInterfaceModifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ClassOrInterfaceModifierContext.prototype.constructor = ClassOrInterfaceModifierContext;

ClassOrInterfaceModifierContext.prototype.annotation = function() {
    return this.getTypedRuleContext(AnnotationContext,0);
};

ClassOrInterfaceModifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterClassOrInterfaceModifier(this);
	}
};

ClassOrInterfaceModifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitClassOrInterfaceModifier(this);
	}
};




JavaParser.ClassOrInterfaceModifierContext = ClassOrInterfaceModifierContext;

JavaParser.prototype.classOrInterfaceModifier = function() {

    var localctx = new ClassOrInterfaceModifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, JavaParser.RULE_classOrInterfaceModifier);
    var _la = 0; // Token type
    try {
        this.state = 277;
        switch(this._input.LA(1)) {
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 1);
            this.state = 275;
            this.annotation();
            break;
        case JavaParser.ABSTRACT:
        case JavaParser.FINAL:
        case JavaParser.PRIVATE:
        case JavaParser.PROTECTED:
        case JavaParser.PUBLIC:
        case JavaParser.STATIC:
        case JavaParser.STRICTFP:
            this.enterOuterAlt(localctx, 2);
            this.state = 276;
            _la = this._input.LA(1);
            if(!(_la===JavaParser.ABSTRACT || _la===JavaParser.FINAL || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)))) !== 0))) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VariableModifierContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_variableModifier;
    return this;
}

VariableModifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableModifierContext.prototype.constructor = VariableModifierContext;

VariableModifierContext.prototype.annotation = function() {
    return this.getTypedRuleContext(AnnotationContext,0);
};

VariableModifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterVariableModifier(this);
	}
};

VariableModifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitVariableModifier(this);
	}
};




JavaParser.VariableModifierContext = VariableModifierContext;

JavaParser.prototype.variableModifier = function() {

    var localctx = new VariableModifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, JavaParser.RULE_variableModifier);
    try {
        this.state = 281;
        switch(this._input.LA(1)) {
        case JavaParser.FINAL:
            this.enterOuterAlt(localctx, 1);
            this.state = 279;
            this.match(JavaParser.FINAL);
            break;
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 2);
            this.state = 280;
            this.annotation();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ClassDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_classDeclaration;
    return this;
}

ClassDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ClassDeclarationContext.prototype.constructor = ClassDeclarationContext;

ClassDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

ClassDeclarationContext.prototype.classBody = function() {
    return this.getTypedRuleContext(ClassBodyContext,0);
};

ClassDeclarationContext.prototype.typeParameters = function() {
    return this.getTypedRuleContext(TypeParametersContext,0);
};

ClassDeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

ClassDeclarationContext.prototype.typeList = function() {
    return this.getTypedRuleContext(TypeListContext,0);
};

ClassDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterClassDeclaration(this);
	}
};

ClassDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitClassDeclaration(this);
	}
};




JavaParser.ClassDeclarationContext = ClassDeclarationContext;

JavaParser.prototype.classDeclaration = function() {

    var localctx = new ClassDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, JavaParser.RULE_classDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 283;
        this.match(JavaParser.CLASS);
        this.state = 284;
        this.match(JavaParser.Identifier);
        this.state = 286;
        _la = this._input.LA(1);
        if(_la===JavaParser.LT) {
            this.state = 285;
            this.typeParameters();
        }

        this.state = 290;
        _la = this._input.LA(1);
        if(_la===JavaParser.EXTENDS) {
            this.state = 288;
            this.match(JavaParser.EXTENDS);
            this.state = 289;
            this.type();
        }

        this.state = 294;
        _la = this._input.LA(1);
        if(_la===JavaParser.IMPLEMENTS) {
            this.state = 292;
            this.match(JavaParser.IMPLEMENTS);
            this.state = 293;
            this.typeList();
        }

        this.state = 296;
        this.classBody();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeParametersContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeParameters;
    return this;
}

TypeParametersContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeParametersContext.prototype.constructor = TypeParametersContext;

TypeParametersContext.prototype.typeParameter = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeParameterContext);
    } else {
        return this.getTypedRuleContext(TypeParameterContext,i);
    }
};

TypeParametersContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeParameters(this);
	}
};

TypeParametersContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeParameters(this);
	}
};




JavaParser.TypeParametersContext = TypeParametersContext;

JavaParser.prototype.typeParameters = function() {

    var localctx = new TypeParametersContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, JavaParser.RULE_typeParameters);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 298;
        this.match(JavaParser.LT);
        this.state = 299;
        this.typeParameter();
        this.state = 304;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 300;
            this.match(JavaParser.COMMA);
            this.state = 301;
            this.typeParameter();
            this.state = 306;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 307;
        this.match(JavaParser.GT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeParameterContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeParameter;
    return this;
}

TypeParameterContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeParameterContext.prototype.constructor = TypeParameterContext;

TypeParameterContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

TypeParameterContext.prototype.typeBound = function() {
    return this.getTypedRuleContext(TypeBoundContext,0);
};

TypeParameterContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeParameter(this);
	}
};

TypeParameterContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeParameter(this);
	}
};




JavaParser.TypeParameterContext = TypeParameterContext;

JavaParser.prototype.typeParameter = function() {

    var localctx = new TypeParameterContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, JavaParser.RULE_typeParameter);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 309;
        this.match(JavaParser.Identifier);
        this.state = 312;
        _la = this._input.LA(1);
        if(_la===JavaParser.EXTENDS) {
            this.state = 310;
            this.match(JavaParser.EXTENDS);
            this.state = 311;
            this.typeBound();
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeBoundContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeBound;
    return this;
}

TypeBoundContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeBoundContext.prototype.constructor = TypeBoundContext;

TypeBoundContext.prototype.type = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeContext);
    } else {
        return this.getTypedRuleContext(TypeContext,i);
    }
};

TypeBoundContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeBound(this);
	}
};

TypeBoundContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeBound(this);
	}
};




JavaParser.TypeBoundContext = TypeBoundContext;

JavaParser.prototype.typeBound = function() {

    var localctx = new TypeBoundContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, JavaParser.RULE_typeBound);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 314;
        this.type();
        this.state = 319;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.BITAND) {
            this.state = 315;
            this.match(JavaParser.BITAND);
            this.state = 316;
            this.type();
            this.state = 321;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EnumDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_enumDeclaration;
    return this;
}

EnumDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EnumDeclarationContext.prototype.constructor = EnumDeclarationContext;

EnumDeclarationContext.prototype.ENUM = function() {
    return this.getToken(JavaParser.ENUM, 0);
};

EnumDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

EnumDeclarationContext.prototype.typeList = function() {
    return this.getTypedRuleContext(TypeListContext,0);
};

EnumDeclarationContext.prototype.enumConstants = function() {
    return this.getTypedRuleContext(EnumConstantsContext,0);
};

EnumDeclarationContext.prototype.enumBodyDeclarations = function() {
    return this.getTypedRuleContext(EnumBodyDeclarationsContext,0);
};

EnumDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterEnumDeclaration(this);
	}
};

EnumDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitEnumDeclaration(this);
	}
};




JavaParser.EnumDeclarationContext = EnumDeclarationContext;

JavaParser.prototype.enumDeclaration = function() {

    var localctx = new EnumDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, JavaParser.RULE_enumDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 322;
        this.match(JavaParser.ENUM);
        this.state = 323;
        this.match(JavaParser.Identifier);
        this.state = 326;
        _la = this._input.LA(1);
        if(_la===JavaParser.IMPLEMENTS) {
            this.state = 324;
            this.match(JavaParser.IMPLEMENTS);
            this.state = 325;
            this.typeList();
        }

        this.state = 328;
        this.match(JavaParser.LBRACE);
        this.state = 330;
        _la = this._input.LA(1);
        if(_la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 329;
            this.enumConstants();
        }

        this.state = 333;
        _la = this._input.LA(1);
        if(_la===JavaParser.COMMA) {
            this.state = 332;
            this.match(JavaParser.COMMA);
        }

        this.state = 336;
        _la = this._input.LA(1);
        if(_la===JavaParser.SEMI) {
            this.state = 335;
            this.enumBodyDeclarations();
        }

        this.state = 338;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EnumConstantsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_enumConstants;
    return this;
}

EnumConstantsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EnumConstantsContext.prototype.constructor = EnumConstantsContext;

EnumConstantsContext.prototype.enumConstant = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(EnumConstantContext);
    } else {
        return this.getTypedRuleContext(EnumConstantContext,i);
    }
};

EnumConstantsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterEnumConstants(this);
	}
};

EnumConstantsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitEnumConstants(this);
	}
};




JavaParser.EnumConstantsContext = EnumConstantsContext;

JavaParser.prototype.enumConstants = function() {

    var localctx = new EnumConstantsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, JavaParser.RULE_enumConstants);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 340;
        this.enumConstant();
        this.state = 345;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,24,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 341;
                this.match(JavaParser.COMMA);
                this.state = 342;
                this.enumConstant(); 
            }
            this.state = 347;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,24,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EnumConstantContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_enumConstant;
    return this;
}

EnumConstantContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EnumConstantContext.prototype.constructor = EnumConstantContext;

EnumConstantContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

EnumConstantContext.prototype.annotation = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(AnnotationContext);
    } else {
        return this.getTypedRuleContext(AnnotationContext,i);
    }
};

EnumConstantContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};

EnumConstantContext.prototype.classBody = function() {
    return this.getTypedRuleContext(ClassBodyContext,0);
};

EnumConstantContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterEnumConstant(this);
	}
};

EnumConstantContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitEnumConstant(this);
	}
};




JavaParser.EnumConstantContext = EnumConstantContext;

JavaParser.prototype.enumConstant = function() {

    var localctx = new EnumConstantContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, JavaParser.RULE_enumConstant);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 351;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.AT) {
            this.state = 348;
            this.annotation();
            this.state = 353;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 354;
        this.match(JavaParser.Identifier);
        this.state = 356;
        _la = this._input.LA(1);
        if(_la===JavaParser.LPAREN) {
            this.state = 355;
            this.arguments();
        }

        this.state = 359;
        _la = this._input.LA(1);
        if(_la===JavaParser.LBRACE) {
            this.state = 358;
            this.classBody();
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EnumBodyDeclarationsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_enumBodyDeclarations;
    return this;
}

EnumBodyDeclarationsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EnumBodyDeclarationsContext.prototype.constructor = EnumBodyDeclarationsContext;

EnumBodyDeclarationsContext.prototype.classBodyDeclaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ClassBodyDeclarationContext);
    } else {
        return this.getTypedRuleContext(ClassBodyDeclarationContext,i);
    }
};

EnumBodyDeclarationsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterEnumBodyDeclarations(this);
	}
};

EnumBodyDeclarationsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitEnumBodyDeclarations(this);
	}
};




JavaParser.EnumBodyDeclarationsContext = EnumBodyDeclarationsContext;

JavaParser.prototype.enumBodyDeclarations = function() {

    var localctx = new EnumBodyDeclarationsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, JavaParser.RULE_enumBodyDeclarations);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 361;
        this.match(JavaParser.SEMI);
        this.state = 365;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.CLASS) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.INTERFACE) | (1 << JavaParser.LONG) | (1 << JavaParser.NATIVE))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.SHORT - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SYNCHRONIZED - 33)) | (1 << (JavaParser.TRANSIENT - 33)) | (1 << (JavaParser.VOID - 33)) | (1 << (JavaParser.VOLATILE - 33)) | (1 << (JavaParser.LBRACE - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || _la===JavaParser.LT || _la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 362;
            this.classBodyDeclaration();
            this.state = 367;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InterfaceDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_interfaceDeclaration;
    return this;
}

InterfaceDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InterfaceDeclarationContext.prototype.constructor = InterfaceDeclarationContext;

InterfaceDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

InterfaceDeclarationContext.prototype.interfaceBody = function() {
    return this.getTypedRuleContext(InterfaceBodyContext,0);
};

InterfaceDeclarationContext.prototype.typeParameters = function() {
    return this.getTypedRuleContext(TypeParametersContext,0);
};

InterfaceDeclarationContext.prototype.typeList = function() {
    return this.getTypedRuleContext(TypeListContext,0);
};

InterfaceDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterInterfaceDeclaration(this);
	}
};

InterfaceDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitInterfaceDeclaration(this);
	}
};




JavaParser.InterfaceDeclarationContext = InterfaceDeclarationContext;

JavaParser.prototype.interfaceDeclaration = function() {

    var localctx = new InterfaceDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, JavaParser.RULE_interfaceDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 368;
        this.match(JavaParser.INTERFACE);
        this.state = 369;
        this.match(JavaParser.Identifier);
        this.state = 371;
        _la = this._input.LA(1);
        if(_la===JavaParser.LT) {
            this.state = 370;
            this.typeParameters();
        }

        this.state = 375;
        _la = this._input.LA(1);
        if(_la===JavaParser.EXTENDS) {
            this.state = 373;
            this.match(JavaParser.EXTENDS);
            this.state = 374;
            this.typeList();
        }

        this.state = 377;
        this.interfaceBody();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeListContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeList;
    return this;
}

TypeListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeListContext.prototype.constructor = TypeListContext;

TypeListContext.prototype.type = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeContext);
    } else {
        return this.getTypedRuleContext(TypeContext,i);
    }
};

TypeListContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeList(this);
	}
};

TypeListContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeList(this);
	}
};




JavaParser.TypeListContext = TypeListContext;

JavaParser.prototype.typeList = function() {

    var localctx = new TypeListContext(this, this._ctx, this.state);
    this.enterRule(localctx, 32, JavaParser.RULE_typeList);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 379;
        this.type();
        this.state = 384;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 380;
            this.match(JavaParser.COMMA);
            this.state = 381;
            this.type();
            this.state = 386;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ClassBodyContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_classBody;
    return this;
}

ClassBodyContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ClassBodyContext.prototype.constructor = ClassBodyContext;

ClassBodyContext.prototype.classBodyDeclaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ClassBodyDeclarationContext);
    } else {
        return this.getTypedRuleContext(ClassBodyDeclarationContext,i);
    }
};

ClassBodyContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterClassBody(this);
	}
};

ClassBodyContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitClassBody(this);
	}
};




JavaParser.ClassBodyContext = ClassBodyContext;

JavaParser.prototype.classBody = function() {

    var localctx = new ClassBodyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 34, JavaParser.RULE_classBody);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 387;
        this.match(JavaParser.LBRACE);
        this.state = 391;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.CLASS) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.INTERFACE) | (1 << JavaParser.LONG) | (1 << JavaParser.NATIVE))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.SHORT - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SYNCHRONIZED - 33)) | (1 << (JavaParser.TRANSIENT - 33)) | (1 << (JavaParser.VOID - 33)) | (1 << (JavaParser.VOLATILE - 33)) | (1 << (JavaParser.LBRACE - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || _la===JavaParser.LT || _la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 388;
            this.classBodyDeclaration();
            this.state = 393;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 394;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InterfaceBodyContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_interfaceBody;
    return this;
}

InterfaceBodyContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InterfaceBodyContext.prototype.constructor = InterfaceBodyContext;

InterfaceBodyContext.prototype.interfaceBodyDeclaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(InterfaceBodyDeclarationContext);
    } else {
        return this.getTypedRuleContext(InterfaceBodyDeclarationContext,i);
    }
};

InterfaceBodyContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterInterfaceBody(this);
	}
};

InterfaceBodyContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitInterfaceBody(this);
	}
};




JavaParser.InterfaceBodyContext = InterfaceBodyContext;

JavaParser.prototype.interfaceBody = function() {

    var localctx = new InterfaceBodyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 36, JavaParser.RULE_interfaceBody);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 396;
        this.match(JavaParser.LBRACE);
        this.state = 400;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.CLASS) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.INTERFACE) | (1 << JavaParser.LONG) | (1 << JavaParser.NATIVE))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.SHORT - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SYNCHRONIZED - 33)) | (1 << (JavaParser.TRANSIENT - 33)) | (1 << (JavaParser.VOID - 33)) | (1 << (JavaParser.VOLATILE - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || _la===JavaParser.LT || _la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 397;
            this.interfaceBodyDeclaration();
            this.state = 402;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 403;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ClassBodyDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_classBodyDeclaration;
    return this;
}

ClassBodyDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ClassBodyDeclarationContext.prototype.constructor = ClassBodyDeclarationContext;

ClassBodyDeclarationContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

ClassBodyDeclarationContext.prototype.memberDeclaration = function() {
    return this.getTypedRuleContext(MemberDeclarationContext,0);
};

ClassBodyDeclarationContext.prototype.modifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ModifierContext);
    } else {
        return this.getTypedRuleContext(ModifierContext,i);
    }
};

ClassBodyDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterClassBodyDeclaration(this);
	}
};

ClassBodyDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitClassBodyDeclaration(this);
	}
};




JavaParser.ClassBodyDeclarationContext = ClassBodyDeclarationContext;

JavaParser.prototype.classBodyDeclaration = function() {

    var localctx = new ClassBodyDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 38, JavaParser.RULE_classBodyDeclaration);
    var _la = 0; // Token type
    try {
        this.state = 417;
        var la_ = this._interp.adaptivePredict(this._input,36,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 405;
            this.match(JavaParser.SEMI);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 407;
            _la = this._input.LA(1);
            if(_la===JavaParser.STATIC) {
                this.state = 406;
                this.match(JavaParser.STATIC);
            }

            this.state = 409;
            this.block();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 413;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,35,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 410;
                    this.modifier(); 
                }
                this.state = 415;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,35,this._ctx);
            }

            this.state = 416;
            this.memberDeclaration();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function MemberDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_memberDeclaration;
    return this;
}

MemberDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MemberDeclarationContext.prototype.constructor = MemberDeclarationContext;

MemberDeclarationContext.prototype.methodDeclaration = function() {
    return this.getTypedRuleContext(MethodDeclarationContext,0);
};

MemberDeclarationContext.prototype.genericMethodDeclaration = function() {
    return this.getTypedRuleContext(GenericMethodDeclarationContext,0);
};

MemberDeclarationContext.prototype.fieldDeclaration = function() {
    return this.getTypedRuleContext(FieldDeclarationContext,0);
};

MemberDeclarationContext.prototype.constructorDeclaration = function() {
    return this.getTypedRuleContext(ConstructorDeclarationContext,0);
};

MemberDeclarationContext.prototype.genericConstructorDeclaration = function() {
    return this.getTypedRuleContext(GenericConstructorDeclarationContext,0);
};

MemberDeclarationContext.prototype.interfaceDeclaration = function() {
    return this.getTypedRuleContext(InterfaceDeclarationContext,0);
};

MemberDeclarationContext.prototype.annotationTypeDeclaration = function() {
    return this.getTypedRuleContext(AnnotationTypeDeclarationContext,0);
};

MemberDeclarationContext.prototype.classDeclaration = function() {
    return this.getTypedRuleContext(ClassDeclarationContext,0);
};

MemberDeclarationContext.prototype.enumDeclaration = function() {
    return this.getTypedRuleContext(EnumDeclarationContext,0);
};

MemberDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterMemberDeclaration(this);
	}
};

MemberDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitMemberDeclaration(this);
	}
};




JavaParser.MemberDeclarationContext = MemberDeclarationContext;

JavaParser.prototype.memberDeclaration = function() {

    var localctx = new MemberDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 40, JavaParser.RULE_memberDeclaration);
    try {
        this.state = 428;
        var la_ = this._interp.adaptivePredict(this._input,37,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 419;
            this.methodDeclaration();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 420;
            this.genericMethodDeclaration();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 421;
            this.fieldDeclaration();
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 422;
            this.constructorDeclaration();
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 423;
            this.genericConstructorDeclaration();
            break;

        case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 424;
            this.interfaceDeclaration();
            break;

        case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 425;
            this.annotationTypeDeclaration();
            break;

        case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 426;
            this.classDeclaration();
            break;

        case 9:
            this.enterOuterAlt(localctx, 9);
            this.state = 427;
            this.enumDeclaration();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function MethodDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_methodDeclaration;
    return this;
}

MethodDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MethodDeclarationContext.prototype.constructor = MethodDeclarationContext;

MethodDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

MethodDeclarationContext.prototype.formalParameters = function() {
    return this.getTypedRuleContext(FormalParametersContext,0);
};

MethodDeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

MethodDeclarationContext.prototype.methodBody = function() {
    return this.getTypedRuleContext(MethodBodyContext,0);
};

MethodDeclarationContext.prototype.qualifiedNameList = function() {
    return this.getTypedRuleContext(QualifiedNameListContext,0);
};

MethodDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterMethodDeclaration(this);
	}
};

MethodDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitMethodDeclaration(this);
	}
};




JavaParser.MethodDeclarationContext = MethodDeclarationContext;

JavaParser.prototype.methodDeclaration = function() {

    var localctx = new MethodDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 42, JavaParser.RULE_methodDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 432;
        switch(this._input.LA(1)) {
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
        case JavaParser.Identifier:
            this.state = 430;
            this.type();
            break;
        case JavaParser.VOID:
            this.state = 431;
            this.match(JavaParser.VOID);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this.state = 434;
        this.match(JavaParser.Identifier);
        this.state = 435;
        this.formalParameters();
        this.state = 440;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.LBRACK) {
            this.state = 436;
            this.match(JavaParser.LBRACK);
            this.state = 437;
            this.match(JavaParser.RBRACK);
            this.state = 442;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 445;
        _la = this._input.LA(1);
        if(_la===JavaParser.THROWS) {
            this.state = 443;
            this.match(JavaParser.THROWS);
            this.state = 444;
            this.qualifiedNameList();
        }

        this.state = 449;
        switch(this._input.LA(1)) {
        case JavaParser.LBRACE:
            this.state = 447;
            this.methodBody();
            break;
        case JavaParser.SEMI:
            this.state = 448;
            this.match(JavaParser.SEMI);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function GenericMethodDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_genericMethodDeclaration;
    return this;
}

GenericMethodDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
GenericMethodDeclarationContext.prototype.constructor = GenericMethodDeclarationContext;

GenericMethodDeclarationContext.prototype.typeParameters = function() {
    return this.getTypedRuleContext(TypeParametersContext,0);
};

GenericMethodDeclarationContext.prototype.methodDeclaration = function() {
    return this.getTypedRuleContext(MethodDeclarationContext,0);
};

GenericMethodDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterGenericMethodDeclaration(this);
	}
};

GenericMethodDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitGenericMethodDeclaration(this);
	}
};




JavaParser.GenericMethodDeclarationContext = GenericMethodDeclarationContext;

JavaParser.prototype.genericMethodDeclaration = function() {

    var localctx = new GenericMethodDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 44, JavaParser.RULE_genericMethodDeclaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 451;
        this.typeParameters();
        this.state = 452;
        this.methodDeclaration();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConstructorDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_constructorDeclaration;
    return this;
}

ConstructorDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstructorDeclarationContext.prototype.constructor = ConstructorDeclarationContext;

ConstructorDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

ConstructorDeclarationContext.prototype.formalParameters = function() {
    return this.getTypedRuleContext(FormalParametersContext,0);
};

ConstructorDeclarationContext.prototype.constructorBody = function() {
    return this.getTypedRuleContext(ConstructorBodyContext,0);
};

ConstructorDeclarationContext.prototype.qualifiedNameList = function() {
    return this.getTypedRuleContext(QualifiedNameListContext,0);
};

ConstructorDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterConstructorDeclaration(this);
	}
};

ConstructorDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitConstructorDeclaration(this);
	}
};




JavaParser.ConstructorDeclarationContext = ConstructorDeclarationContext;

JavaParser.prototype.constructorDeclaration = function() {

    var localctx = new ConstructorDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 46, JavaParser.RULE_constructorDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 454;
        this.match(JavaParser.Identifier);
        this.state = 455;
        this.formalParameters();
        this.state = 458;
        _la = this._input.LA(1);
        if(_la===JavaParser.THROWS) {
            this.state = 456;
            this.match(JavaParser.THROWS);
            this.state = 457;
            this.qualifiedNameList();
        }

        this.state = 460;
        this.constructorBody();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function GenericConstructorDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_genericConstructorDeclaration;
    return this;
}

GenericConstructorDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
GenericConstructorDeclarationContext.prototype.constructor = GenericConstructorDeclarationContext;

GenericConstructorDeclarationContext.prototype.typeParameters = function() {
    return this.getTypedRuleContext(TypeParametersContext,0);
};

GenericConstructorDeclarationContext.prototype.constructorDeclaration = function() {
    return this.getTypedRuleContext(ConstructorDeclarationContext,0);
};

GenericConstructorDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterGenericConstructorDeclaration(this);
	}
};

GenericConstructorDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitGenericConstructorDeclaration(this);
	}
};




JavaParser.GenericConstructorDeclarationContext = GenericConstructorDeclarationContext;

JavaParser.prototype.genericConstructorDeclaration = function() {

    var localctx = new GenericConstructorDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 48, JavaParser.RULE_genericConstructorDeclaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 462;
        this.typeParameters();
        this.state = 463;
        this.constructorDeclaration();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FieldDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_fieldDeclaration;
    return this;
}

FieldDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FieldDeclarationContext.prototype.constructor = FieldDeclarationContext;

FieldDeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

FieldDeclarationContext.prototype.variableDeclarators = function() {
    return this.getTypedRuleContext(VariableDeclaratorsContext,0);
};

FieldDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterFieldDeclaration(this);
	}
};

FieldDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitFieldDeclaration(this);
	}
};




JavaParser.FieldDeclarationContext = FieldDeclarationContext;

JavaParser.prototype.fieldDeclaration = function() {

    var localctx = new FieldDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 50, JavaParser.RULE_fieldDeclaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 465;
        this.type();
        this.state = 466;
        this.variableDeclarators();
        this.state = 467;
        this.match(JavaParser.SEMI);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InterfaceBodyDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_interfaceBodyDeclaration;
    return this;
}

InterfaceBodyDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InterfaceBodyDeclarationContext.prototype.constructor = InterfaceBodyDeclarationContext;

InterfaceBodyDeclarationContext.prototype.interfaceMemberDeclaration = function() {
    return this.getTypedRuleContext(InterfaceMemberDeclarationContext,0);
};

InterfaceBodyDeclarationContext.prototype.modifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ModifierContext);
    } else {
        return this.getTypedRuleContext(ModifierContext,i);
    }
};

InterfaceBodyDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterInterfaceBodyDeclaration(this);
	}
};

InterfaceBodyDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitInterfaceBodyDeclaration(this);
	}
};




JavaParser.InterfaceBodyDeclarationContext = InterfaceBodyDeclarationContext;

JavaParser.prototype.interfaceBodyDeclaration = function() {

    var localctx = new InterfaceBodyDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 52, JavaParser.RULE_interfaceBodyDeclaration);
    try {
        this.state = 477;
        switch(this._input.LA(1)) {
        case JavaParser.ABSTRACT:
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.CLASS:
        case JavaParser.DOUBLE:
        case JavaParser.ENUM:
        case JavaParser.FINAL:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.INTERFACE:
        case JavaParser.LONG:
        case JavaParser.NATIVE:
        case JavaParser.PRIVATE:
        case JavaParser.PROTECTED:
        case JavaParser.PUBLIC:
        case JavaParser.SHORT:
        case JavaParser.STATIC:
        case JavaParser.STRICTFP:
        case JavaParser.SYNCHRONIZED:
        case JavaParser.TRANSIENT:
        case JavaParser.VOID:
        case JavaParser.VOLATILE:
        case JavaParser.LT:
        case JavaParser.Identifier:
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 1);
            this.state = 472;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,43,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 469;
                    this.modifier(); 
                }
                this.state = 474;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,43,this._ctx);
            }

            this.state = 475;
            this.interfaceMemberDeclaration();
            break;
        case JavaParser.SEMI:
            this.enterOuterAlt(localctx, 2);
            this.state = 476;
            this.match(JavaParser.SEMI);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InterfaceMemberDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_interfaceMemberDeclaration;
    return this;
}

InterfaceMemberDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InterfaceMemberDeclarationContext.prototype.constructor = InterfaceMemberDeclarationContext;

InterfaceMemberDeclarationContext.prototype.constDeclaration = function() {
    return this.getTypedRuleContext(ConstDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.interfaceMethodDeclaration = function() {
    return this.getTypedRuleContext(InterfaceMethodDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.genericInterfaceMethodDeclaration = function() {
    return this.getTypedRuleContext(GenericInterfaceMethodDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.interfaceDeclaration = function() {
    return this.getTypedRuleContext(InterfaceDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.annotationTypeDeclaration = function() {
    return this.getTypedRuleContext(AnnotationTypeDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.classDeclaration = function() {
    return this.getTypedRuleContext(ClassDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.enumDeclaration = function() {
    return this.getTypedRuleContext(EnumDeclarationContext,0);
};

InterfaceMemberDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterInterfaceMemberDeclaration(this);
	}
};

InterfaceMemberDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitInterfaceMemberDeclaration(this);
	}
};




JavaParser.InterfaceMemberDeclarationContext = InterfaceMemberDeclarationContext;

JavaParser.prototype.interfaceMemberDeclaration = function() {

    var localctx = new InterfaceMemberDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 54, JavaParser.RULE_interfaceMemberDeclaration);
    try {
        this.state = 486;
        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 479;
            this.constDeclaration();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 480;
            this.interfaceMethodDeclaration();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 481;
            this.genericInterfaceMethodDeclaration();
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 482;
            this.interfaceDeclaration();
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 483;
            this.annotationTypeDeclaration();
            break;

        case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 484;
            this.classDeclaration();
            break;

        case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 485;
            this.enumDeclaration();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConstDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_constDeclaration;
    return this;
}

ConstDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstDeclarationContext.prototype.constructor = ConstDeclarationContext;

ConstDeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

ConstDeclarationContext.prototype.constantDeclarator = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ConstantDeclaratorContext);
    } else {
        return this.getTypedRuleContext(ConstantDeclaratorContext,i);
    }
};

ConstDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterConstDeclaration(this);
	}
};

ConstDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitConstDeclaration(this);
	}
};




JavaParser.ConstDeclarationContext = ConstDeclarationContext;

JavaParser.prototype.constDeclaration = function() {

    var localctx = new ConstDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 56, JavaParser.RULE_constDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 488;
        this.type();
        this.state = 489;
        this.constantDeclarator();
        this.state = 494;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 490;
            this.match(JavaParser.COMMA);
            this.state = 491;
            this.constantDeclarator();
            this.state = 496;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 497;
        this.match(JavaParser.SEMI);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConstantDeclaratorContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_constantDeclarator;
    return this;
}

ConstantDeclaratorContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstantDeclaratorContext.prototype.constructor = ConstantDeclaratorContext;

ConstantDeclaratorContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

ConstantDeclaratorContext.prototype.variableInitializer = function() {
    return this.getTypedRuleContext(VariableInitializerContext,0);
};

ConstantDeclaratorContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterConstantDeclarator(this);
	}
};

ConstantDeclaratorContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitConstantDeclarator(this);
	}
};




JavaParser.ConstantDeclaratorContext = ConstantDeclaratorContext;

JavaParser.prototype.constantDeclarator = function() {

    var localctx = new ConstantDeclaratorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 58, JavaParser.RULE_constantDeclarator);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 499;
        this.match(JavaParser.Identifier);
        this.state = 504;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.LBRACK) {
            this.state = 500;
            this.match(JavaParser.LBRACK);
            this.state = 501;
            this.match(JavaParser.RBRACK);
            this.state = 506;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 507;
        this.match(JavaParser.ASSIGN);
        this.state = 508;
        this.variableInitializer();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InterfaceMethodDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_interfaceMethodDeclaration;
    return this;
}

InterfaceMethodDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InterfaceMethodDeclarationContext.prototype.constructor = InterfaceMethodDeclarationContext;

InterfaceMethodDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

InterfaceMethodDeclarationContext.prototype.formalParameters = function() {
    return this.getTypedRuleContext(FormalParametersContext,0);
};

InterfaceMethodDeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

InterfaceMethodDeclarationContext.prototype.qualifiedNameList = function() {
    return this.getTypedRuleContext(QualifiedNameListContext,0);
};

InterfaceMethodDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterInterfaceMethodDeclaration(this);
	}
};

InterfaceMethodDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitInterfaceMethodDeclaration(this);
	}
};




JavaParser.InterfaceMethodDeclarationContext = InterfaceMethodDeclarationContext;

JavaParser.prototype.interfaceMethodDeclaration = function() {

    var localctx = new InterfaceMethodDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 60, JavaParser.RULE_interfaceMethodDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 512;
        switch(this._input.LA(1)) {
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
        case JavaParser.Identifier:
            this.state = 510;
            this.type();
            break;
        case JavaParser.VOID:
            this.state = 511;
            this.match(JavaParser.VOID);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this.state = 514;
        this.match(JavaParser.Identifier);
        this.state = 515;
        this.formalParameters();
        this.state = 520;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.LBRACK) {
            this.state = 516;
            this.match(JavaParser.LBRACK);
            this.state = 517;
            this.match(JavaParser.RBRACK);
            this.state = 522;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 525;
        _la = this._input.LA(1);
        if(_la===JavaParser.THROWS) {
            this.state = 523;
            this.match(JavaParser.THROWS);
            this.state = 524;
            this.qualifiedNameList();
        }

        this.state = 527;
        this.match(JavaParser.SEMI);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function GenericInterfaceMethodDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_genericInterfaceMethodDeclaration;
    return this;
}

GenericInterfaceMethodDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
GenericInterfaceMethodDeclarationContext.prototype.constructor = GenericInterfaceMethodDeclarationContext;

GenericInterfaceMethodDeclarationContext.prototype.typeParameters = function() {
    return this.getTypedRuleContext(TypeParametersContext,0);
};

GenericInterfaceMethodDeclarationContext.prototype.interfaceMethodDeclaration = function() {
    return this.getTypedRuleContext(InterfaceMethodDeclarationContext,0);
};

GenericInterfaceMethodDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterGenericInterfaceMethodDeclaration(this);
	}
};

GenericInterfaceMethodDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitGenericInterfaceMethodDeclaration(this);
	}
};




JavaParser.GenericInterfaceMethodDeclarationContext = GenericInterfaceMethodDeclarationContext;

JavaParser.prototype.genericInterfaceMethodDeclaration = function() {

    var localctx = new GenericInterfaceMethodDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 62, JavaParser.RULE_genericInterfaceMethodDeclaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 529;
        this.typeParameters();
        this.state = 530;
        this.interfaceMethodDeclaration();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VariableDeclaratorsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_variableDeclarators;
    return this;
}

VariableDeclaratorsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableDeclaratorsContext.prototype.constructor = VariableDeclaratorsContext;

VariableDeclaratorsContext.prototype.variableDeclarator = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableDeclaratorContext);
    } else {
        return this.getTypedRuleContext(VariableDeclaratorContext,i);
    }
};

VariableDeclaratorsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterVariableDeclarators(this);
	}
};

VariableDeclaratorsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitVariableDeclarators(this);
	}
};




JavaParser.VariableDeclaratorsContext = VariableDeclaratorsContext;

JavaParser.prototype.variableDeclarators = function() {

    var localctx = new VariableDeclaratorsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 64, JavaParser.RULE_variableDeclarators);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 532;
        this.variableDeclarator();
        this.state = 537;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 533;
            this.match(JavaParser.COMMA);
            this.state = 534;
            this.variableDeclarator();
            this.state = 539;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VariableDeclaratorContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_variableDeclarator;
    return this;
}

VariableDeclaratorContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableDeclaratorContext.prototype.constructor = VariableDeclaratorContext;

VariableDeclaratorContext.prototype.variableDeclaratorId = function() {
    return this.getTypedRuleContext(VariableDeclaratorIdContext,0);
};

VariableDeclaratorContext.prototype.variableInitializer = function() {
    return this.getTypedRuleContext(VariableInitializerContext,0);
};

VariableDeclaratorContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterVariableDeclarator(this);
	}
};

VariableDeclaratorContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitVariableDeclarator(this);
	}
};




JavaParser.VariableDeclaratorContext = VariableDeclaratorContext;

JavaParser.prototype.variableDeclarator = function() {

    var localctx = new VariableDeclaratorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 66, JavaParser.RULE_variableDeclarator);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 540;
        this.variableDeclaratorId();
        this.state = 543;
        _la = this._input.LA(1);
        if(_la===JavaParser.ASSIGN) {
            this.state = 541;
            this.match(JavaParser.ASSIGN);
            this.state = 542;
            this.variableInitializer();
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VariableDeclaratorIdContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_variableDeclaratorId;
    return this;
}

VariableDeclaratorIdContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableDeclaratorIdContext.prototype.constructor = VariableDeclaratorIdContext;

VariableDeclaratorIdContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

VariableDeclaratorIdContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterVariableDeclaratorId(this);
	}
};

VariableDeclaratorIdContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitVariableDeclaratorId(this);
	}
};




JavaParser.VariableDeclaratorIdContext = VariableDeclaratorIdContext;

JavaParser.prototype.variableDeclaratorId = function() {

    var localctx = new VariableDeclaratorIdContext(this, this._ctx, this.state);
    this.enterRule(localctx, 68, JavaParser.RULE_variableDeclaratorId);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 545;
        this.match(JavaParser.Identifier);
        this.state = 550;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.LBRACK) {
            this.state = 546;
            this.match(JavaParser.LBRACK);
            this.state = 547;
            this.match(JavaParser.RBRACK);
            this.state = 552;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VariableInitializerContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_variableInitializer;
    return this;
}

VariableInitializerContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableInitializerContext.prototype.constructor = VariableInitializerContext;

VariableInitializerContext.prototype.arrayInitializer = function() {
    return this.getTypedRuleContext(ArrayInitializerContext,0);
};

VariableInitializerContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

VariableInitializerContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterVariableInitializer(this);
	}
};

VariableInitializerContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitVariableInitializer(this);
	}
};




JavaParser.VariableInitializerContext = VariableInitializerContext;

JavaParser.prototype.variableInitializer = function() {

    var localctx = new VariableInitializerContext(this, this._ctx, this.state);
    this.enterRule(localctx, 70, JavaParser.RULE_variableInitializer);
    try {
        this.state = 555;
        switch(this._input.LA(1)) {
        case JavaParser.LBRACE:
            this.enterOuterAlt(localctx, 1);
            this.state = 553;
            this.arrayInitializer();
            break;
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.NEW:
        case JavaParser.SHORT:
        case JavaParser.SUPER:
        case JavaParser.THIS:
        case JavaParser.VOID:
        case JavaParser.IntegerLiteral:
        case JavaParser.FloatingPointLiteral:
        case JavaParser.BooleanLiteral:
        case JavaParser.CharacterLiteral:
        case JavaParser.StringLiteral:
        case JavaParser.NullLiteral:
        case JavaParser.LPAREN:
        case JavaParser.LT:
        case JavaParser.BANG:
        case JavaParser.TILDE:
        case JavaParser.INC:
        case JavaParser.DEC:
        case JavaParser.ADD:
        case JavaParser.SUB:
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 2);
            this.state = 554;
            this.expression(0);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ArrayInitializerContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_arrayInitializer;
    return this;
}

ArrayInitializerContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArrayInitializerContext.prototype.constructor = ArrayInitializerContext;

ArrayInitializerContext.prototype.variableInitializer = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableInitializerContext);
    } else {
        return this.getTypedRuleContext(VariableInitializerContext,i);
    }
};

ArrayInitializerContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterArrayInitializer(this);
	}
};

ArrayInitializerContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitArrayInitializer(this);
	}
};




JavaParser.ArrayInitializerContext = ArrayInitializerContext;

JavaParser.prototype.arrayInitializer = function() {

    var localctx = new ArrayInitializerContext(this, this._ctx, this.state);
    this.enterRule(localctx, 72, JavaParser.RULE_arrayInitializer);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 557;
        this.match(JavaParser.LBRACE);
        this.state = 569;
        _la = this._input.LA(1);
        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LBRACE - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0)) {
            this.state = 558;
            this.variableInitializer();
            this.state = 563;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,55,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 559;
                    this.match(JavaParser.COMMA);
                    this.state = 560;
                    this.variableInitializer(); 
                }
                this.state = 565;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,55,this._ctx);
            }

            this.state = 567;
            _la = this._input.LA(1);
            if(_la===JavaParser.COMMA) {
                this.state = 566;
                this.match(JavaParser.COMMA);
            }

        }

        this.state = 571;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EnumConstantNameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_enumConstantName;
    return this;
}

EnumConstantNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EnumConstantNameContext.prototype.constructor = EnumConstantNameContext;

EnumConstantNameContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

EnumConstantNameContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterEnumConstantName(this);
	}
};

EnumConstantNameContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitEnumConstantName(this);
	}
};




JavaParser.EnumConstantNameContext = EnumConstantNameContext;

JavaParser.prototype.enumConstantName = function() {

    var localctx = new EnumConstantNameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 74, JavaParser.RULE_enumConstantName);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 573;
        this.match(JavaParser.Identifier);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_type;
    return this;
}

TypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeContext.prototype.constructor = TypeContext;

TypeContext.prototype.classOrInterfaceType = function() {
    return this.getTypedRuleContext(ClassOrInterfaceTypeContext,0);
};

TypeContext.prototype.primitiveType = function() {
    return this.getTypedRuleContext(PrimitiveTypeContext,0);
};

TypeContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterType(this);
	}
};

TypeContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitType(this);
	}
};




JavaParser.TypeContext = TypeContext;

JavaParser.prototype.type = function() {

    var localctx = new TypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 76, JavaParser.RULE_type);
    try {
        this.state = 591;
        switch(this._input.LA(1)) {
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 1);
            this.state = 575;
            this.classOrInterfaceType();
            this.state = 580;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,58,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 576;
                    this.match(JavaParser.LBRACK);
                    this.state = 577;
                    this.match(JavaParser.RBRACK); 
                }
                this.state = 582;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,58,this._ctx);
            }

            break;
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
            this.enterOuterAlt(localctx, 2);
            this.state = 583;
            this.primitiveType();
            this.state = 588;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,59,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 584;
                    this.match(JavaParser.LBRACK);
                    this.state = 585;
                    this.match(JavaParser.RBRACK); 
                }
                this.state = 590;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,59,this._ctx);
            }

            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ClassOrInterfaceTypeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_classOrInterfaceType;
    return this;
}

ClassOrInterfaceTypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ClassOrInterfaceTypeContext.prototype.constructor = ClassOrInterfaceTypeContext;

ClassOrInterfaceTypeContext.prototype.Identifier = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(JavaParser.Identifier);
    } else {
        return this.getToken(JavaParser.Identifier, i);
    }
};


ClassOrInterfaceTypeContext.prototype.typeArguments = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeArgumentsContext);
    } else {
        return this.getTypedRuleContext(TypeArgumentsContext,i);
    }
};

ClassOrInterfaceTypeContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterClassOrInterfaceType(this);
	}
};

ClassOrInterfaceTypeContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitClassOrInterfaceType(this);
	}
};




JavaParser.ClassOrInterfaceTypeContext = ClassOrInterfaceTypeContext;

JavaParser.prototype.classOrInterfaceType = function() {

    var localctx = new ClassOrInterfaceTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 78, JavaParser.RULE_classOrInterfaceType);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 593;
        this.match(JavaParser.Identifier);
        this.state = 595;
        var la_ = this._interp.adaptivePredict(this._input,61,this._ctx);
        if(la_===1) {
            this.state = 594;
            this.typeArguments();

        }
        this.state = 604;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,63,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 597;
                this.match(JavaParser.DOT);
                this.state = 598;
                this.match(JavaParser.Identifier);
                this.state = 600;
                var la_ = this._interp.adaptivePredict(this._input,62,this._ctx);
                if(la_===1) {
                    this.state = 599;
                    this.typeArguments();

                } 
            }
            this.state = 606;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,63,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function PrimitiveTypeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_primitiveType;
    return this;
}

PrimitiveTypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PrimitiveTypeContext.prototype.constructor = PrimitiveTypeContext;


PrimitiveTypeContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterPrimitiveType(this);
	}
};

PrimitiveTypeContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitPrimitiveType(this);
	}
};




JavaParser.PrimitiveTypeContext = PrimitiveTypeContext;

JavaParser.prototype.primitiveType = function() {

    var localctx = new PrimitiveTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 80, JavaParser.RULE_primitiveType);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 607;
        _la = this._input.LA(1);
        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG))) !== 0) || _la===JavaParser.SHORT)) {
        this._errHandler.recoverInline(this);
        }
        else {
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeArgumentsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeArguments;
    return this;
}

TypeArgumentsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeArgumentsContext.prototype.constructor = TypeArgumentsContext;

TypeArgumentsContext.prototype.typeArgument = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeArgumentContext);
    } else {
        return this.getTypedRuleContext(TypeArgumentContext,i);
    }
};

TypeArgumentsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeArguments(this);
	}
};

TypeArgumentsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeArguments(this);
	}
};




JavaParser.TypeArgumentsContext = TypeArgumentsContext;

JavaParser.prototype.typeArguments = function() {

    var localctx = new TypeArgumentsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 82, JavaParser.RULE_typeArguments);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 609;
        this.match(JavaParser.LT);
        this.state = 610;
        this.typeArgument();
        this.state = 615;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 611;
            this.match(JavaParser.COMMA);
            this.state = 612;
            this.typeArgument();
            this.state = 617;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 618;
        this.match(JavaParser.GT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeArgumentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeArgument;
    return this;
}

TypeArgumentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeArgumentContext.prototype.constructor = TypeArgumentContext;

TypeArgumentContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

TypeArgumentContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeArgument(this);
	}
};

TypeArgumentContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeArgument(this);
	}
};




JavaParser.TypeArgumentContext = TypeArgumentContext;

JavaParser.prototype.typeArgument = function() {

    var localctx = new TypeArgumentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 84, JavaParser.RULE_typeArgument);
    var _la = 0; // Token type
    try {
        this.state = 626;
        switch(this._input.LA(1)) {
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 1);
            this.state = 620;
            this.type();
            break;
        case JavaParser.QUESTION:
            this.enterOuterAlt(localctx, 2);
            this.state = 621;
            this.match(JavaParser.QUESTION);
            this.state = 624;
            _la = this._input.LA(1);
            if(_la===JavaParser.EXTENDS || _la===JavaParser.SUPER) {
                this.state = 622;
                _la = this._input.LA(1);
                if(!(_la===JavaParser.EXTENDS || _la===JavaParser.SUPER)) {
                this._errHandler.recoverInline(this);
                }
                else {
                    this.consume();
                }
                this.state = 623;
                this.type();
            }

            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function QualifiedNameListContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_qualifiedNameList;
    return this;
}

QualifiedNameListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QualifiedNameListContext.prototype.constructor = QualifiedNameListContext;

QualifiedNameListContext.prototype.qualifiedName = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(QualifiedNameContext);
    } else {
        return this.getTypedRuleContext(QualifiedNameContext,i);
    }
};

QualifiedNameListContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterQualifiedNameList(this);
	}
};

QualifiedNameListContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitQualifiedNameList(this);
	}
};




JavaParser.QualifiedNameListContext = QualifiedNameListContext;

JavaParser.prototype.qualifiedNameList = function() {

    var localctx = new QualifiedNameListContext(this, this._ctx, this.state);
    this.enterRule(localctx, 86, JavaParser.RULE_qualifiedNameList);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 628;
        this.qualifiedName();
        this.state = 633;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 629;
            this.match(JavaParser.COMMA);
            this.state = 630;
            this.qualifiedName();
            this.state = 635;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FormalParametersContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_formalParameters;
    return this;
}

FormalParametersContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FormalParametersContext.prototype.constructor = FormalParametersContext;

FormalParametersContext.prototype.formalParameterList = function() {
    return this.getTypedRuleContext(FormalParameterListContext,0);
};

FormalParametersContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterFormalParameters(this);
	}
};

FormalParametersContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitFormalParameters(this);
	}
};




JavaParser.FormalParametersContext = FormalParametersContext;

JavaParser.prototype.formalParameters = function() {

    var localctx = new FormalParametersContext(this, this._ctx, this.state);
    this.enterRule(localctx, 88, JavaParser.RULE_formalParameters);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 636;
        this.match(JavaParser.LPAREN);
        this.state = 638;
        _la = this._input.LA(1);
        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG))) !== 0) || _la===JavaParser.SHORT || _la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 637;
            this.formalParameterList();
        }

        this.state = 640;
        this.match(JavaParser.RPAREN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FormalParameterListContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_formalParameterList;
    return this;
}

FormalParameterListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FormalParameterListContext.prototype.constructor = FormalParameterListContext;

FormalParameterListContext.prototype.formalParameter = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(FormalParameterContext);
    } else {
        return this.getTypedRuleContext(FormalParameterContext,i);
    }
};

FormalParameterListContext.prototype.lastFormalParameter = function() {
    return this.getTypedRuleContext(LastFormalParameterContext,0);
};

FormalParameterListContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterFormalParameterList(this);
	}
};

FormalParameterListContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitFormalParameterList(this);
	}
};




JavaParser.FormalParameterListContext = FormalParameterListContext;

JavaParser.prototype.formalParameterList = function() {

    var localctx = new FormalParameterListContext(this, this._ctx, this.state);
    this.enterRule(localctx, 90, JavaParser.RULE_formalParameterList);
    var _la = 0; // Token type
    try {
        this.state = 655;
        var la_ = this._interp.adaptivePredict(this._input,71,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 642;
            this.formalParameter();
            this.state = 647;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,69,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 643;
                    this.match(JavaParser.COMMA);
                    this.state = 644;
                    this.formalParameter(); 
                }
                this.state = 649;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,69,this._ctx);
            }

            this.state = 652;
            _la = this._input.LA(1);
            if(_la===JavaParser.COMMA) {
                this.state = 650;
                this.match(JavaParser.COMMA);
                this.state = 651;
                this.lastFormalParameter();
            }

            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 654;
            this.lastFormalParameter();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FormalParameterContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_formalParameter;
    return this;
}

FormalParameterContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FormalParameterContext.prototype.constructor = FormalParameterContext;

FormalParameterContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

FormalParameterContext.prototype.variableDeclaratorId = function() {
    return this.getTypedRuleContext(VariableDeclaratorIdContext,0);
};

FormalParameterContext.prototype.variableModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableModifierContext);
    } else {
        return this.getTypedRuleContext(VariableModifierContext,i);
    }
};

FormalParameterContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterFormalParameter(this);
	}
};

FormalParameterContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitFormalParameter(this);
	}
};




JavaParser.FormalParameterContext = FormalParameterContext;

JavaParser.prototype.formalParameter = function() {

    var localctx = new FormalParameterContext(this, this._ctx, this.state);
    this.enterRule(localctx, 92, JavaParser.RULE_formalParameter);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 660;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.FINAL || _la===JavaParser.AT) {
            this.state = 657;
            this.variableModifier();
            this.state = 662;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 663;
        this.type();
        this.state = 664;
        this.variableDeclaratorId();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function LastFormalParameterContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_lastFormalParameter;
    return this;
}

LastFormalParameterContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LastFormalParameterContext.prototype.constructor = LastFormalParameterContext;

LastFormalParameterContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

LastFormalParameterContext.prototype.variableDeclaratorId = function() {
    return this.getTypedRuleContext(VariableDeclaratorIdContext,0);
};

LastFormalParameterContext.prototype.variableModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableModifierContext);
    } else {
        return this.getTypedRuleContext(VariableModifierContext,i);
    }
};

LastFormalParameterContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterLastFormalParameter(this);
	}
};

LastFormalParameterContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitLastFormalParameter(this);
	}
};




JavaParser.LastFormalParameterContext = LastFormalParameterContext;

JavaParser.prototype.lastFormalParameter = function() {

    var localctx = new LastFormalParameterContext(this, this._ctx, this.state);
    this.enterRule(localctx, 94, JavaParser.RULE_lastFormalParameter);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 669;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.FINAL || _la===JavaParser.AT) {
            this.state = 666;
            this.variableModifier();
            this.state = 671;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 672;
        this.type();
        this.state = 673;
        this.match(JavaParser.ELLIPSIS);
        this.state = 674;
        this.variableDeclaratorId();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function MethodBodyContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_methodBody;
    return this;
}

MethodBodyContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MethodBodyContext.prototype.constructor = MethodBodyContext;

MethodBodyContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

MethodBodyContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterMethodBody(this);
	}
};

MethodBodyContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitMethodBody(this);
	}
};




JavaParser.MethodBodyContext = MethodBodyContext;

JavaParser.prototype.methodBody = function() {

    var localctx = new MethodBodyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 96, JavaParser.RULE_methodBody);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 676;
        this.block();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConstructorBodyContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_constructorBody;
    return this;
}

ConstructorBodyContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstructorBodyContext.prototype.constructor = ConstructorBodyContext;

ConstructorBodyContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

ConstructorBodyContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterConstructorBody(this);
	}
};

ConstructorBodyContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitConstructorBody(this);
	}
};




JavaParser.ConstructorBodyContext = ConstructorBodyContext;

JavaParser.prototype.constructorBody = function() {

    var localctx = new ConstructorBodyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 98, JavaParser.RULE_constructorBody);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 678;
        this.block();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function QualifiedNameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_qualifiedName;
    return this;
}

QualifiedNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QualifiedNameContext.prototype.constructor = QualifiedNameContext;

QualifiedNameContext.prototype.Identifier = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(JavaParser.Identifier);
    } else {
        return this.getToken(JavaParser.Identifier, i);
    }
};


QualifiedNameContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterQualifiedName(this);
	}
};

QualifiedNameContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitQualifiedName(this);
	}
};




JavaParser.QualifiedNameContext = QualifiedNameContext;

JavaParser.prototype.qualifiedName = function() {

    var localctx = new QualifiedNameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 100, JavaParser.RULE_qualifiedName);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 680;
        this.match(JavaParser.Identifier);
        this.state = 685;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,74,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 681;
                this.match(JavaParser.DOT);
                this.state = 682;
                this.match(JavaParser.Identifier); 
            }
            this.state = 687;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,74,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function LiteralContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_literal;
    return this;
}

LiteralContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LiteralContext.prototype.constructor = LiteralContext;

LiteralContext.prototype.IntegerLiteral = function() {
    return this.getToken(JavaParser.IntegerLiteral, 0);
};

LiteralContext.prototype.FloatingPointLiteral = function() {
    return this.getToken(JavaParser.FloatingPointLiteral, 0);
};

LiteralContext.prototype.CharacterLiteral = function() {
    return this.getToken(JavaParser.CharacterLiteral, 0);
};

LiteralContext.prototype.StringLiteral = function() {
    return this.getToken(JavaParser.StringLiteral, 0);
};

LiteralContext.prototype.BooleanLiteral = function() {
    return this.getToken(JavaParser.BooleanLiteral, 0);
};

LiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterLiteral(this);
	}
};

LiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitLiteral(this);
	}
};




JavaParser.LiteralContext = LiteralContext;

JavaParser.prototype.literal = function() {

    var localctx = new LiteralContext(this, this._ctx, this.state);
    this.enterRule(localctx, 102, JavaParser.RULE_literal);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 688;
        _la = this._input.LA(1);
        if(!(((((_la - 51)) & ~0x1f) == 0 && ((1 << (_la - 51)) & ((1 << (JavaParser.IntegerLiteral - 51)) | (1 << (JavaParser.FloatingPointLiteral - 51)) | (1 << (JavaParser.BooleanLiteral - 51)) | (1 << (JavaParser.CharacterLiteral - 51)) | (1 << (JavaParser.StringLiteral - 51)) | (1 << (JavaParser.NullLiteral - 51)))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotation;
    return this;
}

AnnotationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationContext.prototype.constructor = AnnotationContext;

AnnotationContext.prototype.annotationName = function() {
    return this.getTypedRuleContext(AnnotationNameContext,0);
};

AnnotationContext.prototype.elementValuePairs = function() {
    return this.getTypedRuleContext(ElementValuePairsContext,0);
};

AnnotationContext.prototype.elementValue = function() {
    return this.getTypedRuleContext(ElementValueContext,0);
};

AnnotationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotation(this);
	}
};

AnnotationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotation(this);
	}
};




JavaParser.AnnotationContext = AnnotationContext;

JavaParser.prototype.annotation = function() {

    var localctx = new AnnotationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 104, JavaParser.RULE_annotation);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 690;
        this.match(JavaParser.AT);
        this.state = 691;
        this.annotationName();
        this.state = 698;
        _la = this._input.LA(1);
        if(_la===JavaParser.LPAREN) {
            this.state = 692;
            this.match(JavaParser.LPAREN);
            this.state = 695;
            var la_ = this._interp.adaptivePredict(this._input,75,this._ctx);
            if(la_===1) {
                this.state = 693;
                this.elementValuePairs();

            } else if(la_===2) {
                this.state = 694;
                this.elementValue();

            }
            this.state = 697;
            this.match(JavaParser.RPAREN);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationNameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationName;
    return this;
}

AnnotationNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationNameContext.prototype.constructor = AnnotationNameContext;

AnnotationNameContext.prototype.qualifiedName = function() {
    return this.getTypedRuleContext(QualifiedNameContext,0);
};

AnnotationNameContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationName(this);
	}
};

AnnotationNameContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationName(this);
	}
};




JavaParser.AnnotationNameContext = AnnotationNameContext;

JavaParser.prototype.annotationName = function() {

    var localctx = new AnnotationNameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 106, JavaParser.RULE_annotationName);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 700;
        this.qualifiedName();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ElementValuePairsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_elementValuePairs;
    return this;
}

ElementValuePairsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElementValuePairsContext.prototype.constructor = ElementValuePairsContext;

ElementValuePairsContext.prototype.elementValuePair = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ElementValuePairContext);
    } else {
        return this.getTypedRuleContext(ElementValuePairContext,i);
    }
};

ElementValuePairsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterElementValuePairs(this);
	}
};

ElementValuePairsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitElementValuePairs(this);
	}
};




JavaParser.ElementValuePairsContext = ElementValuePairsContext;

JavaParser.prototype.elementValuePairs = function() {

    var localctx = new ElementValuePairsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 108, JavaParser.RULE_elementValuePairs);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 702;
        this.elementValuePair();
        this.state = 707;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 703;
            this.match(JavaParser.COMMA);
            this.state = 704;
            this.elementValuePair();
            this.state = 709;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ElementValuePairContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_elementValuePair;
    return this;
}

ElementValuePairContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElementValuePairContext.prototype.constructor = ElementValuePairContext;

ElementValuePairContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

ElementValuePairContext.prototype.elementValue = function() {
    return this.getTypedRuleContext(ElementValueContext,0);
};

ElementValuePairContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterElementValuePair(this);
	}
};

ElementValuePairContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitElementValuePair(this);
	}
};




JavaParser.ElementValuePairContext = ElementValuePairContext;

JavaParser.prototype.elementValuePair = function() {

    var localctx = new ElementValuePairContext(this, this._ctx, this.state);
    this.enterRule(localctx, 110, JavaParser.RULE_elementValuePair);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 710;
        this.match(JavaParser.Identifier);
        this.state = 711;
        this.match(JavaParser.ASSIGN);
        this.state = 712;
        this.elementValue();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ElementValueContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_elementValue;
    return this;
}

ElementValueContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElementValueContext.prototype.constructor = ElementValueContext;

ElementValueContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

ElementValueContext.prototype.annotation = function() {
    return this.getTypedRuleContext(AnnotationContext,0);
};

ElementValueContext.prototype.elementValueArrayInitializer = function() {
    return this.getTypedRuleContext(ElementValueArrayInitializerContext,0);
};

ElementValueContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterElementValue(this);
	}
};

ElementValueContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitElementValue(this);
	}
};




JavaParser.ElementValueContext = ElementValueContext;

JavaParser.prototype.elementValue = function() {

    var localctx = new ElementValueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 112, JavaParser.RULE_elementValue);
    try {
        this.state = 717;
        switch(this._input.LA(1)) {
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.NEW:
        case JavaParser.SHORT:
        case JavaParser.SUPER:
        case JavaParser.THIS:
        case JavaParser.VOID:
        case JavaParser.IntegerLiteral:
        case JavaParser.FloatingPointLiteral:
        case JavaParser.BooleanLiteral:
        case JavaParser.CharacterLiteral:
        case JavaParser.StringLiteral:
        case JavaParser.NullLiteral:
        case JavaParser.LPAREN:
        case JavaParser.LT:
        case JavaParser.BANG:
        case JavaParser.TILDE:
        case JavaParser.INC:
        case JavaParser.DEC:
        case JavaParser.ADD:
        case JavaParser.SUB:
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 1);
            this.state = 714;
            this.expression(0);
            break;
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 2);
            this.state = 715;
            this.annotation();
            break;
        case JavaParser.LBRACE:
            this.enterOuterAlt(localctx, 3);
            this.state = 716;
            this.elementValueArrayInitializer();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ElementValueArrayInitializerContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_elementValueArrayInitializer;
    return this;
}

ElementValueArrayInitializerContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElementValueArrayInitializerContext.prototype.constructor = ElementValueArrayInitializerContext;

ElementValueArrayInitializerContext.prototype.elementValue = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ElementValueContext);
    } else {
        return this.getTypedRuleContext(ElementValueContext,i);
    }
};

ElementValueArrayInitializerContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterElementValueArrayInitializer(this);
	}
};

ElementValueArrayInitializerContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitElementValueArrayInitializer(this);
	}
};




JavaParser.ElementValueArrayInitializerContext = ElementValueArrayInitializerContext;

JavaParser.prototype.elementValueArrayInitializer = function() {

    var localctx = new ElementValueArrayInitializerContext(this, this._ctx, this.state);
    this.enterRule(localctx, 114, JavaParser.RULE_elementValueArrayInitializer);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 719;
        this.match(JavaParser.LBRACE);
        this.state = 728;
        _la = this._input.LA(1);
        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LBRACE - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0) || _la===JavaParser.AT) {
            this.state = 720;
            this.elementValue();
            this.state = 725;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,79,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 721;
                    this.match(JavaParser.COMMA);
                    this.state = 722;
                    this.elementValue(); 
                }
                this.state = 727;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,79,this._ctx);
            }

        }

        this.state = 731;
        _la = this._input.LA(1);
        if(_la===JavaParser.COMMA) {
            this.state = 730;
            this.match(JavaParser.COMMA);
        }

        this.state = 733;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationTypeDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationTypeDeclaration;
    return this;
}

AnnotationTypeDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationTypeDeclarationContext.prototype.constructor = AnnotationTypeDeclarationContext;

AnnotationTypeDeclarationContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

AnnotationTypeDeclarationContext.prototype.annotationTypeBody = function() {
    return this.getTypedRuleContext(AnnotationTypeBodyContext,0);
};

AnnotationTypeDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationTypeDeclaration(this);
	}
};

AnnotationTypeDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationTypeDeclaration(this);
	}
};




JavaParser.AnnotationTypeDeclarationContext = AnnotationTypeDeclarationContext;

JavaParser.prototype.annotationTypeDeclaration = function() {

    var localctx = new AnnotationTypeDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 116, JavaParser.RULE_annotationTypeDeclaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 735;
        this.match(JavaParser.AT);
        this.state = 736;
        this.match(JavaParser.INTERFACE);
        this.state = 737;
        this.match(JavaParser.Identifier);
        this.state = 738;
        this.annotationTypeBody();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationTypeBodyContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationTypeBody;
    return this;
}

AnnotationTypeBodyContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationTypeBodyContext.prototype.constructor = AnnotationTypeBodyContext;

AnnotationTypeBodyContext.prototype.annotationTypeElementDeclaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(AnnotationTypeElementDeclarationContext);
    } else {
        return this.getTypedRuleContext(AnnotationTypeElementDeclarationContext,i);
    }
};

AnnotationTypeBodyContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationTypeBody(this);
	}
};

AnnotationTypeBodyContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationTypeBody(this);
	}
};




JavaParser.AnnotationTypeBodyContext = AnnotationTypeBodyContext;

JavaParser.prototype.annotationTypeBody = function() {

    var localctx = new AnnotationTypeBodyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 118, JavaParser.RULE_annotationTypeBody);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 740;
        this.match(JavaParser.LBRACE);
        this.state = 744;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.CLASS) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.INTERFACE) | (1 << JavaParser.LONG) | (1 << JavaParser.NATIVE))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.SHORT - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SYNCHRONIZED - 33)) | (1 << (JavaParser.TRANSIENT - 33)) | (1 << (JavaParser.VOLATILE - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || _la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 741;
            this.annotationTypeElementDeclaration();
            this.state = 746;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 747;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationTypeElementDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationTypeElementDeclaration;
    return this;
}

AnnotationTypeElementDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationTypeElementDeclarationContext.prototype.constructor = AnnotationTypeElementDeclarationContext;

AnnotationTypeElementDeclarationContext.prototype.annotationTypeElementRest = function() {
    return this.getTypedRuleContext(AnnotationTypeElementRestContext,0);
};

AnnotationTypeElementDeclarationContext.prototype.modifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ModifierContext);
    } else {
        return this.getTypedRuleContext(ModifierContext,i);
    }
};

AnnotationTypeElementDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationTypeElementDeclaration(this);
	}
};

AnnotationTypeElementDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationTypeElementDeclaration(this);
	}
};




JavaParser.AnnotationTypeElementDeclarationContext = AnnotationTypeElementDeclarationContext;

JavaParser.prototype.annotationTypeElementDeclaration = function() {

    var localctx = new AnnotationTypeElementDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 120, JavaParser.RULE_annotationTypeElementDeclaration);
    try {
        this.state = 757;
        switch(this._input.LA(1)) {
        case JavaParser.ABSTRACT:
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.CLASS:
        case JavaParser.DOUBLE:
        case JavaParser.ENUM:
        case JavaParser.FINAL:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.INTERFACE:
        case JavaParser.LONG:
        case JavaParser.NATIVE:
        case JavaParser.PRIVATE:
        case JavaParser.PROTECTED:
        case JavaParser.PUBLIC:
        case JavaParser.SHORT:
        case JavaParser.STATIC:
        case JavaParser.STRICTFP:
        case JavaParser.SYNCHRONIZED:
        case JavaParser.TRANSIENT:
        case JavaParser.VOLATILE:
        case JavaParser.Identifier:
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 1);
            this.state = 752;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,83,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 749;
                    this.modifier(); 
                }
                this.state = 754;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,83,this._ctx);
            }

            this.state = 755;
            this.annotationTypeElementRest();
            break;
        case JavaParser.SEMI:
            this.enterOuterAlt(localctx, 2);
            this.state = 756;
            this.match(JavaParser.SEMI);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationTypeElementRestContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationTypeElementRest;
    return this;
}

AnnotationTypeElementRestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationTypeElementRestContext.prototype.constructor = AnnotationTypeElementRestContext;

AnnotationTypeElementRestContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

AnnotationTypeElementRestContext.prototype.annotationMethodOrConstantRest = function() {
    return this.getTypedRuleContext(AnnotationMethodOrConstantRestContext,0);
};

AnnotationTypeElementRestContext.prototype.classDeclaration = function() {
    return this.getTypedRuleContext(ClassDeclarationContext,0);
};

AnnotationTypeElementRestContext.prototype.interfaceDeclaration = function() {
    return this.getTypedRuleContext(InterfaceDeclarationContext,0);
};

AnnotationTypeElementRestContext.prototype.enumDeclaration = function() {
    return this.getTypedRuleContext(EnumDeclarationContext,0);
};

AnnotationTypeElementRestContext.prototype.annotationTypeDeclaration = function() {
    return this.getTypedRuleContext(AnnotationTypeDeclarationContext,0);
};

AnnotationTypeElementRestContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationTypeElementRest(this);
	}
};

AnnotationTypeElementRestContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationTypeElementRest(this);
	}
};




JavaParser.AnnotationTypeElementRestContext = AnnotationTypeElementRestContext;

JavaParser.prototype.annotationTypeElementRest = function() {

    var localctx = new AnnotationTypeElementRestContext(this, this._ctx, this.state);
    this.enterRule(localctx, 122, JavaParser.RULE_annotationTypeElementRest);
    try {
        this.state = 779;
        switch(this._input.LA(1)) {
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 1);
            this.state = 759;
            this.type();
            this.state = 760;
            this.annotationMethodOrConstantRest();
            this.state = 761;
            this.match(JavaParser.SEMI);
            break;
        case JavaParser.CLASS:
            this.enterOuterAlt(localctx, 2);
            this.state = 763;
            this.classDeclaration();
            this.state = 765;
            var la_ = this._interp.adaptivePredict(this._input,85,this._ctx);
            if(la_===1) {
                this.state = 764;
                this.match(JavaParser.SEMI);

            }
            break;
        case JavaParser.INTERFACE:
            this.enterOuterAlt(localctx, 3);
            this.state = 767;
            this.interfaceDeclaration();
            this.state = 769;
            var la_ = this._interp.adaptivePredict(this._input,86,this._ctx);
            if(la_===1) {
                this.state = 768;
                this.match(JavaParser.SEMI);

            }
            break;
        case JavaParser.ENUM:
            this.enterOuterAlt(localctx, 4);
            this.state = 771;
            this.enumDeclaration();
            this.state = 773;
            var la_ = this._interp.adaptivePredict(this._input,87,this._ctx);
            if(la_===1) {
                this.state = 772;
                this.match(JavaParser.SEMI);

            }
            break;
        case JavaParser.AT:
            this.enterOuterAlt(localctx, 5);
            this.state = 775;
            this.annotationTypeDeclaration();
            this.state = 777;
            var la_ = this._interp.adaptivePredict(this._input,88,this._ctx);
            if(la_===1) {
                this.state = 776;
                this.match(JavaParser.SEMI);

            }
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationMethodOrConstantRestContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationMethodOrConstantRest;
    return this;
}

AnnotationMethodOrConstantRestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationMethodOrConstantRestContext.prototype.constructor = AnnotationMethodOrConstantRestContext;

AnnotationMethodOrConstantRestContext.prototype.annotationMethodRest = function() {
    return this.getTypedRuleContext(AnnotationMethodRestContext,0);
};

AnnotationMethodOrConstantRestContext.prototype.annotationConstantRest = function() {
    return this.getTypedRuleContext(AnnotationConstantRestContext,0);
};

AnnotationMethodOrConstantRestContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationMethodOrConstantRest(this);
	}
};

AnnotationMethodOrConstantRestContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationMethodOrConstantRest(this);
	}
};




JavaParser.AnnotationMethodOrConstantRestContext = AnnotationMethodOrConstantRestContext;

JavaParser.prototype.annotationMethodOrConstantRest = function() {

    var localctx = new AnnotationMethodOrConstantRestContext(this, this._ctx, this.state);
    this.enterRule(localctx, 124, JavaParser.RULE_annotationMethodOrConstantRest);
    try {
        this.state = 783;
        var la_ = this._interp.adaptivePredict(this._input,90,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 781;
            this.annotationMethodRest();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 782;
            this.annotationConstantRest();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationMethodRestContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationMethodRest;
    return this;
}

AnnotationMethodRestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationMethodRestContext.prototype.constructor = AnnotationMethodRestContext;

AnnotationMethodRestContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

AnnotationMethodRestContext.prototype.defaultValue = function() {
    return this.getTypedRuleContext(DefaultValueContext,0);
};

AnnotationMethodRestContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationMethodRest(this);
	}
};

AnnotationMethodRestContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationMethodRest(this);
	}
};




JavaParser.AnnotationMethodRestContext = AnnotationMethodRestContext;

JavaParser.prototype.annotationMethodRest = function() {

    var localctx = new AnnotationMethodRestContext(this, this._ctx, this.state);
    this.enterRule(localctx, 126, JavaParser.RULE_annotationMethodRest);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 785;
        this.match(JavaParser.Identifier);
        this.state = 786;
        this.match(JavaParser.LPAREN);
        this.state = 787;
        this.match(JavaParser.RPAREN);
        this.state = 789;
        _la = this._input.LA(1);
        if(_la===JavaParser.DEFAULT) {
            this.state = 788;
            this.defaultValue();
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnnotationConstantRestContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_annotationConstantRest;
    return this;
}

AnnotationConstantRestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnnotationConstantRestContext.prototype.constructor = AnnotationConstantRestContext;

AnnotationConstantRestContext.prototype.variableDeclarators = function() {
    return this.getTypedRuleContext(VariableDeclaratorsContext,0);
};

AnnotationConstantRestContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterAnnotationConstantRest(this);
	}
};

AnnotationConstantRestContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitAnnotationConstantRest(this);
	}
};




JavaParser.AnnotationConstantRestContext = AnnotationConstantRestContext;

JavaParser.prototype.annotationConstantRest = function() {

    var localctx = new AnnotationConstantRestContext(this, this._ctx, this.state);
    this.enterRule(localctx, 128, JavaParser.RULE_annotationConstantRest);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 791;
        this.variableDeclarators();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function DefaultValueContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_defaultValue;
    return this;
}

DefaultValueContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DefaultValueContext.prototype.constructor = DefaultValueContext;

DefaultValueContext.prototype.elementValue = function() {
    return this.getTypedRuleContext(ElementValueContext,0);
};

DefaultValueContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterDefaultValue(this);
	}
};

DefaultValueContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitDefaultValue(this);
	}
};




JavaParser.DefaultValueContext = DefaultValueContext;

JavaParser.prototype.defaultValue = function() {

    var localctx = new DefaultValueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 130, JavaParser.RULE_defaultValue);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 793;
        this.match(JavaParser.DEFAULT);
        this.state = 794;
        this.elementValue();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function BlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_block;
    return this;
}

BlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BlockContext.prototype.constructor = BlockContext;

BlockContext.prototype.blockStatement = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(BlockStatementContext);
    } else {
        return this.getTypedRuleContext(BlockStatementContext,i);
    }
};

BlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterBlock(this);
	}
};

BlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitBlock(this);
	}
};




JavaParser.BlockContext = BlockContext;

JavaParser.prototype.block = function() {

    var localctx = new BlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 132, JavaParser.RULE_block);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 796;
        this.match(JavaParser.LBRACE);
        this.state = 800;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.ASSERT) | (1 << JavaParser.BOOLEAN) | (1 << JavaParser.BREAK) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.CLASS) | (1 << JavaParser.CONTINUE) | (1 << JavaParser.DO) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.FOR) | (1 << JavaParser.IF) | (1 << JavaParser.INT) | (1 << JavaParser.INTERFACE) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.RETURN - 33)) | (1 << (JavaParser.SHORT - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SUPER - 33)) | (1 << (JavaParser.SWITCH - 33)) | (1 << (JavaParser.SYNCHRONIZED - 33)) | (1 << (JavaParser.THIS - 33)) | (1 << (JavaParser.THROW - 33)) | (1 << (JavaParser.TRY - 33)) | (1 << (JavaParser.VOID - 33)) | (1 << (JavaParser.WHILE - 33)) | (1 << (JavaParser.IntegerLiteral - 33)) | (1 << (JavaParser.FloatingPointLiteral - 33)) | (1 << (JavaParser.BooleanLiteral - 33)) | (1 << (JavaParser.CharacterLiteral - 33)) | (1 << (JavaParser.StringLiteral - 33)) | (1 << (JavaParser.NullLiteral - 33)) | (1 << (JavaParser.LPAREN - 33)) | (1 << (JavaParser.LBRACE - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || ((((_la - 68)) & ~0x1f) == 0 && ((1 << (_la - 68)) & ((1 << (JavaParser.LT - 68)) | (1 << (JavaParser.BANG - 68)) | (1 << (JavaParser.TILDE - 68)) | (1 << (JavaParser.INC - 68)) | (1 << (JavaParser.DEC - 68)) | (1 << (JavaParser.ADD - 68)) | (1 << (JavaParser.SUB - 68)))) !== 0) || _la===JavaParser.Identifier || _la===JavaParser.AT) {
            this.state = 797;
            this.blockStatement();
            this.state = 802;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 803;
        this.match(JavaParser.RBRACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function BlockStatementContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_blockStatement;
    return this;
}

BlockStatementContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BlockStatementContext.prototype.constructor = BlockStatementContext;

BlockStatementContext.prototype.localVariableDeclarationStatement = function() {
    return this.getTypedRuleContext(LocalVariableDeclarationStatementContext,0);
};

BlockStatementContext.prototype.statement = function() {
    return this.getTypedRuleContext(StatementContext,0);
};

BlockStatementContext.prototype.typeDeclaration = function() {
    return this.getTypedRuleContext(TypeDeclarationContext,0);
};

BlockStatementContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterBlockStatement(this);
	}
};

BlockStatementContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitBlockStatement(this);
	}
};




JavaParser.BlockStatementContext = BlockStatementContext;

JavaParser.prototype.blockStatement = function() {

    var localctx = new BlockStatementContext(this, this._ctx, this.state);
    this.enterRule(localctx, 134, JavaParser.RULE_blockStatement);
    try {
        this.state = 808;
        var la_ = this._interp.adaptivePredict(this._input,93,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 805;
            this.localVariableDeclarationStatement();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 806;
            this.statement();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 807;
            this.typeDeclaration();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function LocalVariableDeclarationStatementContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_localVariableDeclarationStatement;
    return this;
}

LocalVariableDeclarationStatementContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LocalVariableDeclarationStatementContext.prototype.constructor = LocalVariableDeclarationStatementContext;

LocalVariableDeclarationStatementContext.prototype.localVariableDeclaration = function() {
    return this.getTypedRuleContext(LocalVariableDeclarationContext,0);
};

LocalVariableDeclarationStatementContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterLocalVariableDeclarationStatement(this);
	}
};

LocalVariableDeclarationStatementContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitLocalVariableDeclarationStatement(this);
	}
};




JavaParser.LocalVariableDeclarationStatementContext = LocalVariableDeclarationStatementContext;

JavaParser.prototype.localVariableDeclarationStatement = function() {

    var localctx = new LocalVariableDeclarationStatementContext(this, this._ctx, this.state);
    this.enterRule(localctx, 136, JavaParser.RULE_localVariableDeclarationStatement);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 810;
        this.localVariableDeclaration();
        this.state = 811;
        this.match(JavaParser.SEMI);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function LocalVariableDeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_localVariableDeclaration;
    return this;
}

LocalVariableDeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LocalVariableDeclarationContext.prototype.constructor = LocalVariableDeclarationContext;

LocalVariableDeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

LocalVariableDeclarationContext.prototype.variableDeclarators = function() {
    return this.getTypedRuleContext(VariableDeclaratorsContext,0);
};

LocalVariableDeclarationContext.prototype.variableModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableModifierContext);
    } else {
        return this.getTypedRuleContext(VariableModifierContext,i);
    }
};

LocalVariableDeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterLocalVariableDeclaration(this);
	}
};

LocalVariableDeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitLocalVariableDeclaration(this);
	}
};




JavaParser.LocalVariableDeclarationContext = LocalVariableDeclarationContext;

JavaParser.prototype.localVariableDeclaration = function() {

    var localctx = new LocalVariableDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 138, JavaParser.RULE_localVariableDeclaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 816;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.FINAL || _la===JavaParser.AT) {
            this.state = 813;
            this.variableModifier();
            this.state = 818;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 819;
        this.type();
        this.state = 820;
        this.variableDeclarators();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function StatementContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_statement;
    return this;
}

StatementContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StatementContext.prototype.constructor = StatementContext;

StatementContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

StatementContext.prototype.ASSERT = function() {
    return this.getToken(JavaParser.ASSERT, 0);
};

StatementContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};

StatementContext.prototype.parExpression = function() {
    return this.getTypedRuleContext(ParExpressionContext,0);
};

StatementContext.prototype.statement = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(StatementContext);
    } else {
        return this.getTypedRuleContext(StatementContext,i);
    }
};

StatementContext.prototype.forControl = function() {
    return this.getTypedRuleContext(ForControlContext,0);
};

StatementContext.prototype.finallyBlock = function() {
    return this.getTypedRuleContext(FinallyBlockContext,0);
};

StatementContext.prototype.catchClause = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(CatchClauseContext);
    } else {
        return this.getTypedRuleContext(CatchClauseContext,i);
    }
};

StatementContext.prototype.resourceSpecification = function() {
    return this.getTypedRuleContext(ResourceSpecificationContext,0);
};

StatementContext.prototype.switchBlockStatementGroup = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SwitchBlockStatementGroupContext);
    } else {
        return this.getTypedRuleContext(SwitchBlockStatementGroupContext,i);
    }
};

StatementContext.prototype.switchLabel = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SwitchLabelContext);
    } else {
        return this.getTypedRuleContext(SwitchLabelContext,i);
    }
};

StatementContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

StatementContext.prototype.statementExpression = function() {
    return this.getTypedRuleContext(StatementExpressionContext,0);
};

StatementContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterStatement(this);
	}
};

StatementContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitStatement(this);
	}
};




JavaParser.StatementContext = StatementContext;

JavaParser.prototype.statement = function() {

    var localctx = new StatementContext(this, this._ctx, this.state);
    this.enterRule(localctx, 140, JavaParser.RULE_statement);
    var _la = 0; // Token type
    try {
        this.state = 926;
        var la_ = this._interp.adaptivePredict(this._input,107,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 822;
            this.block();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 823;
            this.match(JavaParser.ASSERT);
            this.state = 824;
            this.expression(0);
            this.state = 827;
            _la = this._input.LA(1);
            if(_la===JavaParser.COLON) {
                this.state = 825;
                this.match(JavaParser.COLON);
                this.state = 826;
                this.expression(0);
            }

            this.state = 829;
            this.match(JavaParser.SEMI);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 831;
            this.match(JavaParser.IF);
            this.state = 832;
            this.parExpression();
            this.state = 833;
            this.statement();
            this.state = 836;
            var la_ = this._interp.adaptivePredict(this._input,96,this._ctx);
            if(la_===1) {
                this.state = 834;
                this.match(JavaParser.ELSE);
                this.state = 835;
                this.statement();

            }
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 838;
            this.match(JavaParser.FOR);
            this.state = 839;
            this.match(JavaParser.LPAREN);
            this.state = 840;
            this.forControl();
            this.state = 841;
            this.match(JavaParser.RPAREN);
            this.state = 842;
            this.statement();
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 844;
            this.match(JavaParser.WHILE);
            this.state = 845;
            this.parExpression();
            this.state = 846;
            this.statement();
            break;

        case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 848;
            this.match(JavaParser.DO);
            this.state = 849;
            this.statement();
            this.state = 850;
            this.match(JavaParser.WHILE);
            this.state = 851;
            this.parExpression();
            this.state = 852;
            this.match(JavaParser.SEMI);
            break;

        case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 854;
            this.match(JavaParser.TRY);
            this.state = 855;
            this.block();
            this.state = 865;
            switch(this._input.LA(1)) {
            case JavaParser.CATCH:
                this.state = 857; 
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                do {
                    this.state = 856;
                    this.catchClause();
                    this.state = 859; 
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                } while(_la===JavaParser.CATCH);
                this.state = 862;
                _la = this._input.LA(1);
                if(_la===JavaParser.FINALLY) {
                    this.state = 861;
                    this.finallyBlock();
                }

                break;
            case JavaParser.FINALLY:
                this.state = 864;
                this.finallyBlock();
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
            break;

        case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 867;
            this.match(JavaParser.TRY);
            this.state = 868;
            this.resourceSpecification();
            this.state = 869;
            this.block();
            this.state = 873;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.CATCH) {
                this.state = 870;
                this.catchClause();
                this.state = 875;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 877;
            _la = this._input.LA(1);
            if(_la===JavaParser.FINALLY) {
                this.state = 876;
                this.finallyBlock();
            }

            break;

        case 9:
            this.enterOuterAlt(localctx, 9);
            this.state = 879;
            this.match(JavaParser.SWITCH);
            this.state = 880;
            this.parExpression();
            this.state = 881;
            this.match(JavaParser.LBRACE);
            this.state = 885;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,102,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 882;
                    this.switchBlockStatementGroup(); 
                }
                this.state = 887;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,102,this._ctx);
            }

            this.state = 891;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.CASE || _la===JavaParser.DEFAULT) {
                this.state = 888;
                this.switchLabel();
                this.state = 893;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 894;
            this.match(JavaParser.RBRACE);
            break;

        case 10:
            this.enterOuterAlt(localctx, 10);
            this.state = 896;
            this.match(JavaParser.SYNCHRONIZED);
            this.state = 897;
            this.parExpression();
            this.state = 898;
            this.block();
            break;

        case 11:
            this.enterOuterAlt(localctx, 11);
            this.state = 900;
            this.match(JavaParser.RETURN);
            this.state = 902;
            _la = this._input.LA(1);
            if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0)) {
                this.state = 901;
                this.expression(0);
            }

            this.state = 904;
            this.match(JavaParser.SEMI);
            break;

        case 12:
            this.enterOuterAlt(localctx, 12);
            this.state = 905;
            this.match(JavaParser.THROW);
            this.state = 906;
            this.expression(0);
            this.state = 907;
            this.match(JavaParser.SEMI);
            break;

        case 13:
            this.enterOuterAlt(localctx, 13);
            this.state = 909;
            this.match(JavaParser.BREAK);
            this.state = 911;
            _la = this._input.LA(1);
            if(_la===JavaParser.Identifier) {
                this.state = 910;
                this.match(JavaParser.Identifier);
            }

            this.state = 913;
            this.match(JavaParser.SEMI);
            break;

        case 14:
            this.enterOuterAlt(localctx, 14);
            this.state = 914;
            this.match(JavaParser.CONTINUE);
            this.state = 916;
            _la = this._input.LA(1);
            if(_la===JavaParser.Identifier) {
                this.state = 915;
                this.match(JavaParser.Identifier);
            }

            this.state = 918;
            this.match(JavaParser.SEMI);
            break;

        case 15:
            this.enterOuterAlt(localctx, 15);
            this.state = 919;
            this.match(JavaParser.SEMI);
            break;

        case 16:
            this.enterOuterAlt(localctx, 16);
            this.state = 920;
            this.statementExpression();
            this.state = 921;
            this.match(JavaParser.SEMI);
            break;

        case 17:
            this.enterOuterAlt(localctx, 17);
            this.state = 923;
            this.match(JavaParser.Identifier);
            this.state = 924;
            this.match(JavaParser.COLON);
            this.state = 925;
            this.statement();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function CatchClauseContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_catchClause;
    return this;
}

CatchClauseContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CatchClauseContext.prototype.constructor = CatchClauseContext;

CatchClauseContext.prototype.catchType = function() {
    return this.getTypedRuleContext(CatchTypeContext,0);
};

CatchClauseContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

CatchClauseContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

CatchClauseContext.prototype.variableModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableModifierContext);
    } else {
        return this.getTypedRuleContext(VariableModifierContext,i);
    }
};

CatchClauseContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterCatchClause(this);
	}
};

CatchClauseContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitCatchClause(this);
	}
};




JavaParser.CatchClauseContext = CatchClauseContext;

JavaParser.prototype.catchClause = function() {

    var localctx = new CatchClauseContext(this, this._ctx, this.state);
    this.enterRule(localctx, 142, JavaParser.RULE_catchClause);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 928;
        this.match(JavaParser.CATCH);
        this.state = 929;
        this.match(JavaParser.LPAREN);
        this.state = 933;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.FINAL || _la===JavaParser.AT) {
            this.state = 930;
            this.variableModifier();
            this.state = 935;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 936;
        this.catchType();
        this.state = 937;
        this.match(JavaParser.Identifier);
        this.state = 938;
        this.match(JavaParser.RPAREN);
        this.state = 939;
        this.block();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function CatchTypeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_catchType;
    return this;
}

CatchTypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CatchTypeContext.prototype.constructor = CatchTypeContext;

CatchTypeContext.prototype.qualifiedName = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(QualifiedNameContext);
    } else {
        return this.getTypedRuleContext(QualifiedNameContext,i);
    }
};

CatchTypeContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterCatchType(this);
	}
};

CatchTypeContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitCatchType(this);
	}
};




JavaParser.CatchTypeContext = CatchTypeContext;

JavaParser.prototype.catchType = function() {

    var localctx = new CatchTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 144, JavaParser.RULE_catchType);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 941;
        this.qualifiedName();
        this.state = 946;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.BITOR) {
            this.state = 942;
            this.match(JavaParser.BITOR);
            this.state = 943;
            this.qualifiedName();
            this.state = 948;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FinallyBlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_finallyBlock;
    return this;
}

FinallyBlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FinallyBlockContext.prototype.constructor = FinallyBlockContext;

FinallyBlockContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

FinallyBlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterFinallyBlock(this);
	}
};

FinallyBlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitFinallyBlock(this);
	}
};




JavaParser.FinallyBlockContext = FinallyBlockContext;

JavaParser.prototype.finallyBlock = function() {

    var localctx = new FinallyBlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 146, JavaParser.RULE_finallyBlock);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 949;
        this.match(JavaParser.FINALLY);
        this.state = 950;
        this.block();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ResourceSpecificationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_resourceSpecification;
    return this;
}

ResourceSpecificationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ResourceSpecificationContext.prototype.constructor = ResourceSpecificationContext;

ResourceSpecificationContext.prototype.resources = function() {
    return this.getTypedRuleContext(ResourcesContext,0);
};

ResourceSpecificationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterResourceSpecification(this);
	}
};

ResourceSpecificationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitResourceSpecification(this);
	}
};




JavaParser.ResourceSpecificationContext = ResourceSpecificationContext;

JavaParser.prototype.resourceSpecification = function() {

    var localctx = new ResourceSpecificationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 148, JavaParser.RULE_resourceSpecification);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 952;
        this.match(JavaParser.LPAREN);
        this.state = 953;
        this.resources();
        this.state = 955;
        _la = this._input.LA(1);
        if(_la===JavaParser.SEMI) {
            this.state = 954;
            this.match(JavaParser.SEMI);
        }

        this.state = 957;
        this.match(JavaParser.RPAREN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ResourcesContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_resources;
    return this;
}

ResourcesContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ResourcesContext.prototype.constructor = ResourcesContext;

ResourcesContext.prototype.resource = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ResourceContext);
    } else {
        return this.getTypedRuleContext(ResourceContext,i);
    }
};

ResourcesContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterResources(this);
	}
};

ResourcesContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitResources(this);
	}
};




JavaParser.ResourcesContext = ResourcesContext;

JavaParser.prototype.resources = function() {

    var localctx = new ResourcesContext(this, this._ctx, this.state);
    this.enterRule(localctx, 150, JavaParser.RULE_resources);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 959;
        this.resource();
        this.state = 964;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,111,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 960;
                this.match(JavaParser.SEMI);
                this.state = 961;
                this.resource(); 
            }
            this.state = 966;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,111,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ResourceContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_resource;
    return this;
}

ResourceContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ResourceContext.prototype.constructor = ResourceContext;

ResourceContext.prototype.classOrInterfaceType = function() {
    return this.getTypedRuleContext(ClassOrInterfaceTypeContext,0);
};

ResourceContext.prototype.variableDeclaratorId = function() {
    return this.getTypedRuleContext(VariableDeclaratorIdContext,0);
};

ResourceContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

ResourceContext.prototype.variableModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableModifierContext);
    } else {
        return this.getTypedRuleContext(VariableModifierContext,i);
    }
};

ResourceContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterResource(this);
	}
};

ResourceContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitResource(this);
	}
};




JavaParser.ResourceContext = ResourceContext;

JavaParser.prototype.resource = function() {

    var localctx = new ResourceContext(this, this._ctx, this.state);
    this.enterRule(localctx, 152, JavaParser.RULE_resource);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 970;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.FINAL || _la===JavaParser.AT) {
            this.state = 967;
            this.variableModifier();
            this.state = 972;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 973;
        this.classOrInterfaceType();
        this.state = 974;
        this.variableDeclaratorId();
        this.state = 975;
        this.match(JavaParser.ASSIGN);
        this.state = 976;
        this.expression(0);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function SwitchBlockStatementGroupContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_switchBlockStatementGroup;
    return this;
}

SwitchBlockStatementGroupContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SwitchBlockStatementGroupContext.prototype.constructor = SwitchBlockStatementGroupContext;

SwitchBlockStatementGroupContext.prototype.switchLabel = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SwitchLabelContext);
    } else {
        return this.getTypedRuleContext(SwitchLabelContext,i);
    }
};

SwitchBlockStatementGroupContext.prototype.blockStatement = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(BlockStatementContext);
    } else {
        return this.getTypedRuleContext(BlockStatementContext,i);
    }
};

SwitchBlockStatementGroupContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterSwitchBlockStatementGroup(this);
	}
};

SwitchBlockStatementGroupContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitSwitchBlockStatementGroup(this);
	}
};




JavaParser.SwitchBlockStatementGroupContext = SwitchBlockStatementGroupContext;

JavaParser.prototype.switchBlockStatementGroup = function() {

    var localctx = new SwitchBlockStatementGroupContext(this, this._ctx, this.state);
    this.enterRule(localctx, 154, JavaParser.RULE_switchBlockStatementGroup);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 979; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 978;
            this.switchLabel();
            this.state = 981; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while(_la===JavaParser.CASE || _la===JavaParser.DEFAULT);
        this.state = 984; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 983;
            this.blockStatement();
            this.state = 986; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.ABSTRACT) | (1 << JavaParser.ASSERT) | (1 << JavaParser.BOOLEAN) | (1 << JavaParser.BREAK) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.CLASS) | (1 << JavaParser.CONTINUE) | (1 << JavaParser.DO) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.ENUM) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.FOR) | (1 << JavaParser.IF) | (1 << JavaParser.INT) | (1 << JavaParser.INTERFACE) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 33)) & ~0x1f) == 0 && ((1 << (_la - 33)) & ((1 << (JavaParser.PRIVATE - 33)) | (1 << (JavaParser.PROTECTED - 33)) | (1 << (JavaParser.PUBLIC - 33)) | (1 << (JavaParser.RETURN - 33)) | (1 << (JavaParser.SHORT - 33)) | (1 << (JavaParser.STATIC - 33)) | (1 << (JavaParser.STRICTFP - 33)) | (1 << (JavaParser.SUPER - 33)) | (1 << (JavaParser.SWITCH - 33)) | (1 << (JavaParser.SYNCHRONIZED - 33)) | (1 << (JavaParser.THIS - 33)) | (1 << (JavaParser.THROW - 33)) | (1 << (JavaParser.TRY - 33)) | (1 << (JavaParser.VOID - 33)) | (1 << (JavaParser.WHILE - 33)) | (1 << (JavaParser.IntegerLiteral - 33)) | (1 << (JavaParser.FloatingPointLiteral - 33)) | (1 << (JavaParser.BooleanLiteral - 33)) | (1 << (JavaParser.CharacterLiteral - 33)) | (1 << (JavaParser.StringLiteral - 33)) | (1 << (JavaParser.NullLiteral - 33)) | (1 << (JavaParser.LPAREN - 33)) | (1 << (JavaParser.LBRACE - 33)) | (1 << (JavaParser.SEMI - 33)))) !== 0) || ((((_la - 68)) & ~0x1f) == 0 && ((1 << (_la - 68)) & ((1 << (JavaParser.LT - 68)) | (1 << (JavaParser.BANG - 68)) | (1 << (JavaParser.TILDE - 68)) | (1 << (JavaParser.INC - 68)) | (1 << (JavaParser.DEC - 68)) | (1 << (JavaParser.ADD - 68)) | (1 << (JavaParser.SUB - 68)))) !== 0) || _la===JavaParser.Identifier || _la===JavaParser.AT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function SwitchLabelContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_switchLabel;
    return this;
}

SwitchLabelContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SwitchLabelContext.prototype.constructor = SwitchLabelContext;

SwitchLabelContext.prototype.constantExpression = function() {
    return this.getTypedRuleContext(ConstantExpressionContext,0);
};

SwitchLabelContext.prototype.enumConstantName = function() {
    return this.getTypedRuleContext(EnumConstantNameContext,0);
};

SwitchLabelContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterSwitchLabel(this);
	}
};

SwitchLabelContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitSwitchLabel(this);
	}
};




JavaParser.SwitchLabelContext = SwitchLabelContext;

JavaParser.prototype.switchLabel = function() {

    var localctx = new SwitchLabelContext(this, this._ctx, this.state);
    this.enterRule(localctx, 156, JavaParser.RULE_switchLabel);
    try {
        this.state = 998;
        var la_ = this._interp.adaptivePredict(this._input,115,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 988;
            this.match(JavaParser.CASE);
            this.state = 989;
            this.constantExpression();
            this.state = 990;
            this.match(JavaParser.COLON);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 992;
            this.match(JavaParser.CASE);
            this.state = 993;
            this.enumConstantName();
            this.state = 994;
            this.match(JavaParser.COLON);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 996;
            this.match(JavaParser.DEFAULT);
            this.state = 997;
            this.match(JavaParser.COLON);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ForControlContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_forControl;
    return this;
}

ForControlContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ForControlContext.prototype.constructor = ForControlContext;

ForControlContext.prototype.enhancedForControl = function() {
    return this.getTypedRuleContext(EnhancedForControlContext,0);
};

ForControlContext.prototype.forInit = function() {
    return this.getTypedRuleContext(ForInitContext,0);
};

ForControlContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

ForControlContext.prototype.forUpdate = function() {
    return this.getTypedRuleContext(ForUpdateContext,0);
};

ForControlContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterForControl(this);
	}
};

ForControlContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitForControl(this);
	}
};




JavaParser.ForControlContext = ForControlContext;

JavaParser.prototype.forControl = function() {

    var localctx = new ForControlContext(this, this._ctx, this.state);
    this.enterRule(localctx, 158, JavaParser.RULE_forControl);
    var _la = 0; // Token type
    try {
        this.state = 1012;
        var la_ = this._interp.adaptivePredict(this._input,119,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 1000;
            this.enhancedForControl();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 1002;
            _la = this._input.LA(1);
            if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FINAL) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0) || _la===JavaParser.AT) {
                this.state = 1001;
                this.forInit();
            }

            this.state = 1004;
            this.match(JavaParser.SEMI);
            this.state = 1006;
            _la = this._input.LA(1);
            if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0)) {
                this.state = 1005;
                this.expression(0);
            }

            this.state = 1008;
            this.match(JavaParser.SEMI);
            this.state = 1010;
            _la = this._input.LA(1);
            if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0)) {
                this.state = 1009;
                this.forUpdate();
            }

            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ForInitContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_forInit;
    return this;
}

ForInitContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ForInitContext.prototype.constructor = ForInitContext;

ForInitContext.prototype.localVariableDeclaration = function() {
    return this.getTypedRuleContext(LocalVariableDeclarationContext,0);
};

ForInitContext.prototype.expressionList = function() {
    return this.getTypedRuleContext(ExpressionListContext,0);
};

ForInitContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterForInit(this);
	}
};

ForInitContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitForInit(this);
	}
};




JavaParser.ForInitContext = ForInitContext;

JavaParser.prototype.forInit = function() {

    var localctx = new ForInitContext(this, this._ctx, this.state);
    this.enterRule(localctx, 160, JavaParser.RULE_forInit);
    try {
        this.state = 1016;
        var la_ = this._interp.adaptivePredict(this._input,120,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 1014;
            this.localVariableDeclaration();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 1015;
            this.expressionList();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EnhancedForControlContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_enhancedForControl;
    return this;
}

EnhancedForControlContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EnhancedForControlContext.prototype.constructor = EnhancedForControlContext;

EnhancedForControlContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

EnhancedForControlContext.prototype.variableDeclaratorId = function() {
    return this.getTypedRuleContext(VariableDeclaratorIdContext,0);
};

EnhancedForControlContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

EnhancedForControlContext.prototype.variableModifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(VariableModifierContext);
    } else {
        return this.getTypedRuleContext(VariableModifierContext,i);
    }
};

EnhancedForControlContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterEnhancedForControl(this);
	}
};

EnhancedForControlContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitEnhancedForControl(this);
	}
};




JavaParser.EnhancedForControlContext = EnhancedForControlContext;

JavaParser.prototype.enhancedForControl = function() {

    var localctx = new EnhancedForControlContext(this, this._ctx, this.state);
    this.enterRule(localctx, 162, JavaParser.RULE_enhancedForControl);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1021;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.FINAL || _la===JavaParser.AT) {
            this.state = 1018;
            this.variableModifier();
            this.state = 1023;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 1024;
        this.type();
        this.state = 1025;
        this.variableDeclaratorId();
        this.state = 1026;
        this.match(JavaParser.COLON);
        this.state = 1027;
        this.expression(0);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ForUpdateContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_forUpdate;
    return this;
}

ForUpdateContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ForUpdateContext.prototype.constructor = ForUpdateContext;

ForUpdateContext.prototype.expressionList = function() {
    return this.getTypedRuleContext(ExpressionListContext,0);
};

ForUpdateContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterForUpdate(this);
	}
};

ForUpdateContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitForUpdate(this);
	}
};




JavaParser.ForUpdateContext = ForUpdateContext;

JavaParser.prototype.forUpdate = function() {

    var localctx = new ForUpdateContext(this, this._ctx, this.state);
    this.enterRule(localctx, 164, JavaParser.RULE_forUpdate);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1029;
        this.expressionList();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ParExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_parExpression;
    return this;
}

ParExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParExpressionContext.prototype.constructor = ParExpressionContext;

ParExpressionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

ParExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterParExpression(this);
	}
};

ParExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitParExpression(this);
	}
};




JavaParser.ParExpressionContext = ParExpressionContext;

JavaParser.prototype.parExpression = function() {

    var localctx = new ParExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 166, JavaParser.RULE_parExpression);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1031;
        this.match(JavaParser.LPAREN);
        this.state = 1032;
        this.expression(0);
        this.state = 1033;
        this.match(JavaParser.RPAREN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExpressionListContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_expressionList;
    return this;
}

ExpressionListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExpressionListContext.prototype.constructor = ExpressionListContext;

ExpressionListContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};

ExpressionListContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterExpressionList(this);
	}
};

ExpressionListContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitExpressionList(this);
	}
};




JavaParser.ExpressionListContext = ExpressionListContext;

JavaParser.prototype.expressionList = function() {

    var localctx = new ExpressionListContext(this, this._ctx, this.state);
    this.enterRule(localctx, 168, JavaParser.RULE_expressionList);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1035;
        this.expression(0);
        this.state = 1040;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===JavaParser.COMMA) {
            this.state = 1036;
            this.match(JavaParser.COMMA);
            this.state = 1037;
            this.expression(0);
            this.state = 1042;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function StatementExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_statementExpression;
    return this;
}

StatementExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StatementExpressionContext.prototype.constructor = StatementExpressionContext;

StatementExpressionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

StatementExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterStatementExpression(this);
	}
};

StatementExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitStatementExpression(this);
	}
};




JavaParser.StatementExpressionContext = StatementExpressionContext;

JavaParser.prototype.statementExpression = function() {

    var localctx = new StatementExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 170, JavaParser.RULE_statementExpression);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1043;
        this.expression(0);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConstantExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_constantExpression;
    return this;
}

ConstantExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstantExpressionContext.prototype.constructor = ConstantExpressionContext;

ConstantExpressionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

ConstantExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterConstantExpression(this);
	}
};

ConstantExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitConstantExpression(this);
	}
};




JavaParser.ConstantExpressionContext = ConstantExpressionContext;

JavaParser.prototype.constantExpression = function() {

    var localctx = new ConstantExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 172, JavaParser.RULE_constantExpression);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1045;
        this.expression(0);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_expression;
    return this;
}

ExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExpressionContext.prototype.constructor = ExpressionContext;

ExpressionContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

ExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};

ExpressionContext.prototype.primary = function() {
    return this.getTypedRuleContext(PrimaryContext,0);
};

ExpressionContext.prototype.creator = function() {
    return this.getTypedRuleContext(CreatorContext,0);
};

ExpressionContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

ExpressionContext.prototype.innerCreator = function() {
    return this.getTypedRuleContext(InnerCreatorContext,0);
};

ExpressionContext.prototype.nonWildcardTypeArguments = function() {
    return this.getTypedRuleContext(NonWildcardTypeArgumentsContext,0);
};

ExpressionContext.prototype.superSuffix = function() {
    return this.getTypedRuleContext(SuperSuffixContext,0);
};

ExpressionContext.prototype.explicitGenericInvocation = function() {
    return this.getTypedRuleContext(ExplicitGenericInvocationContext,0);
};

ExpressionContext.prototype.expressionList = function() {
    return this.getTypedRuleContext(ExpressionListContext,0);
};

ExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterExpression(this);
	}
};

ExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitExpression(this);
	}
};



JavaParser.prototype.expression = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ExpressionContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 174;
    this.enterRecursionRule(localctx, 174, JavaParser.RULE_expression, _p);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1060;
        var la_ = this._interp.adaptivePredict(this._input,123,this._ctx);
        switch(la_) {
        case 1:
            this.state = 1048;
            this.match(JavaParser.LPAREN);
            this.state = 1049;
            this.type();
            this.state = 1050;
            this.match(JavaParser.RPAREN);
            this.state = 1051;
            this.expression(17);
            break;

        case 2:
            this.state = 1053;
            _la = this._input.LA(1);
            if(!(((((_la - 79)) & ~0x1f) == 0 && ((1 << (_la - 79)) & ((1 << (JavaParser.INC - 79)) | (1 << (JavaParser.DEC - 79)) | (1 << (JavaParser.ADD - 79)) | (1 << (JavaParser.SUB - 79)))) !== 0))) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            this.state = 1054;
            this.expression(15);
            break;

        case 3:
            this.state = 1055;
            _la = this._input.LA(1);
            if(!(_la===JavaParser.BANG || _la===JavaParser.TILDE)) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            this.state = 1056;
            this.expression(14);
            break;

        case 4:
            this.state = 1057;
            this.primary();
            break;

        case 5:
            this.state = 1058;
            this.match(JavaParser.NEW);
            this.state = 1059;
            this.creator();
            break;

        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 1147;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,128,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 1145;
                var la_ = this._interp.adaptivePredict(this._input,127,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1062;
                    if (!( this.precpred(this._ctx, 13))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 13)");
                    }
                    this.state = 1063;
                    _la = this._input.LA(1);
                    if(!(((((_la - 83)) & ~0x1f) == 0 && ((1 << (_la - 83)) & ((1 << (JavaParser.MUL - 83)) | (1 << (JavaParser.DIV - 83)) | (1 << (JavaParser.MOD - 83)))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 1064;
                    this.expression(14);
                    break;

                case 2:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1065;
                    if (!( this.precpred(this._ctx, 12))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 12)");
                    }
                    this.state = 1066;
                    _la = this._input.LA(1);
                    if(!(_la===JavaParser.ADD || _la===JavaParser.SUB)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 1067;
                    this.expression(13);
                    break;

                case 3:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1068;
                    if (!( this.precpred(this._ctx, 11))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 11)");
                    }
                    this.state = 1076;
                    var la_ = this._interp.adaptivePredict(this._input,124,this._ctx);
                    switch(la_) {
                    case 1:
                        this.state = 1069;
                        this.match(JavaParser.LT);
                        this.state = 1070;
                        this.match(JavaParser.LT);
                        break;

                    case 2:
                        this.state = 1071;
                        this.match(JavaParser.GT);
                        this.state = 1072;
                        this.match(JavaParser.GT);
                        this.state = 1073;
                        this.match(JavaParser.GT);
                        break;

                    case 3:
                        this.state = 1074;
                        this.match(JavaParser.GT);
                        this.state = 1075;
                        this.match(JavaParser.GT);
                        break;

                    }
                    this.state = 1078;
                    this.expression(12);
                    break;

                case 4:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1079;
                    if (!( this.precpred(this._ctx, 10))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
                    }
                    this.state = 1080;
                    _la = this._input.LA(1);
                    if(!(((((_la - 67)) & ~0x1f) == 0 && ((1 << (_la - 67)) & ((1 << (JavaParser.GT - 67)) | (1 << (JavaParser.LT - 67)) | (1 << (JavaParser.LE - 67)) | (1 << (JavaParser.GE - 67)))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 1081;
                    this.expression(11);
                    break;

                case 5:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1082;
                    if (!( this.precpred(this._ctx, 8))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
                    }
                    this.state = 1083;
                    _la = this._input.LA(1);
                    if(!(_la===JavaParser.EQUAL || _la===JavaParser.NOTEQUAL)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 1084;
                    this.expression(9);
                    break;

                case 6:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1085;
                    if (!( this.precpred(this._ctx, 7))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                    }
                    this.state = 1086;
                    this.match(JavaParser.BITAND);
                    this.state = 1087;
                    this.expression(8);
                    break;

                case 7:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1088;
                    if (!( this.precpred(this._ctx, 6))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                    }
                    this.state = 1089;
                    this.match(JavaParser.CARET);
                    this.state = 1090;
                    this.expression(7);
                    break;

                case 8:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1091;
                    if (!( this.precpred(this._ctx, 5))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                    }
                    this.state = 1092;
                    this.match(JavaParser.BITOR);
                    this.state = 1093;
                    this.expression(6);
                    break;

                case 9:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1094;
                    if (!( this.precpred(this._ctx, 4))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                    }
                    this.state = 1095;
                    this.match(JavaParser.AND);
                    this.state = 1096;
                    this.expression(5);
                    break;

                case 10:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1097;
                    if (!( this.precpred(this._ctx, 3))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
                    }
                    this.state = 1098;
                    this.match(JavaParser.OR);
                    this.state = 1099;
                    this.expression(4);
                    break;

                case 11:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1100;
                    if (!( this.precpred(this._ctx, 2))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
                    }
                    this.state = 1101;
                    this.match(JavaParser.QUESTION);
                    this.state = 1102;
                    this.expression(0);
                    this.state = 1103;
                    this.match(JavaParser.COLON);
                    this.state = 1104;
                    this.expression(3);
                    break;

                case 12:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1106;
                    if (!( this.precpred(this._ctx, 1))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
                    }
                    this.state = 1107;
                    _la = this._input.LA(1);
                    if(!(((((_la - 66)) & ~0x1f) == 0 && ((1 << (_la - 66)) & ((1 << (JavaParser.ASSIGN - 66)) | (1 << (JavaParser.ADD_ASSIGN - 66)) | (1 << (JavaParser.SUB_ASSIGN - 66)) | (1 << (JavaParser.MUL_ASSIGN - 66)) | (1 << (JavaParser.DIV_ASSIGN - 66)) | (1 << (JavaParser.AND_ASSIGN - 66)) | (1 << (JavaParser.OR_ASSIGN - 66)) | (1 << (JavaParser.XOR_ASSIGN - 66)) | (1 << (JavaParser.MOD_ASSIGN - 66)) | (1 << (JavaParser.LSHIFT_ASSIGN - 66)))) !== 0) || _la===JavaParser.RSHIFT_ASSIGN || _la===JavaParser.URSHIFT_ASSIGN)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 1108;
                    this.expression(1);
                    break;

                case 13:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1109;
                    if (!( this.precpred(this._ctx, 25))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 25)");
                    }
                    this.state = 1110;
                    this.match(JavaParser.DOT);
                    this.state = 1111;
                    this.match(JavaParser.Identifier);
                    break;

                case 14:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1112;
                    if (!( this.precpred(this._ctx, 24))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 24)");
                    }
                    this.state = 1113;
                    this.match(JavaParser.DOT);
                    this.state = 1114;
                    this.match(JavaParser.THIS);
                    break;

                case 15:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1115;
                    if (!( this.precpred(this._ctx, 23))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 23)");
                    }
                    this.state = 1116;
                    this.match(JavaParser.DOT);
                    this.state = 1117;
                    this.match(JavaParser.NEW);
                    this.state = 1119;
                    _la = this._input.LA(1);
                    if(_la===JavaParser.LT) {
                        this.state = 1118;
                        this.nonWildcardTypeArguments();
                    }

                    this.state = 1121;
                    this.innerCreator();
                    break;

                case 16:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1122;
                    if (!( this.precpred(this._ctx, 22))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 22)");
                    }
                    this.state = 1123;
                    this.match(JavaParser.DOT);
                    this.state = 1124;
                    this.match(JavaParser.SUPER);
                    this.state = 1125;
                    this.superSuffix();
                    break;

                case 17:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1126;
                    if (!( this.precpred(this._ctx, 21))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 21)");
                    }
                    this.state = 1127;
                    this.match(JavaParser.DOT);
                    this.state = 1128;
                    this.explicitGenericInvocation();
                    break;

                case 18:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1129;
                    if (!( this.precpred(this._ctx, 20))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 20)");
                    }
                    this.state = 1130;
                    this.match(JavaParser.LBRACK);
                    this.state = 1131;
                    this.expression(0);
                    this.state = 1132;
                    this.match(JavaParser.RBRACK);
                    break;

                case 19:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1134;
                    if (!( this.precpred(this._ctx, 19))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 19)");
                    }
                    this.state = 1135;
                    this.match(JavaParser.LPAREN);
                    this.state = 1137;
                    _la = this._input.LA(1);
                    if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0)) {
                        this.state = 1136;
                        this.expressionList();
                    }

                    this.state = 1139;
                    this.match(JavaParser.RPAREN);
                    break;

                case 20:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1140;
                    if (!( this.precpred(this._ctx, 16))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 16)");
                    }
                    this.state = 1141;
                    _la = this._input.LA(1);
                    if(!(_la===JavaParser.INC || _la===JavaParser.DEC)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    break;

                case 21:
                    localctx = new ExpressionContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, JavaParser.RULE_expression);
                    this.state = 1142;
                    if (!( this.precpred(this._ctx, 9))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
                    }
                    this.state = 1143;
                    this.match(JavaParser.INSTANCEOF);
                    this.state = 1144;
                    this.type();
                    break;

                } 
            }
            this.state = 1149;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,128,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function PrimaryContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_primary;
    return this;
}

PrimaryContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PrimaryContext.prototype.constructor = PrimaryContext;

PrimaryContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

PrimaryContext.prototype.literal = function() {
    return this.getTypedRuleContext(LiteralContext,0);
};

PrimaryContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

PrimaryContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

PrimaryContext.prototype.nonWildcardTypeArguments = function() {
    return this.getTypedRuleContext(NonWildcardTypeArgumentsContext,0);
};

PrimaryContext.prototype.explicitGenericInvocationSuffix = function() {
    return this.getTypedRuleContext(ExplicitGenericInvocationSuffixContext,0);
};

PrimaryContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};

PrimaryContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterPrimary(this);
	}
};

PrimaryContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitPrimary(this);
	}
};




JavaParser.PrimaryContext = PrimaryContext;

JavaParser.prototype.primary = function() {

    var localctx = new PrimaryContext(this, this._ctx, this.state);
    this.enterRule(localctx, 176, JavaParser.RULE_primary);
    try {
        this.state = 1171;
        var la_ = this._interp.adaptivePredict(this._input,130,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 1150;
            this.match(JavaParser.LPAREN);
            this.state = 1151;
            this.expression(0);
            this.state = 1152;
            this.match(JavaParser.RPAREN);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 1154;
            this.match(JavaParser.THIS);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 1155;
            this.match(JavaParser.SUPER);
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 1156;
            this.literal();
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 1157;
            this.match(JavaParser.Identifier);
            break;

        case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 1158;
            this.type();
            this.state = 1159;
            this.match(JavaParser.DOT);
            this.state = 1160;
            this.match(JavaParser.CLASS);
            break;

        case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 1162;
            this.match(JavaParser.VOID);
            this.state = 1163;
            this.match(JavaParser.DOT);
            this.state = 1164;
            this.match(JavaParser.CLASS);
            break;

        case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 1165;
            this.nonWildcardTypeArguments();
            this.state = 1169;
            switch(this._input.LA(1)) {
            case JavaParser.SUPER:
            case JavaParser.Identifier:
                this.state = 1166;
                this.explicitGenericInvocationSuffix();
                break;
            case JavaParser.THIS:
                this.state = 1167;
                this.match(JavaParser.THIS);
                this.state = 1168;
                this.arguments();
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function CreatorContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_creator;
    return this;
}

CreatorContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CreatorContext.prototype.constructor = CreatorContext;

CreatorContext.prototype.nonWildcardTypeArguments = function() {
    return this.getTypedRuleContext(NonWildcardTypeArgumentsContext,0);
};

CreatorContext.prototype.createdName = function() {
    return this.getTypedRuleContext(CreatedNameContext,0);
};

CreatorContext.prototype.classCreatorRest = function() {
    return this.getTypedRuleContext(ClassCreatorRestContext,0);
};

CreatorContext.prototype.arrayCreatorRest = function() {
    return this.getTypedRuleContext(ArrayCreatorRestContext,0);
};

CreatorContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterCreator(this);
	}
};

CreatorContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitCreator(this);
	}
};




JavaParser.CreatorContext = CreatorContext;

JavaParser.prototype.creator = function() {

    var localctx = new CreatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 178, JavaParser.RULE_creator);
    try {
        this.state = 1182;
        switch(this._input.LA(1)) {
        case JavaParser.LT:
            this.enterOuterAlt(localctx, 1);
            this.state = 1173;
            this.nonWildcardTypeArguments();
            this.state = 1174;
            this.createdName();
            this.state = 1175;
            this.classCreatorRest();
            break;
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 2);
            this.state = 1177;
            this.createdName();
            this.state = 1180;
            switch(this._input.LA(1)) {
            case JavaParser.LBRACK:
                this.state = 1178;
                this.arrayCreatorRest();
                break;
            case JavaParser.LPAREN:
                this.state = 1179;
                this.classCreatorRest();
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function CreatedNameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_createdName;
    return this;
}

CreatedNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CreatedNameContext.prototype.constructor = CreatedNameContext;

CreatedNameContext.prototype.Identifier = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(JavaParser.Identifier);
    } else {
        return this.getToken(JavaParser.Identifier, i);
    }
};


CreatedNameContext.prototype.typeArgumentsOrDiamond = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(TypeArgumentsOrDiamondContext);
    } else {
        return this.getTypedRuleContext(TypeArgumentsOrDiamondContext,i);
    }
};

CreatedNameContext.prototype.primitiveType = function() {
    return this.getTypedRuleContext(PrimitiveTypeContext,0);
};

CreatedNameContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterCreatedName(this);
	}
};

CreatedNameContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitCreatedName(this);
	}
};




JavaParser.CreatedNameContext = CreatedNameContext;

JavaParser.prototype.createdName = function() {

    var localctx = new CreatedNameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 180, JavaParser.RULE_createdName);
    var _la = 0; // Token type
    try {
        this.state = 1199;
        switch(this._input.LA(1)) {
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 1);
            this.state = 1184;
            this.match(JavaParser.Identifier);
            this.state = 1186;
            _la = this._input.LA(1);
            if(_la===JavaParser.LT) {
                this.state = 1185;
                this.typeArgumentsOrDiamond();
            }

            this.state = 1195;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.DOT) {
                this.state = 1188;
                this.match(JavaParser.DOT);
                this.state = 1189;
                this.match(JavaParser.Identifier);
                this.state = 1191;
                _la = this._input.LA(1);
                if(_la===JavaParser.LT) {
                    this.state = 1190;
                    this.typeArgumentsOrDiamond();
                }

                this.state = 1197;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            break;
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.SHORT:
            this.enterOuterAlt(localctx, 2);
            this.state = 1198;
            this.primitiveType();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InnerCreatorContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_innerCreator;
    return this;
}

InnerCreatorContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InnerCreatorContext.prototype.constructor = InnerCreatorContext;

InnerCreatorContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

InnerCreatorContext.prototype.classCreatorRest = function() {
    return this.getTypedRuleContext(ClassCreatorRestContext,0);
};

InnerCreatorContext.prototype.nonWildcardTypeArgumentsOrDiamond = function() {
    return this.getTypedRuleContext(NonWildcardTypeArgumentsOrDiamondContext,0);
};

InnerCreatorContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterInnerCreator(this);
	}
};

InnerCreatorContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitInnerCreator(this);
	}
};




JavaParser.InnerCreatorContext = InnerCreatorContext;

JavaParser.prototype.innerCreator = function() {

    var localctx = new InnerCreatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 182, JavaParser.RULE_innerCreator);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1201;
        this.match(JavaParser.Identifier);
        this.state = 1203;
        _la = this._input.LA(1);
        if(_la===JavaParser.LT) {
            this.state = 1202;
            this.nonWildcardTypeArgumentsOrDiamond();
        }

        this.state = 1205;
        this.classCreatorRest();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ArrayCreatorRestContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_arrayCreatorRest;
    return this;
}

ArrayCreatorRestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArrayCreatorRestContext.prototype.constructor = ArrayCreatorRestContext;

ArrayCreatorRestContext.prototype.arrayInitializer = function() {
    return this.getTypedRuleContext(ArrayInitializerContext,0);
};

ArrayCreatorRestContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};

ArrayCreatorRestContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterArrayCreatorRest(this);
	}
};

ArrayCreatorRestContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitArrayCreatorRest(this);
	}
};




JavaParser.ArrayCreatorRestContext = ArrayCreatorRestContext;

JavaParser.prototype.arrayCreatorRest = function() {

    var localctx = new ArrayCreatorRestContext(this, this._ctx, this.state);
    this.enterRule(localctx, 184, JavaParser.RULE_arrayCreatorRest);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1207;
        this.match(JavaParser.LBRACK);
        this.state = 1235;
        switch(this._input.LA(1)) {
        case JavaParser.RBRACK:
            this.state = 1208;
            this.match(JavaParser.RBRACK);
            this.state = 1213;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===JavaParser.LBRACK) {
                this.state = 1209;
                this.match(JavaParser.LBRACK);
                this.state = 1210;
                this.match(JavaParser.RBRACK);
                this.state = 1215;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 1216;
            this.arrayInitializer();
            break;
        case JavaParser.BOOLEAN:
        case JavaParser.BYTE:
        case JavaParser.CHAR:
        case JavaParser.DOUBLE:
        case JavaParser.FLOAT:
        case JavaParser.INT:
        case JavaParser.LONG:
        case JavaParser.NEW:
        case JavaParser.SHORT:
        case JavaParser.SUPER:
        case JavaParser.THIS:
        case JavaParser.VOID:
        case JavaParser.IntegerLiteral:
        case JavaParser.FloatingPointLiteral:
        case JavaParser.BooleanLiteral:
        case JavaParser.CharacterLiteral:
        case JavaParser.StringLiteral:
        case JavaParser.NullLiteral:
        case JavaParser.LPAREN:
        case JavaParser.LT:
        case JavaParser.BANG:
        case JavaParser.TILDE:
        case JavaParser.INC:
        case JavaParser.DEC:
        case JavaParser.ADD:
        case JavaParser.SUB:
        case JavaParser.Identifier:
            this.state = 1217;
            this.expression(0);
            this.state = 1218;
            this.match(JavaParser.RBRACK);
            this.state = 1225;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,139,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 1219;
                    this.match(JavaParser.LBRACK);
                    this.state = 1220;
                    this.expression(0);
                    this.state = 1221;
                    this.match(JavaParser.RBRACK); 
                }
                this.state = 1227;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,139,this._ctx);
            }

            this.state = 1232;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,140,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 1228;
                    this.match(JavaParser.LBRACK);
                    this.state = 1229;
                    this.match(JavaParser.RBRACK); 
                }
                this.state = 1234;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,140,this._ctx);
            }

            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ClassCreatorRestContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_classCreatorRest;
    return this;
}

ClassCreatorRestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ClassCreatorRestContext.prototype.constructor = ClassCreatorRestContext;

ClassCreatorRestContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};

ClassCreatorRestContext.prototype.classBody = function() {
    return this.getTypedRuleContext(ClassBodyContext,0);
};

ClassCreatorRestContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterClassCreatorRest(this);
	}
};

ClassCreatorRestContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitClassCreatorRest(this);
	}
};




JavaParser.ClassCreatorRestContext = ClassCreatorRestContext;

JavaParser.prototype.classCreatorRest = function() {

    var localctx = new ClassCreatorRestContext(this, this._ctx, this.state);
    this.enterRule(localctx, 186, JavaParser.RULE_classCreatorRest);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1237;
        this.arguments();
        this.state = 1239;
        var la_ = this._interp.adaptivePredict(this._input,142,this._ctx);
        if(la_===1) {
            this.state = 1238;
            this.classBody();

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExplicitGenericInvocationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_explicitGenericInvocation;
    return this;
}

ExplicitGenericInvocationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExplicitGenericInvocationContext.prototype.constructor = ExplicitGenericInvocationContext;

ExplicitGenericInvocationContext.prototype.nonWildcardTypeArguments = function() {
    return this.getTypedRuleContext(NonWildcardTypeArgumentsContext,0);
};

ExplicitGenericInvocationContext.prototype.explicitGenericInvocationSuffix = function() {
    return this.getTypedRuleContext(ExplicitGenericInvocationSuffixContext,0);
};

ExplicitGenericInvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterExplicitGenericInvocation(this);
	}
};

ExplicitGenericInvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitExplicitGenericInvocation(this);
	}
};




JavaParser.ExplicitGenericInvocationContext = ExplicitGenericInvocationContext;

JavaParser.prototype.explicitGenericInvocation = function() {

    var localctx = new ExplicitGenericInvocationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 188, JavaParser.RULE_explicitGenericInvocation);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1241;
        this.nonWildcardTypeArguments();
        this.state = 1242;
        this.explicitGenericInvocationSuffix();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function NonWildcardTypeArgumentsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_nonWildcardTypeArguments;
    return this;
}

NonWildcardTypeArgumentsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NonWildcardTypeArgumentsContext.prototype.constructor = NonWildcardTypeArgumentsContext;

NonWildcardTypeArgumentsContext.prototype.typeList = function() {
    return this.getTypedRuleContext(TypeListContext,0);
};

NonWildcardTypeArgumentsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterNonWildcardTypeArguments(this);
	}
};

NonWildcardTypeArgumentsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitNonWildcardTypeArguments(this);
	}
};




JavaParser.NonWildcardTypeArgumentsContext = NonWildcardTypeArgumentsContext;

JavaParser.prototype.nonWildcardTypeArguments = function() {

    var localctx = new NonWildcardTypeArgumentsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 190, JavaParser.RULE_nonWildcardTypeArguments);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1244;
        this.match(JavaParser.LT);
        this.state = 1245;
        this.typeList();
        this.state = 1246;
        this.match(JavaParser.GT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeArgumentsOrDiamondContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_typeArgumentsOrDiamond;
    return this;
}

TypeArgumentsOrDiamondContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeArgumentsOrDiamondContext.prototype.constructor = TypeArgumentsOrDiamondContext;

TypeArgumentsOrDiamondContext.prototype.typeArguments = function() {
    return this.getTypedRuleContext(TypeArgumentsContext,0);
};

TypeArgumentsOrDiamondContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterTypeArgumentsOrDiamond(this);
	}
};

TypeArgumentsOrDiamondContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitTypeArgumentsOrDiamond(this);
	}
};




JavaParser.TypeArgumentsOrDiamondContext = TypeArgumentsOrDiamondContext;

JavaParser.prototype.typeArgumentsOrDiamond = function() {

    var localctx = new TypeArgumentsOrDiamondContext(this, this._ctx, this.state);
    this.enterRule(localctx, 192, JavaParser.RULE_typeArgumentsOrDiamond);
    try {
        this.state = 1251;
        var la_ = this._interp.adaptivePredict(this._input,143,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 1248;
            this.match(JavaParser.LT);
            this.state = 1249;
            this.match(JavaParser.GT);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 1250;
            this.typeArguments();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function NonWildcardTypeArgumentsOrDiamondContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_nonWildcardTypeArgumentsOrDiamond;
    return this;
}

NonWildcardTypeArgumentsOrDiamondContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NonWildcardTypeArgumentsOrDiamondContext.prototype.constructor = NonWildcardTypeArgumentsOrDiamondContext;

NonWildcardTypeArgumentsOrDiamondContext.prototype.nonWildcardTypeArguments = function() {
    return this.getTypedRuleContext(NonWildcardTypeArgumentsContext,0);
};

NonWildcardTypeArgumentsOrDiamondContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterNonWildcardTypeArgumentsOrDiamond(this);
	}
};

NonWildcardTypeArgumentsOrDiamondContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitNonWildcardTypeArgumentsOrDiamond(this);
	}
};




JavaParser.NonWildcardTypeArgumentsOrDiamondContext = NonWildcardTypeArgumentsOrDiamondContext;

JavaParser.prototype.nonWildcardTypeArgumentsOrDiamond = function() {

    var localctx = new NonWildcardTypeArgumentsOrDiamondContext(this, this._ctx, this.state);
    this.enterRule(localctx, 194, JavaParser.RULE_nonWildcardTypeArgumentsOrDiamond);
    try {
        this.state = 1256;
        var la_ = this._interp.adaptivePredict(this._input,144,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 1253;
            this.match(JavaParser.LT);
            this.state = 1254;
            this.match(JavaParser.GT);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 1255;
            this.nonWildcardTypeArguments();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function SuperSuffixContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_superSuffix;
    return this;
}

SuperSuffixContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SuperSuffixContext.prototype.constructor = SuperSuffixContext;

SuperSuffixContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};

SuperSuffixContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

SuperSuffixContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterSuperSuffix(this);
	}
};

SuperSuffixContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitSuperSuffix(this);
	}
};




JavaParser.SuperSuffixContext = SuperSuffixContext;

JavaParser.prototype.superSuffix = function() {

    var localctx = new SuperSuffixContext(this, this._ctx, this.state);
    this.enterRule(localctx, 196, JavaParser.RULE_superSuffix);
    try {
        this.state = 1264;
        switch(this._input.LA(1)) {
        case JavaParser.LPAREN:
            this.enterOuterAlt(localctx, 1);
            this.state = 1258;
            this.arguments();
            break;
        case JavaParser.DOT:
            this.enterOuterAlt(localctx, 2);
            this.state = 1259;
            this.match(JavaParser.DOT);
            this.state = 1260;
            this.match(JavaParser.Identifier);
            this.state = 1262;
            var la_ = this._interp.adaptivePredict(this._input,145,this._ctx);
            if(la_===1) {
                this.state = 1261;
                this.arguments();

            }
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExplicitGenericInvocationSuffixContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_explicitGenericInvocationSuffix;
    return this;
}

ExplicitGenericInvocationSuffixContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExplicitGenericInvocationSuffixContext.prototype.constructor = ExplicitGenericInvocationSuffixContext;

ExplicitGenericInvocationSuffixContext.prototype.superSuffix = function() {
    return this.getTypedRuleContext(SuperSuffixContext,0);
};

ExplicitGenericInvocationSuffixContext.prototype.Identifier = function() {
    return this.getToken(JavaParser.Identifier, 0);
};

ExplicitGenericInvocationSuffixContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};

ExplicitGenericInvocationSuffixContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterExplicitGenericInvocationSuffix(this);
	}
};

ExplicitGenericInvocationSuffixContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitExplicitGenericInvocationSuffix(this);
	}
};




JavaParser.ExplicitGenericInvocationSuffixContext = ExplicitGenericInvocationSuffixContext;

JavaParser.prototype.explicitGenericInvocationSuffix = function() {

    var localctx = new ExplicitGenericInvocationSuffixContext(this, this._ctx, this.state);
    this.enterRule(localctx, 198, JavaParser.RULE_explicitGenericInvocationSuffix);
    try {
        this.state = 1270;
        switch(this._input.LA(1)) {
        case JavaParser.SUPER:
            this.enterOuterAlt(localctx, 1);
            this.state = 1266;
            this.match(JavaParser.SUPER);
            this.state = 1267;
            this.superSuffix();
            break;
        case JavaParser.Identifier:
            this.enterOuterAlt(localctx, 2);
            this.state = 1268;
            this.match(JavaParser.Identifier);
            this.state = 1269;
            this.arguments();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ArgumentsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = JavaParser.RULE_arguments;
    return this;
}

ArgumentsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArgumentsContext.prototype.constructor = ArgumentsContext;

ArgumentsContext.prototype.expressionList = function() {
    return this.getTypedRuleContext(ExpressionListContext,0);
};

ArgumentsContext.prototype.enterRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.enterArguments(this);
	}
};

ArgumentsContext.prototype.exitRule = function(listener) {
    if(listener instanceof JavaListener ) {
        listener.exitArguments(this);
	}
};




JavaParser.ArgumentsContext = ArgumentsContext;

JavaParser.prototype.arguments = function() {

    var localctx = new ArgumentsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 200, JavaParser.RULE_arguments);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1272;
        this.match(JavaParser.LPAREN);
        this.state = 1274;
        _la = this._input.LA(1);
        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << JavaParser.BOOLEAN) | (1 << JavaParser.BYTE) | (1 << JavaParser.CHAR) | (1 << JavaParser.DOUBLE) | (1 << JavaParser.FLOAT) | (1 << JavaParser.INT) | (1 << JavaParser.LONG) | (1 << JavaParser.NEW))) !== 0) || ((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & ((1 << (JavaParser.SHORT - 37)) | (1 << (JavaParser.SUPER - 37)) | (1 << (JavaParser.THIS - 37)) | (1 << (JavaParser.VOID - 37)) | (1 << (JavaParser.IntegerLiteral - 37)) | (1 << (JavaParser.FloatingPointLiteral - 37)) | (1 << (JavaParser.BooleanLiteral - 37)) | (1 << (JavaParser.CharacterLiteral - 37)) | (1 << (JavaParser.StringLiteral - 37)) | (1 << (JavaParser.NullLiteral - 37)) | (1 << (JavaParser.LPAREN - 37)) | (1 << (JavaParser.LT - 37)))) !== 0) || ((((_la - 69)) & ~0x1f) == 0 && ((1 << (_la - 69)) & ((1 << (JavaParser.BANG - 69)) | (1 << (JavaParser.TILDE - 69)) | (1 << (JavaParser.INC - 69)) | (1 << (JavaParser.DEC - 69)) | (1 << (JavaParser.ADD - 69)) | (1 << (JavaParser.SUB - 69)) | (1 << (JavaParser.Identifier - 69)))) !== 0)) {
            this.state = 1273;
            this.expressionList();
        }

        this.state = 1276;
        this.match(JavaParser.RPAREN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


JavaParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 87:
			return this.expression_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

JavaParser.prototype.expression_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 13);
		case 1:
			return this.precpred(this._ctx, 12);
		case 2:
			return this.precpred(this._ctx, 11);
		case 3:
			return this.precpred(this._ctx, 10);
		case 4:
			return this.precpred(this._ctx, 8);
		case 5:
			return this.precpred(this._ctx, 7);
		case 6:
			return this.precpred(this._ctx, 6);
		case 7:
			return this.precpred(this._ctx, 5);
		case 8:
			return this.precpred(this._ctx, 4);
		case 9:
			return this.precpred(this._ctx, 3);
		case 10:
			return this.precpred(this._ctx, 2);
		case 11:
			return this.precpred(this._ctx, 1);
		case 12:
			return this.precpred(this._ctx, 25);
		case 13:
			return this.precpred(this._ctx, 24);
		case 14:
			return this.precpred(this._ctx, 23);
		case 15:
			return this.precpred(this._ctx, 22);
		case 16:
			return this.precpred(this._ctx, 21);
		case 17:
			return this.precpred(this._ctx, 20);
		case 18:
			return this.precpred(this._ctx, 19);
		case 19:
			return this.precpred(this._ctx, 16);
		case 20:
			return this.precpred(this._ctx, 9);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.JavaParser = JavaParser;

},{"./JavaListener":7,"antlr4/index":49}],9:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// This implementation of {@link TokenStream} loads tokens from a
// {@link TokenSource} on-demand, and places the tokens in a buffer to provide
// access to any previous token by index.
//
// <p>
// This token stream ignores the value of {@link Token//getChannel}. If your
// parser requires the token stream filter tokens to only those on a particular
// channel, such as {@link Token//DEFAULT_CHANNEL} or
// {@link Token//HIDDEN_CHANNEL}, use a filtering token stream such a
// {@link CommonTokenStream}.</p>

var Token = require('./Token').Token;
var Lexer = require('./Lexer').Lexer;
var Interval = require('./IntervalSet').Interval;

// this is just to keep meaningful parameter types to Parser
function TokenStream() {
	return this;
}

function BufferedTokenStream(tokenSource) {

	TokenStream.call(this);
	// The {@link TokenSource} from which tokens for this stream are fetched.
	this.tokenSource = tokenSource;

	// A collection of all tokens fetched from the token source. The list is
	// considered a complete view of the input once {@link //fetchedEOF} is set
	// to {@code true}.
	this.tokens = [];

	// The index into {@link //tokens} of the current token (next token to
	// {@link //consume}). {@link //tokens}{@code [}{@link //p}{@code ]} should
	// be
	// {@link //LT LT(1)}.
	//
	// <p>This field is set to -1 when the stream is first constructed or when
	// {@link //setTokenSource} is called, indicating that the first token has
	// not yet been fetched from the token source. For additional information,
	// see the documentation of {@link IntStream} for a description of
	// Initializing Methods.</p>
	this.index = -1;

	// Indicates whether the {@link Token//EOF} token has been fetched from
	// {@link //tokenSource} and added to {@link //tokens}. This field improves
	// performance for the following cases:
	//
	// <ul>
	// <li>{@link //consume}: The lookahead check in {@link //consume} to
	// prevent
	// consuming the EOF symbol is optimized by checking the values of
	// {@link //fetchedEOF} and {@link //p} instead of calling {@link
	// //LA}.</li>
	// <li>{@link //fetch}: The check to prevent adding multiple EOF symbols
	// into
	// {@link //tokens} is trivial with this field.</li>
	// <ul>
	this.fetchedEOF = false;
	return this;
}

BufferedTokenStream.prototype = Object.create(TokenStream.prototype);
BufferedTokenStream.prototype.constructor = BufferedTokenStream;

BufferedTokenStream.prototype.mark = function() {
	return 0;
};

BufferedTokenStream.prototype.release = function(marker) {
	// no resources to release
};

BufferedTokenStream.prototype.reset = function() {
	this.seek(0);
};

BufferedTokenStream.prototype.seek = function(index) {
	this.lazyInit();
	this.index = this.adjustSeekIndex(index);
};

BufferedTokenStream.prototype.get = function(index) {
	this.lazyInit();
	return this.tokens[index];
};

BufferedTokenStream.prototype.consume = function() {
	var skipEofCheck = false;
	if (this.index >= 0) {
		if (this.fetchedEOF) {
			// the last token in tokens is EOF. skip check if p indexes any
			// fetched token except the last.
			skipEofCheck = this.index < this.tokens.length - 1;
		} else {
			// no EOF token in tokens. skip check if p indexes a fetched token.
			skipEofCheck = this.index < this.tokens.length;
		}
	} else {
		// not yet initialized
		skipEofCheck = false;
	}
	if (!skipEofCheck && this.LA(1) === Token.EOF) {
		throw "cannot consume EOF";
	}
	if (this.sync(this.index + 1)) {
		this.index = this.adjustSeekIndex(this.index + 1);
	}
};

// Make sure index {@code i} in tokens has a token.
//
// @return {@code true} if a token is located at index {@code i}, otherwise
// {@code false}.
// @see //get(int i)
// /
BufferedTokenStream.prototype.sync = function(i) {
	var n = i - this.tokens.length + 1; // how many more elements we need?
	if (n > 0) {
		var fetched = this.fetch(n);
		return fetched >= n;
	}
	return true;
};

// Add {@code n} elements to buffer.
//
// @return The actual number of elements added to the buffer.
// /
BufferedTokenStream.prototype.fetch = function(n) {
	if (this.fetchedEOF) {
		return 0;
	}
	for (var i = 0; i < n; i++) {
		var t = this.tokenSource.nextToken();
		t.tokenIndex = this.tokens.length;
		this.tokens.push(t);
		if (t.type === Token.EOF) {
			this.fetchedEOF = true;
			return i + 1;
		}
	}
	return n;
};

// Get all tokens from start..stop inclusively///
BufferedTokenStream.prototype.getTokens = function(start, stop, types) {
	if (types === undefined) {
		types = null;
	}
	if (start < 0 || stop < 0) {
		return null;
	}
	this.lazyInit();
	var subset = [];
	if (stop >= this.tokens.length) {
		stop = this.tokens.length - 1;
	}
	for (var i = start; i < stop; i++) {
		var t = this.tokens[i];
		if (t.type === Token.EOF) {
			break;
		}
		if (types === null || types.contains(t.type)) {
			subset.push(t);
		}
	}
	return subset;
};

BufferedTokenStream.prototype.LA = function(i) {
	return this.LT(i).type;
};

BufferedTokenStream.prototype.LB = function(k) {
	if (this.index - k < 0) {
		return null;
	}
	return this.tokens[this.index - k];
};

BufferedTokenStream.prototype.LT = function(k) {
	this.lazyInit();
	if (k === 0) {
		return null;
	}
	if (k < 0) {
		return this.LB(-k);
	}
	var i = this.index + k - 1;
	this.sync(i);
	if (i >= this.tokens.length) { // return EOF token
		// EOF must be last token
		return this.tokens[this.tokens.length - 1];
	}
	return this.tokens[i];
};

// Allowed derived classes to modify the behavior of operations which change
// the current stream position by adjusting the target token index of a seek
// operation. The default implementation simply returns {@code i}. If an
// exception is thrown in this method, the current stream index should not be
// changed.
//
// <p>For example, {@link CommonTokenStream} overrides this method to ensure
// that
// the seek target is always an on-channel token.</p>
//
// @param i The target token index.
// @return The adjusted target token index.

BufferedTokenStream.prototype.adjustSeekIndex = function(i) {
	return i;
};

BufferedTokenStream.prototype.lazyInit = function() {
	if (this.index === -1) {
		this.setup();
	}
};

BufferedTokenStream.prototype.setup = function() {
	this.sync(0);
	this.index = this.adjustSeekIndex(0);
};

// Reset this token stream by setting its token source.///
BufferedTokenStream.prototype.setTokenSource = function(tokenSource) {
	this.tokenSource = tokenSource;
	this.tokens = [];
	this.index = -1;
};

// Given a starting index, return the index of the next token on channel.
// Return i if tokens[i] is on channel. Return -1 if there are no tokens
// on channel between i and EOF.
// /
BufferedTokenStream.prototype.nextTokenOnChannel = function(i, channel) {
	this.sync(i);
	if (i >= this.tokens.length) {
		return -1;
	}
	var token = this.tokens[i];
	while (token.channel !== this.channel) {
		if (token.type === Token.EOF) {
			return -1;
		}
		i += 1;
		this.sync(i);
		token = this.tokens[i];
	}
	return i;
};

// Given a starting index, return the index of the previous token on channel.
// Return i if tokens[i] is on channel. Return -1 if there are no tokens
// on channel between i and 0.
BufferedTokenStream.prototype.previousTokenOnChannel = function(i, channel) {
	while (i >= 0 && this.tokens[i].channel !== channel) {
		i -= 1;
	}
	return i;
};

// Collect all tokens on specified channel to the right of
// the current token up until we see a token on DEFAULT_TOKEN_CHANNEL or
// EOF. If channel is -1, find any non default channel token.
BufferedTokenStream.prototype.getHiddenTokensToRight = function(tokenIndex,
		channel) {
	if (channel === undefined) {
		channel = -1;
	}
	this.lazyInit();
	if (this.tokenIndex < 0 || tokenIndex >= this.tokens.length) {
		throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
	}
	var nextOnChannel = this.nextTokenOnChannel(tokenIndex + 1,
			Lexer.DEFAULT_TOKEN_CHANNEL);
	var from_ = tokenIndex + 1;
	// if none onchannel to right, nextOnChannel=-1 so set to = last token
	var to = nextOnChannel === -1 ? this.tokens.length - 1 : nextOnChannel;
	return this.filterForChannel(from_, to, channel);
};

// Collect all tokens on specified channel to the left of
// the current token up until we see a token on DEFAULT_TOKEN_CHANNEL.
// If channel is -1, find any non default channel token.
BufferedTokenStream.prototype.getHiddenTokensToLeft = function(tokenIndex,
		channel) {
	if (channel === undefined) {
		channel = -1;
	}
	this.lazyInit();
	if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
		throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
	}
	var prevOnChannel = this.previousTokenOnChannel(tokenIndex - 1,
			Lexer.DEFAULT_TOKEN_CHANNEL);
	if (prevOnChannel === tokenIndex - 1) {
		return null;
	}
	// if none on channel to left, prevOnChannel=-1 then from=0
	var from_ = prevOnChannel + 1;
	var to = tokenIndex - 1;
	return this.filterForChannel(from_, to, channel);
};

BufferedTokenStream.prototype.filterForChannel = function(left, right, channel) {
	var hidden = [];
	for (var i = left; i < right + 1; i++) {
		var t = this.tokens[i];
		if (channel === -1) {
			if (t.channel !== Lexer.DEFAULT_TOKEN_CHANNEL) {
				hidden.push(t);
			}
		} else if (t.channel === channel) {
			hidden.push(t);
		}
	}
	if (hidden.length === 0) {
		return null;
	}
	return hidden;
};

BufferedTokenStream.prototype.getSourceName = function() {
	return this.tokenSource.getSourceName();
};

// Get the text of all tokens in this buffer.///
BufferedTokenStream.prototype.getText = function(interval) {
	this.lazyInit();
	this.fill();
	if (interval === undefined || interval === null) {
		interval = new Interval(0, this.tokens.length - 1);
	}
	var start = interval.start;
	if (start instanceof Token) {
		start = start.tokenIndex;
	}
	var stop = interval.stop;
	if (stop instanceof Token) {
		stop = stop.tokenIndex;
	}
	if (start === null || stop === null || start < 0 || stop < 0) {
		return "";
	}
	if (stop >= this.tokens.length) {
		stop = this.tokens.length - 1;
	}
	var s = "";
	for (var i = start; i < stop + 1; i++) {
		var t = this.tokens[i];
		if (t.type === Token.EOF) {
			break;
		}
		s = s + t.text;
	}
	return s;
};

// Get all tokens from lexer until EOF///
BufferedTokenStream.prototype.fill = function() {
	this.lazyInit();
	while (this.fetch(1000) === 1000) {
		continue;
	}
};

exports.BufferedTokenStream = BufferedTokenStream;

},{"./IntervalSet":14,"./Lexer":16,"./Token":22}],10:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

//
// This default implementation of {@link TokenFactory} creates
// {@link CommonToken} objects.
//

var CommonToken = require('./Token').CommonToken;

function TokenFactory() {
	return this;
}

function CommonTokenFactory(copyText) {
	TokenFactory.call(this);
    // Indicates whether {@link CommonToken//setText} should be called after
    // constructing tokens to explicitly set the text. This is useful for cases
    // where the input stream might not be able to provide arbitrary substrings
    // of text from the input after the lexer creates a token (e.g. the
    // implementation of {@link CharStream//getText} in
    // {@link UnbufferedCharStream} throws an
    // {@link UnsupportedOperationException}). Explicitly setting the token text
    // allows {@link Token//getText} to be called at any time regardless of the
    // input stream implementation.
    //
    // <p>
    // The default value is {@code false} to avoid the performance and memory
    // overhead of copying text for every token unless explicitly requested.</p>
    //
    this.copyText = copyText===undefined ? false : copyText;
	return this;
}

CommonTokenFactory.prototype = Object.create(TokenFactory.prototype);
CommonTokenFactory.prototype.constructor = CommonTokenFactory;

//
// The default {@link CommonTokenFactory} instance.
//
// <p>
// This token factory does not explicitly copy token text when constructing
// tokens.</p>
//
CommonTokenFactory.DEFAULT = new CommonTokenFactory();

CommonTokenFactory.prototype.create = function(source, type, text, channel, start, stop, line, column) {
    var t = new CommonToken(source, type, channel, start, stop);
    t.line = line;
    t.column = column;
    if (text !==null) {
        t.text = text;
    } else if (this.copyText && source[1] !==null) {
        t.text = source[1].getText(start,stop);
    }
    return t;
};

CommonTokenFactory.prototype.createThin = function(type, text) {
    var t = new CommonToken(null, type);
    t.text = text;
    return t;
};

exports.CommonTokenFactory = CommonTokenFactory;

},{"./Token":22}],11:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

//
// This class extends {@link BufferedTokenStream} with functionality to filter
// token streams to tokens on a particular channel (tokens where
// {@link Token//getChannel} returns a particular value).
//
// <p>
// This token stream provides access to all tokens by index or when calling
// methods like {@link //getText}. The channel filtering is only used for code
// accessing tokens via the lookahead methods {@link //LA}, {@link //LT}, and
// {@link //LB}.</p>
//
// <p>
// By default, tokens are placed on the default channel
// ({@link Token//DEFAULT_CHANNEL}), but may be reassigned by using the
// {@code ->channel(HIDDEN)} lexer command, or by using an embedded action to
// call {@link Lexer//setChannel}.
// </p>
//
// <p>
// Note: lexer rules which use the {@code ->skip} lexer command or call
// {@link Lexer//skip} do not produce tokens at all, so input text matched by
// such a rule will not be available as part of the token stream, regardless of
// channel.</p>
///

var Token = require('./Token').Token;
var BufferedTokenStream = require('./BufferedTokenStream').BufferedTokenStream;

function CommonTokenStream(lexer, channel) {
	BufferedTokenStream.call(this, lexer);
    this.channel = channel===undefined ? Token.DEFAULT_CHANNEL : channel;
    return this;
}

CommonTokenStream.prototype = Object.create(BufferedTokenStream.prototype);
CommonTokenStream.prototype.constructor = CommonTokenStream;

CommonTokenStream.prototype.adjustSeekIndex = function(i) {
    return this.nextTokenOnChannel(i, this.channel);
};

CommonTokenStream.prototype.LB = function(k) {
    if (k===0 || this.index-k<0) {
        return null;
    }
    var i = this.index;
    var n = 1;
    // find k good tokens looking backwards
    while (n <= k) {
        // skip off-channel tokens
        i = this.previousTokenOnChannel(i - 1, this.channel);
        n += 1;
    }
    if (i < 0) {
        return null;
    }
    return this.tokens[i];
};

CommonTokenStream.prototype.LT = function(k) {
    this.lazyInit();
    if (k === 0) {
        return null;
    }
    if (k < 0) {
        return this.LB(-k);
    }
    var i = this.index;
    var n = 1; // we know tokens[pos] is a good one
    // find k good tokens
    while (n < k) {
        // skip off-channel tokens, but make sure to not look past EOF
        if (this.sync(i + 1)) {
            i = this.nextTokenOnChannel(i + 1, this.channel);
        }
        n += 1;
    }
    return this.tokens[i];
};

// Count EOF just once.///
CommonTokenStream.prototype.getNumberOfOnChannelTokens = function() {
    var n = 0;
    this.fill();
    for (var i =0; i< this.tokens.length;i++) {
        var t = this.tokens[i];
        if( t.channel===this.channel) {
            n += 1;
        }
        if( t.type===Token.EOF) {
            break;
        }
    }
    return n;
};

exports.CommonTokenStream = CommonTokenStream;
},{"./BufferedTokenStream":9,"./Token":22}],12:[function(require,module,exports){
//
//  [The "BSD license"]
//   Copyright (c) 2012 Terence Parr
//   Copyright (c) 2012 Sam Harwell
//   Copyright (c) 2014 Eric Vergnaud
//   All rights reserved.
// 
//   Redistribution and use in source and binary forms, with or without
//   modification, are permitted provided that the following conditions
//   are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//   3. The name of the author may not be used to endorse or promote products
//      derived from this software without specific prior written permission.
// 
//   THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//   IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//   OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//   IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//   INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//   NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//   DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//   THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 

//
//  This is an InputStream that is loaded from a file all at once
//  when you construct the object.
// 
var InputStream = require('./InputStream').InputStream;
try {
	var fs = require("fs");
} catch(ex) {
	// probably running from browser, no "Node.js/fs" makes sense 
}
	
function FileStream(fileName) {
	var data = fs.readFileSync(fileName, "utf8");
	InputStream.call(this, data);
	this.fileName = fileName;
	return this;
}

FileStream.prototype = Object.create(InputStream.prototype);
FileStream.prototype.constructor = FileStream;

exports.FileStream = FileStream;

},{"./InputStream":13,"fs":1}],13:[function(require,module,exports){
// 
//  [The "BSD license"]
//   Copyright (c) 2012 Terence Parr
//   Copyright (c) 2012 Sam Harwell
//   Copyright (c) 2014 Eric Vergnaud
//   All rights reserved.
// 
//   Redistribution and use in source and binary forms, with or without
//   modification, are permitted provided that the following conditions
//   are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//   3. The name of the author may not be used to endorse or promote products
//      derived from this software without specific prior written permission.
// 
//   THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//   IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//   OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//   IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//   INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//   NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//   DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//   THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 

var Token = require('./Token').Token;

// Vacuum all input from a string and then treat it like a buffer.

function _loadString(stream) {
	stream._index = 0;
	stream.data = [];
	for (var i = 0; i < stream.strdata.length; i++) {
		stream.data.push(stream.strdata.charCodeAt(i));
	}
	stream._size = stream.data.length;
}

function InputStream(data) {
	this.name = "<empty>";
	this.strdata = data;
	_loadString(this);
	return this;
}

Object.defineProperty(InputStream.prototype, "index", {
	get : function() {
		return this._index;
	}
});

Object.defineProperty(InputStream.prototype, "size", {
	get : function() {
		return this._size;
	}
});

// Reset the stream so that it's in the same state it was
// when the object was created *except* the data array is not
// touched.
//
InputStream.prototype.reset = function() {
	this._index = 0;
};

InputStream.prototype.consume = function() {
	if (this._index >= this._size) {
		// assert this.LA(1) == Token.EOF
		throw ("cannot consume EOF");
	}
	this._index += 1;
};

InputStream.prototype.LA = function(offset) {
	if (offset === 0) {
		return 0; // undefined
	}
	if (offset < 0) {
		offset += 1; // e.g., translate LA(-1) to use offset=0
	}
	var pos = this._index + offset - 1;
	if (pos < 0 || pos >= this._size) { // invalid
		return Token.EOF;
	}
	return this.data[pos];
};

InputStream.prototype.LT = function(offset) {
	return this.LA(offset);
};

// mark/release do nothing; we have entire buffer
InputStream.prototype.mark = function() {
	return -1;
};

InputStream.prototype.release = function(marker) {
};

// consume() ahead until p==_index; can't just set p=_index as we must
// update line and column. If we seek backwards, just set p
//
InputStream.prototype.seek = function(_index) {
	if (_index <= this._index) {
		this._index = _index; // just jump; don't update stream state (line,
								// ...)
		return;
	}
	// seek forward
	this._index = Math.min(_index, this._size);
};

InputStream.prototype.getText = function(start, stop) {
	if (stop >= this._size) {
		stop = this._size - 1;
	}
	if (start >= this._size) {
		return "";
	} else {
		return this.strdata.slice(start, stop + 1);
	}
};

InputStream.prototype.toString = function() {
	return this.strdata;
};

exports.InputStream = InputStream;

},{"./Token":22}],14:[function(require,module,exports){
/*jslint smarttabs:true */

var Token = require('./Token').Token;

/* stop is not included! */
function Interval(start, stop) {
	this.start = start;
	this.stop = stop;
	return this;
}

Interval.prototype.contains = function(item) {
	return item >= this.start && item < this.stop;
};

Interval.prototype.toString = function() {
	if(this.start===this.stop-1) {
		return this.start.toString();
	} else {
		return this.start.toString() + ".." + (this.stop-1).toString();
	}
};


Object.defineProperty(Interval.prototype, "length", {
	get : function() {
		return this.stop - this.start;
	}
});

function IntervalSet() {
	this.intervals = null;
	this.readOnly = false;
}

IntervalSet.prototype.first = function(v) {
	if (this.intervals === null || this.intervals.length===0) {
		return Token.INVALID_TYPE;
	} else {
		return this.intervals[0].start;
	}
};

IntervalSet.prototype.addOne = function(v) {
	this.addInterval(new Interval(v, v + 1));
};

IntervalSet.prototype.addRange = function(l, h) {
	this.addInterval(new Interval(l, h + 1));
};

IntervalSet.prototype.addInterval = function(v) {
	if (this.intervals === null) {
		this.intervals = [];
		this.intervals.push(v);
	} else {
		// find insert pos
		for (var k = 0; k < this.intervals.length; k++) {
			var i = this.intervals[k];
			// distinct range -> insert
			if (v.stop < i.start) {
				this.intervals.splice(k, 0, v);
				return;
			}
			// contiguous range -> adjust
			else if (v.stop === i.start) {
				this.intervals[k].start = v.start;
				return;
			}
			// overlapping range -> adjust and reduce
			else if (v.start <= i.stop) {
				this.intervals[k] = new Interval(Math.min(i.start, v.start), Math.max(i.stop, v.stop));
				this.reduce(k);
				return;
			}
		}
		// greater than any existing
		this.intervals.push(v);
	}
};

IntervalSet.prototype.addSet = function(other) {
	if (other.intervals !== null) {
		for (var k = 0; k < other.intervals.length; k++) {
			var i = other.intervals[k];
			this.addInterval(new Interval(i.start, i.stop));
		}
	}
	return this;
};

IntervalSet.prototype.reduce = function(k) {
	// only need to reduce if k is not the last
	if (k < this.intervalslength - 1) {
		var l = this.intervals[k];
		var r = this.intervals[k + 1];
		// if r contained in l
		if (l.stop >= r.stop) {
			this.intervals.pop(k + 1);
			this.reduce(k);
		} else if (l.stop >= r.start) {
			this.intervals[k] = new Interval(l.start, r.stop);
			this.intervals.pop(k + 1);
		}
	}
};

IntervalSet.prototype.complement = function(start, stop) {
    var result = new IntervalSet();
    result.addInterval(new Interval(start,stop+1));
    for(var i=0; i<this.intervals.length; i++) {
        result.removeRange(this.intervals[i]);
    }
    return result;
};

IntervalSet.prototype.contains = function(item) {
	if (this.intervals === null) {
		return false;
	} else {
		for (var k = 0; k < this.intervals.length; k++) {
			if(this.intervals[k].contains(item)) {
				return true;
			}
		}
		return false;
	}
};

Object.defineProperty(IntervalSet.prototype, "length", {
	get : function() {
		var len = 0;
		this.intervals.map(function(i) {len += i.length;});
		return len;
	}
});

IntervalSet.prototype.removeRange = function(v) {
    if(v.start===v.stop-1) {
        this.removeOne(v.start);
    } else if (this.intervals!==null) {
        var k = 0;
        for(var n=0; n<this.intervals.length; n++) {
            var i = this.intervals[k];
            // intervals are ordered
            if (v.stop<=i.start) {
                return;
            }
            // check for including range, split it
            else if(v.start>i.start && v.stop<i.stop) {
                this.intervals[k] = new Interval(i.start, v.start);
                var x = new Interval(v.stop, i.stop);
                this.intervals.splice(k, 0, x);
                return;
            }
            // check for included range, remove it
            else if(v.start<=i.start && v.stop>=i.stop) {
                this.intervals.splice(k, 1);
                k = k - 1; // need another pass
            }
            // check for lower boundary
            else if(v.start<i.stop) {
                this.intervals[k] = new Interval(i.start, v.start);
            }
            // check for upper boundary
            else if(v.stop<i.stop) {
                this.intervals[k] = new Interval(v.stop, i.stop);
            }
            k += 1;
        }
    }
};

IntervalSet.prototype.removeOne = function(v) {
	if (this.intervals !== null) {
		for (var k = 0; k < this.intervals.length; k++) {
			var i = this.intervals[k];
			// intervals is ordered
			if (v < i.start) {
				return;
			}
			// check for single value range
			else if (v === i.start && v === i.stop - 1) {
				this.intervals.splice(k, 1);
				return;
			}
			// check for lower boundary
			else if (v === i.start) {
				this.intervals[k] = new Interval(i.start + 1, i.stop);
				return;
			}
			// check for upper boundary
			else if (v === i.stop - 1) {
				this.intervals[k] = new Interval(i.start, i.stop - 1);
				return;
			}
			// split existing range
			else if (v < i.stop - 1) {
				var x = new Interval(i.start, v);
				i.start = v + 1;
				this.intervals.splice(k, 0, x);
				return;
			}
		}
	}
};

IntervalSet.prototype.toString = function(literalNames, symbolicNames, elemsAreChar) {
	literalNames = literalNames || null;
	symbolicNames = symbolicNames || null;
	elemsAreChar = elemsAreChar || false;
	if (this.intervals === null) {
		return "{}";
	} else if(literalNames!==null || symbolicNames!==null) {
		return this.toTokenString(literalNames, symbolicNames);
	} else if(elemsAreChar) {
		return this.toCharString();
	} else {
		return this.toIndexString();
	}
};

IntervalSet.prototype.toCharString = function() {
	var names = [];
	for (var i = 0; i < this.intervals.length; i++) {
		var v = this.intervals[i];
		if(v.stop===v.start+1) {
			if ( v.start===Token.EOF ) {
				names.push("<EOF>");
			} else {
				names.push("'" + String.fromCharCode(v.start) + "'");
			}
		} else {
			names.push("'" + String.fromCharCode(v.start) + "'..'" + String.fromCharCode(v.stop-1) + "'");
		}
	}
	if (names.length > 1) {
		return "{" + names.join(", ") + "}";
	} else {
		return names[0];
	}
};


IntervalSet.prototype.toIndexString = function() {
	var names = [];
	for (var i = 0; i < this.intervals.length; i++) {
		var v = this.intervals[i];
		if(v.stop===v.start+1) {
			if ( v.start===Token.EOF ) {
				names.push("<EOF>");
			} else {
				names.push(v.start.toString());
			}
		} else {
			names.push(v.start.toString() + ".." + (v.stop-1).toString());
		}
	}
	if (names.length > 1) {
		return "{" + names.join(", ") + "}";
	} else {
		return names[0];
	}
};


IntervalSet.prototype.toTokenString = function(literalNames, symbolicNames) {
	var names = [];
	for (var i = 0; i < this.intervals.length; i++) {
		var v = this.intervals[i];
		for (var j = v.start; j < v.stop; j++) {
			names.push(this.elementName(literalNames, symbolicNames, j));
		}
	}
	if (names.length > 1) {
		return "{" + names.join(", ") + "}";
	} else {
		return names[0];
	}
};

IntervalSet.prototype.elementName = function(literalNames, symbolicNames, a) {
	if (a === Token.EOF) {
		return "<EOF>";
	} else if (a === Token.EPSILON) {
		return "<EPSILON>";
	} else {
		return literalNames[a] || symbolicNames[a];
	}
};

exports.Interval = Interval;
exports.IntervalSet = IntervalSet;

},{"./Token":22}],15:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

var Set = require('./Utils').Set;
var BitSet = require('./Utils').BitSet;
var Token = require('./Token').Token;
var ATNConfig = require('./atn/ATNConfig').ATNConfig;
var Interval = require('./IntervalSet').Interval;
var IntervalSet = require('./IntervalSet').IntervalSet;
var RuleStopState = require('./atn/ATNState').RuleStopState;
var RuleTransition = require('./atn/Transition').RuleTransition;
var NotSetTransition = require('./atn/Transition').NotSetTransition;
var WildcardTransition = require('./atn/Transition').WildcardTransition;
var AbstractPredicateTransition = require('./atn/Transition').AbstractPredicateTransition;

var pc = require('./PredictionContext');
var predictionContextFromRuleContext = pc.predictionContextFromRuleContext;
var PredictionContext = pc.PredictionContext;
var SingletonPredictionContext = pc.SingletonPredictionContext;

function LL1Analyzer (atn) {
    this.atn = atn;
}

//* Special value added to the lookahead sets to indicate that we hit
//  a predicate during analysis if {@code seeThruPreds==false}.
///
LL1Analyzer.HIT_PRED = Token.INVALID_TYPE;


//*
// Calculates the SLL(1) expected lookahead set for each outgoing transition
// of an {@link ATNState}. The returned array has one element for each
// outgoing transition in {@code s}. If the closure from transition
// <em>i</em> leads to a semantic predicate before matching a symbol, the
// element at index <em>i</em> of the result will be {@code null}.
//
// @param s the ATN state
// @return the expected symbols for each outgoing transition of {@code s}.
///
LL1Analyzer.prototype.getDecisionLookahead = function(s) {
    if (s === null) {
        return null;
    }
    var count = s.transitions.length;
    var look = [];
    for(var alt=0; alt< count; alt++) {
        look[alt] = new IntervalSet();
        var lookBusy = new Set();
        var seeThruPreds = false; // fail to get lookahead upon pred
        this._LOOK(s.transition(alt).target, null, PredictionContext.EMPTY,
              look[alt], lookBusy, new BitSet(), seeThruPreds, false);
        // Wipe out lookahead for this alternative if we found nothing
        // or we had a predicate when we !seeThruPreds
        if (look[alt].length===0 || look[alt].contains(LL1Analyzer.HIT_PRED)) {
            look[alt] = null;
        }
    }
    return look;
};

//*
// Compute set of tokens that can follow {@code s} in the ATN in the
// specified {@code ctx}.
//
// <p>If {@code ctx} is {@code null} and the end of the rule containing
// {@code s} is reached, {@link Token//EPSILON} is added to the result set.
// If {@code ctx} is not {@code null} and the end of the outermost rule is
// reached, {@link Token//EOF} is added to the result set.</p>
//
// @param s the ATN state
// @param stopState the ATN state to stop at. This can be a
// {@link BlockEndState} to detect epsilon paths through a closure.
// @param ctx the complete parser context, or {@code null} if the context
// should be ignored
//
// @return The set of tokens that can follow {@code s} in the ATN in the
// specified {@code ctx}.
///
LL1Analyzer.prototype.LOOK = function(s, stopState, ctx) {
    var r = new IntervalSet();
    var seeThruPreds = true; // ignore preds; get all lookahead
	ctx = ctx || null;
    var lookContext = ctx!==null ? predictionContextFromRuleContext(s.atn, ctx) : null;
    this._LOOK(s, stopState, lookContext, r, new Set(), new BitSet(), seeThruPreds, true);
    return r;
};
    
//*
// Compute set of tokens that can follow {@code s} in the ATN in the
// specified {@code ctx}.
//
// <p>If {@code ctx} is {@code null} and {@code stopState} or the end of the
// rule containing {@code s} is reached, {@link Token//EPSILON} is added to
// the result set. If {@code ctx} is not {@code null} and {@code addEOF} is
// {@code true} and {@code stopState} or the end of the outermost rule is
// reached, {@link Token//EOF} is added to the result set.</p>
//
// @param s the ATN state.
// @param stopState the ATN state to stop at. This can be a
// {@link BlockEndState} to detect epsilon paths through a closure.
// @param ctx The outer context, or {@code null} if the outer context should
// not be used.
// @param look The result lookahead set.
// @param lookBusy A set used for preventing epsilon closures in the ATN
// from causing a stack overflow. Outside code should pass
// {@code new Set<ATNConfig>} for this argument.
// @param calledRuleStack A set used for preventing left recursion in the
// ATN from causing a stack overflow. Outside code should pass
// {@code new BitSet()} for this argument.
// @param seeThruPreds {@code true} to true semantic predicates as
// implicitly {@code true} and "see through them", otherwise {@code false}
// to treat semantic predicates as opaque and add {@link //HIT_PRED} to the
// result if one is encountered.
// @param addEOF Add {@link Token//EOF} to the result if the end of the
// outermost context is reached. This parameter has no effect if {@code ctx}
// is {@code null}.
///
LL1Analyzer.prototype._LOOK = function(s, stopState , ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF) {
    var c = new ATNConfig({state:s, alt:0}, ctx);
    if (lookBusy.contains(c)) {
        return;
    }
    lookBusy.add(c);
    if (s === stopState) {
        if (ctx ===null) {
            look.addOne(Token.EPSILON);
            return;
        } else if (ctx.isEmpty() && addEOF) {
            look.addOne(Token.EOF);
            return;
        }
    }
    if (s instanceof RuleStopState ) {
        if (ctx ===null) {
            look.addOne(Token.EPSILON);
            return;
        } else if (ctx.isEmpty() && addEOF) {
            look.addOne(Token.EOF);
            return;
        }
        if (ctx !== PredictionContext.EMPTY) {
            // run thru all possible stack tops in ctx
            for(var i=0; i<ctx.length; i++) {
                var returnState = this.atn.states[ctx.getReturnState(i)];
                var removed = calledRuleStack.contains(returnState.ruleIndex);
                try {
                    calledRuleStack.remove(returnState.ruleIndex);
                    this._LOOK(returnState, stopState, ctx.getParent(i), look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                } finally {
                    if (removed) {
                        calledRuleStack.add(returnState.ruleIndex);
                    }
                }
            }
            return;
        }
    }
    for(var j=0; j<s.transitions.length; j++) {
        var t = s.transitions[j];
        if (t.constructor === RuleTransition) {
            if (calledRuleStack.contains(t.target.ruleIndex)) {
                continue;
            }
            var newContext = SingletonPredictionContext.create(ctx, t.followState.stateNumber);
            try {
                calledRuleStack.add(t.target.ruleIndex);
                this._LOOK(t.target, stopState, newContext, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
            } finally {
                calledRuleStack.remove(t.target.ruleIndex);
            }
        } else if (t instanceof AbstractPredicateTransition ) {
            if (seeThruPreds) {
                this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
            } else {
                look.addOne(LL1Analyzer.HIT_PRED);
            }
        } else if( t.isEpsilon) {
            this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
        } else if (t.constructor === WildcardTransition) {
            look.addRange( Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType );
        } else {
            var set = t.label;
            if (set !== null) {
                if (t instanceof NotSetTransition) {
                    set = set.complement(Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType);
                }
                look.addSet(set);
            }
        }
    }
};

exports.LL1Analyzer = LL1Analyzer;


},{"./IntervalSet":14,"./PredictionContext":19,"./Token":22,"./Utils":23,"./atn/ATNConfig":25,"./atn/ATNState":30,"./atn/Transition":38}],16:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  this SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  this SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

// A lexer is recognizer that draws input symbols from a character stream.
//  lexer grammars result in a subclass of this object. A Lexer object
//  uses simplified match() and error recovery mechanisms in the interest
//  of speed.
///

var Token = require('./Token').Token;
var Recognizer = require('./Recognizer').Recognizer;
var CommonTokenFactory = require('./CommonTokenFactory').CommonTokenFactory;
var LexerNoViableAltException = require('./error/Errors').LexerNoViableAltException;

function TokenSource() {
	return this;
}

function Lexer(input) {
	Recognizer.call(this);
	this._input = input;
	this._factory = CommonTokenFactory.DEFAULT;
	this._tokenFactorySourcePair = [ this, input ];

	this._interp = null; // child classes must populate this

	// The goal of all lexer rules/methods is to create a token object.
	// this is an instance variable as multiple rules may collaborate to
	// create a single token. nextToken will return this object after
	// matching lexer rule(s). If you subclass to allow multiple token
	// emissions, then set this to the last token to be matched or
	// something nonnull so that the auto token emit mechanism will not
	// emit another token.
	this._token = null;

	// What character index in the stream did the current token start at?
	// Needed, for example, to get the text for current token. Set at
	// the start of nextToken.
	this._tokenStartCharIndex = -1;

	// The line on which the first character of the token resides///
	this._tokenStartLine = -1;

	// The character position of first character within the line///
	this._tokenStartColumn = -1;

	// Once we see EOF on char stream, next token will be EOF.
	// If you have DONE : EOF ; then you see DONE EOF.
	this._hitEOF = false;

	// The channel number for the current token///
	this._channel = Token.DEFAULT_CHANNEL;

	// The token type for the current token///
	this._type = Token.INVALID_TYPE;

	this._modeStack = [];
	this._mode = Lexer.DEFAULT_MODE;

	// You can set the text for the current token to override what is in
	// the input char buffer. Use setText() or can set this instance var.
	// /
	this._text = null;

	return this;
}

Lexer.prototype = Object.create(Recognizer.prototype);
Lexer.prototype.constructor = Lexer;

Lexer.DEFAULT_MODE = 0;
Lexer.MORE = -2;
Lexer.SKIP = -3;

Lexer.DEFAULT_TOKEN_CHANNEL = Token.DEFAULT_CHANNEL;
Lexer.HIDDEN = Token.HIDDEN_CHANNEL;
Lexer.MIN_CHAR_VALUE = '\u0000';
Lexer.MAX_CHAR_VALUE = '\uFFFE';

Lexer.prototype.reset = function() {
	// wack Lexer state variables
	if (this._input !== null) {
		this._input.seek(0); // rewind the input
	}
	this._token = null;
	this._type = Token.INVALID_TYPE;
	this._channel = Token.DEFAULT_CHANNEL;
	this._tokenStartCharIndex = -1;
	this._tokenStartColumn = -1;
	this._tokenStartLine = -1;
	this._text = null;

	this._hitEOF = false;
	this._mode = Lexer.DEFAULT_MODE;
	this._modeStack = [];

	this._interp.reset();
};

// Return a token from this source; i.e., match a token on the char stream.
Lexer.prototype.nextToken = function() {
	if (this._input === null) {
		throw "nextToken requires a non-null input stream.";
	}

	// Mark start location in char stream so unbuffered streams are
	// guaranteed at least have text of current token
	var tokenStartMarker = this._input.mark();
	try {
		while (true) {
			if (this._hitEOF) {
				this.emitEOF();
				return this._token;
			}
			this._token = null;
			this._channel = Token.DEFAULT_CHANNEL;
			this._tokenStartCharIndex = this._input.index;
			this._tokenStartColumn = this._interp.column;
			this._tokenStartLine = this._interp.line;
			this._text = null;
			var continueOuter = false;
			while (true) {
				this._type = Token.INVALID_TYPE;
				var ttype = Lexer.SKIP;
				try {
					ttype = this._interp.match(this._input, this._mode);
				} catch (e) {
					this.notifyListeners(e); // report error
					this.recover(e);
				}
				if (this._input.LA(1) === Token.EOF) {
					this._hitEOF = true;
				}
				if (this._type === Token.INVALID_TYPE) {
					this._type = ttype;
				}
				if (this._type === Lexer.SKIP) {
					continueOuter = true;
					break;
				}
				if (this._type !== Lexer.MORE) {
					break;
				}
			}
			if (continueOuter) {
				continue;
			}
			if (this._token === null) {
				this.emit();
			}
			return this._token;
		}
	} finally {
		// make sure we release marker after match or
		// unbuffered char stream will keep buffering
		this._input.release(tokenStartMarker);
	}
};

// Instruct the lexer to skip creating a token for current lexer rule
// and look for another token. nextToken() knows to keep looking when
// a lexer rule finishes with token set to SKIP_TOKEN. Recall that
// if token==null at end of any token rule, it creates one for you
// and emits it.
// /
Lexer.prototype.skip = function() {
	this._type = Lexer.SKIP;
};

Lexer.prototype.more = function() {
	this._type = Lexer.MORE;
};

Lexer.prototype.mode = function(m) {
	this._mode = m;
};

Lexer.prototype.pushMode = function(m) {
	if (this._interp.debug) {
		console.log("pushMode " + m);
	}
	this._modeStack.push(this._mode);
	this.mode(m);
};

Lexer.prototype.popMode = function() {
	if (this._modeStack.length === 0) {
		throw "Empty Stack";
	}
	if (this._interp.debug) {
		console.log("popMode back to " + this._modeStack.slice(0, -1));
	}
	this.mode(this._modeStack.pop());
	return this._mode;
};

// Set the char stream and reset the lexer
Object.defineProperty(Lexer.prototype, "inputStream", {
	get : function() {
		return this._input;
	},
	set : function(input) {
		this._input = null;
		this._tokenFactorySourcePair = [ this, this._input ];
		this.reset();
		this._input = input;
		this._tokenFactorySourcePair = [ this, this._input ];
	}
});

Object.defineProperty(Lexer.prototype, "sourceName", {
	get : function sourceName() {
		return this._input.sourceName;
	}
});

// By default does not support multiple emits per nextToken invocation
// for efficiency reasons. Subclass and override this method, nextToken,
// and getToken (to push tokens into a list and pull from that list
// rather than a single variable as this implementation does).
// /
Lexer.prototype.emitToken = function(token) {
	this._token = token;
};

// The standard method called to automatically emit a token at the
// outermost lexical rule. The token object should point into the
// char buffer start..stop. If there is a text override in 'text',
// use that to set the token's text. Override this method to emit
// custom Token objects or provide a new factory.
// /
Lexer.prototype.emit = function() {
	var t = this._factory.create(this._tokenFactorySourcePair, this._type,
			this._text, this._channel, this._tokenStartCharIndex, this
					.getCharIndex() - 1, this._tokenStartLine,
			this._tokenStartColumn);
	this.emitToken(t);
	return t;
};

Lexer.prototype.emitEOF = function() {
	var cpos = this.column;
	var lpos = this.line;
	var eof = this._factory.create(this._tokenFactorySourcePair, Token.EOF,
			null, Token.DEFAULT_CHANNEL, this._input.index,
			this._input.index - 1, lpos, cpos);
	this.emitToken(eof);
	return eof;
};

Object.defineProperty(Lexer.prototype, "type", {
	get : function() {
		return this.type;
	},
	set : function(type) {
		this._type = type;
	}
});

Object.defineProperty(Lexer.prototype, "line", {
	get : function() {
		return this._interp.line;
	},
	set : function(line) {
		this._interp.line = line;
	}
});

Object.defineProperty(Lexer.prototype, "column", {
	get : function() {
		return this._interp.column;
	},
	set : function(column) {
		this._interp.column = column;
	}
});


// What is the index of the current character of lookahead?///
Lexer.prototype.getCharIndex = function() {
	return this._input.index;
};

// Return the text matched so far for the current token or any text override.
//Set the complete text of this token; it wipes any previous changes to the text.
Object.defineProperty(Lexer.prototype, "text", {
	get : function() {
		if (this._text !== null) {
			return this._text;
		} else {
			return this._interp.getText(this._input);
		}
	},
	set : function(text) {
		this._text = text;
	}
});
// Return a list of all Token objects in input char stream.
// Forces load of all tokens. Does not include EOF token.
// /
Lexer.prototype.getAllTokens = function() {
	var tokens = [];
	var t = this.nextToken();
	while (t.type !== Token.EOF) {
		tokens.push(t);
		t = this.nextToken();
	}
	return tokens;
};

Lexer.prototype.notifyListeners = function(e) {
	var start = this._tokenStartCharIndex;
	var stop = this._input.index;
	var text = this._input.getText(start, stop);
	var msg = "token recognition error at: '" + this.getErrorDisplay(text) + "'";
	var listener = this.getErrorListenerDispatch();
	listener.syntaxError(this, null, this._tokenStartLine,
			this._tokenStartColumn, msg, e);
};

Lexer.prototype.getErrorDisplay = function(s) {
	var d = [];
	for (var i = 0; i < s.length; i++) {
		d.push(s[i]);
	}
	return d.join('');
};

Lexer.prototype.getErrorDisplayForChar = function(c) {
	if (c.charCodeAt(0) === Token.EOF) {
		return "<EOF>";
	} else if (c === '\n') {
		return "\\n";
	} else if (c === '\t') {
		return "\\t";
	} else if (c === '\r') {
		return "\\r";
	} else {
		return c;
	}
};

Lexer.prototype.getCharErrorDisplay = function(c) {
	return "'" + this.getErrorDisplayForChar(c) + "'";
};

// Lexers can normally match any char in it's vocabulary after matching
// a token, so do the easy thing and just kill a character and hope
// it all works out. You can instead use the rule invocation stack
// to do sophisticated error recovery if you are in a fragment rule.
// /
Lexer.prototype.recover = function(re) {
	if (this._input.LA(1) !== Token.EOF) {
		if (re instanceof LexerNoViableAltException) {
			// skip a char and try again
			this._interp.consume(this._input);
		} else {
			// TODO: Do we lose character or line position information?
			this._input.consume();
		}
	}
};

exports.Lexer = Lexer;

},{"./CommonTokenFactory":10,"./Recognizer":20,"./Token":22,"./error/Errors":47}],17:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  this SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  this SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var Token = require('./Token').Token;
var ParseTreeListener = require('./tree/Tree').ParseTreeListener;
var Recognizer = require('./Recognizer').Recognizer;
var DefaultErrorStrategy = require('./error/ErrorStrategy').DefaultErrorStrategy;
var ATNDeserializer = require('./atn/ATNDeserializer').ATNDeserializer;
var ATNDeserializationOptions = require('./atn/ATNDeserializationOptions').ATNDeserializationOptions;

function TraceListener(parser) {
	ParseTreeListener.call(this);
    this.parser = parser;
	return this;
}

TraceListener.prototype = Object.create(ParseTreeListener);
TraceListener.prototype.constructor = TraceListener;

TraceListener.prototype.enterEveryRule = function(ctx) {
	console.log("enter   " + this.parser.ruleNames[ctx.ruleIndex] + ", LT(1)=" + this.parser._input.LT(1).text);
};

TraceListener.prototype.visitTerminal = function( node) {
	console.log("consume " + node.symbol + " rule " + this.parser.ruleNames[this.parser._ctx.ruleIndex]);
};

TraceListener.prototype.exitEveryRule = function(ctx) {
	console.log("exit    " + this.parser.ruleNames[ctx.ruleIndex] + ", LT(1)=" + this.parser._input.LT(1).text);
};

// this is all the parsing support code essentially; most of it is error
// recovery stuff.//
function Parser(input) {
	Recognizer.call(this);
	// The input stream.
	this._input = null;
	// The error handling strategy for the parser. The default value is a new
	// instance of {@link DefaultErrorStrategy}.
	this._errHandler = new DefaultErrorStrategy();
	this._precedenceStack = [];
	this._precedenceStack.push(0);
	// The {@link ParserRuleContext} object for the currently executing rule.
	// this is always non-null during the parsing process.
	this._ctx = null;
	// Specifies whether or not the parser should construct a parse tree during
	// the parsing process. The default value is {@code true}.
	this.buildParseTrees = true;
	// When {@link //setTrace}{@code (true)} is called, a reference to the
	// {@link TraceListener} is stored here so it can be easily removed in a
	// later call to {@link //setTrace}{@code (false)}. The listener itself is
	// implemented as a parser listener so this field is not directly used by
	// other parser methods.
	this._tracer = null;
	// The list of {@link ParseTreeListener} listeners registered to receive
	// events during the parse.
	this._parseListeners = null;
	// The number of syntax errors reported during parsing. this value is
	// incremented each time {@link //notifyErrorListeners} is called.
	this._syntaxErrors = 0;
	this.setInputStream(input);
	return this;
}

Parser.prototype = Object.create(Recognizer.prototype);
Parser.prototype.contructor = Parser;

// this field maps from the serialized ATN string to the deserialized {@link
// ATN} with
// bypass alternatives.
//
// @see ATNDeserializationOptions//isGenerateRuleBypassTransitions()
//
Parser.bypassAltsAtnCache = {};

// reset the parser's state//
Parser.prototype.reset = function() {
	if (this._input !== null) {
		this._input.seek(0);
	}
	this._errHandler.reset(this);
	this._ctx = null;
	this._syntaxErrors = 0;
	this.setTrace(false);
	this._precedenceStack = [];
	this._precedenceStack.push(0);
	if (this._interp !== null) {
		this._interp.reset();
	}
};

// Match current input symbol against {@code ttype}. If the symbol type
// matches, {@link ANTLRErrorStrategy//reportMatch} and {@link //consume} are
// called to complete the match process.
//
// <p>If the symbol type does not match,
// {@link ANTLRErrorStrategy//recoverInline} is called on the current error
// strategy to attempt recovery. If {@link //getBuildParseTree} is
// {@code true} and the token index of the symbol returned by
// {@link ANTLRErrorStrategy//recoverInline} is -1, the symbol is added to
// the parse tree by calling {@link ParserRuleContext//addErrorNode}.</p>
//
// @param ttype the token type to match
// @return the matched symbol
// @throws RecognitionException if the current input symbol did not match
// {@code ttype} and the error strategy could not recover from the
// mismatched symbol

Parser.prototype.match = function(ttype) {
	var t = this.getCurrentToken();
	if (t.type === ttype) {
		this._errHandler.reportMatch(this);
		this.consume();
	} else {
		t = this._errHandler.recoverInline(this);
		if (this.buildParseTrees && t.tokenIndex === -1) {
			// we must have conjured up a new token during single token
			// insertion
			// if it's not the current symbol
			this._ctx.addErrorNode(t);
		}
	}
	return t;
};
// Match current input symbol as a wildcard. If the symbol type matches
// (i.e. has a value greater than 0), {@link ANTLRErrorStrategy//reportMatch}
// and {@link //consume} are called to complete the match process.
//
// <p>If the symbol type does not match,
// {@link ANTLRErrorStrategy//recoverInline} is called on the current error
// strategy to attempt recovery. If {@link //getBuildParseTree} is
// {@code true} and the token index of the symbol returned by
// {@link ANTLRErrorStrategy//recoverInline} is -1, the symbol is added to
// the parse tree by calling {@link ParserRuleContext//addErrorNode}.</p>
//
// @return the matched symbol
// @throws RecognitionException if the current input symbol did not match
// a wildcard and the error strategy could not recover from the mismatched
// symbol

Parser.prototype.matchWildcard = function() {
	var t = this.getCurrentToken();
	if (t.type > 0) {
		this._errHandler.reportMatch(this);
		this.consume();
	} else {
		t = this._errHandler.recoverInline(this);
		if (this._buildParseTrees && t.tokenIndex === -1) {
			// we must have conjured up a new token during single token
			// insertion
			// if it's not the current symbol
			this._ctx.addErrorNode(t);
		}
	}
	return t;
};

Parser.prototype.getParseListeners = function() {
	return this._parseListeners || [];
};

// Registers {@code listener} to receive events during the parsing process.
//
// <p>To support output-preserving grammar transformations (including but not
// limited to left-recursion removal, automated left-factoring, and
// optimized code generation), calls to listener methods during the parse
// may differ substantially from calls made by
// {@link ParseTreeWalker//DEFAULT} used after the parse is complete. In
// particular, rule entry and exit events may occur in a different order
// during the parse than after the parser. In addition, calls to certain
// rule entry methods may be omitted.</p>
//
// <p>With the following specific exceptions, calls to listener events are
// <em>deterministic</em>, i.e. for identical input the calls to listener
// methods will be the same.</p>
//
// <ul>
// <li>Alterations to the grammar used to generate code may change the
// behavior of the listener calls.</li>
// <li>Alterations to the command line options passed to ANTLR 4 when
// generating the parser may change the behavior of the listener calls.</li>
// <li>Changing the version of the ANTLR Tool used to generate the parser
// may change the behavior of the listener calls.</li>
// </ul>
//
// @param listener the listener to add
//
// @throws NullPointerException if {@code} listener is {@code null}
//
Parser.prototype.addParseListener = function(listener) {
	if (listener === null) {
		throw "listener";
	}
	if (this._parseListeners === null) {
		this._parseListeners = [];
	}
	this._parseListeners.push(listener);
};

//
// Remove {@code listener} from the list of parse listeners.
//
// <p>If {@code listener} is {@code null} or has not been added as a parse
// listener, this method does nothing.</p>
// @param listener the listener to remove
//
Parser.prototype.removeParseListener = function(listener) {
	if (this._parseListeners !== null) {
		var idx = this._parseListeners.indexOf(listener);
		if (idx >= 0) {
			this._parseListeners.splice(idx, 1);
		}
		if (this._parseListeners.length === 0) {
			this._parseListeners = null;
		}
	}
};

// Remove all parse listeners.
Parser.prototype.removeParseListeners = function() {
	this._parseListeners = null;
};

// Notify any parse listeners of an enter rule event.
Parser.prototype.triggerEnterRuleEvent = function() {
	if (this._parseListeners !== null) {
        var ctx = this._ctx;
		this._parseListeners.map(function(listener) {
			listener.enterEveryRule(ctx);
			ctx.enterRule(listener);
		});
	}
};

//
// Notify any parse listeners of an exit rule event.
//
// @see //addParseListener
//
Parser.prototype.triggerExitRuleEvent = function() {
	if (this._parseListeners !== null) {
		// reverse order walk of listeners
        var ctx = this._ctx;
		this._parseListeners.slice(0).reverse().map(function(listener) {
			ctx.exitRule(listener);
			listener.exitEveryRule(ctx);
		});
	}
};

Parser.prototype.getTokenFactory = function() {
	return this._input.tokenSource._factory;
};

// Tell our token source and error strategy about a new way to create tokens.//
Parser.prototype.setTokenFactory = function(factory) {
	this._input.tokenSource._factory = factory;
};

// The ATN with bypass alternatives is expensive to create so we create it
// lazily.
//
// @throws UnsupportedOperationException if the current parser does not
// implement the {@link //getSerializedATN()} method.
//
Parser.prototype.getATNWithBypassAlts = function() {
	var serializedAtn = this.getSerializedATN();
	if (serializedAtn === null) {
		throw "The current parser does not support an ATN with bypass alternatives.";
	}
	var result = this.bypassAltsAtnCache[serializedAtn];
	if (result === null) {
		var deserializationOptions = new ATNDeserializationOptions();
		deserializationOptions.generateRuleBypassTransitions = true;
		result = new ATNDeserializer(deserializationOptions)
				.deserialize(serializedAtn);
		this.bypassAltsAtnCache[serializedAtn] = result;
	}
	return result;
};

// The preferred method of getting a tree pattern. For example, here's a
// sample use:
//
// <pre>
// ParseTree t = parser.expr();
// ParseTreePattern p = parser.compileParseTreePattern("&lt;ID&gt;+0",
// MyParser.RULE_expr);
// ParseTreeMatch m = p.match(t);
// String id = m.get("ID");
// </pre>

var Lexer = require('./Lexer').Lexer;

Parser.prototype.compileParseTreePattern = function(pattern, patternRuleIndex, lexer) {
	lexer = lexer || null;
	if (lexer === null) {
		if (this.getTokenStream() !== null) {
			var tokenSource = this.getTokenStream().getTokenSource();
			if (tokenSource instanceof Lexer) {
				lexer = tokenSource;
			}
		}
	}
	if (lexer === null) {
		throw "Parser can't discover a lexer to use";
	}
	var m = new ParseTreePatternMatcher(lexer, this);
	return m.compile(pattern, patternRuleIndex);
};

Parser.prototype.getInputStream = function() {
	return this.getTokenStream();
};

Parser.prototype.setInputStream = function(input) {
	this.setTokenStream(input);
};

Parser.prototype.getTokenStream = function() {
	return this._input;
};

// Set the token stream and reset the parser.//
Parser.prototype.setTokenStream = function(input) {
	this._input = null;
	this.reset();
	this._input = input;
};

// Match needs to return the current input symbol, which gets put
// into the label for the associated token ref; e.g., x=ID.
//
Parser.prototype.getCurrentToken = function() {
	return this._input.LT(1);
};

Parser.prototype.notifyErrorListeners = function(msg, offendingToken, err) {
	offendingToken = offendingToken || null;
	err = err || null;
	if (offendingToken === null) {
		offendingToken = this.getCurrentToken();
	}
	this._syntaxErrors += 1;
	var line = offendingToken.line;
	var column = offendingToken.column;
	var listener = this.getErrorListenerDispatch();
	listener.syntaxError(this, offendingToken, line, column, msg, err);
};

//
// Consume and return the {@linkplain //getCurrentToken current symbol}.
//
// <p>E.g., given the following input with {@code A} being the current
// lookahead symbol, this function moves the cursor to {@code B} and returns
// {@code A}.</p>
//
// <pre>
// A B
// ^
// </pre>
//
// If the parser is not in error recovery mode, the consumed symbol is added
// to the parse tree using {@link ParserRuleContext//addChild(Token)}, and
// {@link ParseTreeListener//visitTerminal} is called on any parse listeners.
// If the parser <em>is</em> in error recovery mode, the consumed symbol is
// added to the parse tree using
// {@link ParserRuleContext//addErrorNode(Token)}, and
// {@link ParseTreeListener//visitErrorNode} is called on any parse
// listeners.
//
Parser.prototype.consume = function() {
	var o = this.getCurrentToken();
	if (o.type !== Token.EOF) {
		this.getInputStream().consume();
	}
	var hasListener = this._parseListeners !== null && this._parseListeners.length > 0;
	if (this.buildParseTrees || hasListener) {
		var node;
		if (this._errHandler.inErrorRecoveryMode(this)) {
			node = this._ctx.addErrorNode(o);
		} else {
			node = this._ctx.addTokenNode(o);
		}
		if (hasListener) {
			this._parseListeners.map(function(listener) {
				listener.visitTerminal(node);
			});
		}
	}
	return o;
};

Parser.prototype.addContextToParseTree = function() {
	// add current context to parent if we have a parent
	if (this._ctx.parentCtx !== null) {
		this._ctx.parentCtx.addChild(this._ctx);
	}
};

// Always called by generated parsers upon entry to a rule. Access field
// {@link //_ctx} get the current context.

Parser.prototype.enterRule = function(localctx, state, ruleIndex) {
	this.state = state;
	this._ctx = localctx;
	this._ctx.start = this._input.LT(1);
	if (this.buildParseTrees) {
		this.addContextToParseTree();
	}
	if (this._parseListeners !== null) {
		this.triggerEnterRuleEvent();
	}
};

Parser.prototype.exitRule = function() {
	this._ctx.stop = this._input.LT(-1);
	// trigger event on _ctx, before it reverts to parent
	if (this._parseListeners !== null) {
		this.triggerExitRuleEvent();
	}
	this.state = this._ctx.invokingState;
	this._ctx = this._ctx.parentCtx;
};

Parser.prototype.enterOuterAlt = function(localctx, altNum) {
	// if we have new localctx, make sure we replace existing ctx
	// that is previous child of parse tree
	if (this.buildParseTrees && this._ctx !== localctx) {
		if (this._ctx.parentCtx !== null) {
			this._ctx.parentCtx.removeLastChild();
			this._ctx.parentCtx.addChild(localctx);
		}
	}
	this._ctx = localctx;
};

// Get the precedence level for the top-most precedence rule.
//
// @return The precedence level for the top-most precedence rule, or -1 if
// the parser context is not nested within a precedence rule.

Parser.prototype.getPrecedence = function() {
	if (this._precedenceStack.length === 0) {
		return -1;
	} else {
		return this._precedenceStack[this._precedenceStack.length-1];
	}
};

Parser.prototype.enterRecursionRule = function(localctx, state, ruleIndex,
		precedence) {
	this.state = state;
	this._precedenceStack.push(precedence);
	this._ctx = localctx;
	this._ctx.start = this._input.LT(1);
	if (this._parseListeners !== null) {
		this.triggerEnterRuleEvent(); // simulates rule entry for
										// left-recursive rules
	}
};

//
// Like {@link //enterRule} but for recursive rules.

Parser.prototype.pushNewRecursionContext = function(localctx, state, ruleIndex) {
	var previous = this._ctx;
	previous.parentCtx = localctx;
	previous.invokingState = state;
	previous.stop = this._input.LT(-1);

	this._ctx = localctx;
	this._ctx.start = previous.start;
	if (this.buildParseTrees) {
		this._ctx.addChild(previous);
	}
	if (this._parseListeners !== null) {
		this.triggerEnterRuleEvent(); // simulates rule entry for
										// left-recursive rules
	}
};

Parser.prototype.unrollRecursionContexts = function(parentCtx) {
	this._precedenceStack.pop();
	this._ctx.stop = this._input.LT(-1);
	var retCtx = this._ctx; // save current ctx (return value)
	// unroll so _ctx is as it was before call to recursive method
	if (this._parseListeners !== null) {
		while (this._ctx !== parentCtx) {
			this.triggerExitRuleEvent();
			this._ctx = this._ctx.parentCtx;
		}
	} else {
		this._ctx = parentCtx;
	}
	// hook into tree
	retCtx.parentCtx = parentCtx;
	if (this.buildParseTrees && parentCtx !== null) {
		// add return ctx into invoking rule's tree
		parentCtx.addChild(retCtx);
	}
};

Parser.prototype.getInvokingContext = function(ruleIndex) {
	var ctx = this._ctx;
	while (ctx !== null) {
		if (ctx.ruleIndex === ruleIndex) {
			return ctx;
		}
		ctx = ctx.parentCtx;
	}
	return null;
};

Parser.prototype.precpred = function(localctx, precedence) {
	return precedence >= this._precedenceStack[this._precedenceStack.length-1];
};

Parser.prototype.inContext = function(context) {
	// TODO: useful in parser?
	return false;
};

//
// Checks whether or not {@code symbol} can follow the current state in the
// ATN. The behavior of this method is equivalent to the following, but is
// implemented such that the complete context-sensitive follow set does not
// need to be explicitly constructed.
//
// <pre>
// return getExpectedTokens().contains(symbol);
// </pre>
//
// @param symbol the symbol type to check
// @return {@code true} if {@code symbol} can follow the current state in
// the ATN, otherwise {@code false}.

Parser.prototype.isExpectedToken = function(symbol) {
	var atn = this._interp.atn;
	var ctx = this._ctx;
	var s = atn.states[this.state];
	var following = atn.nextTokens(s);
	if (following.contains(symbol)) {
		return true;
	}
	if (!following.contains(Token.EPSILON)) {
		return false;
	}
	while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
		var invokingState = atn.states[ctx.invokingState];
		var rt = invokingState.transitions[0];
		following = atn.nextTokens(rt.followState);
		if (following.contains(symbol)) {
			return true;
		}
		ctx = ctx.parentCtx;
	}
	if (following.contains(Token.EPSILON) && symbol === Token.EOF) {
		return true;
	} else {
		return false;
	}
};

// Computes the set of input symbols which could follow the current parser
// state and context, as given by {@link //getState} and {@link //getContext},
// respectively.
//
// @see ATN//getExpectedTokens(int, RuleContext)
//
Parser.prototype.getExpectedTokens = function() {
	return this._interp.atn.getExpectedTokens(this.state, this._ctx);
};

Parser.prototype.getExpectedTokensWithinCurrentRule = function() {
	var atn = this._interp.atn;
	var s = atn.states[this.state];
	return atn.nextTokens(s);
};

// Get a rule's index (i.e., {@code RULE_ruleName} field) or -1 if not found.//
Parser.prototype.getRuleIndex = function(ruleName) {
	var ruleIndex = this.getRuleIndexMap()[ruleName];
	if (ruleIndex !== null) {
		return ruleIndex;
	} else {
		return -1;
	}
};

// Return List&lt;String&gt; of the rule names in your parser instance
// leading up to a call to the current rule. You could override if
// you want more details such as the file/line info of where
// in the ATN a rule is invoked.
//
// this is very useful for error messages.
//
Parser.prototype.getRuleInvocationStack = function(p) {
	p = p || null;
	if (p === null) {
		p = this._ctx;
	}
	var stack = [];
	while (p !== null) {
		// compute what follows who invoked us
		var ruleIndex = p.ruleIndex;
		if (ruleIndex < 0) {
			stack.push("n/a");
		} else {
			stack.push(this.ruleNames[ruleIndex]);
		}
		p = p.parentCtx;
	}
	return stack;
};

// For debugging and other purposes.//
Parser.prototype.getDFAStrings = function() {
	return this._interp.decisionToDFA.toString();
};
// For debugging and other purposes.//
Parser.prototype.dumpDFA = function() {
	var seenOne = false;
	for (var i = 0; i < this._interp.decisionToDFA.length; i++) {
		var dfa = this._interp.decisionToDFA[i];
		if (dfa.states.length > 0) {
			if (seenOne) {
				console.log();
			}
			this.printer.println("Decision " + dfa.decision + ":");
			this.printer.print(dfa.toString(this.literalNames, this.symbolicNames));
			seenOne = true;
		}
	}
};

/*
"			printer = function() {\r\n" +
"				this.println = function(s) { document.getElementById('output') += s + '\\n'; }\r\n" +
"				this.print = function(s) { document.getElementById('output') += s; }\r\n" +
"			};\r\n" +
*/

Parser.prototype.getSourceName = function() {
	return this._input.sourceName;
};

// During a parse is sometimes useful to listen in on the rule entry and exit
// events as well as token matches. this is for quick and dirty debugging.
//
Parser.prototype.setTrace = function(trace) {
	if (!trace) {
		this.removeParseListener(this._tracer);
		this._tracer = null;
	} else {
		if (this._tracer !== null) {
			this.removeParseListener(this._tracer);
		}
		this._tracer = new TraceListener(this);
		this.addParseListener(this._tracer);
	}
};

exports.Parser = Parser;
},{"./Lexer":16,"./Recognizer":20,"./Token":22,"./atn/ATNDeserializationOptions":27,"./atn/ATNDeserializer":28,"./error/ErrorStrategy":46,"./tree/Tree":50}],18:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

//* A rule invocation record for parsing.
//
//  Contains all of the information about the current rule not stored in the
//  RuleContext. It handles parse tree children list, Any ATN state
//  tracing, and the default values available for rule indications:
//  start, stop, rule index, current alt number, current
//  ATN state.
//
//  Subclasses made for each rule and grammar track the parameters,
//  return values, locals, and labels specific to that rule. These
//  are the objects that are returned from rules.
//
//  Note text is not an actual field of a rule return value; it is computed
//  from start and stop using the input stream's toString() method.  I
//  could add a ctor to this so that we can pass in and store the input
//  stream, but I'm not sure we want to do that.  It would seem to be undefined
//  to get the .text property anyway if the rule matches tokens from multiple
//  input streams.
//
//  I do not use getters for fields of objects that are used simply to
//  group values such as this aggregate.  The getters/setters are there to
//  satisfy the superclass interface.

var RuleContext = require('./RuleContext').RuleContext;
var Tree = require('./tree/Tree');
var INVALID_INTERVAL = Tree.INVALID_INTERVAL;
var TerminalNode = Tree.TerminalNode;
var TerminalNodeImpl = Tree.TerminalNodeImpl;
var ErrorNodeImpl = Tree.ErrorNodeImpl;
var Interval = require("./IntervalSet").Interval;

function ParserRuleContext(parent, invokingStateNumber) {
	parent = parent || null;
	invokingStateNumber = invokingStateNumber || null;
	RuleContext.call(this, parent, invokingStateNumber);
	this.ruleIndex = -1;
    // * If we are debugging or building a parse tree for a visitor,
    // we need to track all of the tokens and rule invocations associated
    // with this rule's context. This is empty for parsing w/o tree constr.
    // operation because we don't the need to track the details about
    // how we parse this rule.
    // /
    this.children = null;
    this.start = null;
    this.stop = null;
    // The exception that forced this rule to return. If the rule successfully
    // completed, this is {@code null}.
    this.exception = null;
}

ParserRuleContext.prototype = Object.create(RuleContext.prototype);
ParserRuleContext.prototype.constructor = ParserRuleContext;

// * COPY a ctx (I'm deliberately not using copy constructor)///
ParserRuleContext.prototype.copyFrom = function(ctx) {
    // from RuleContext
    this.parentCtx = ctx.parentCtx;
    this.invokingState = ctx.invokingState;
    this.children = null;
    this.start = ctx.start;
    this.stop = ctx.stop;
};

// Double dispatch methods for listeners
ParserRuleContext.prototype.enterRule = function(listener) {
};

ParserRuleContext.prototype.exitRule = function(listener) {
};

// * Does not set parent link; other add methods do that///
ParserRuleContext.prototype.addChild = function(child) {
    if (this.children === null) {
        this.children = [];
    }
    this.children.push(child);
    return child;
};

// * Used by enterOuterAlt to toss out a RuleContext previously added as
// we entered a rule. If we have // label, we will need to remove
// generic ruleContext object.
// /
ParserRuleContext.prototype.removeLastChild = function() {
    if (this.children !== null) {
        this.children.pop();
    }
};

ParserRuleContext.prototype.addTokenNode = function(token) {
    var node = new TerminalNodeImpl(token);
    this.addChild(node);
    node.parentCtx = this;
    return node;
};

ParserRuleContext.prototype.addErrorNode = function(badToken) {
    var node = new ErrorNodeImpl(badToken);
    this.addChild(node);
    node.parentCtx = this;
    return node;
};

ParserRuleContext.prototype.getChild = function(i, type) {
	type = type || null;
	if (type === null) {
		return this.children.length>=i ? this.children[i] : null;
	} else {
		for(var j=0; j<this.children.length; j++) {
			var child = this.children[j];
			if(child instanceof type) {
				if(i===0) {
					return child;
				} else {
					i -= 1;
				}
			}
		}
		return null;
    }
};


ParserRuleContext.prototype.getToken = function(ttype, i) {
	for(var j=0; j<this.children.length; j++) {
		var child = this.children[j];
		if (child instanceof TerminalNode) {
			if (child.symbol.type === ttype) {
				if(i===0) {
					return child;
				} else {
					i -= 1;
				}
			}
        }
	}
    return null;
};

ParserRuleContext.prototype.getTokens = function(ttype ) {
    if (this.children=== null) {
        return [];
    } else {
		var tokens = [];
		for(var j=0; j<this.children.length; j++) {
			var child = this.children[j];
			if (child instanceof TerminalNode) {
				if (child.symbol.type === ttype) {
					tokens.push(child);
				}
			}
		}
		return tokens;
    }
};

ParserRuleContext.prototype.getTypedRuleContext = function(ctxType, i) {
    return this.getChild(i, ctxType);
};

ParserRuleContext.prototype.getTypedRuleContexts = function(ctxType) {
    if (this.children=== null) {
        return [];
    } else {
		var contexts = [];
		for(var j=0; j<this.children.length; j++) {
			var child = this.children[j];
			if (child instanceof ctxType) {
				contexts.push(child);
			}
		}
		return contexts;
	}
};

ParserRuleContext.prototype.getChildCount = function() {
	if (this.children=== null) {
		return 0;
	} else {
		return this.children.length;
	}
};

ParserRuleContext.prototype.getSourceInterval = function() {
    if( this.start === null || this.stop === null) {
        return INVALID_INTERVAL;
    } else {
        return Interval(this.start.tokenIndex, this.stop.tokenIndex);
    }
};

RuleContext.EMPTY = new ParserRuleContext();

function InterpreterRuleContext(parent, invokingStateNumber, ruleIndex) {
	ParserRuleContext.call(parent, invokingStateNumber);
    this.ruleIndex = ruleIndex;
    return this;
}

InterpreterRuleContext.prototype = Object.create(ParserRuleContext.prototype);
InterpreterRuleContext.prototype.constructor = InterpreterRuleContext;

exports.ParserRuleContext = ParserRuleContext;
},{"./IntervalSet":14,"./RuleContext":21,"./tree/Tree":50}],19:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

var RuleContext = require('./RuleContext').RuleContext;

function PredictionContext(cachedHashString) {
	this.cachedHashString = cachedHashString;
}

// Represents {@code $} in local context prediction, which means wildcard.
// {@code//+x =//}.
// /
PredictionContext.EMPTY = null;

// Represents {@code $} in an array in full context mode, when {@code $}
// doesn't mean wildcard: {@code $ + x = [$,x]}. Here,
// {@code $} = {@link //EMPTY_RETURN_STATE}.
// /
PredictionContext.EMPTY_RETURN_STATE = 0x7FFFFFFF;

PredictionContext.globalNodeCount = 1;
PredictionContext.id = PredictionContext.globalNodeCount;

// Stores the computed hash code of this {@link PredictionContext}. The hash
// code is computed in parts to match the following reference algorithm.
//
// <pre>
// private int referenceHashCode() {
// int hash = {@link MurmurHash//initialize MurmurHash.initialize}({@link
// //INITIAL_HASH});
//
// for (int i = 0; i &lt; {@link //size()}; i++) {
// hash = {@link MurmurHash//update MurmurHash.update}(hash, {@link //getParent
// getParent}(i));
// }
//
// for (int i = 0; i &lt; {@link //size()}; i++) {
// hash = {@link MurmurHash//update MurmurHash.update}(hash, {@link
// //getReturnState getReturnState}(i));
// }
//
// hash = {@link MurmurHash//finish MurmurHash.finish}(hash, 2// {@link
// //size()});
// return hash;
// }
// </pre>
// /

// This means only the {@link //EMPTY} context is in set.
PredictionContext.prototype.isEmpty = function() {
	return this === PredictionContext.EMPTY;
};

PredictionContext.prototype.hasEmptyPath = function() {
	return this.getReturnState(this.length - 1) === PredictionContext.EMPTY_RETURN_STATE;
};

PredictionContext.prototype.hashString = function() {
	return this.cachedHashString;
};

function calculateHashString(parent, returnState) {
	return "" + parent + returnState;
}

function calculateEmptyHashString() {
	return "";
}

// Used to cache {@link PredictionContext} objects. Its used for the shared
// context cash associated with contexts in DFA states. This cache
// can be used for both lexers and parsers.

function PredictionContextCache() {
	this.cache = {};
	return this;
}

// Add a context to the cache and return it. If the context already exists,
// return that one instead and do not add a new context to the cache.
// Protect shared cache from unsafe thread access.
//
PredictionContextCache.prototype.add = function(ctx) {
	if (ctx === PredictionContext.EMPTY) {
		return PredictionContext.EMPTY;
	}
	var existing = this.cache[ctx];
	if (existing !== null) {
		return existing;
	}
	this.cache[ctx] = ctx;
	return ctx;
};

PredictionContextCache.prototype.get = function(ctx) {
	return this.cache[ctx] || null;
};

Object.defineProperty(PredictionContextCache.prototype, "length", {
	get : function() {
		return this.cache.length;
	}
});

function SingletonPredictionContext(parent, returnState) {
	var hashString = parent !== null ? calculateHashString(parent, returnState)
			: calculateEmptyHashString();
	PredictionContext.call(this, hashString);
	this.parentCtx = parent;
	this.returnState = returnState;
}

SingletonPredictionContext.prototype = Object.create(PredictionContext.prototype);
SingletonPredictionContext.prototype.contructor = SingletonPredictionContext;

SingletonPredictionContext.create = function(parent, returnState) {
	if (returnState === PredictionContext.EMPTY_RETURN_STATE && parent === null) {
		// someone can pass in the bits of an array ctx that mean $
		return PredictionContext.EMPTY;
	} else {
		return new SingletonPredictionContext(parent, returnState);
	}
};

Object.defineProperty(SingletonPredictionContext.prototype, "length", {
	get : function() {
		return 1;
	}
});

SingletonPredictionContext.prototype.getParent = function(index) {
	return this.parentCtx;
};

SingletonPredictionContext.prototype.getReturnState = function(index) {
	return this.returnState;
};

SingletonPredictionContext.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof SingletonPredictionContext)) {
		return false;
	} else if (this.hashString() !== other.hashString()) {
		return false; // can't be same if hash is different
	} else {
		if(this.returnState !== other.returnState)
            return false;
        else if(this.parentCtx==null)
            return other.parentCtx==null
		else
            return this.parentCtx.equals(other.parentCtx);
	}
};

SingletonPredictionContext.prototype.hashString = function() {
	return this.cachedHashString;
};

SingletonPredictionContext.prototype.toString = function() {
	var up = this.parentCtx === null ? "" : this.parentCtx.toString();
	if (up.length === 0) {
		if (this.returnState === this.EMPTY_RETURN_STATE) {
			return "$";
		} else {
			return "" + this.returnState;
		}
	} else {
		return "" + this.returnState + " " + up;
	}
};

function EmptyPredictionContext() {
	SingletonPredictionContext.call(this, null, PredictionContext.EMPTY_RETURN_STATE);
	return this;
}

EmptyPredictionContext.prototype = Object.create(SingletonPredictionContext.prototype);
EmptyPredictionContext.prototype.constructor = EmptyPredictionContext;

EmptyPredictionContext.prototype.isEmpty = function() {
	return true;
};

EmptyPredictionContext.prototype.getParent = function(index) {
	return null;
};

EmptyPredictionContext.prototype.getReturnState = function(index) {
	return this.returnState;
};

EmptyPredictionContext.prototype.equals = function(other) {
	return this === other;
};

EmptyPredictionContext.prototype.toString = function() {
	return "$";
};

PredictionContext.EMPTY = new EmptyPredictionContext();

function ArrayPredictionContext(parents, returnStates) {
	// Parent can be null only if full ctx mode and we make an array
	// from {@link //EMPTY} and non-empty. We merge {@link //EMPTY} by using
	// null parent and
	// returnState == {@link //EMPTY_RETURN_STATE}.
	var hash = calculateHashString(parents, returnStates);
	PredictionContext.call(this, hash);
	this.parents = parents;
	this.returnStates = returnStates;
	return this;
}

ArrayPredictionContext.prototype = Object.create(PredictionContext.prototype);
ArrayPredictionContext.prototype.constructor = ArrayPredictionContext;

ArrayPredictionContext.prototype.isEmpty = function() {
	// since EMPTY_RETURN_STATE can only appear in the last position, we
	// don't need to verify that size==1
	return this.returnStates[0] === PredictionContext.EMPTY_RETURN_STATE;
};

Object.defineProperty(ArrayPredictionContext.prototype, "length", {
	get : function() {
		return this.returnStates.length;
	}
});

ArrayPredictionContext.prototype.getParent = function(index) {
	return this.parents[index];
};

ArrayPredictionContext.prototype.getReturnState = function(index) {
	return this.returnStates[index];
};

ArrayPredictionContext.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof ArrayPredictionContext)) {
		return false;
	} else if (this.hashString !== other.hashString()) {
		return false; // can't be same if hash is different
	} else {
		return this.returnStates === other.returnStates &&
				this.parents === other.parents;
	}
};

ArrayPredictionContext.prototype.toString = function() {
	if (this.isEmpty()) {
		return "[]";
	} else {
		var s = "[";
		for (var i = 0; i < this.returnStates.length; i++) {
			if (i > 0) {
				s = s + ", ";
			}
			if (this.returnStates[i] === PredictionContext.EMPTY_RETURN_STATE) {
				s = s + "$";
				continue;
			}
			s = s + this.returnStates[i];
			if (this.parents[i] !== null) {
				s = s + " " + this.parents[i];
			} else {
				s = s + "null";
			}
		}
		return s + "]";
	}
};

// Convert a {@link RuleContext} tree to a {@link PredictionContext} graph.
// Return {@link //EMPTY} if {@code outerContext} is empty or null.
// /
function predictionContextFromRuleContext(atn, outerContext) {
	if (outerContext === undefined || outerContext === null) {
		outerContext = RuleContext.EMPTY;
	}
	// if we are in RuleContext of start rule, s, then PredictionContext
	// is EMPTY. Nobody called us. (if we are empty, return empty)
	if (outerContext.parentCtx === null || outerContext === RuleContext.EMPTY) {
		return PredictionContext.EMPTY;
	}
	// If we have a parent, convert it to a PredictionContext graph
	var parent = predictionContextFromRuleContext(atn, outerContext.parentCtx);
	var state = atn.states[outerContext.invokingState];
	var transition = state.transitions[0];
	return SingletonPredictionContext.create(parent, transition.followState.stateNumber);
}

function calculateListsHashString(parents, returnStates) {
	var s = "";
	parents.map(function(p) {
		s = s + p;
	});
	returnStates.map(function(r) {
		s = s + r;
	});
	return s;
}

function merge(a, b, rootIsWildcard, mergeCache) {
	// share same graph if both same
	if (a === b) {
		return a;
	}
	if (a instanceof SingletonPredictionContext && b instanceof SingletonPredictionContext) {
		return mergeSingletons(a, b, rootIsWildcard, mergeCache);
	}
	// At least one of a or b is array
	// If one is $ and rootIsWildcard, return $ as// wildcard
	if (rootIsWildcard) {
		if (a instanceof EmptyPredictionContext) {
			return a;
		}
		if (b instanceof EmptyPredictionContext) {
			return b;
		}
	}
	// convert singleton so both are arrays to normalize
	if (a instanceof SingletonPredictionContext) {
		a = new ArrayPredictionContext([a.getParent()], [a.returnState]);
	}
	if (b instanceof SingletonPredictionContext) {
		b = new ArrayPredictionContext([b.getParent()], [b.returnState]);
	}
	return mergeArrays(a, b, rootIsWildcard, mergeCache);
}

//
// Merge two {@link SingletonPredictionContext} instances.
//
// <p>Stack tops equal, parents merge is same; return left graph.<br>
// <embed src="images/SingletonMerge_SameRootSamePar.svg"
// type="image/svg+xml"/></p>
//
// <p>Same stack top, parents differ; merge parents giving array node, then
// remainders of those graphs. A new root node is created to point to the
// merged parents.<br>
// <embed src="images/SingletonMerge_SameRootDiffPar.svg"
// type="image/svg+xml"/></p>
//
// <p>Different stack tops pointing to same parent. Make array node for the
// root where both element in the root point to the same (original)
// parent.<br>
// <embed src="images/SingletonMerge_DiffRootSamePar.svg"
// type="image/svg+xml"/></p>
//
// <p>Different stack tops pointing to different parents. Make array node for
// the root where each element points to the corresponding original
// parent.<br>
// <embed src="images/SingletonMerge_DiffRootDiffPar.svg"
// type="image/svg+xml"/></p>
//
// @param a the first {@link SingletonPredictionContext}
// @param b the second {@link SingletonPredictionContext}
// @param rootIsWildcard {@code true} if this is a local-context merge,
// otherwise false to indicate a full-context merge
// @param mergeCache
// /
function mergeSingletons(a, b, rootIsWildcard, mergeCache) {
	if (mergeCache !== null) {
		var previous = mergeCache.get(a, b);
		if (previous !== null) {
			return previous;
		}
		previous = mergeCache.get(b, a);
		if (previous !== null) {
			return previous;
		}
	}

	var rootMerge = mergeRoot(a, b, rootIsWildcard);
	if (rootMerge !== null) {
		if (mergeCache !== null) {
			mergeCache.set(a, b, rootMerge);
		}
		return rootMerge;
	}
	if (a.returnState === b.returnState) {
		var parent = merge(a.parentCtx, b.parentCtx, rootIsWildcard, mergeCache);
		// if parent is same as existing a or b parent or reduced to a parent,
		// return it
		if (parent === a.parentCtx) {
			return a; // ax + bx = ax, if a=b
		}
		if (parent === b.parentCtx) {
			return b; // ax + bx = bx, if a=b
		}
		// else: ax + ay = a'[x,y]
		// merge parents x and y, giving array node with x,y then remainders
		// of those graphs. dup a, a' points at merged array
		// new joined parent so create new singleton pointing to it, a'
		var spc = SingletonPredictionContext.create(parent, a.returnState);
		if (mergeCache !== null) {
			mergeCache.set(a, b, spc);
		}
		return spc;
	} else { // a != b payloads differ
		// see if we can collapse parents due to $+x parents if local ctx
		var singleParent = null;
		if (a === b || (a.parentCtx !== null && a.parentCtx === b.parentCtx)) { // ax +
																				// bx =
																				// [a,b]x
			singleParent = a.parentCtx;
		}
		if (singleParent !== null) { // parents are same
			// sort payloads and use same parent
			var payloads = [ a.returnState, b.returnState ];
			if (a.returnState > b.returnState) {
				payloads[0] = b.returnState;
				payloads[1] = a.returnState;
			}
			var parents = [ singleParent, singleParent ];
			var apc = new ArrayPredictionContext(parents, payloads);
			if (mergeCache !== null) {
				mergeCache.set(a, b, apc);
			}
			return apc;
		}
		// parents differ and can't merge them. Just pack together
		// into array; can't merge.
		// ax + by = [ax,by]
		var payloads = [ a.returnState, b.returnState ];
		var parents = [ a.parentCtx, b.parentCtx ];
		if (a.returnState > b.returnState) { // sort by payload
			payloads[0] = b.returnState;
			payloads[1] = a.returnState;
			parents = [ b.parentCtx, a.parentCtx ];
		}
		var a_ = new ArrayPredictionContext(parents, payloads);
		if (mergeCache !== null) {
			mergeCache.set(a, b, a_);
		}
		return a_;
	}
}

//
// Handle case where at least one of {@code a} or {@code b} is
// {@link //EMPTY}. In the following diagrams, the symbol {@code $} is used
// to represent {@link //EMPTY}.
//
// <h2>Local-Context Merges</h2>
//
// <p>These local-context merge operations are used when {@code rootIsWildcard}
// is true.</p>
//
// <p>{@link //EMPTY} is superset of any graph; return {@link //EMPTY}.<br>
// <embed src="images/LocalMerge_EmptyRoot.svg" type="image/svg+xml"/></p>
//
// <p>{@link //EMPTY} and anything is {@code //EMPTY}, so merged parent is
// {@code //EMPTY}; return left graph.<br>
// <embed src="images/LocalMerge_EmptyParent.svg" type="image/svg+xml"/></p>
//
// <p>Special case of last merge if local context.<br>
// <embed src="images/LocalMerge_DiffRoots.svg" type="image/svg+xml"/></p>
//
// <h2>Full-Context Merges</h2>
//
// <p>These full-context merge operations are used when {@code rootIsWildcard}
// is false.</p>
//
// <p><embed src="images/FullMerge_EmptyRoots.svg" type="image/svg+xml"/></p>
//
// <p>Must keep all contexts; {@link //EMPTY} in array is a special value (and
// null parent).<br>
// <embed src="images/FullMerge_EmptyRoot.svg" type="image/svg+xml"/></p>
//
// <p><embed src="images/FullMerge_SameRoot.svg" type="image/svg+xml"/></p>
//
// @param a the first {@link SingletonPredictionContext}
// @param b the second {@link SingletonPredictionContext}
// @param rootIsWildcard {@code true} if this is a local-context merge,
// otherwise false to indicate a full-context merge
// /
function mergeRoot(a, b, rootIsWildcard) {
	if (rootIsWildcard) {
		if (a === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY; // // + b =//
		}
		if (b === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY; // a +// =//
		}
	} else {
		if (a === PredictionContext.EMPTY && b === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY; // $ + $ = $
		} else if (a === PredictionContext.EMPTY) { // $ + x = [$,x]
			var payloads = [ b.returnState,
					PredictionContext.EMPTY_RETURN_STATE ];
			var parents = [ b.parentCtx, null ];
			return new ArrayPredictionContext(parents, payloads);
		} else if (b === PredictionContext.EMPTY) { // x + $ = [$,x] ($ is always first if present)
			var payloads = [ a.returnState, PredictionContext.EMPTY_RETURN_STATE ];
			var parents = [ a.parentCtx, null ];
			return new ArrayPredictionContext(parents, payloads);
		}
	}
	return null;
}

//
// Merge two {@link ArrayPredictionContext} instances.
//
// <p>Different tops, different parents.<br>
// <embed src="images/ArrayMerge_DiffTopDiffPar.svg" type="image/svg+xml"/></p>
//
// <p>Shared top, same parents.<br>
// <embed src="images/ArrayMerge_ShareTopSamePar.svg" type="image/svg+xml"/></p>
//
// <p>Shared top, different parents.<br>
// <embed src="images/ArrayMerge_ShareTopDiffPar.svg" type="image/svg+xml"/></p>
//
// <p>Shared top, all shared parents.<br>
// <embed src="images/ArrayMerge_ShareTopSharePar.svg"
// type="image/svg+xml"/></p>
//
// <p>Equal tops, merge parents and reduce top to
// {@link SingletonPredictionContext}.<br>
// <embed src="images/ArrayMerge_EqualTop.svg" type="image/svg+xml"/></p>
// /
function mergeArrays(a, b, rootIsWildcard, mergeCache) {
	if (mergeCache !== null) {
		var previous = mergeCache.get(a, b);
		if (previous !== null) {
			return previous;
		}
		previous = mergeCache.get(b, a);
		if (previous !== null) {
			return previous;
		}
	}
	// merge sorted payloads a + b => M
	var i = 0; // walks a
	var j = 0; // walks b
	var k = 0; // walks target M array

	var mergedReturnStates = [];
	var mergedParents = [];
	// walk and merge to yield mergedParents, mergedReturnStates
	while (i < a.returnStates.length && j < b.returnStates.length) {
		var a_parent = a.parents[i];
		var b_parent = b.parents[j];
		if (a.returnStates[i] === b.returnStates[j]) {
			// same payload (stack tops are equal), must yield merged singleton
			var payload = a.returnStates[i];
			// $+$ = $
			var bothDollars = payload === PredictionContext.EMPTY_RETURN_STATE &&
					a_parent === null && b_parent === null;
			var ax_ax = (a_parent !== null && b_parent !== null && a_parent === b_parent); // ax+ax
																							// ->
																							// ax
			if (bothDollars || ax_ax) {
				mergedParents[k] = a_parent; // choose left
				mergedReturnStates[k] = payload;
			} else { // ax+ay -> a'[x,y]
				var mergedParent = merge(a_parent, b_parent, rootIsWildcard, mergeCache);
				mergedParents[k] = mergedParent;
				mergedReturnStates[k] = payload;
			}
			i += 1; // hop over left one as usual
			j += 1; // but also skip one in right side since we merge
		} else if (a.returnStates[i] < b.returnStates[j]) { // copy a[i] to M
			mergedParents[k] = a_parent;
			mergedReturnStates[k] = a.returnStates[i];
			i += 1;
		} else { // b > a, copy b[j] to M
			mergedParents[k] = b_parent;
			mergedReturnStates[k] = b.returnStates[j];
			j += 1;
		}
		k += 1;
	}
	// copy over any payloads remaining in either array
	if (i < a.returnStates.length) {
		for (var p = i; p < a.returnStates.length; p++) {
			mergedParents[k] = a.parents[p];
			mergedReturnStates[k] = a.returnStates[p];
			k += 1;
		}
	} else {
		for (var p = j; p < b.returnStates.length; p++) {
			mergedParents[k] = b.parents[p];
			mergedReturnStates[k] = b.returnStates[p];
			k += 1;
		}
	}
	// trim merged if we combined a few that had same stack tops
	if (k < mergedParents.length) { // write index < last position; trim
		if (k === 1) { // for just one merged element, return singleton top
			var a_ = SingletonPredictionContext.create(mergedParents[0],
					mergedReturnStates[0]);
			if (mergeCache !== null) {
				mergeCache.set(a, b, a_);
			}
			return a_;
		}
		mergedParents = mergedParents.slice(0, k);
		mergedReturnStates = mergedReturnStates.slice(0, k);
	}

	var M = new ArrayPredictionContext(mergedParents, mergedReturnStates);

	// if we created same array as a or b, return that instead
	// TODO: track whether this is possible above during merge sort for speed
	if (M === a) {
		if (mergeCache !== null) {
			mergeCache.set(a, b, a);
		}
		return a;
	}
	if (M === b) {
		if (mergeCache !== null) {
			mergeCache.set(a, b, b);
		}
		return b;
	}
	combineCommonParents(mergedParents);

	if (mergeCache !== null) {
		mergeCache.set(a, b, M);
	}
	return M;
}

//
// Make pass over all <em>M</em> {@code parents}; merge any {@code equals()}
// ones.
// /
function combineCommonParents(parents) {
	var uniqueParents = {};

	for (var p = 0; p < parents.length; p++) {
		var parent = parents[p];
		if (!(parent in uniqueParents)) {
			uniqueParents[parent] = parent;
		}
	}
	for (var q = 0; q < parents.length; q++) {
		parents[q] = uniqueParents[parents[q]];
	}
}

function getCachedPredictionContext(context, contextCache, visited) {
	if (context.isEmpty()) {
		return context;
	}
	var existing = visited[context] || null;
	if (existing !== null) {
		return existing;
	}
	existing = contextCache.get(context);
	if (existing !== null) {
		visited[context] = existing;
		return existing;
	}
	var changed = false;
	var parents = [];
	for (var i = 0; i < parents.length; i++) {
		var parent = getCachedPredictionContext(context.getParent(i), contextCache, visited);
		if (changed || parent !== context.getParent(i)) {
			if (!changed) {
				parents = [];
				for (var j = 0; j < context.length; j++) {
					parents[j] = context.getParent(j);
				}
				changed = true;
			}
			parents[i] = parent;
		}
	}
	if (!changed) {
		contextCache.add(context);
		visited[context] = context;
		return context;
	}
	var updated = null;
	if (parents.length === 0) {
		updated = PredictionContext.EMPTY;
	} else if (parents.length === 1) {
		updated = SingletonPredictionContext.create(parents[0], context
				.getReturnState(0));
	} else {
		updated = new ArrayPredictionContext(parents, context.returnStates);
	}
	contextCache.add(updated);
	visited[updated] = updated;
	visited[context] = updated;

	return updated;
}

// ter's recursive version of Sam's getAllNodes()
function getAllContextNodes(context, nodes, visited) {
	if (nodes === null) {
		nodes = [];
		return getAllContextNodes(context, nodes, visited);
	} else if (visited === null) {
		visited = {};
		return getAllContextNodes(context, nodes, visited);
	} else {
		if (context === null || visited[context] !== null) {
			return nodes;
		}
		visited[context] = context;
		nodes.push(context);
		for (var i = 0; i < context.length; i++) {
			getAllContextNodes(context.getParent(i), nodes, visited);
		}
		return nodes;
	}
}

exports.merge = merge;
exports.PredictionContext = PredictionContext;
exports.PredictionContextCache = PredictionContextCache;
exports.SingletonPredictionContext = SingletonPredictionContext;
exports.predictionContextFromRuleContext = predictionContextFromRuleContext;
exports.getCachedPredictionContext = getCachedPredictionContext;

},{"./RuleContext":21}],20:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

var Token = require('./Token').Token;
var ConsoleErrorListener = require('./error/ErrorListener').ConsoleErrorListener;
var ProxyErrorListener = require('./error/ErrorListener').ProxyErrorListener;

function Recognizer() {
    this._listeners = [ ConsoleErrorListener.INSTANCE ];
    this._interp = null;
    this._stateNumber = -1;
    return this;
}

Recognizer.tokenTypeMapCache = {};
Recognizer.ruleIndexMapCache = {};


Recognizer.prototype.checkVersion = function(toolVersion) {
    var runtimeVersion = "4.5";
    if (runtimeVersion!==toolVersion) {
        console.log("ANTLR runtime and generated code versions disagree: "+runtimeVersion+"!="+toolVersion);
    }
};

Recognizer.prototype.addErrorListener = function(listener) {
    this._listeners.push(listener);
};

Recognizer.prototype.removeErrorListeners = function() {
    this._listeners = [];
};

Recognizer.prototype.getTokenTypeMap = function() {
    var tokenNames = this.getTokenNames();
    if (tokenNames===null) {
        throw("The current recognizer does not provide a list of token names.");
    }
    var result = this.tokenTypeMapCache[tokenNames];
    if(result===undefined) {
        result = tokenNames.reduce(function(o, k, i) { o[k] = i; });
        result.EOF = Token.EOF;
        this.tokenTypeMapCache[tokenNames] = result;
    }
    return result;
};

// Get a map from rule names to rule indexes.
//
// <p>Used for XPath and tree pattern compilation.</p>
//
Recognizer.prototype.getRuleIndexMap = function() {
    var ruleNames = this.getRuleNames();
    if (ruleNames===null) {
        throw("The current recognizer does not provide a list of rule names.");
    }
    var result = this.ruleIndexMapCache[ruleNames];
    if(result===undefined) {
        result = ruleNames.reduce(function(o, k, i) { o[k] = i; });
        this.ruleIndexMapCache[ruleNames] = result;
    }
    return result;
};

Recognizer.prototype.getTokenType = function(tokenName) {
    var ttype = this.getTokenTypeMap()[tokenName];
    if (ttype !==undefined) {
        return ttype;
    } else {
        return Token.INVALID_TYPE;
    }
};


// What is the error header, normally line/character position information?//
Recognizer.prototype.getErrorHeader = function(e) {
    var line = e.getOffendingToken().line;
    var column = e.getOffendingToken().column;
    return "line " + line + ":" + column;
};


// How should a token be displayed in an error message? The default
//  is to display just the text, but during development you might
//  want to have a lot of information spit out.  Override in that case
//  to use t.toString() (which, for CommonToken, dumps everything about
//  the token). This is better than forcing you to override a method in
//  your token objects because you don't have to go modify your lexer
//  so that it creates a new Java type.
//
// @deprecated This method is not called by the ANTLR 4 Runtime. Specific
// implementations of {@link ANTLRErrorStrategy} may provide a similar
// feature when necessary. For example, see
// {@link DefaultErrorStrategy//getTokenErrorDisplay}.
//
Recognizer.prototype.getTokenErrorDisplay = function(t) {
    if (t===null) {
        return "<no token>";
    }
    var s = t.text;
    if (s===null) {
        if (t.type===Token.EOF) {
            s = "<EOF>";
        } else {
            s = "<" + t.type + ">";
        }
    }
    s = s.replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");
    return "'" + s + "'";
};

Recognizer.prototype.getErrorListenerDispatch = function() {
    return new ProxyErrorListener(this._listeners);
};

// subclass needs to override these if there are sempreds or actions
// that the ATN interp needs to execute
Recognizer.prototype.sempred = function(localctx, ruleIndex, actionIndex) {
    return true;
};

Recognizer.prototype.precpred = function(localctx , precedence) {
    return true;
};

//Indicate that the recognizer has changed internal state that is
//consistent with the ATN state passed in.  This way we always know
//where we are in the ATN as the parser goes along. The rule
//context objects form a stack that lets us see the stack of
//invoking rules. Combine this and we have complete ATN
//configuration information.

Object.defineProperty(Recognizer.prototype, "state", {
	get : function() {
		return this._stateNumber;
	},
	set : function(state) {
		this._stateNumber = state;
	}
});


exports.Recognizer = Recognizer;

},{"./Token":22,"./error/ErrorListener":45}],21:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

//  A rule context is a record of a single rule invocation. It knows
//  which context invoked it, if any. If there is no parent context, then
//  naturally the invoking state is not valid.  The parent link
//  provides a chain upwards from the current rule invocation to the root
//  of the invocation tree, forming a stack. We actually carry no
//  information about the rule associated with this context (except
//  when parsing). We keep only the state number of the invoking state from
//  the ATN submachine that invoked this. Contrast this with the s
//  pointer inside ParserRuleContext that tracks the current state
//  being "executed" for the current rule.
//
//  The parent contexts are useful for computing lookahead sets and
//  getting error information.
//
//  These objects are used during parsing and prediction.
//  For the special case of parsers, we use the subclass
//  ParserRuleContext.
//
//  @see ParserRuleContext
///

var RuleNode = require('./tree/Tree').RuleNode;
var INVALID_INTERVAL = require('./tree/Tree').INVALID_INTERVAL;

function RuleContext(parent, invokingState) {
	RuleNode.call(this);
	// What context invoked this rule?
	this.parentCtx = parent || null;
	// What state invoked the rule associated with this context?
	// The "return address" is the followState of invokingState
	// If parent is null, this should be -1.
	this.invokingState = invokingState || -1;
	return this;
}

RuleContext.prototype = Object.create(RuleNode.prototype);
RuleContext.prototype.constructor = RuleContext;

RuleContext.prototype.depth = function() {
	var n = 0;
	var p = this;
	while (p !== null) {
		p = p.parentCtx;
		n += 1;
	}
	return n;
};

// A context is empty if there is no invoking state; meaning nobody call
// current context.
RuleContext.prototype.isEmpty = function() {
	return this.invokingState === -1;
};

// satisfy the ParseTree / SyntaxTree interface

RuleContext.prototype.getSourceInterval = function() {
	return INVALID_INTERVAL;
};

RuleContext.prototype.getRuleContext = function() {
	return this;
};

RuleContext.prototype.getPayload = function() {
	return this;
};

// Return the combined text of all child nodes. This method only considers
// tokens which have been added to the parse tree.
// <p>
// Since tokens on hidden channels (e.g. whitespace or comments) are not
// added to the parse trees, they will not appear in the output of this
// method.
// /
RuleContext.prototype.getText = function() {
	if (this.getChildCount() === 0) {
		return "";
	} else {
		return this.children.map(function(child) {
			return child.getText();
		}).join("");
	}
};

RuleContext.prototype.getChild = function(i) {
	return null;
};

RuleContext.prototype.getChildCount = function() {
	return 0;
};

RuleContext.prototype.accept = function(visitor) {
	return visitor.visitChildren(this);
};

//need to manage circular dependencies, so export now
exports.RuleContext = RuleContext;
var Trees = require('./tree/Trees').Trees;


// Print out a whole tree, not just a node, in LISP format
// (root child1 .. childN). Print just a node if this is a leaf.
//

RuleContext.prototype.toStringTree = function(ruleNames, recog) {
	return Trees.toStringTree(this, ruleNames, recog);
};

RuleContext.prototype.toString = function(ruleNames, stop) {
	ruleNames = ruleNames || null;
	stop = stop || null;
	var p = this;
	var s = "[";
	while (p !== null && p !== stop) {
		if (ruleNames === null) {
			if (!p.isEmpty()) {
				s += p.invokingState;
			}
		} else {
			var ri = p.ruleIndex;
			var ruleName = (ri >= 0 && ri < ruleNames.length) ? ruleNames[ri]
					: "" + ri;
			s += ruleName;
		}
		if (p.parentCtx !== null && (ruleNames !== null || !p.parentCtx.isEmpty())) {
			s += " ";
		}
		p = p.parentCtx;
	}
	s += "]";
	return s;
};


},{"./tree/Tree":50,"./tree/Trees":51}],22:[function(require,module,exports){
//[The "BSD license"]
// Copyright (c) 2012 Terence Parr
// Copyright (c) 2012 Sam Harwell
// Copyright (c) 2014 Eric Vergnaud
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. The name of the author may not be used to endorse or promote products
//    derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
// NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

// A token has properties: text, type, line, character position in the line
// (so we can ignore tabs), token channel, index, and source from which
// we obtained this token.

function Token() {
	this.source = null;
	this.type = null; // token type of the token
	this.channel = null; // The parser ignores everything not on DEFAULT_CHANNEL
	this.start = null; // optional; return -1 if not implemented.
	this.stop = null; // optional; return -1 if not implemented.
	this.tokenIndex = null; // from 0..n-1 of the token object in the input stream
	this.line = null; // line=1..n of the 1st character
	this.column = null; // beginning of the line at which it occurs, 0..n-1
	this._text = null; // text of the token.
	return this;
}

Token.INVALID_TYPE = 0;

// During lookahead operations, this "token" signifies we hit rule end ATN state
// and did not follow it despite needing to.
Token.EPSILON = -2;

Token.MIN_USER_TOKEN_TYPE = 1;

Token.EOF = -1;

// All tokens go to the parser (unless skip() is called in that rule)
// on a particular "channel". The parser tunes to a particular channel
// so that whitespace etc... can go to the parser on a "hidden" channel.

Token.DEFAULT_CHANNEL = 0;

// Anything on different channel than DEFAULT_CHANNEL is not parsed
// by parser.

Token.HIDDEN_CHANNEL = 1;

// Explicitly set the text for this token. If {code text} is not
// {@code null}, then {@link //getText} will return this value rather than
// extracting the text from the input.
//
// @param text The explicit text of the token, or {@code null} if the text
// should be obtained from the input along with the start and stop indexes
// of the token.

Object.defineProperty(Token.prototype, "text", {
	get : function() {
		return this._text;
	},
	set : function(text) {
		this._text = text;
	}
});

Token.prototype.getTokenSource = function() {
	return this.source[0];
};

Token.prototype.getInputStream = function() {
	return this.source[1];
};

function CommonToken(source, type, channel, start, stop) {
	Token.call(this);
	this.source = source !== undefined ? source : CommonToken.EMPTY_SOURCE;
	this.type = type !== undefined ? type : null;
	this.channel = channel !== undefined ? channel : Token.DEFAULT_CHANNEL;
	this.start = start !== undefined ? start : -1;
	this.stop = stop !== undefined ? stop : -1;
	this.tokenIndex = -1;
	if (this.source[0] !== null) {
		this.line = source[0].line;
		this.column = source[0].column;
	} else {
		this.column = -1;
	}
	return this;
}

CommonToken.prototype = Object.create(Token.prototype);
CommonToken.prototype.constructor = CommonToken;

// An empty {@link Pair} which is used as the default value of
// {@link //source} for tokens that do not have a source.
CommonToken.EMPTY_SOURCE = [ null, null ];

// Constructs a new {@link CommonToken} as a copy of another {@link Token}.
//
// <p>
// If {@code oldToken} is also a {@link CommonToken} instance, the newly
// constructed token will share a reference to the {@link //text} field and
// the {@link Pair} stored in {@link //source}. Otherwise, {@link //text} will
// be assigned the result of calling {@link //getText}, and {@link //source}
// will be constructed from the result of {@link Token//getTokenSource} and
// {@link Token//getInputStream}.</p>
//
// @param oldToken The token to copy.
//
CommonToken.prototype.clone = function() {
	var t = new CommonToken(this.source, this.type, this.channel, this.start,
			this.stop);
	t.tokenIndex = this.tokenIndex;
	t.line = this.line;
	t.column = this.column;
	t.text = this.text;
	return t;
};

Object.defineProperty(CommonToken.prototype, "text", {
	get : function() {
		if (this._text !== null) {
			return this._text;
		}
		var input = this.getInputStream();
		if (input === null) {
			return null;
		}
		var n = input.size;
		if (this.start < n && this.stop < n) {
			return input.getText(this.start, this.stop);
		} else {
			return "<EOF>";
		}
	},
	set : function(text) {
		this._text = text;
	}
});

CommonToken.prototype.toString = function() {
	var txt = this.text;
	if (txt !== null) {
		txt = txt.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
	} else {
		txt = "<no text>";
	}
	return "[@" + this.tokenIndex + "," + this.start + ":" + this.stop + "='" +
			txt + "',<" + this.type + ">" +
			(this.channel > 0 ? ",channel=" + this.channel : "") + "," +
			this.line + ":" + this.column + "]";
};

exports.Token = Token;
exports.CommonToken = CommonToken;

},{}],23:[function(require,module,exports){
function arrayToString(a) {
	return "[" + a.join(", ") + "]";
}

String.prototype.hashCode = function(s) {
	var hash = 0;
	if (this.length === 0) {
		return hash;
	}
	for (var i = 0; i < this.length; i++) {
		var character = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

function standardEqualsFunction(a,b) {
	return a.equals(b);
}

function standardHashFunction(a) {
	return a.hashString();
}

function Set(hashFunction, equalsFunction) {
	this.data = {};
	this.hashFunction = hashFunction || standardHashFunction;
	this.equalsFunction = equalsFunction || standardEqualsFunction;
	return this;
}

Object.defineProperty(Set.prototype, "length", {
	get : function() {
		return this.values().length;
	}
});

Set.prototype.add = function(value) {
	var hash = this.hashFunction(value);
	var key = "hash_" + hash.hashCode();
	if(key in this.data) {
		var i;
		var values = this.data[key];
		for(i=0;i<values.length; i++) {
			if(this.equalsFunction(value, values[i])) {
				return values[i];
			}
		}
		values.push(value);
		return value;
	} else {
		this.data[key] = [ value ];
		return value;
	}
};

Set.prototype.contains = function(value) {
	var hash = this.hashFunction(value);
	var key = hash.hashCode();
	if(key in this.data) {
		var i;
		var values = this.data[key];
		for(i=0;i<values.length; i++) {
			if(this.equalsFunction(value, values[i])) {
				return true;
			}
		}
	}
	return false;
};

Set.prototype.values = function() {
	var l = [];
	for(var key in this.data) {
		if(key.indexOf("hash_")===0) {
			l = l.concat(this.data[key]);
		}
	}
	return l;
};

Set.prototype.toString = function() {
	return arrayToString(this.values());
};

function BitSet() {
	this.data = [];
	return this;
}

BitSet.prototype.add = function(value) {
	this.data[value] = true;
};

BitSet.prototype.or = function(set) {
	var bits = this;
	Object.keys(set.data).map( function(alt) { bits.add(alt); });
};

BitSet.prototype.remove = function(value) {
	delete this.data[value];
};

BitSet.prototype.contains = function(value) {
	return this.data[value] === true;
};

BitSet.prototype.values = function() {
	return Object.keys(this.data);
};

BitSet.prototype.minValue = function() {
	return Math.min.apply(null, this.values());
};

BitSet.prototype.hashString = function() {
	return this.values().toString();
};

BitSet.prototype.equals = function(other) {
	if(!(other instanceof BitSet)) {
		return false;
	}
	return this.hashString()===other.hashString();
};

Object.defineProperty(BitSet.prototype, "length", {
	get : function() {
		return this.values().length;
	}
});

BitSet.prototype.toString = function() {
	return "{" + this.values().join(", ") + "}";
};

function AltDict() {
	this.data = {};
	return this;
}

AltDict.prototype.get = function(key) {
	key = "k-" + key;
	if(key in this.data){
		return this.data[key];
	} else {
		return null;
	}
};

AltDict.prototype.put = function(key, value) {
	key = "k-" + key;
	this.data[key] = value;
};

AltDict.prototype.values = function() {
	var data = this.data;
	var keys = Object.keys(this.data);
	return keys.map(function(key) {
		return data[key];
	});
};

function DoubleDict() {
	return this;
}

DoubleDict.prototype.get = function(a, b) {
	var d = this[a] || null;
	return d===null ? null : (d[b] || null);
};

DoubleDict.prototype.set = function(a, b, o) {
	var d = this[a] || null;
	if(d===null) {
		d = {};
		this[a] = d;
	}
	d[b] = o;
};


function escapeWhitespace(s, escapeSpaces) {
	s = s.replace("\t","\\t");
	s = s.replace("\n","\\n");
	s = s.replace("\r","\\r");
	if(escapeSpaces) {
		s = s.replace(" ","\u00B7");
	}
	return s;
}


exports.Set = Set;
exports.BitSet = BitSet;
exports.AltDict = AltDict;
exports.DoubleDict = DoubleDict;
exports.escapeWhitespace = escapeWhitespace;
exports.arrayToString = arrayToString;

},{}],24:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var LL1Analyzer = require('./../LL1Analyzer').LL1Analyzer;
var IntervalSet = require('./../IntervalSet').IntervalSet;

function ATN(grammarType , maxTokenType) {

    // Used for runtime deserialization of ATNs from strings///
    // The type of the ATN.
    this.grammarType = grammarType;
    // The maximum value for any symbol recognized by a transition in the ATN.
    this.maxTokenType = maxTokenType;
    this.states = [];
    // Each subrule/rule is a decision point and we must track them so we
    //  can go back later and build DFA predictors for them.  This includes
    //  all the rules, subrules, optional blocks, ()+, ()* etc...
    this.decisionToState = [];
    // Maps from rule index to starting state number.
    this.ruleToStartState = [];
    // Maps from rule index to stop state number.
    this.ruleToStopState = null;
    this.modeNameToStartState = {};
    // For lexer ATNs, this maps the rule index to the resulting token type.
    // For parser ATNs, this maps the rule index to the generated bypass token
    // type if the
    // {@link ATNDeserializationOptions//isGenerateRuleBypassTransitions}
    // deserialization option was specified; otherwise, this is {@code null}.
    this.ruleToTokenType = null;
    // For lexer ATNs, this is an array of {@link LexerAction} objects which may
    // be referenced by action transitions in the ATN.
    this.lexerActions = null;
    this.modeToStartState = [];

    return this;
}
	
// Compute the set of valid tokens that can occur starting in state {@code s}.
//  If {@code ctx} is null, the set of tokens will not include what can follow
//  the rule surrounding {@code s}. In other words, the set will be
//  restricted to tokens reachable staying within {@code s}'s rule.
ATN.prototype.nextTokensInContext = function(s, ctx) {
    var anal = new LL1Analyzer(this);
    return anal.LOOK(s, null, ctx);
};

// Compute the set of valid tokens that can occur starting in {@code s} and
// staying in same rule. {@link Token//EPSILON} is in set if we reach end of
// rule.
ATN.prototype.nextTokensNoContext = function(s) {
    if (s.nextTokenWithinRule !== null ) {
        return s.nextTokenWithinRule;
    }
    s.nextTokenWithinRule = this.nextTokensInContext(s, null);
    s.nextTokenWithinRule.readonly = true;
    return s.nextTokenWithinRule;
};

ATN.prototype.nextTokens = function(s, ctx) {
    if ( ctx===undefined ) {
        return this.nextTokensNoContext(s);
    } else {
        return this.nextTokensInContext(s, ctx);
    }
};

ATN.prototype.addState = function( state) {
    if ( state !== null ) {
        state.atn = this;
        state.stateNumber = this.states.length;
    }
    this.states.push(state);
};

ATN.prototype.removeState = function( state) {
    this.states[state.stateNumber] = null; // just free mem, don't shift states in list
};

ATN.prototype.defineDecisionState = function( s) {
    this.decisionToState.push(s);
    s.decision = this.decisionToState.length-1;
    return s.decision;
};

ATN.prototype.getDecisionState = function( decision) {
    if (this.decisionToState.length===0) {
        return null;
    } else {
        return this.decisionToState[decision];
    }
};

// Computes the set of input symbols which could follow ATN state number
// {@code stateNumber} in the specified full {@code context}. This method
// considers the complete parser context, but does not evaluate semantic
// predicates (i.e. all predicates encountered during the calculation are
// assumed true). If a path in the ATN exists from the starting state to the
// {@link RuleStopState} of the outermost context without matching any
// symbols, {@link Token//EOF} is added to the returned set.
//
// <p>If {@code context} is {@code null}, it is treated as
// {@link ParserRuleContext//EMPTY}.</p>
//
// @param stateNumber the ATN state number
// @param context the full parse context
// @return The set of potentially valid input symbols which could follow the
// specified state in the specified context.
// @throws IllegalArgumentException if the ATN does not contain a state with
// number {@code stateNumber}
var Token = require('./../Token').Token;

ATN.prototype.getExpectedTokens = function( stateNumber, ctx ) {
    if ( stateNumber < 0 || stateNumber >= this.states.length ) {
        throw("Invalid state number.");
    }
    var s = this.states[stateNumber];
    var following = this.nextTokens(s);
    if (!following.contains(Token.EPSILON)) {
        return following;
    }
    var expected = new IntervalSet();
    expected.addSet(following);
    expected.removeOne(Token.EPSILON);
    while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
        var invokingState = this.states[ctx.invokingState];
        var rt = invokingState.transitions[0];
        following = this.nextTokens(rt.followState);
        expected.addSet(following);
        expected.removeOne(Token.EPSILON);
        ctx = ctx.parentCtx;
    }
    if (following.contains(Token.EPSILON)) {
        expected.addOne(Token.EOF);
    }
    return expected;
};

ATN.INVALID_ALT_NUMBER = 0;

exports.ATN = ATN;
},{"./../IntervalSet":14,"./../LL1Analyzer":15,"./../Token":22}],25:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

// A tuple: (ATN state, predicted alt, syntactic, semantic context).
//  The syntactic context is a graph-structured stack node whose
//  path(s) to the root is the rule invocation(s)
//  chain used to arrive at the state.  The semantic context is
//  the tree of semantic predicates encountered before reaching
//  an ATN state.
///

var DecisionState = require('./ATNState').DecisionState;
var SemanticContext = require('./SemanticContext').SemanticContext;

function checkParams(params, isCfg) {
	if(params===null) {
		var result = { state:null, alt:null, context:null, semanticContext:null };
		if(isCfg) {
			result.reachesIntoOuterContext = 0;
		}
		return result;
	} else {
		var props = {};
		props.state = params.state || null;
		props.alt = params.alt || null;
		props.context = params.context || null;
		props.semanticContext = params.semanticContext || null;
		if(isCfg) {
			props.reachesIntoOuterContext = params.reachesIntoOuterContext || 0;
			props.precedenceFilterSuppressed = params.precedenceFilterSuppressed || false;
		}
		return props;
	}
}

function ATNConfig(params, config) {
	this.checkContext(params, config);
	params = checkParams(params);
	config = checkParams(config, true);
    // The ATN state associated with this configuration///
    this.state = params.state!==null ? params.state : config.state;
    // What alt (or lexer rule) is predicted by this configuration///
    this.alt = params.alt!==null ? params.alt : config.alt;
    // The stack of invoking states leading to the rule/states associated
    //  with this config.  We track only those contexts pushed during
    //  execution of the ATN simulator.
    this.context = params.context!==null ? params.context : config.context;
    this.semanticContext = params.semanticContext!==null ? params.semanticContext :
        (config.semanticContext!==null ? config.semanticContext : SemanticContext.NONE);
    // We cannot execute predicates dependent upon local context unless
    // we know for sure we are in the correct context. Because there is
    // no way to do this efficiently, we simply cannot evaluate
    // dependent predicates unless we are in the rule that initially
    // invokes the ATN simulator.
    //
    // closure() tracks the depth of how far we dip into the
    // outer context: depth &gt; 0.  Note that it may not be totally
    // accurate depth since I don't ever decrement. TODO: make it a boolean then
    this.reachesIntoOuterContext = config.reachesIntoOuterContext;
    this.precedenceFilterSuppressed = config.precedenceFilterSuppressed;
    return this;
}

ATNConfig.prototype.checkContext = function(params, config) {
	if((params.context===null || params.context===undefined) &&
			(config===null || config.context===null || config.context===undefined)) {
		this.context = null;
	}
};

// An ATN configuration is equal to another if both have
//  the same state, they predict the same alternative, and
//  syntactic/semantic contexts are the same.
///
ATNConfig.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (! (other instanceof ATNConfig)) {
        return false;
    } else {
        return this.state.stateNumber===other.state.stateNumber &&
            this.alt===other.alt &&
            (this.context===null ? other.context===null : this.context.equals(other.context)) &&
            this.semanticContext.equals(other.semanticContext) &&
            this.precedenceFilterSuppressed===other.precedenceFilterSuppressed;
    }
};

ATNConfig.prototype.shortHashString = function() {
    return "" + this.state.stateNumber + "/" + this.alt + "/" + this.semanticContext;
};

ATNConfig.prototype.hashString = function() {
    return "" + this.state.stateNumber + "/" + this.alt + "/" +
             (this.context===null ? "" : this.context.hashString()) +
             "/" + this.semanticContext.hashString();
};

ATNConfig.prototype.toString = function() {
    return "(" + this.state + "," + this.alt +
        (this.context!==null ? ",[" + this.context.toString() + "]" : "") +
        (this.semanticContext !== SemanticContext.NONE ?
                ("," + this.semanticContext.toString())
                : "") +
        (this.reachesIntoOuterContext>0 ?
                (",up=" + this.reachesIntoOuterContext)
                : "") + ")";
};


function LexerATNConfig(params, config) {
	ATNConfig.call(this, params, config);
    
    // This is the backing field for {@link //getLexerActionExecutor}.
	var lexerActionExecutor = params.lexerActionExecutor || null;
    this.lexerActionExecutor = lexerActionExecutor || (config!==null ? config.lexerActionExecutor : null);
    this.passedThroughNonGreedyDecision = config!==null ? this.checkNonGreedyDecision(config, this.state) : false;
    return this;
}

LexerATNConfig.prototype = Object.create(ATNConfig.prototype);
LexerATNConfig.prototype.constructor = LexerATNConfig;

LexerATNConfig.prototype.hashString = function() {
    return "" + this.state.stateNumber + this.alt + this.context +
            this.semanticContext + (this.passedThroughNonGreedyDecision ? 1 : 0) +
            this.lexerActionExecutor;
};

LexerATNConfig.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (!(other instanceof LexerATNConfig)) {
        return false;
    } else if (this.passedThroughNonGreedyDecision !== other.passedThroughNonGreedyDecision) {
        return false;
    } else if (this.lexerActionExecutor !== other.lexerActionExecutor) {
        return false;
    } else {
        return ATNConfig.prototype.equals.call(this, other);
    }
};

LexerATNConfig.prototype.checkNonGreedyDecision = function(source, target) {
    return source.passedThroughNonGreedyDecision ||
        (target instanceof DecisionState) && target.nonGreedy;
};

exports.ATNConfig = ATNConfig;
exports.LexerATNConfig = LexerATNConfig;
},{"./ATNState":30,"./SemanticContext":37}],26:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

//
// Specialized {@link Set}{@code <}{@link ATNConfig}{@code >} that can track
// info about the set, with support for combining similar configurations using a
// graph-structured stack.
///

var ATN = require('./ATN').ATN;
var Utils = require('./../Utils');
var Set = Utils.Set;
var SemanticContext = require('./SemanticContext').SemanticContext;
var merge = require('./../PredictionContext').merge;

function hashATNConfig(c) {
	return c.shortHashString();
}

function equalATNConfigs(a, b) {
	if ( a===b ) {
		return true;
	}
	if ( a===null || b===null ) {
		return false;
	}
	return a.state.stateNumber===b.state.stateNumber &&
		a.alt===b.alt && a.semanticContext.equals(b.semanticContext);
}


function ATNConfigSet(fullCtx) {
	//
	// The reason that we need this is because we don't want the hash map to use
	// the standard hash code and equals. We need all configurations with the
	// same
	// {@code (s,i,_,semctx)} to be equal. Unfortunately, this key effectively
	// doubles
	// the number of objects associated with ATNConfigs. The other solution is
	// to
	// use a hash table that lets us specify the equals/hashcode operation.
	// All configs but hashed by (s, i, _, pi) not including context. Wiped out
	// when we go readonly as this set becomes a DFA state.
	this.configLookup = new Set(hashATNConfig, equalATNConfigs);
	// Indicates that this configuration set is part of a full context
	// LL prediction. It will be used to determine how to merge $. With SLL
	// it's a wildcard whereas it is not for LL context merge.
	this.fullCtx = fullCtx === undefined ? true : fullCtx;
	// Indicates that the set of configurations is read-only. Do not
	// allow any code to manipulate the set; DFA states will point at
	// the sets and they must not change. This does not protect the other
	// fields; in particular, conflictingAlts is set after
	// we've made this readonly.
	this.readonly = false;
	// Track the elements as they are added to the set; supports get(i)///
	this.configs = [];

	// TODO: these fields make me pretty uncomfortable but nice to pack up info
	// together, saves recomputation
	// TODO: can we track conflicts as they are added to save scanning configs
	// later?
	this.uniqueAlt = 0;
	this.conflictingAlts = null;

	// Used in parser and lexer. In lexer, it indicates we hit a pred
	// while computing a closure operation. Don't make a DFA state from this.
	this.hasSemanticContext = false;
	this.dipsIntoOuterContext = false;

	this.cachedHashString = "-1";

	return this;
}

// Adding a new config means merging contexts with existing configs for
// {@code (s, i, pi, _)}, where {@code s} is the
// {@link ATNConfig//state}, {@code i} is the {@link ATNConfig//alt}, and
// {@code pi} is the {@link ATNConfig//semanticContext}. We use
// {@code (s,i,pi)} as key.
//
// <p>This method updates {@link //dipsIntoOuterContext} and
// {@link //hasSemanticContext} when necessary.</p>
// /
ATNConfigSet.prototype.add = function(config, mergeCache) {
	if (mergeCache === undefined) {
		mergeCache = null;
	}
	if (this.readonly) {
		throw "This set is readonly";
	}
	if (config.semanticContext !== SemanticContext.NONE) {
		this.hasSemanticContext = true;
	}
	if (config.reachesIntoOuterContext > 0) {
		this.dipsIntoOuterContext = true;
	}
	var existing = this.configLookup.add(config);
	if (existing === config) {
		this.cachedHashString = "-1";
		this.configs.push(config); // track order here
		return true;
	}
	// a previous (s,i,pi,_), merge with it and save result
	var rootIsWildcard = !this.fullCtx;
	var merged = merge(existing.context, config.context, rootIsWildcard, mergeCache);
	// no need to check for existing.context, config.context in cache
	// since only way to create new graphs is "call rule" and here. We
	// cache at both places.
	existing.reachesIntoOuterContext = Math.max( existing.reachesIntoOuterContext, config.reachesIntoOuterContext);
	// make sure to preserve the precedence filter suppression during the merge
	if (config.precedenceFilterSuppressed) {
		existing.precedenceFilterSuppressed = true;
	}
	existing.context = merged; // replace context; no need to alt mapping
	return true;
};

ATNConfigSet.prototype.getStates = function() {
	var states = new Set();
	for (var i = 0; i < this.configs.length; i++) {
		states.add(this.configs[i].state);
	}
	return states;
};

ATNConfigSet.prototype.getPredicates = function() {
	var preds = [];
	for (var i = 0; i < this.configs.length; i++) {
		var c = this.configs[i].semanticContext;
		if (c !== SemanticContext.NONE) {
			preds.push(c.semanticContext);
		}
	}
	return preds;
};

Object.defineProperty(ATNConfigSet.prototype, "items", {
	get : function() {
		return this.configs;
	}
});

ATNConfigSet.prototype.optimizeConfigs = function(interpreter) {
	if (this.readonly) {
		throw "This set is readonly";
	}
	if (this.configLookup.length === 0) {
		return;
	}
	for (var i = 0; i < this.configs.length; i++) {
		var config = this.configs[i];
		config.context = interpreter.getCachedContext(config.context);
	}
};

ATNConfigSet.prototype.addAll = function(coll) {
	for (var i = 0; i < coll.length; i++) {
		this.add(coll[i]);
	}
	return false;
};

ATNConfigSet.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof ATNConfigSet)) {
		return false;
	}
	return this.configs !== null && this.configs.equals(other.configs) &&
			this.fullCtx === other.fullCtx &&
			this.uniqueAlt === other.uniqueAlt &&
			this.conflictingAlts === other.conflictingAlts &&
			this.hasSemanticContext === other.hasSemanticContext &&
			this.dipsIntoOuterContext === other.dipsIntoOuterContext;
};

ATNConfigSet.prototype.hashString = function() {
	if (this.readonly) {
		if (this.cachedHashString === "-1") {
			this.cachedHashString = this.hashConfigs();
		}
		return this.cachedHashString;
	} else {
		return this.hashConfigs();
	}
};

ATNConfigSet.prototype.hashConfigs = function() {
	var s = "";
	this.configs.map(function(c) {
		s += c.toString();
	});
	return s;
};

Object.defineProperty(ATNConfigSet.prototype, "length", {
	get : function() {
		return this.configs.length;
	}
});

ATNConfigSet.prototype.isEmpty = function() {
	return this.configs.length === 0;
};

ATNConfigSet.prototype.contains = function(item) {
	if (this.configLookup === null) {
		throw "This method is not implemented for readonly sets.";
	}
	return this.configLookup.contains(item);
};

ATNConfigSet.prototype.containsFast = function(item) {
	if (this.configLookup === null) {
		throw "This method is not implemented for readonly sets.";
	}
	return this.configLookup.containsFast(item);
};

ATNConfigSet.prototype.clear = function() {
	if (this.readonly) {
		throw "This set is readonly";
	}
	this.configs = [];
	this.cachedHashString = "-1";
	this.configLookup = new Set();
};

ATNConfigSet.prototype.setReadonly = function(readonly) {
	this.readonly = readonly;
	if (readonly) {
		this.configLookup = null; // can't mod, no need for lookup cache
	}
};

ATNConfigSet.prototype.toString = function() {
	return Utils.arrayToString(this.configs) +
		(this.hasSemanticContext ? ",hasSemanticContext=" + this.hasSemanticContext : "") +
		(this.uniqueAlt !== ATN.INVALID_ALT_NUMBER ? ",uniqueAlt=" + this.uniqueAlt : "") +
		(this.conflictingAlts !== null ? ",conflictingAlts=" + this.conflictingAlts : "") +
		(this.dipsIntoOuterContext ? ",dipsIntoOuterContext" : "");
};

function OrderedATNConfigSet() {
	ATNConfigSet.call(this);
	this.configLookup = new Set();
	return this;
}

OrderedATNConfigSet.prototype = Object.create(ATNConfigSet.prototype);
OrderedATNConfigSet.prototype.constructor = OrderedATNConfigSet;

exports.ATNConfigSet = ATNConfigSet;
exports.OrderedATNConfigSet = OrderedATNConfigSet;

},{"./../PredictionContext":19,"./../Utils":23,"./ATN":24,"./SemanticContext":37}],27:[function(require,module,exports){
//[The "BSD license"]
// Copyright (c) 2013 Terence Parr
// Copyright (c) 2013 Sam Harwell
// Copyright (c) 2014 Eric Vergnaud
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. The name of the author may not be used to endorse or promote products
//    derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
// NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function ATNDeserializationOptions(copyFrom) {
	if(copyFrom===undefined) {
		copyFrom = null;
	}
	this.readOnly = false;
    this.verifyATN = copyFrom===null ? true : copyFrom.verifyATN;
    this.generateRuleBypassTransitions = copyFrom===null ? false : copyFrom.generateRuleBypassTransitions;

    return this;
}

ATNDeserializationOptions.defaultOptions = new ATNDeserializationOptions();
ATNDeserializationOptions.defaultOptions.readOnly = true;

//    def __setattr__(self, key, value):
//        if key!="readOnly" and self.readOnly:
//            raise Exception("The object is read only.")
//        super(type(self), self).__setattr__(key,value)

exports.ATNDeserializationOptions = ATNDeserializationOptions;

},{}],28:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var Token = require('./../Token').Token;
var ATN = require('./ATN').ATN;
var ATNType = require('./ATNType').ATNType;
var ATNStates = require('./ATNState');
var ATNState = ATNStates.ATNState;
var BasicState = ATNStates.BasicState;
var DecisionState = ATNStates.DecisionState;
var BlockStartState = ATNStates.BlockStartState;
var BlockEndState = ATNStates.BlockEndState;
var LoopEndState = ATNStates.LoopEndState;
var RuleStartState = ATNStates.RuleStartState;
var RuleStopState = ATNStates.RuleStopState;
var TokensStartState = ATNStates.TokensStartState;
var PlusLoopbackState = ATNStates.PlusLoopbackState;
var StarLoopbackState = ATNStates.StarLoopbackState;
var StarLoopEntryState = ATNStates.StarLoopEntryState;
var PlusBlockStartState = ATNStates.PlusBlockStartState;
var StarBlockStartState = ATNStates.StarBlockStartState;
var BasicBlockStartState = ATNStates.BasicBlockStartState;
var Transitions = require('./Transition');
var Transition = Transitions.Transition;
var AtomTransition = Transitions.AtomTransition;
var SetTransition = Transitions.SetTransition;
var NotSetTransition = Transitions.NotSetTransition;
var RuleTransition = Transitions.RuleTransition;
var RangeTransition = Transitions.RangeTransition;
var ActionTransition = Transitions.ActionTransition;
var EpsilonTransition = Transitions.EpsilonTransition;
var WildcardTransition = Transitions.WildcardTransition;
var PredicateTransition = Transitions.PredicateTransition;
var PrecedencePredicateTransition = Transitions.PrecedencePredicateTransition;
var IntervalSet = require('./../IntervalSet').IntervalSet;
var Interval = require('./../IntervalSet').Interval;
var ATNDeserializationOptions = require('./ATNDeserializationOptions').ATNDeserializationOptions;
var LexerActions = require('./LexerAction');
var LexerActionType = LexerActions.LexerActionType;
var LexerSkipAction = LexerActions.LexerSkipAction;
var LexerChannelAction = LexerActions.LexerChannelAction;
var LexerCustomAction = LexerActions.LexerCustomAction;
var LexerMoreAction = LexerActions.LexerMoreAction;
var LexerTypeAction = LexerActions.LexerTypeAction;
var LexerPushModeAction = LexerActions.LexerPushModeAction;
var LexerPopModeAction = LexerActions.LexerPopModeAction;
var LexerModeAction = LexerActions.LexerModeAction;
// This is the earliest supported serialized UUID.
// stick to serialized version for now, we don't need a UUID instance
var BASE_SERIALIZED_UUID = "AADB8D7E-AEEF-4415-AD2B-8204D6CF042E";

// This list contains all of the currently supported UUIDs, ordered by when
// the feature first appeared in this branch.
var SUPPORTED_UUIDS = [ BASE_SERIALIZED_UUID ];

var SERIALIZED_VERSION = 3;

// This is the current serialized UUID.
var SERIALIZED_UUID = BASE_SERIALIZED_UUID;

function initArray( length, value) {
	var tmp = [];
	tmp[length-1] = value;
	return tmp.map(function(i) {return value;});
}

function ATNDeserializer (options) {
	
    if ( options=== undefined || options === null ) {
        options = ATNDeserializationOptions.defaultOptions;
    }
    this.deserializationOptions = options;
    this.stateFactories = null;
    this.actionFactories = null;
    
    return this;
}

// Determines if a particular serialized representation of an ATN supports
// a particular feature, identified by the {@link UUID} used for serializing
// the ATN at the time the feature was first introduced.
//
// @param feature The {@link UUID} marking the first time the feature was
// supported in the serialized ATN.
// @param actualUuid The {@link UUID} of the actual serialized ATN which is
// currently being deserialized.
// @return {@code true} if the {@code actualUuid} value represents a
// serialized ATN at or after the feature identified by {@code feature} was
// introduced; otherwise, {@code false}.

ATNDeserializer.prototype.isFeatureSupported = function(feature, actualUuid) {
    var idx1 = SUPPORTED_UUIDS.index(feature);
    if (idx1<0) {
        return false;
    }
    var idx2 = SUPPORTED_UUIDS.index(actualUuid);
    return idx2 >= idx1;
};

ATNDeserializer.prototype.deserialize = function(data) {
    this.reset(data);
    this.checkVersion();
    this.checkUUID();
    var atn = this.readATN();
    this.readStates(atn);
    this.readRules(atn);
    this.readModes(atn);
    var sets = this.readSets(atn);
    this.readEdges(atn, sets);
    this.readDecisions(atn);
    this.readLexerActions(atn);
    this.markPrecedenceDecisions(atn);
    this.verifyATN(atn);
    if (this.deserializationOptions.generateRuleBypassTransitions && atn.grammarType === ATNType.PARSER ) {
        this.generateRuleBypassTransitions(atn);
        // re-verify after modification
        this.verifyATN(atn);
    }
    return atn;
};

ATNDeserializer.prototype.reset = function(data) {
	var adjust = function(c) {
        var v = c.charCodeAt(0);
        return v>1  ? v-2 : -1;
	};
    var temp = data.split("").map(adjust);
    // don't adjust the first value since that's the version number
    temp[0] = data.charCodeAt(0);
    this.data = temp;
    this.pos = 0;
};

ATNDeserializer.prototype.checkVersion = function() {
    var version = this.readInt();
    if ( version !== SERIALIZED_VERSION ) {
        throw ("Could not deserialize ATN with version " + version + " (expected " + SERIALIZED_VERSION + ").");
    }
};

ATNDeserializer.prototype.checkUUID = function() {
    var uuid = this.readUUID();
    if (SUPPORTED_UUIDS.indexOf(uuid)<0) {
        throw ("Could not deserialize ATN with UUID: " + uuid +
                        " (expected " + SERIALIZED_UUID + " or a legacy UUID).", uuid, SERIALIZED_UUID);
    }
    this.uuid = uuid;
};

ATNDeserializer.prototype.readATN = function() {
    var grammarType = this.readInt();
    var maxTokenType = this.readInt();
    return new ATN(grammarType, maxTokenType);
};

ATNDeserializer.prototype.readStates = function(atn) {
	var j, pair, stateNumber;
    var loopBackStateNumbers = [];
    var endStateNumbers = [];
    var nstates = this.readInt();
    for(var i=0; i<nstates; i++) {
        var stype = this.readInt();
        // ignore bad type of states
        if (stype===ATNState.INVALID_TYPE) {
            atn.addState(null);
            continue;
        }
        var ruleIndex = this.readInt();
        if (ruleIndex === 0xFFFF) {
            ruleIndex = -1;
        }
        var s = this.stateFactory(stype, ruleIndex);
        if (stype === ATNState.LOOP_END) { // special case
            var loopBackStateNumber = this.readInt();
            loopBackStateNumbers.push([s, loopBackStateNumber]);
        } else if(s instanceof BlockStartState) {
            var endStateNumber = this.readInt();
            endStateNumbers.push([s, endStateNumber]);
        }
        atn.addState(s);
    }
    // delay the assignment of loop back and end states until we know all the
	// state instances have been initialized
    for (j=0; j<loopBackStateNumbers.length; j++) {
        pair = loopBackStateNumbers[j];
        pair[0].loopBackState = atn.states[pair[1]];
    }

    for (j=0; j<endStateNumbers.length; j++) {
        pair = endStateNumbers[j];
        pair[0].endState = atn.states[pair[1]];
    }
    
    var numNonGreedyStates = this.readInt();
    for (j=0; j<numNonGreedyStates; j++) {
        stateNumber = this.readInt();
        atn.states[stateNumber].nonGreedy = true;
    }

    var numPrecedenceStates = this.readInt();
    for (j=0; j<numPrecedenceStates; j++) {
        stateNumber = this.readInt();
        atn.states[stateNumber].isPrecedenceRule = true;
    }
};

ATNDeserializer.prototype.readRules = function(atn) {
    var i;
    var nrules = this.readInt();
    if (atn.grammarType === ATNType.LEXER ) {
        atn.ruleToTokenType = initArray(nrules, 0);
    }
    atn.ruleToStartState = initArray(nrules, 0);
    for (i=0; i<nrules; i++) {
        var s = this.readInt();
        var startState = atn.states[s];
        atn.ruleToStartState[i] = startState;
        if ( atn.grammarType === ATNType.LEXER ) {
            var tokenType = this.readInt();
            if (tokenType === 0xFFFF) {
                tokenType = Token.EOF;
            }
            atn.ruleToTokenType[i] = tokenType;
        }
    }
    atn.ruleToStopState = initArray(nrules, 0);
    for (i=0; i<atn.states.length; i++) {
        var state = atn.states[i];
        if (!(state instanceof RuleStopState)) {
            continue;
        }
        atn.ruleToStopState[state.ruleIndex] = state;
        atn.ruleToStartState[state.ruleIndex].stopState = state;
    }
};

ATNDeserializer.prototype.readModes = function(atn) {
    var nmodes = this.readInt();
    for (var i=0; i<nmodes; i++) {
        var s = this.readInt();
        atn.modeToStartState.push(atn.states[s]);
    }
};

ATNDeserializer.prototype.readSets = function(atn) {
    var sets = [];
    var m = this.readInt();
    for (var i=0; i<m; i++) {
        var iset = new IntervalSet();
        sets.push(iset);
        var n = this.readInt();
        var containsEof = this.readInt();
        if (containsEof!==0) {
            iset.addOne(-1);
        }
        for (var j=0; j<n; j++) {
            var i1 = this.readInt();
            var i2 = this.readInt();
            iset.addRange(i1, i2);
        }
    }
    return sets;
};

ATNDeserializer.prototype.readEdges = function(atn, sets) {
	var i, j, state, trans, target;
    var nedges = this.readInt();
    for (i=0; i<nedges; i++) {
        var src = this.readInt();
        var trg = this.readInt();
        var ttype = this.readInt();
        var arg1 = this.readInt();
        var arg2 = this.readInt();
        var arg3 = this.readInt();
        trans = this.edgeFactory(atn, ttype, src, trg, arg1, arg2, arg3, sets);
        var srcState = atn.states[src];
        srcState.addTransition(trans);
    }
    // edges for rule stop states can be derived, so they aren't serialized
    for (i=0; i<atn.states.length; i++) {
        state = atn.states[i];
        for (j=0; j<state.transitions.length; j++) {
            var t = state.transitions[j];
            if (!(t instanceof RuleTransition)) {
                continue;
            }
			var outermostPrecedenceReturn = -1;
			if (atn.ruleToStartState[t.target.ruleIndex].isPrecedenceRule) {
				if (t.precedence === 0) {
					outermostPrecedenceReturn = t.target.ruleIndex;
				}
			}

			trans = new EpsilonTransition(t.followState, outermostPrecedenceReturn);
            atn.ruleToStopState[t.target.ruleIndex].addTransition(trans);
        }
    }

    for (i=0; i<atn.states.length; i++) {
        state = atn.states[i];
        if (state instanceof BlockStartState) {
            // we need to know the end state to set its start state
            if (state.endState === null) {
                throw ("IllegalState");
            }
            // block end states can only be associated to a single block start
			// state
            if ( state.endState.startState !== null) {
                throw ("IllegalState");
            }
            state.endState.startState = state;
        }
        if (state instanceof PlusLoopbackState) {
            for (j=0; j<state.transitions.length; j++) {
                target = state.transitions[j].target;
                if (target instanceof PlusBlockStartState) {
                    target.loopBackState = state;
                }
            }
        } else if (state instanceof StarLoopbackState) {
            for (j=0; j<state.transitions.length; j++) {
                target = state.transitions[j].target;
                if (target instanceof StarLoopEntryState) {
                    target.loopBackState = state;
                }
            }
        }
    }
};

ATNDeserializer.prototype.readDecisions = function(atn) {
    var ndecisions = this.readInt();
    for (var i=0; i<ndecisions; i++) {
        var s = this.readInt();
        var decState = atn.states[s];
        atn.decisionToState.push(decState);
        decState.decision = i;
    }
};

ATNDeserializer.prototype.readLexerActions = function(atn) {
    if (atn.grammarType === ATNType.LEXER) {
        var count = this.readInt();
        atn.lexerActions = initArray(count, null);
        for (var i=0; i<count; i++) {
            var actionType = this.readInt();
            var data1 = this.readInt();
            if (data1 === 0xFFFF) {
                data1 = -1;
            }
            var data2 = this.readInt();
            if (data2 === 0xFFFF) {
                data2 = -1;
            }
            var lexerAction = this.lexerActionFactory(actionType, data1, data2);
            atn.lexerActions[i] = lexerAction;
        }
    }
};

ATNDeserializer.prototype.generateRuleBypassTransitions = function(atn) {
	var i;
    var count = atn.ruleToStartState.length;
    for(i=0; i<count; i++) {
        atn.ruleToTokenType[i] = atn.maxTokenType + i + 1;
    }
    for(i=0; i<count; i++) {
        this.generateRuleBypassTransition(atn, i);
    }
};

ATNDeserializer.prototype.generateRuleBypassTransition = function(atn, idx) {
	var i, state;
    var bypassStart = new BasicBlockStartState();
    bypassStart.ruleIndex = idx;
    atn.addState(bypassStart);

    var bypassStop = new BlockEndState();
    bypassStop.ruleIndex = idx;
    atn.addState(bypassStop);

    bypassStart.endState = bypassStop;
    atn.defineDecisionState(bypassStart);

    bypassStop.startState = bypassStart;

    var excludeTransition = null;
    var endState = null;
    
    if (atn.ruleToStartState[idx].isPrecedenceRule) {
        // wrap from the beginning of the rule to the StarLoopEntryState
        endState = null;
        for(i=0; i<atn.states.length; i++) {
            state = atn.states[i];
            if (this.stateIsEndStateFor(state, idx)) {
                endState = state;
                excludeTransition = state.loopBackState.transitions[0];
                break;
            }
        }
        if (excludeTransition === null) {
            throw ("Couldn't identify final state of the precedence rule prefix section.");
        }
    } else {
        endState = atn.ruleToStopState[idx];
    }
    
    // all non-excluded transitions that currently target end state need to
	// target blockEnd instead
    for(i=0; i<atn.states.length; i++) {
        state = atn.states[i];
        for(var j=0; j<state.transitions.length; j++) {
            var transition = state.transitions[j];
            if (transition === excludeTransition) {
                continue;
            }
            if (transition.target === endState) {
                transition.target = bypassStop;
            }
        }
    }

    // all transitions leaving the rule start state need to leave blockStart
	// instead
    var ruleToStartState = atn.ruleToStartState[idx];
    var count = ruleToStartState.transitions.length;
    while ( count > 0) {
        bypassStart.addTransition(ruleToStartState.transitions[count-1]);
        ruleToStartState.transitions = ruleToStartState.transitions.slice(-1);
    }
    // link the new states
    atn.ruleToStartState[idx].addTransition(new EpsilonTransition(bypassStart));
    bypassStop.addTransition(new EpsilonTransition(endState));

    var matchState = new BasicState();
    atn.addState(matchState);
    matchState.addTransition(new AtomTransition(bypassStop, atn.ruleToTokenType[idx]));
    bypassStart.addTransition(new EpsilonTransition(matchState));
};

ATNDeserializer.prototype.stateIsEndStateFor = function(state, idx) {
    if ( state.ruleIndex !== idx) {
        return null;
    }
    if (!( state instanceof StarLoopEntryState)) {
        return null;
    }
    var maybeLoopEndState = state.transitions[state.transitions.length - 1].target;
    if (!( maybeLoopEndState instanceof LoopEndState)) {
        return null;
    }
    if (maybeLoopEndState.epsilonOnlyTransitions &&
        (maybeLoopEndState.transitions[0].target instanceof RuleStopState)) {
        return state;
    } else {
        return null;
    }
};

//
// Analyze the {@link StarLoopEntryState} states in the specified ATN to set
// the {@link StarLoopEntryState//precedenceRuleDecision} field to the
// correct value.
//
// @param atn The ATN.
//
ATNDeserializer.prototype.markPrecedenceDecisions = function(atn) {
	for(var i=0; i<atn.states.length; i++) {
		var state = atn.states[i];
		if (!( state instanceof StarLoopEntryState)) {
            continue;
        }
        // We analyze the ATN to determine if this ATN decision state is the
        // decision for the closure block that determines whether a
        // precedence rule should continue or complete.
        //
        if ( atn.ruleToStartState[state.ruleIndex].isPrecedenceRule) {
            var maybeLoopEndState = state.transitions[state.transitions.length - 1].target;
            if (maybeLoopEndState instanceof LoopEndState) {
                if ( maybeLoopEndState.epsilonOnlyTransitions &&
                        (maybeLoopEndState.transitions[0].target instanceof RuleStopState)) {
                    state.precedenceRuleDecision = true;
                }
            }
        }
	}
};

ATNDeserializer.prototype.verifyATN = function(atn) {
    if (!this.deserializationOptions.verifyATN) {
        return;
    }
    // verify assumptions
	for(var i=0; i<atn.states.length; i++) {
        var state = atn.states[i];
        if (state === null) {
            continue;
        }
        this.checkCondition(state.epsilonOnlyTransitions || state.transitions.length <= 1);
        if (state instanceof PlusBlockStartState) {
            this.checkCondition(state.loopBackState !== null);
        } else  if (state instanceof StarLoopEntryState) {
            this.checkCondition(state.loopBackState !== null);
            this.checkCondition(state.transitions.length === 2);
            if (state.transitions[0].target instanceof StarBlockStartState) {
                this.checkCondition(state.transitions[1].target instanceof LoopEndState);
                this.checkCondition(!state.nonGreedy);
            } else if (state.transitions[0].target instanceof LoopEndState) {
                this.checkCondition(state.transitions[1].target instanceof StarBlockStartState);
                this.checkCondition(state.nonGreedy);
            } else {
                throw("IllegalState");
            }
        } else if (state instanceof StarLoopbackState) {
            this.checkCondition(state.transitions.length === 1);
            this.checkCondition(state.transitions[0].target instanceof StarLoopEntryState);
        } else if (state instanceof LoopEndState) {
            this.checkCondition(state.loopBackState !== null);
        } else if (state instanceof RuleStartState) {
            this.checkCondition(state.stopState !== null);
        } else if (state instanceof BlockStartState) {
            this.checkCondition(state.endState !== null);
        } else if (state instanceof BlockEndState) {
            this.checkCondition(state.startState !== null);
        } else if (state instanceof DecisionState) {
            this.checkCondition(state.transitions.length <= 1 || state.decision >= 0);
        } else {
            this.checkCondition(state.transitions.length <= 1 || (state instanceof RuleStopState));
        }
	}
};

ATNDeserializer.prototype.checkCondition = function(condition, message) {
    if (!condition) {
        if (message === undefined || message===null) {
            message = "IllegalState";
        }
        throw (message);
    }
};

ATNDeserializer.prototype.readInt = function() {
    return this.data[this.pos++];
};

ATNDeserializer.prototype.readInt32 = function() {
    var low = this.readInt();
    var high = this.readInt();
    return low | (high << 16);
};

ATNDeserializer.prototype.readLong = function() {
    var low = this.readInt32();
    var high = this.readInt32();
    return (low & 0x00000000FFFFFFFF) | (high << 32);
};

function createByteToHex() {
	var bth = [];
	for (var i = 0; i < 256; i++) {
		bth[i] = (i + 0x100).toString(16).substr(1).toUpperCase();
	}
	return bth;
}

var byteToHex = createByteToHex();
	
ATNDeserializer.prototype.readUUID = function() {
	var bb = [];
	for(var i=7;i>=0;i--) {
		var int = this.readInt();
		/* jshint bitwise: false */
		bb[(2*i)+1] = int & 0xFF;
		bb[2*i] = (int >> 8) & 0xFF;
	}
    return byteToHex[bb[0]] + byteToHex[bb[1]] +
    byteToHex[bb[2]] + byteToHex[bb[3]] + '-' +
    byteToHex[bb[4]] + byteToHex[bb[5]] + '-' +
    byteToHex[bb[6]] + byteToHex[bb[7]] + '-' +
    byteToHex[bb[8]] + byteToHex[bb[9]] + '-' +
    byteToHex[bb[10]] + byteToHex[bb[11]] +
    byteToHex[bb[12]] + byteToHex[bb[13]] +
    byteToHex[bb[14]] + byteToHex[bb[15]];
};

ATNDeserializer.prototype.edgeFactory = function(atn, type, src, trg, arg1, arg2, arg3, sets) {
    var target = atn.states[trg];
    switch(type) {
    case Transition.EPSILON:
        return new EpsilonTransition(target);
    case Transition.RANGE:
        return arg3 !== 0 ? new RangeTransition(target, Token.EOF, arg2) : new RangeTransition(target, arg1, arg2);
    case Transition.RULE:
        return new RuleTransition(atn.states[arg1], arg2, arg3, target);
    case Transition.PREDICATE:
        return new PredicateTransition(target, arg1, arg2, arg3 !== 0);
    case Transition.PRECEDENCE:
        return new PrecedencePredicateTransition(target, arg1);
    case Transition.ATOM:
        return arg3 !== 0 ? new AtomTransition(target, Token.EOF) : new AtomTransition(target, arg1);
    case Transition.ACTION:
        return new ActionTransition(target, arg1, arg2, arg3 !== 0);
    case Transition.SET:
        return new SetTransition(target, sets[arg1]);
    case Transition.NOT_SET:
        return new NotSetTransition(target, sets[arg1]);
    case Transition.WILDCARD:
        return new WildcardTransition(target);
    default:
        throw "The specified transition type: " + type + " is not valid.";
    }
};

ATNDeserializer.prototype.stateFactory = function(type, ruleIndex) {
    if (this.stateFactories === null) {
        var sf = [];
        sf[ATNState.INVALID_TYPE] = null;
        sf[ATNState.BASIC] = function() { return new BasicState(); };
        sf[ATNState.RULE_START] = function() { return new RuleStartState(); };
        sf[ATNState.BLOCK_START] = function() { return new BasicBlockStartState(); };
        sf[ATNState.PLUS_BLOCK_START] = function() { return new PlusBlockStartState(); };
        sf[ATNState.STAR_BLOCK_START] = function() { return new StarBlockStartState(); };
        sf[ATNState.TOKEN_START] = function() { return new TokensStartState(); };
        sf[ATNState.RULE_STOP] = function() { return new RuleStopState(); };
        sf[ATNState.BLOCK_END] = function() { return new BlockEndState(); };
        sf[ATNState.STAR_LOOP_BACK] = function() { return new StarLoopbackState(); };
        sf[ATNState.STAR_LOOP_ENTRY] = function() { return new StarLoopEntryState(); };
        sf[ATNState.PLUS_LOOP_BACK] = function() { return new PlusLoopbackState(); };
        sf[ATNState.LOOP_END] = function() { return new LoopEndState(); };
        this.stateFactories = sf;
    }
    if (type>this.stateFactories.length || this.stateFactories[type] === null) {
        throw("The specified state type " + type + " is not valid.");
    } else {
        var s = this.stateFactories[type]();
        if (s!==null) {
            s.ruleIndex = ruleIndex;
            return s;
        }
    }
};

ATNDeserializer.prototype.lexerActionFactory = function(type, data1, data2) {
    if (this.actionFactories === null) {
        var af = [];
        af[LexerActionType.CHANNEL] = function(data1, data2) { return new LexerChannelAction(data1); };
        af[LexerActionType.CUSTOM] = function(data1, data2) { return new LexerCustomAction(data1, data2); };
        af[LexerActionType.MODE] = function(data1, data2) { return new LexerModeAction(data1); };
        af[LexerActionType.MORE] = function(data1, data2) { return LexerMoreAction.INSTANCE; };
        af[LexerActionType.POP_MODE] = function(data1, data2) { return LexerPopModeAction.INSTANCE; };
        af[LexerActionType.PUSH_MODE] = function(data1, data2) { return new LexerPushModeAction(data1); };
        af[LexerActionType.SKIP] = function(data1, data2) { return LexerSkipAction.INSTANCE; };
        af[LexerActionType.TYPE] = function(data1, data2) { return new LexerTypeAction(data1); };
        this.actionFactories = af;
    }
    if (type>this.actionFactories.length || this.actionFactories[type] === null) {
        throw("The specified lexer action type " + type + " is not valid.");
    } else {
        return this.actionFactories[type](data1, data2);
    }
};
   

exports.ATNDeserializer = ATNDeserializer;
},{"./../IntervalSet":14,"./../Token":22,"./ATN":24,"./ATNDeserializationOptions":27,"./ATNState":30,"./ATNType":31,"./LexerAction":33,"./Transition":38}],29:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

var DFAState = require('./../dfa/DFAState').DFAState;
var ATNConfigSet = require('./ATNConfigSet').ATNConfigSet;
var getCachedPredictionContext = require('./../PredictionContext').getCachedPredictionContext;

function ATNSimulator(atn, sharedContextCache) {
	
    // The context cache maps all PredictionContext objects that are ==
    //  to a single cached copy. This cache is shared across all contexts
    //  in all ATNConfigs in all DFA states.  We rebuild each ATNConfigSet
    //  to use only cached nodes/graphs in addDFAState(). We don't want to
    //  fill this during closure() since there are lots of contexts that
    //  pop up but are not used ever again. It also greatly slows down closure().
    //
    //  <p>This cache makes a huge difference in memory and a little bit in speed.
    //  For the Java grammar on java.*, it dropped the memory requirements
    //  at the end from 25M to 16M. We don't store any of the full context
    //  graphs in the DFA because they are limited to local context only,
    //  but apparently there's a lot of repetition there as well. We optimize
    //  the config contexts before storing the config set in the DFA states
    //  by literally rebuilding them with cached subgraphs only.</p>
    //
    //  <p>I tried a cache for use during closure operations, that was
    //  whacked after each adaptivePredict(). It cost a little bit
    //  more time I think and doesn't save on the overall footprint
    //  so it's not worth the complexity.</p>
    ///
    this.atn = atn;
    this.sharedContextCache = sharedContextCache;
    return this;
}

// Must distinguish between missing edge and edge we know leads nowhere///
ATNSimulator.ERROR = new DFAState(0x7FFFFFFF, new ATNConfigSet());


ATNSimulator.prototype.getCachedContext = function(context) {
    if (this.sharedContextCache ===null) {
        return context;
    }
    var visited = {};
    return getCachedPredictionContext(context, this.sharedContextCache, visited);
};

exports.ATNSimulator = ATNSimulator;

},{"./../PredictionContext":19,"./../dfa/DFAState":42,"./ATNConfigSet":26}],30:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

// The following images show the relation of states and
// {@link ATNState//transitions} for various grammar constructs.
//
// <ul>
//
// <li>Solid edges marked with an &//0949; indicate a required
// {@link EpsilonTransition}.</li>
//
// <li>Dashed edges indicate locations where any transition derived from
// {@link Transition} might appear.</li>
//
// <li>Dashed nodes are place holders for either a sequence of linked
// {@link BasicState} states or the inclusion of a block representing a nested
// construct in one of the forms below.</li>
//
// <li>Nodes showing multiple outgoing alternatives with a {@code ...} support
// any number of alternatives (one or more). Nodes without the {@code ...} only
// support the exact number of alternatives shown in the diagram.</li>
//
// </ul>
//
// <h2>Basic Blocks</h2>
//
// <h3>Rule</h3>
//
// <embed src="images/Rule.svg" type="image/svg+xml"/>
//
// <h3>Block of 1 or more alternatives</h3>
//
// <embed src="images/Block.svg" type="image/svg+xml"/>
//
// <h2>Greedy Loops</h2>
//
// <h3>Greedy Closure: {@code (...)*}</h3>
//
// <embed src="images/ClosureGreedy.svg" type="image/svg+xml"/>
//
// <h3>Greedy Positive Closure: {@code (...)+}</h3>
//
// <embed src="images/PositiveClosureGreedy.svg" type="image/svg+xml"/>
//
// <h3>Greedy Optional: {@code (...)?}</h3>
//
// <embed src="images/OptionalGreedy.svg" type="image/svg+xml"/>
//
// <h2>Non-Greedy Loops</h2>
//
// <h3>Non-Greedy Closure: {@code (...)*?}</h3>
//
// <embed src="images/ClosureNonGreedy.svg" type="image/svg+xml"/>
//
// <h3>Non-Greedy Positive Closure: {@code (...)+?}</h3>
//
// <embed src="images/PositiveClosureNonGreedy.svg" type="image/svg+xml"/>
//
// <h3>Non-Greedy Optional: {@code (...)??}</h3>
//
// <embed src="images/OptionalNonGreedy.svg" type="image/svg+xml"/>
//

var INITIAL_NUM_TRANSITIONS = 4;

function ATNState() {
    // Which ATN are we in?
    this.atn = null;
    this.stateNumber = ATNState.INVALID_STATE_NUMBER;
    this.stateType = null;
    this.ruleIndex = 0; // at runtime, we don't have Rule objects
    this.epsilonOnlyTransitions = false;
    // Track the transitions emanating from this ATN state.
    this.transitions = [];
    // Used to cache lookahead during parsing, not used during construction
    this.nextTokenWithinRule = null;
    return this;
}

// constants for serialization
ATNState.INVALID_TYPE = 0;
ATNState.BASIC = 1;
ATNState.RULE_START = 2;
ATNState.BLOCK_START = 3;
ATNState.PLUS_BLOCK_START = 4;
ATNState.STAR_BLOCK_START = 5;
ATNState.TOKEN_START = 6;
ATNState.RULE_STOP = 7;
ATNState.BLOCK_END = 8;
ATNState.STAR_LOOP_BACK = 9;
ATNState.STAR_LOOP_ENTRY = 10;
ATNState.PLUS_LOOP_BACK = 11;
ATNState.LOOP_END = 12;

ATNState.serializationNames = [
            "INVALID",
            "BASIC",
            "RULE_START",
            "BLOCK_START",
            "PLUS_BLOCK_START",
            "STAR_BLOCK_START",
            "TOKEN_START",
            "RULE_STOP",
            "BLOCK_END",
            "STAR_LOOP_BACK",
            "STAR_LOOP_ENTRY",
            "PLUS_LOOP_BACK",
            "LOOP_END" ];

ATNState.INVALID_STATE_NUMBER = -1;

ATNState.prototype.toString = function() {
	return this.stateNumber;
};

ATNState.prototype.equals = function(other) {
    if (other instanceof ATNState) {
        return this.stateNumber===other.stateNumber;
    } else {
        return false;
    }
};

ATNState.prototype.isNonGreedyExitState = function() {
    return false;
};


ATNState.prototype.addTransition = function(trans, index) {
	if(index===undefined) {
		index = -1;
	}
    if (this.transitions.length===0) {
        this.epsilonOnlyTransitions = trans.isEpsilon;
    } else if(this.epsilonOnlyTransitions !== trans.isEpsilon) {
        this.epsilonOnlyTransitions = false;
    }
    if (index===-1) {
        this.transitions.push(trans);
    } else {
        this.transitions.splice(index, 1, trans);
    }
};

function BasicState() {
	ATNState.call(this);
    this.stateType = ATNState.BASIC;
    return this;
}

BasicState.prototype = Object.create(ATNState.prototype);
BasicState.prototype.constructor = BasicState;


function DecisionState() {
	ATNState.call(this);
    this.decision = -1;
    this.nonGreedy = false;
    return this;
}

DecisionState.prototype = Object.create(ATNState.prototype);
DecisionState.prototype.constructor = DecisionState;


//  The start of a regular {@code (...)} block.
function BlockStartState() {
	DecisionState.call(this);
	this.endState = null;
	return this;
}

BlockStartState.prototype = Object.create(DecisionState.prototype);
BlockStartState.prototype.constructor = BlockStartState;


function BasicBlockStartState() {
	BlockStartState.call(this);
	this.stateType = ATNState.BLOCK_START;
	return this;
}

BasicBlockStartState.prototype = Object.create(BlockStartState.prototype);
BasicBlockStartState.prototype.constructor = BasicBlockStartState;


// Terminal node of a simple {@code (a|b|c)} block.
function BlockEndState() {
	ATNState.call(this);
	this.stateType = ATNState.BLOCK_END;
    this.startState = null;
    return this;
}

BlockEndState.prototype = Object.create(ATNState.prototype);
BlockEndState.prototype.constructor = BlockEndState;


// The last node in the ATN for a rule, unless that rule is the start symbol.
//  In that case, there is one transition to EOF. Later, we might encode
//  references to all calls to this rule to compute FOLLOW sets for
//  error handling.
//
function RuleStopState() {
	ATNState.call(this);
    this.stateType = ATNState.RULE_STOP;
    return this;
}

RuleStopState.prototype = Object.create(ATNState.prototype);
RuleStopState.prototype.constructor = RuleStopState;

function RuleStartState() {
	ATNState.call(this);
	this.stateType = ATNState.RULE_START;
	this.stopState = null;
	this.isPrecedenceRule = false;
	return this;
}

RuleStartState.prototype = Object.create(ATNState.prototype);
RuleStartState.prototype.constructor = RuleStartState;

// Decision state for {@code A+} and {@code (A|B)+}.  It has two transitions:
//  one to the loop back to start of the block and one to exit.
//
function PlusLoopbackState() {
	DecisionState.call(this);
	this.stateType = ATNState.PLUS_LOOP_BACK;
	return this;
}

PlusLoopbackState.prototype = Object.create(DecisionState.prototype);
PlusLoopbackState.prototype.constructor = PlusLoopbackState;
        

// Start of {@code (A|B|...)+} loop. Technically a decision state, but
//  we don't use for code generation; somebody might need it, so I'm defining
//  it for completeness. In reality, the {@link PlusLoopbackState} node is the
//  real decision-making note for {@code A+}.
//
function PlusBlockStartState() {
	BlockStartState.call(this);
	this.stateType = ATNState.PLUS_BLOCK_START;
    this.loopBackState = null;
    return this;
}

PlusBlockStartState.prototype = Object.create(BlockStartState.prototype);
PlusBlockStartState.prototype.constructor = PlusBlockStartState;

// The block that begins a closure loop.
function StarBlockStartState() {
	BlockStartState.call(this);
	this.stateType = ATNState.STAR_BLOCK_START;
	return this;
}

StarBlockStartState.prototype = Object.create(BlockStartState.prototype);
StarBlockStartState.prototype.constructor = StarBlockStartState;


function StarLoopbackState() {
	ATNState.call(this);
	this.stateType = ATNState.STAR_LOOP_BACK;
	return this;
}

StarLoopbackState.prototype = Object.create(ATNState.prototype);
StarLoopbackState.prototype.constructor = StarLoopbackState;


function StarLoopEntryState() {
	DecisionState.call(this);
	this.stateType = ATNState.STAR_LOOP_ENTRY;
    this.loopBackState = null;
    // Indicates whether this state can benefit from a precedence DFA during SLL decision making.
    this.precedenceRuleDecision = null;
    return this;
}

StarLoopEntryState.prototype = Object.create(DecisionState.prototype);
StarLoopEntryState.prototype.constructor = StarLoopEntryState;


// Mark the end of a * or + loop.
function LoopEndState() {
	ATNState.call(this);
	this.stateType = ATNState.LOOP_END;
	this.loopBackState = null;
	return this;
}

LoopEndState.prototype = Object.create(ATNState.prototype);
LoopEndState.prototype.constructor = LoopEndState;


// The Tokens rule start state linking to each lexer rule start state */
function TokensStartState() {
	DecisionState.call(this);
	this.stateType = ATNState.TOKEN_START;
	return this;
}

TokensStartState.prototype = Object.create(DecisionState.prototype);
TokensStartState.prototype.constructor = TokensStartState;

exports.ATNState = ATNState;
exports.BasicState = BasicState;
exports.DecisionState = DecisionState;
exports.BlockStartState = BlockStartState;
exports.BlockEndState = BlockEndState;
exports.LoopEndState = LoopEndState;
exports.RuleStartState = RuleStartState;
exports.RuleStopState = RuleStopState;
exports.TokensStartState = TokensStartState;
exports.PlusLoopbackState = PlusLoopbackState;
exports.StarLoopbackState = StarLoopbackState;
exports.StarLoopEntryState = StarLoopEntryState;
exports.PlusBlockStartState = PlusBlockStartState;
exports.StarBlockStartState = StarBlockStartState;
exports.BasicBlockStartState = BasicBlockStartState;

},{}],31:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

// Represents the type of recognizer an ATN applies to.

function ATNType() {
	
}

ATNType.LEXER = 0;
ATNType.PARSER = 1;

exports.ATNType = ATNType;


},{}],32:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

// When we hit an accept state in either the DFA or the ATN, we
//  have to notify the character stream to start buffering characters
//  via {@link IntStream//mark} and record the current state. The current sim state
//  includes the current index into the input, the current line,
//  and current character position in that line. Note that the Lexer is
//  tracking the starting line and characterization of the token. These
//  variables track the "state" of the simulator when it hits an accept state.
//
//  <p>We track these variables separately for the DFA and ATN simulation
//  because the DFA simulation often has to fail over to the ATN
//  simulation. If the ATN simulation fails, we need the DFA to fall
//  back to its previously accepted state, if any. If the ATN succeeds,
//  then the ATN does the accept and the DFA simulator that invoked it
//  can simply return the predicted token type.</p>
///

var Token = require('./../Token').Token;
var Lexer = require('./../Lexer').Lexer;
var ATN = require('./ATN').ATN;
var ATNSimulator = require('./ATNSimulator').ATNSimulator;
var DFAState = require('./../dfa/DFAState').DFAState;
var ATNConfigSet = require('./ATNConfigSet').ATNConfigSet;
var OrderedATNConfigSet = require('./ATNConfigSet').OrderedATNConfigSet;
var PredictionContext = require('./../PredictionContext').PredictionContext;
var SingletonPredictionContext = require('./../PredictionContext').SingletonPredictionContext;
var RuleStopState = require('./ATNState').RuleStopState;
var LexerATNConfig = require('./ATNConfig').LexerATNConfig;
var Transition = require('./Transition').Transition;
var LexerActionExecutor = require('./LexerActionExecutor').LexerActionExecutor;
var LexerNoViableAltException = require('./../error/Errors').LexerNoViableAltException;

function resetSimState(sim) {
	sim.index = -1;
	sim.line = 0;
	sim.column = -1;
	sim.dfaState = null;
}

function SimState() {
	resetSimState(this);
	return this;
}

SimState.prototype.reset = function() {
	resetSimState(this);
};

function LexerATNSimulator(recog, atn, decisionToDFA, sharedContextCache) {
	ATNSimulator.call(this, atn, sharedContextCache);
	this.decisionToDFA = decisionToDFA;
	this.recog = recog;
	// The current token's starting index into the character stream.
	// Shared across DFA to ATN simulation in case the ATN fails and the
	// DFA did not have a previous accept state. In this case, we use the
	// ATN-generated exception object.
	this.startIndex = -1;
	// line number 1..n within the input///
	this.line = 1;
	// The index of the character relative to the beginning of the line
	// 0..n-1///
	this.column = 0;
	this.mode = Lexer.DEFAULT_MODE;
	// Used during DFA/ATN exec to record the most recent accept configuration
	// info
	this.prevAccept = new SimState();
	// done
	return this;
}

LexerATNSimulator.prototype = Object.create(ATNSimulator.prototype);
LexerATNSimulator.prototype.constructor = LexerATNSimulator;

LexerATNSimulator.debug = false;
LexerATNSimulator.dfa_debug = false;

LexerATNSimulator.MIN_DFA_EDGE = 0;
LexerATNSimulator.MAX_DFA_EDGE = 127; // forces unicode to stay in ATN

LexerATNSimulator.match_calls = 0;

LexerATNSimulator.prototype.copyState = function(simulator) {
	this.column = simulator.column;
	this.line = simulator.line;
	this.mode = simulator.mode;
	this.startIndex = simulator.startIndex;
};

LexerATNSimulator.prototype.match = function(input, mode) {
	this.match_calls += 1;
	this.mode = mode;
	var mark = input.mark();
	try {
		this.startIndex = input.index;
		this.prevAccept.reset();
		var dfa = this.decisionToDFA[mode];
		if (dfa.s0 === null) {
			return this.matchATN(input);
		} else {
			return this.execATN(input, dfa.s0);
		}
	} finally {
		input.release(mark);
	}
};

LexerATNSimulator.prototype.reset = function() {
	this.prevAccept.reset();
	this.startIndex = -1;
	this.line = 1;
	this.column = 0;
	this.mode = Lexer.DEFAULT_MODE;
};

LexerATNSimulator.prototype.matchATN = function(input) {
	var startState = this.atn.modeToStartState[this.mode];

	if (this.debug) {
		console.log("matchATN mode " + this.mode + " start: " + startState);
	}
	var old_mode = this.mode;
	var s0_closure = this.computeStartState(input, startState);
	var suppressEdge = s0_closure.hasSemanticContext;
	s0_closure.hasSemanticContext = false;

	var next = this.addDFAState(s0_closure);
	if (!suppressEdge) {
		this.decisionToDFA[this.mode].s0 = next;
	}

	var predict = this.execATN(input, next);

	if (this.debug) {
		console.log("DFA after matchATN: " + this.decisionToDFA[old_mode].toLexerString());
	}
	return predict;
};

LexerATNSimulator.prototype.execATN = function(input, ds0) {
	if (this.debug) {
		console.log("start state closure=" + ds0.configs);
	}
	if (ds0.isAcceptState) {
		// allow zero-length tokens
		this.captureSimState(this.prevAccept, input, ds0);
	}
	var t = input.LA(1);
	var s = ds0; // s is current/from DFA state

	while (true) { // while more work
		if (this.debug) {
			console.log("execATN loop starting closure: " + s.configs);
		}

		// As we move src->trg, src->trg, we keep track of the previous trg to
		// avoid looking up the DFA state again, which is expensive.
		// If the previous target was already part of the DFA, we might
		// be able to avoid doing a reach operation upon t. If s!=null,
		// it means that semantic predicates didn't prevent us from
		// creating a DFA state. Once we know s!=null, we check to see if
		// the DFA state has an edge already for t. If so, we can just reuse
		// it's configuration set; there's no point in re-computing it.
		// This is kind of like doing DFA simulation within the ATN
		// simulation because DFA simulation is really just a way to avoid
		// computing reach/closure sets. Technically, once we know that
		// we have a previously added DFA state, we could jump over to
		// the DFA simulator. But, that would mean popping back and forth
		// a lot and making things more complicated algorithmically.
		// This optimization makes a lot of sense for loops within DFA.
		// A character will take us back to an existing DFA state
		// that already has lots of edges out of it. e.g., .* in comments.
		// print("Target for:" + str(s) + " and:" + str(t))
		var target = this.getExistingTargetState(s, t);
		// print("Existing:" + str(target))
		if (target === null) {
			target = this.computeTargetState(input, s, t);
			// print("Computed:" + str(target))
		}
		if (target === ATNSimulator.ERROR) {
			break;
		}
		// If this is a consumable input element, make sure to consume before
		// capturing the accept state so the input index, line, and char
		// position accurately reflect the state of the interpreter at the
		// end of the token.
		if (t !== Token.EOF) {
			this.consume(input);
		}
		if (target.isAcceptState) {
			this.captureSimState(this.prevAccept, input, target);
			if (t === Token.EOF) {
				break;
			}
		}
		t = input.LA(1);
		s = target; // flip; current DFA target becomes new src/from state
	}
	return this.failOrAccept(this.prevAccept, input, s.configs, t);
};

// Get an existing target state for an edge in the DFA. If the target state
// for the edge has not yet been computed or is otherwise not available,
// this method returns {@code null}.
//
// @param s The current DFA state
// @param t The next input symbol
// @return The existing target DFA state for the given input symbol
// {@code t}, or {@code null} if the target state for this edge is not
// already cached
LexerATNSimulator.prototype.getExistingTargetState = function(s, t) {
	if (s.edges === null || t < LexerATNSimulator.MIN_DFA_EDGE || t > LexerATNSimulator.MAX_DFA_EDGE) {
		return null;
	}

	var target = s.edges[t - LexerATNSimulator.MIN_DFA_EDGE];
	if(target===undefined) {
		target = null;
	}
	if (this.debug && target !== null) {
		console.log("reuse state " + s.stateNumber + " edge to " + target.stateNumber);
	}
	return target;
};

// Compute a target state for an edge in the DFA, and attempt to add the
// computed state and corresponding edge to the DFA.
//
// @param input The input stream
// @param s The current DFA state
// @param t The next input symbol
//
// @return The computed target DFA state for the given input symbol
// {@code t}. If {@code t} does not lead to a valid DFA state, this method
// returns {@link //ERROR}.
LexerATNSimulator.prototype.computeTargetState = function(input, s, t) {
	var reach = new OrderedATNConfigSet();
	// if we don't find an existing DFA state
	// Fill reach starting from closure, following t transitions
	this.getReachableConfigSet(input, s.configs, reach, t);

	if (reach.items.length === 0) { // we got nowhere on t from s
		if (!reach.hasSemanticContext) {
			// we got nowhere on t, don't throw out this knowledge; it'd
			// cause a failover from DFA later.
			this.addDFAEdge(s, t, ATNSimulator.ERROR);
		}
		// stop when we can't match any more char
		return ATNSimulator.ERROR;
	}
	// Add an edge from s to target DFA found/created for reach
	return this.addDFAEdge(s, t, null, reach);
};

LexerATNSimulator.prototype.failOrAccept = function(prevAccept, input, reach, t) {
	if (this.prevAccept.dfaState !== null) {
		var lexerActionExecutor = prevAccept.dfaState.lexerActionExecutor;
		this.accept(input, lexerActionExecutor, this.startIndex,
				prevAccept.index, prevAccept.line, prevAccept.column);
		return prevAccept.dfaState.prediction;
	} else {
		// if no accept and EOF is first char, return EOF
		if (t === Token.EOF && input.index === this.startIndex) {
			return Token.EOF;
		}
		throw new LexerNoViableAltException(this.recog, input, this.startIndex, reach);
	}
};

// Given a starting configuration set, figure out all ATN configurations
// we can reach upon input {@code t}. Parameter {@code reach} is a return
// parameter.
LexerATNSimulator.prototype.getReachableConfigSet = function(input, closure,
		reach, t) {
	// this is used to skip processing for configs which have a lower priority
	// than a config that already reached an accept state for the same rule
	var skipAlt = ATN.INVALID_ALT_NUMBER;
	for (var i = 0; i < closure.items.length; i++) {
		var cfg = closure.items[i];
		var currentAltReachedAcceptState = (cfg.alt === skipAlt);
		if (currentAltReachedAcceptState && cfg.passedThroughNonGreedyDecision) {
			continue;
		}
		if (this.debug) {
			console.log("testing %s at %s\n", this.getTokenName(t), cfg
					.toString(this.recog, true));
		}
		for (var j = 0; j < cfg.state.transitions.length; j++) {
			var trans = cfg.state.transitions[j]; // for each transition
			var target = this.getReachableTarget(trans, t);
			if (target !== null) {
				var lexerActionExecutor = cfg.lexerActionExecutor;
				if (lexerActionExecutor !== null) {
					lexerActionExecutor = lexerActionExecutor.fixOffsetBeforeMatch(input.index - this.startIndex);
				}
				var treatEofAsEpsilon = (t === Token.EOF);
				var config = new LexerATNConfig({state:target, lexerActionExecutor:lexerActionExecutor}, cfg);
				if (this.closure(input, config, reach,
						currentAltReachedAcceptState, true, treatEofAsEpsilon)) {
					// any remaining configs for this alt have a lower priority
					// than the one that just reached an accept state.
					skipAlt = cfg.alt;
				}
			}
		}
	}
};

LexerATNSimulator.prototype.accept = function(input, lexerActionExecutor,
		startIndex, index, line, charPos) {
	if (this.debug) {
		console.log("ACTION %s\n", lexerActionExecutor);
	}
	// seek to after last char in token
	input.seek(index);
	this.line = line;
	this.column = charPos;
	if (lexerActionExecutor !== null && this.recog !== null) {
		lexerActionExecutor.execute(this.recog, input, startIndex);
	}
};

LexerATNSimulator.prototype.getReachableTarget = function(trans, t) {
	if (trans.matches(t, 0, 0xFFFE)) {
		return trans.target;
	} else {
		return null;
	}
};

LexerATNSimulator.prototype.computeStartState = function(input, p) {
	var initialContext = PredictionContext.EMPTY;
	var configs = new OrderedATNConfigSet();
	for (var i = 0; i < p.transitions.length; i++) {
		var target = p.transitions[i].target;
        var cfg = new LexerATNConfig({state:target, alt:i+1, context:initialContext}, null);
		this.closure(input, cfg, configs, false, false, false);
	}
	return configs;
};

// Since the alternatives within any lexer decision are ordered by
// preference, this method stops pursuing the closure as soon as an accept
// state is reached. After the first accept state is reached by depth-first
// search from {@code config}, all other (potentially reachable) states for
// this rule would have a lower priority.
//
// @return {@code true} if an accept state is reached, otherwise
// {@code false}.
LexerATNSimulator.prototype.closure = function(input, config, configs,
		currentAltReachedAcceptState, speculative, treatEofAsEpsilon) {
	var cfg = null;
	if (this.debug) {
		console.log("closure(" + config.toString(this.recog, true) + ")");
	}
	if (config.state instanceof RuleStopState) {
		if (this.debug) {
			if (this.recog !== null) {
				console.log("closure at %s rule stop %s\n", this.recog.getRuleNames()[config.state.ruleIndex], config);
			} else {
				console.log("closure at rule stop %s\n", config);
			}
		}
		if (config.context === null || config.context.hasEmptyPath()) {
			if (config.context === null || config.context.isEmpty()) {
				configs.add(config);
				return true;
			} else {
				configs.add(new LexerATNConfig({ state:config.state, context:PredictionContext.EMPTY}, config));
				currentAltReachedAcceptState = true;
			}
		}
		if (config.context !== null && !config.context.isEmpty()) {
			for (var i = 0; i < config.context.length; i++) {
				if (config.context.getReturnState(i) !== PredictionContext.EMPTY_RETURN_STATE) {
					var newContext = config.context.getParent(i); // "pop" return state
					var returnState = this.atn.states[config.context.getReturnState(i)];
					cfg = new LexerATNConfig({ state:returnState, context:newContext }, config);
					currentAltReachedAcceptState = this.closure(input, cfg,
							configs, currentAltReachedAcceptState, speculative,
							treatEofAsEpsilon);
				}
			}
		}
		return currentAltReachedAcceptState;
	}
	// optimization
	if (!config.state.epsilonOnlyTransitions) {
		if (!currentAltReachedAcceptState || !config.passedThroughNonGreedyDecision) {
			configs.add(config);
		}
	}
	for (var j = 0; j < config.state.transitions.length; j++) {
		var trans = config.state.transitions[j];
		cfg = this.getEpsilonTarget(input, config, trans, configs, speculative, treatEofAsEpsilon);
		if (cfg !== null) {
			currentAltReachedAcceptState = this.closure(input, cfg, configs,
					currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
		}
	}
	return currentAltReachedAcceptState;
};

// side-effect: can alter configs.hasSemanticContext
LexerATNSimulator.prototype.getEpsilonTarget = function(input, config, trans,
		configs, speculative, treatEofAsEpsilon) {
	var cfg = null;
	if (trans.serializationType === Transition.RULE) {
		var newContext = SingletonPredictionContext.create(config.context, trans.followState.stateNumber);
		cfg = new LexerATNConfig( { state:trans.target, context:newContext}, config);
	} else if (trans.serializationType === Transition.PRECEDENCE) {
		throw "Precedence predicates are not supported in lexers.";
	} else if (trans.serializationType === Transition.PREDICATE) {
		// Track traversing semantic predicates. If we traverse,
		// we cannot add a DFA state for this "reach" computation
		// because the DFA would not test the predicate again in the
		// future. Rather than creating collections of semantic predicates
		// like v3 and testing them on prediction, v4 will test them on the
		// fly all the time using the ATN not the DFA. This is slower but
		// semantically it's not used that often. One of the key elements to
		// this predicate mechanism is not adding DFA states that see
		// predicates immediately afterwards in the ATN. For example,

		// a : ID {p1}? | ID {p2}? ;

		// should create the start state for rule 'a' (to save start state
		// competition), but should not create target of ID state. The
		// collection of ATN states the following ID references includes
		// states reached by traversing predicates. Since this is when we
		// test them, we cannot cash the DFA state target of ID.

		if (this.debug) {
			console.log("EVAL rule " + trans.ruleIndex + ":" + trans.predIndex);
		}
		configs.hasSemanticContext = true;
		if (this.evaluatePredicate(input, trans.ruleIndex, trans.predIndex, speculative)) {
			cfg = new LexerATNConfig({ state:trans.target}, config);
		}
	} else if (trans.serializationType === Transition.ACTION) {
		if (config.context === null || config.context.hasEmptyPath()) {
			// execute actions anywhere in the start rule for a token.
			//
			// TODO: if the entry rule is invoked recursively, some
			// actions may be executed during the recursive call. The
			// problem can appear when hasEmptyPath() is true but
			// isEmpty() is false. In this case, the config needs to be
			// split into two contexts - one with just the empty path
			// and another with everything but the empty path.
			// Unfortunately, the current algorithm does not allow
			// getEpsilonTarget to return two configurations, so
			// additional modifications are needed before we can support
			// the split operation.
			var lexerActionExecutor = LexerActionExecutor.append(config.lexerActionExecutor,
					this.atn.lexerActions[trans.actionIndex]);
			cfg = new LexerATNConfig({ state:trans.target, lexerActionExecutor:lexerActionExecutor }, config);
		} else {
			// ignore actions in referenced rules
			cfg = new LexerATNConfig( { state:trans.target}, config);
		}
	} else if (trans.serializationType === Transition.EPSILON) {
		cfg = new LexerATNConfig({ state:trans.target}, config);
	} else if (trans.serializationType === Transition.ATOM ||
				trans.serializationType === Transition.RANGE ||
				trans.serializationType === Transition.SET) {
		if (treatEofAsEpsilon) {
			if (trans.matches(Token.EOF, 0, 0xFFFF)) {
				cfg = new LexerATNConfig( { state:trans.target }, config);
			}
		}
	}
	return cfg;
};

// Evaluate a predicate specified in the lexer.
//
// <p>If {@code speculative} is {@code true}, this method was called before
// {@link //consume} for the matched character. This method should call
// {@link //consume} before evaluating the predicate to ensure position
// sensitive values, including {@link Lexer//getText}, {@link Lexer//getLine},
// and {@link Lexer//getcolumn}, properly reflect the current
// lexer state. This method should restore {@code input} and the simulator
// to the original state before returning (i.e. undo the actions made by the
// call to {@link //consume}.</p>
//
// @param input The input stream.
// @param ruleIndex The rule containing the predicate.
// @param predIndex The index of the predicate within the rule.
// @param speculative {@code true} if the current index in {@code input} is
// one character before the predicate's location.
//
// @return {@code true} if the specified predicate evaluates to
// {@code true}.
// /
LexerATNSimulator.prototype.evaluatePredicate = function(input, ruleIndex,
		predIndex, speculative) {
	// assume true if no recognizer was provided
	if (this.recog === null) {
		return true;
	}
	if (!speculative) {
		return this.recog.sempred(null, ruleIndex, predIndex);
	}
	var savedcolumn = this.column;
	var savedLine = this.line;
	var index = input.index;
	var marker = input.mark();
	try {
		this.consume(input);
		return this.recog.sempred(null, ruleIndex, predIndex);
	} finally {
		this.column = savedcolumn;
		this.line = savedLine;
		input.seek(index);
		input.release(marker);
	}
};

LexerATNSimulator.prototype.captureSimState = function(settings, input, dfaState) {
	settings.index = input.index;
	settings.line = this.line;
	settings.column = this.column;
	settings.dfaState = dfaState;
};

LexerATNSimulator.prototype.addDFAEdge = function(from_, tk, to, cfgs) {
	if (to === undefined) {
		to = null;
	}
	if (cfgs === undefined) {
		cfgs = null;
	}
	if (to === null && cfgs !== null) {
		// leading to this call, ATNConfigSet.hasSemanticContext is used as a
		// marker indicating dynamic predicate evaluation makes this edge
		// dependent on the specific input sequence, so the static edge in the
		// DFA should be omitted. The target DFAState is still created since
		// execATN has the ability to resynchronize with the DFA state cache
		// following the predicate evaluation step.
		//
		// TJP notes: next time through the DFA, we see a pred again and eval.
		// If that gets us to a previously created (but dangling) DFA
		// state, we can continue in pure DFA mode from there.
		// /
		var suppressEdge = cfgs.hasSemanticContext;
		cfgs.hasSemanticContext = false;

		to = this.addDFAState(cfgs);

		if (suppressEdge) {
			return to;
		}
	}
	// add the edge
	if (tk < LexerATNSimulator.MIN_DFA_EDGE || tk > LexerATNSimulator.MAX_DFA_EDGE) {
		// Only track edges within the DFA bounds
		return to;
	}
	if (this.debug) {
		console.log("EDGE " + from_ + " -> " + to + " upon " + tk);
	}
	if (from_.edges === null) {
		// make room for tokens 1..n and -1 masquerading as index 0
		from_.edges = [];
	}
	from_.edges[tk - LexerATNSimulator.MIN_DFA_EDGE] = to; // connect

	return to;
};

// Add a new DFA state if there isn't one with this set of
// configurations already. This method also detects the first
// configuration containing an ATN rule stop state. Later, when
// traversing the DFA, we will know which rule to accept.
LexerATNSimulator.prototype.addDFAState = function(configs) {
	var proposed = new DFAState(null, configs);
	var firstConfigWithRuleStopState = null;
	for (var i = 0; i < configs.items.length; i++) {
		var cfg = configs.items[i];
		if (cfg.state instanceof RuleStopState) {
			firstConfigWithRuleStopState = cfg;
			break;
		}
	}
	if (firstConfigWithRuleStopState !== null) {
		proposed.isAcceptState = true;
		proposed.lexerActionExecutor = firstConfigWithRuleStopState.lexerActionExecutor;
		proposed.prediction = this.atn.ruleToTokenType[firstConfigWithRuleStopState.state.ruleIndex];
	}
	var hash = proposed.hashString();
	var dfa = this.decisionToDFA[this.mode];
	var existing = dfa.states[hash] || null;
	if (existing!==null) {
		return existing;
	}
	var newState = proposed;
	newState.stateNumber = dfa.states.length;
	configs.setReadonly(true);
	newState.configs = configs;
	dfa.states[hash] = newState;
	return newState;
};

LexerATNSimulator.prototype.getDFA = function(mode) {
	return this.decisionToDFA[mode];
};

// Get the text matched so far for the current token.
LexerATNSimulator.prototype.getText = function(input) {
	// index is first lookahead char, don't include.
	return input.getText(this.startIndex, input.index - 1);
};

LexerATNSimulator.prototype.consume = function(input) {
	var curChar = input.LA(1);
	if (curChar === "\n".charCodeAt(0)) {
		this.line += 1;
		this.column = 0;
	} else {
		this.column += 1;
	}
	input.consume();
};

LexerATNSimulator.prototype.getTokenName = function(tt) {
	if (tt === -1) {
		return "EOF";
	} else {
		return "'" + String.fromCharCode(tt) + "'";
	}
};

exports.LexerATNSimulator = LexerATNSimulator;

},{"./../Lexer":16,"./../PredictionContext":19,"./../Token":22,"./../dfa/DFAState":42,"./../error/Errors":47,"./ATN":24,"./ATNConfig":25,"./ATNConfigSet":26,"./ATNSimulator":29,"./ATNState":30,"./LexerActionExecutor":34,"./Transition":38}],33:[function(require,module,exports){
//
 //[The "BSD license"]
 // Copyright (c) 2013 Terence Parr
 // Copyright (c) 2013 Sam Harwell
 // Copyright (c) 2014 Eric Vergnaud
 // All rights reserved.
 //
 // Redistribution and use in source and binary forms, with or without
 // modification, are permitted provided that the following conditions
 // are met:
 //
 // 1. Redistributions of source code must retain the above copyright
 //    notice, this list of conditions and the following disclaimer.
 // 2. Redistributions in binary form must reproduce the above copyright
 //    notice, this list of conditions and the following disclaimer in the
 //    documentation and/or other materials provided with the distribution.
 // 3. The name of the author may not be used to endorse or promote products
 //    derived from this software without specific prior written permission.
 //
 // THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 // IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 // OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 // IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 // INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 // NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 // THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 //

function LexerActionType() {
}

LexerActionType.CHANNEL = 0;     //The type of a {@link LexerChannelAction} action.
LexerActionType.CUSTOM = 1;      //The type of a {@link LexerCustomAction} action.
LexerActionType.MODE = 2;        //The type of a {@link LexerModeAction} action.
LexerActionType.MORE = 3;        //The type of a {@link LexerMoreAction} action.
LexerActionType.POP_MODE = 4;    //The type of a {@link LexerPopModeAction} action.
LexerActionType.PUSH_MODE = 5;   //The type of a {@link LexerPushModeAction} action.
LexerActionType.SKIP = 6;        //The type of a {@link LexerSkipAction} action.
LexerActionType.TYPE = 7;        //The type of a {@link LexerTypeAction} action.

function LexerAction(action) {
    this.actionType = action;
    this.isPositionDependent = false;
    return this;
}

LexerAction.prototype.hashString = function() {
    return "" + this.actionType;
};

LexerAction.prototype.equals = function(other) {
    return this === other;
};



//
// Implements the {@code skip} lexer action by calling {@link Lexer//skip}.
//
// <p>The {@code skip} command does not have any parameters, so this action is
// implemented as a singleton instance exposed by {@link //INSTANCE}.</p>
function LexerSkipAction() {
	LexerAction.call(this, LexerActionType.SKIP);
	return this;
}

LexerSkipAction.prototype = Object.create(LexerAction.prototype);
LexerSkipAction.prototype.constructor = LexerSkipAction;

// Provides a singleton instance of this parameterless lexer action.
LexerSkipAction.INSTANCE = new LexerSkipAction();

LexerSkipAction.prototype.execute = function(lexer) {
    lexer.skip();
};

LexerSkipAction.prototype.toString = function() {
	return "skip";
};

//  Implements the {@code type} lexer action by calling {@link Lexer//setType}
// with the assigned type.
function LexerTypeAction(type) {
	LexerAction.call(this, LexerActionType.TYPE);
	this.type = type;
	return this;
}

LexerTypeAction.prototype = Object.create(LexerAction.prototype);
LexerTypeAction.prototype.constructor = LexerTypeAction;

LexerTypeAction.prototype.execute = function(lexer) {
    lexer.type = this.type;
};

LexerTypeAction.prototype.hashString = function() {
	return "" + this.actionType + this.type;
};


LexerTypeAction.prototype.equals = function(other) {
    if(this === other) {
        return true;
    } else if (! (other instanceof LexerTypeAction)) {
        return false;
    } else {
        return this.type === other.type;
    }
};

LexerTypeAction.prototype.toString = function() {
    return "type(" + this.type + ")";
};

// Implements the {@code pushMode} lexer action by calling
// {@link Lexer//pushMode} with the assigned mode.
function LexerPushModeAction(mode) {
	LexerAction.call(this, LexerActionType.PUSH_MODE);
    this.mode = mode;
    return this;
}

LexerPushModeAction.prototype = Object.create(LexerAction.prototype);
LexerPushModeAction.prototype.constructor = LexerPushModeAction;

// <p>This action is implemented by calling {@link Lexer//pushMode} with the
// value provided by {@link //getMode}.</p>
LexerPushModeAction.prototype.execute = function(lexer) {
    lexer.pushMode(this.mode);
};

LexerPushModeAction.prototype.hashString = function() {
    return "" + this.actionType + this.mode;
};

LexerPushModeAction.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (! (other instanceof LexerPushModeAction)) {
        return false;
    } else {
        return this.mode === other.mode;
    }
};

LexerPushModeAction.prototype.toString = function() {
	return "pushMode(" + this.mode + ")";
};


// Implements the {@code popMode} lexer action by calling {@link Lexer//popMode}.
//
// <p>The {@code popMode} command does not have any parameters, so this action is
// implemented as a singleton instance exposed by {@link //INSTANCE}.</p>
function LexerPopModeAction() {
	LexerAction.call(this,LexerActionType.POP_MODE);
	return this;
}

LexerPopModeAction.prototype = Object.create(LexerAction.prototype);
LexerPopModeAction.prototype.constructor = LexerPopModeAction;

LexerPopModeAction.INSTANCE = new LexerPopModeAction();

// <p>This action is implemented by calling {@link Lexer//popMode}.</p>
LexerPopModeAction.prototype.execute = function(lexer) {
    lexer.popMode();
};

LexerPopModeAction.prototype.toString = function() {
	return "popMode";
};

// Implements the {@code more} lexer action by calling {@link Lexer//more}.
//
// <p>The {@code more} command does not have any parameters, so this action is
// implemented as a singleton instance exposed by {@link //INSTANCE}.</p>
function LexerMoreAction() {
	LexerAction.call(this, LexerActionType.MORE);
	return this;
}

LexerMoreAction.prototype = Object.create(LexerAction.prototype);
LexerMoreAction.prototype.constructor = LexerMoreAction;

LexerMoreAction.INSTANCE = new LexerMoreAction();

// <p>This action is implemented by calling {@link Lexer//popMode}.</p>
LexerMoreAction.prototype.execute = function(lexer) {
    lexer.more();
};

LexerMoreAction.prototype.toString = function() {
    return "more";
};


// Implements the {@code mode} lexer action by calling {@link Lexer//mode} with
// the assigned mode.
function LexerModeAction(mode) {
	LexerAction.call(this, LexerActionType.MODE);
    this.mode = mode;
    return this;
}

LexerModeAction.prototype = Object.create(LexerAction.prototype);
LexerModeAction.prototype.constructor = LexerModeAction;

// <p>This action is implemented by calling {@link Lexer//mode} with the
// value provided by {@link //getMode}.</p>
LexerModeAction.prototype.execute = function(lexer) {
    lexer.mode(this.mode);
};

LexerModeAction.prototype.hashString = function() {
	return "" + this.actionType + this.mode;
};

LexerModeAction.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (! (other instanceof LexerModeAction)) {
        return false;
    } else {
        return this.mode === other.mode;
    }
};

LexerModeAction.prototype.toString = function() {
    return "mode(" + this.mode + ")";
};

// Executes a custom lexer action by calling {@link Recognizer//action} with the
// rule and action indexes assigned to the custom action. The implementation of
// a custom action is added to the generated code for the lexer in an override
// of {@link Recognizer//action} when the grammar is compiled.
//
// <p>This class may represent embedded actions created with the <code>{...}</code>
// syntax in ANTLR 4, as well as actions created for lexer commands where the
// command argument could not be evaluated when the grammar was compiled.</p>


    // Constructs a custom lexer action with the specified rule and action
    // indexes.
    //
    // @param ruleIndex The rule index to use for calls to
    // {@link Recognizer//action}.
    // @param actionIndex The action index to use for calls to
    // {@link Recognizer//action}.

function LexerCustomAction(ruleIndex, actionIndex) {
	LexerAction.call(this, LexerActionType.CUSTOM);
    this.ruleIndex = ruleIndex;
    this.actionIndex = actionIndex;
    this.isPositionDependent = true;
    return this;
}

LexerCustomAction.prototype = Object.create(LexerAction.prototype);
LexerCustomAction.prototype.constructor = LexerCustomAction;

// <p>Custom actions are implemented by calling {@link Lexer//action} with the
// appropriate rule and action indexes.</p>
LexerCustomAction.prototype.execute = function(lexer) {
    lexer.action(null, this.ruleIndex, this.actionIndex);
};

LexerCustomAction.prototype.hashString = function() {
    return "" + this.actionType + this.ruleIndex + this.actionIndex;
};

LexerCustomAction.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (! (other instanceof LexerCustomAction)) {
        return false;
    } else {
        return this.ruleIndex === other.ruleIndex && this.actionIndex === other.actionIndex;
    }
};

// Implements the {@code channel} lexer action by calling
// {@link Lexer//setChannel} with the assigned channel.
// Constructs a new {@code channel} action with the specified channel value.
// @param channel The channel value to pass to {@link Lexer//setChannel}.
function LexerChannelAction(channel) {
	LexerAction.call(this, LexerActionType.CHANNEL);
    this.channel = channel;
    return this;
}

LexerChannelAction.prototype = Object.create(LexerAction.prototype);
LexerChannelAction.prototype.constructor = LexerChannelAction;

// <p>This action is implemented by calling {@link Lexer//setChannel} with the
// value provided by {@link //getChannel}.</p>
LexerChannelAction.prototype.execute = function(lexer) {
    lexer._channel = this.channel;
};

LexerChannelAction.prototype.hashString = function() {
    return "" + this.actionType + this.channel;
};

LexerChannelAction.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (! (other instanceof LexerChannelAction)) {
        return false;
    } else {
        return this.channel === other.channel;
    }
};

LexerChannelAction.prototype.toString = function() {
    return "channel(" + this.channel + ")";
};

// This implementation of {@link LexerAction} is used for tracking input offsets
// for position-dependent actions within a {@link LexerActionExecutor}.
//
// <p>This action is not serialized as part of the ATN, and is only required for
// position-dependent lexer actions which appear at a location other than the
// end of a rule. For more information about DFA optimizations employed for
// lexer actions, see {@link LexerActionExecutor//append} and
// {@link LexerActionExecutor//fixOffsetBeforeMatch}.</p>

// Constructs a new indexed custom action by associating a character offset
// with a {@link LexerAction}.
//
// <p>Note: This class is only required for lexer actions for which
// {@link LexerAction//isPositionDependent} returns {@code true}.</p>
//
// @param offset The offset into the input {@link CharStream}, relative to
// the token start index, at which the specified lexer action should be
// executed.
// @param action The lexer action to execute at a particular offset in the
// input {@link CharStream}.
function LexerIndexedCustomAction(offset, action) {
	LexerAction.call(this, action.actionType);
    this.offset = offset;
    this.action = action;
    this.isPositionDependent = true;
    return this;
}

LexerIndexedCustomAction.prototype = Object.create(LexerAction.prototype);
LexerIndexedCustomAction.prototype.constructor = LexerIndexedCustomAction;

// <p>This method calls {@link //execute} on the result of {@link //getAction}
// using the provided {@code lexer}.</p>
LexerIndexedCustomAction.prototype.execute = function(lexer) {
    // assume the input stream position was properly set by the calling code
    this.action.execute(lexer);
};

LexerIndexedCustomAction.prototype.hashString = function() {
    return "" + this.actionType + this.offset + this.action;
};

LexerIndexedCustomAction.prototype.equals = function(other) {
    if (this === other) {
        return true;
    } else if (! (other instanceof LexerIndexedCustomAction)) {
        return false;
    } else {
        return this.offset === other.offset && this.action === other.action;
    }
};


exports.LexerActionType = LexerActionType;
exports.LexerSkipAction = LexerSkipAction;
exports.LexerChannelAction = LexerChannelAction;
exports.LexerCustomAction = LexerCustomAction;
exports.LexerIndexedCustomAction = LexerIndexedCustomAction;
exports.LexerMoreAction = LexerMoreAction;
exports.LexerTypeAction = LexerTypeAction;
exports.LexerPushModeAction = LexerPushModeAction;
exports.LexerPopModeAction = LexerPopModeAction;
exports.LexerModeAction = LexerModeAction;
},{}],34:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

// Represents an executor for a sequence of lexer actions which traversed during
// the matching operation of a lexer rule (token).
//
// <p>The executor tracks position information for position-dependent lexer actions
// efficiently, ensuring that actions appearing only at the end of the rule do
// not cause bloating of the {@link DFA} created for the lexer.</p>

var LexerIndexedCustomAction = require('./LexerAction').LexerIndexedCustomAction;

function LexerActionExecutor(lexerActions) {
	this.lexerActions = lexerActions === null ? [] : lexerActions;
	// Caches the result of {@link //hashCode} since the hash code is an element
	// of the performance-critical {@link LexerATNConfig//hashCode} operation.
	this.hashString = lexerActions.toString(); // "".join([str(la) for la in
	// lexerActions]))
	return this;
}

// Creates a {@link LexerActionExecutor} which executes the actions for
// the input {@code lexerActionExecutor} followed by a specified
// {@code lexerAction}.
//
// @param lexerActionExecutor The executor for actions already traversed by
// the lexer while matching a token within a particular
// {@link LexerATNConfig}. If this is {@code null}, the method behaves as
// though it were an empty executor.
// @param lexerAction The lexer action to execute after the actions
// specified in {@code lexerActionExecutor}.
//
// @return A {@link LexerActionExecutor} for executing the combine actions
// of {@code lexerActionExecutor} and {@code lexerAction}.
LexerActionExecutor.append = function(lexerActionExecutor, lexerAction) {
	if (lexerActionExecutor === null) {
		return new LexerActionExecutor([ lexerAction ]);
	}
	var lexerActions = lexerActionExecutor.lexerActions.concat([ lexerAction ]);
	return new LexerActionExecutor(lexerActions);
};

// Creates a {@link LexerActionExecutor} which encodes the current offset
// for position-dependent lexer actions.
//
// <p>Normally, when the executor encounters lexer actions where
// {@link LexerAction//isPositionDependent} returns {@code true}, it calls
// {@link IntStream//seek} on the input {@link CharStream} to set the input
// position to the <em>end</em> of the current token. This behavior provides
// for efficient DFA representation of lexer actions which appear at the end
// of a lexer rule, even when the lexer rule matches a variable number of
// characters.</p>
//
// <p>Prior to traversing a match transition in the ATN, the current offset
// from the token start index is assigned to all position-dependent lexer
// actions which have not already been assigned a fixed offset. By storing
// the offsets relative to the token start index, the DFA representation of
// lexer actions which appear in the middle of tokens remains efficient due
// to sharing among tokens of the same length, regardless of their absolute
// position in the input stream.</p>
//
// <p>If the current executor already has offsets assigned to all
// position-dependent lexer actions, the method returns {@code this}.</p>
//
// @param offset The current offset to assign to all position-dependent
// lexer actions which do not already have offsets assigned.
//
// @return A {@link LexerActionExecutor} which stores input stream offsets
// for all position-dependent lexer actions.
// /
LexerActionExecutor.prototype.fixOffsetBeforeMatch = function(offset) {
	var updatedLexerActions = null;
	for (var i = 0; i < this.lexerActions.length; i++) {
		if (this.lexerActions[i].isPositionDependent &&
				!(this.lexerActions[i] instanceof LexerIndexedCustomAction)) {
			if (updatedLexerActions === null) {
				updatedLexerActions = this.lexerActions.concat([]);
			}
			updatedLexerActions[i] = new LexerIndexedCustomAction(offset,
					this.lexerActions[i]);
		}
	}
	if (updatedLexerActions === null) {
		return this;
	} else {
		return new LexerActionExecutor(updatedLexerActions);
	}
};

// Execute the actions encapsulated by this executor within the context of a
// particular {@link Lexer}.
//
// <p>This method calls {@link IntStream//seek} to set the position of the
// {@code input} {@link CharStream} prior to calling
// {@link LexerAction//execute} on a position-dependent action. Before the
// method returns, the input position will be restored to the same position
// it was in when the method was invoked.</p>
//
// @param lexer The lexer instance.
// @param input The input stream which is the source for the current token.
// When this method is called, the current {@link IntStream//index} for
// {@code input} should be the start of the following token, i.e. 1
// character past the end of the current token.
// @param startIndex The token start index. This value may be passed to
// {@link IntStream//seek} to set the {@code input} position to the beginning
// of the token.
// /
LexerActionExecutor.prototype.execute = function(lexer, input, startIndex) {
	var requiresSeek = false;
	var stopIndex = input.index;
	try {
		for (var i = 0; i < this.lexerActions.length; i++) {
			var lexerAction = this.lexerActions[i];
			if (lexerAction instanceof LexerIndexedCustomAction) {
				var offset = lexerAction.offset;
				input.seek(startIndex + offset);
				lexerAction = lexerAction.action;
				requiresSeek = (startIndex + offset) !== stopIndex;
			} else if (lexerAction.isPositionDependent) {
				input.seek(stopIndex);
				requiresSeek = false;
			}
			lexerAction.execute(lexer);
		}
	} finally {
		if (requiresSeek) {
			input.seek(stopIndex);
		}
	}
};

LexerActionExecutor.prototype.hashString = function() {
	return this.hashString;
};

LexerActionExecutor.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof LexerActionExecutor)) {
		return false;
	} else {
		return this.hashString === other.hashString &&
				this.lexerActions === other.lexerActions;
	}
};

exports.LexerActionExecutor = LexerActionExecutor;

},{"./LexerAction":33}],35:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

//
// The embodiment of the adaptive LL(*), ALL(*), parsing strategy.
//
// <p>
// The basic complexity of the adaptive strategy makes it harder to understand.
// We begin with ATN simulation to build paths in a DFA. Subsequent prediction
// requests go through the DFA first. If they reach a state without an edge for
// the current symbol, the algorithm fails over to the ATN simulation to
// complete the DFA path for the current input (until it finds a conflict state
// or uniquely predicting state).</p>
//
// <p>
// All of that is done without using the outer context because we want to create
// a DFA that is not dependent upon the rule invocation stack when we do a
// prediction. One DFA works in all contexts. We avoid using context not
// necessarily because it's slower, although it can be, but because of the DFA
// caching problem. The closure routine only considers the rule invocation stack
// created during prediction beginning in the decision rule. For example, if
// prediction occurs without invoking another rule's ATN, there are no context
// stacks in the configurations. When lack of context leads to a conflict, we
// don't know if it's an ambiguity or a weakness in the strong LL(*) parsing
// strategy (versus full LL(*)).</p>
//
// <p>
// When SLL yields a configuration set with conflict, we rewind the input and
// retry the ATN simulation, this time using full outer context without adding
// to the DFA. Configuration context stacks will be the full invocation stacks
// from the start rule. If we get a conflict using full context, then we can
// definitively say we have a true ambiguity for that input sequence. If we
// don't get a conflict, it implies that the decision is sensitive to the outer
// context. (It is not context-sensitive in the sense of context-sensitive
// grammars.)</p>
//
// <p>
// The next time we reach this DFA state with an SLL conflict, through DFA
// simulation, we will again retry the ATN simulation using full context mode.
// This is slow because we can't save the results and have to "interpret" the
// ATN each time we get that input.</p>
//
// <p>
// <strong>CACHING FULL CONTEXT PREDICTIONS</strong></p>
//
// <p>
// We could cache results from full context to predicted alternative easily and
// that saves a lot of time but doesn't work in presence of predicates. The set
// of visible predicates from the ATN start state changes depending on the
// context, because closure can fall off the end of a rule. I tried to cache
// tuples (stack context, semantic context, predicted alt) but it was slower
// than interpreting and much more complicated. Also required a huge amount of
// memory. The goal is not to create the world's fastest parser anyway. I'd like
// to keep this algorithm simple. By launching multiple threads, we can improve
// the speed of parsing across a large number of files.</p>
//
// <p>
// There is no strict ordering between the amount of input used by SLL vs LL,
// which makes it really hard to build a cache for full context. Let's say that
// we have input A B C that leads to an SLL conflict with full context X. That
// implies that using X we might only use A B but we could also use A B C D to
// resolve conflict. Input A B C D could predict alternative 1 in one position
// in the input and A B C E could predict alternative 2 in another position in
// input. The conflicting SLL configurations could still be non-unique in the
// full context prediction, which would lead us to requiring more input than the
// original A B C.	To make a	prediction cache work, we have to track	the exact
// input	used during the previous prediction. That amounts to a cache that maps
// X to a specific DFA for that context.</p>
//
// <p>
// Something should be done for left-recursive expression predictions. They are
// likely LL(1) + pred eval. Easier to do the whole SLL unless error and retry
// with full LL thing Sam does.</p>
//
// <p>
// <strong>AVOIDING FULL CONTEXT PREDICTION</strong></p>
//
// <p>
// We avoid doing full context retry when the outer context is empty, we did not
// dip into the outer context by falling off the end of the decision state rule,
// or when we force SLL mode.</p>
//
// <p>
// As an example of the not dip into outer context case, consider as super
// constructor calls versus function calls. One grammar might look like
// this:</p>
//
// <pre>
// ctorBody
//   : '{' superCall? stat* '}'
//   ;
// </pre>
//
// <p>
// Or, you might see something like</p>
//
// <pre>
// stat
//   : superCall ';'
//   | expression ';'
//   | ...
//   ;
// </pre>
//
// <p>
// In both cases I believe that no closure operations will dip into the outer
// context. In the first case ctorBody in the worst case will stop at the '}'.
// In the 2nd case it should stop at the ';'. Both cases should stay within the
// entry rule and not dip into the outer context.</p>
//
// <p>
// <strong>PREDICATES</strong></p>
//
// <p>
// Predicates are always evaluated if present in either SLL or LL both. SLL and
// LL simulation deals with predicates differently. SLL collects predicates as
// it performs closure operations like ANTLR v3 did. It delays predicate
// evaluation until it reaches and accept state. This allows us to cache the SLL
// ATN simulation whereas, if we had evaluated predicates on-the-fly during
// closure, the DFA state configuration sets would be different and we couldn't
// build up a suitable DFA.</p>
//
// <p>
// When building a DFA accept state during ATN simulation, we evaluate any
// predicates and return the sole semantically valid alternative. If there is
// more than 1 alternative, we report an ambiguity. If there are 0 alternatives,
// we throw an exception. Alternatives without predicates act like they have
// true predicates. The simple way to think about it is to strip away all
// alternatives with false predicates and choose the minimum alternative that
// remains.</p>
//
// <p>
// When we start in the DFA and reach an accept state that's predicated, we test
// those and return the minimum semantically viable alternative. If no
// alternatives are viable, we throw an exception.</p>
//
// <p>
// During full LL ATN simulation, closure always evaluates predicates and
// on-the-fly. This is crucial to reducing the configuration set size during
// closure. It hits a landmine when parsing with the Java grammar, for example,
// without this on-the-fly evaluation.</p>
//
// <p>
// <strong>SHARING DFA</strong></p>
//
// <p>
// All instances of the same parser share the same decision DFAs through a
// static field. Each instance gets its own ATN simulator but they share the
// same {@link //decisionToDFA} field. They also share a
// {@link PredictionContextCache} object that makes sure that all
// {@link PredictionContext} objects are shared among the DFA states. This makes
// a big size difference.</p>
//
// <p>
// <strong>THREAD SAFETY</strong></p>
//
// <p>
// The {@link ParserATNSimulator} locks on the {@link //decisionToDFA} field when
// it adds a new DFA object to that array. {@link //addDFAEdge}
// locks on the DFA for the current decision when setting the
// {@link DFAState//edges} field. {@link //addDFAState} locks on
// the DFA for the current decision when looking up a DFA state to see if it
// already exists. We must make sure that all requests to add DFA states that
// are equivalent result in the same shared DFA object. This is because lots of
// threads will be trying to update the DFA at once. The
// {@link //addDFAState} method also locks inside the DFA lock
// but this time on the shared context cache when it rebuilds the
// configurations' {@link PredictionContext} objects using cached
// subgraphs/nodes. No other locking occurs, even during DFA simulation. This is
// safe as long as we can guarantee that all threads referencing
// {@code s.edge[t]} get the same physical target {@link DFAState}, or
// {@code null}. Once into the DFA, the DFA simulation does not reference the
// {@link DFA//states} map. It follows the {@link DFAState//edges} field to new
// targets. The DFA simulator will either find {@link DFAState//edges} to be
// {@code null}, to be non-{@code null} and {@code dfa.edges[t]} null, or
// {@code dfa.edges[t]} to be non-null. The
// {@link //addDFAEdge} method could be racing to set the field
// but in either case the DFA simulator works; if {@code null}, and requests ATN
// simulation. It could also race trying to get {@code dfa.edges[t]}, but either
// way it will work because it's not doing a test and set operation.</p>
//
// <p>
// <strong>Starting with SLL then failing to combined SLL/LL (Two-Stage
// Parsing)</strong></p>
//
// <p>
// Sam pointed out that if SLL does not give a syntax error, then there is no
// point in doing full LL, which is slower. We only have to try LL if we get a
// syntax error. For maximum speed, Sam starts the parser set to pure SLL
// mode with the {@link BailErrorStrategy}:</p>
//
// <pre>
// parser.{@link Parser//getInterpreter() getInterpreter()}.{@link //setPredictionMode setPredictionMode}{@code (}{@link PredictionMode//SLL}{@code )};
// parser.{@link Parser//setErrorHandler setErrorHandler}(new {@link BailErrorStrategy}());
// </pre>
//
// <p>
// If it does not get a syntax error, then we're done. If it does get a syntax
// error, we need to retry with the combined SLL/LL strategy.</p>
//
// <p>
// The reason this works is as follows. If there are no SLL conflicts, then the
// grammar is SLL (at least for that input set). If there is an SLL conflict,
// the full LL analysis must yield a set of viable alternatives which is a
// subset of the alternatives reported by SLL. If the LL set is a singleton,
// then the grammar is LL but not SLL. If the LL set is the same size as the SLL
// set, the decision is SLL. If the LL set has size &gt; 1, then that decision
// is truly ambiguous on the current input. If the LL set is smaller, then the
// SLL conflict resolution might choose an alternative that the full LL would
// rule out as a possibility based upon better context information. If that's
// the case, then the SLL parse will definitely get an error because the full LL
// analysis says it's not viable. If SLL conflict resolution chooses an
// alternative within the LL set, them both SLL and LL would choose the same
// alternative because they both choose the minimum of multiple conflicting
// alternatives.</p>
//
// <p>
// Let's say we have a set of SLL conflicting alternatives {@code {1, 2, 3}} and
// a smaller LL set called <em>s</em>. If <em>s</em> is {@code {2, 3}}, then SLL
// parsing will get an error because SLL will pursue alternative 1. If
// <em>s</em> is {@code {1, 2}} or {@code {1, 3}} then both SLL and LL will
// choose the same alternative because alternative one is the minimum of either
// set. If <em>s</em> is {@code {2}} or {@code {3}} then SLL will get a syntax
// error. If <em>s</em> is {@code {1}} then SLL will succeed.</p>
//
// <p>
// Of course, if the input is invalid, then we will get an error for sure in
// both SLL and LL parsing. Erroneous input will therefore require 2 passes over
// the input.</p>
//

var Utils = require('./../Utils');
var Set = Utils.Set;
var BitSet = Utils.BitSet;
var DoubleDict = Utils.DoubleDict;
var ATN = require('./ATN').ATN;
var ATNConfig = require('./ATNConfig').ATNConfig;
var ATNConfigSet = require('./ATNConfigSet').ATNConfigSet;
var Token = require('./../Token').Token;
var DFAState = require('./../dfa/DFAState').DFAState;
var PredPrediction = require('./../dfa/DFAState').PredPrediction;
var ATNSimulator = require('./ATNSimulator').ATNSimulator;
var PredictionMode = require('./PredictionMode').PredictionMode;
var RuleContext = require('./../RuleContext').RuleContext;
var ParserRuleContext = require('./../ParserRuleContext').ParserRuleContext;
var SemanticContext = require('./SemanticContext').SemanticContext;
var StarLoopEntryState = require('./ATNState').StarLoopEntryState;
var RuleStopState = require('./ATNState').RuleStopState;
var PredictionContext = require('./../PredictionContext').PredictionContext;
var Interval = require('./../IntervalSet').Interval;
var Transitions = require('./Transition');
var Transition = Transitions.Transition;
var SetTransition = Transitions.SetTransition;
var NotSetTransition = Transitions.NotSetTransition;
var RuleTransition = Transitions.RuleTransition;
var ActionTransition = Transitions.ActionTransition;
var NoViableAltException = require('./../error/Errors').NoViableAltException;

var SingletonPredictionContext = require('./../PredictionContext').SingletonPredictionContext;
var predictionContextFromRuleContext = require('./../PredictionContext').predictionContextFromRuleContext;

function ParserATNSimulator(parser, atn, decisionToDFA, sharedContextCache) {
	ATNSimulator.call(this, atn, sharedContextCache);
    this.parser = parser;
    this.decisionToDFA = decisionToDFA;
    // SLL, LL, or LL + exact ambig detection?//
    this.predictionMode = PredictionMode.LL;
    // LAME globals to avoid parameters!!!!! I need these down deep in predTransition
    this._input = null;
    this._startIndex = 0;
    this._outerContext = null;
    this._dfa = null;
    // Each prediction operation uses a cache for merge of prediction contexts.
    //  Don't keep around as it wastes huge amounts of memory. DoubleKeyMap
    //  isn't synchronized but we're ok since two threads shouldn't reuse same
    //  parser/atnsim object because it can only handle one input at a time.
    //  This maps graphs a and b to merged result c. (a,b)&rarr;c. We can avoid
    //  the merge if we ever see a and b again.  Note that (b,a)&rarr;c should
    //  also be examined during cache lookup.
    //
    this.mergeCache = null;
    return this;
}

ParserATNSimulator.prototype = Object.create(ATNSimulator.prototype);
ParserATNSimulator.prototype.constructor = ParserATNSimulator;

ParserATNSimulator.prototype.debug = false;
ParserATNSimulator.prototype.debug_list_atn_decisions = false;
ParserATNSimulator.prototype.dfa_debug = false;
ParserATNSimulator.prototype.retry_debug = false;


ParserATNSimulator.prototype.reset = function() {
};

ParserATNSimulator.prototype.adaptivePredict = function(input, decision, outerContext) {
    if (this.debug || this.debug_list_atn_decisions) {
        console.log("adaptivePredict decision " + decision +
                               " exec LA(1)==" + this.getLookaheadName(input) +
                               " line " + input.LT(1).line + ":" +
                               input.LT(1).column);
    }
    this._input = input;
    this._startIndex = input.index;
    this._outerContext = outerContext;
    
    var dfa = this.decisionToDFA[decision];
    this._dfa = dfa;
    var m = input.mark();
    var index = input.index;

    // Now we are certain to have a specific decision's DFA
    // But, do we still need an initial state?
    try {
        var s0;
        if (dfa.precedenceDfa) {
            // the start state for a precedence DFA depends on the current
            // parser precedence, and is provided by a DFA method.
            s0 = dfa.getPrecedenceStartState(this.parser.getPrecedence());
        } else {
            // the start state for a "regular" DFA is just s0
            s0 = dfa.s0;
        }
        if (s0===null) {
            if (outerContext===null) {
                outerContext = RuleContext.EMPTY;
            }
            if (this.debug || this.debug_list_atn_decisions) {
                console.log("predictATN decision " + dfa.decision +
                                   " exec LA(1)==" + this.getLookaheadName(input) +
                                   ", outerContext=" + outerContext.toString(this.parser.ruleNames));
            }
            // If this is not a precedence DFA, we check the ATN start state
            // to determine if this ATN start state is the decision for the
            // closure block that determines whether a precedence rule
            // should continue or complete.
            //
            if (!dfa.precedenceDfa && (dfa.atnStartState instanceof StarLoopEntryState)) {
                if (dfa.atnStartState.precedenceRuleDecision) {
                    dfa.setPrecedenceDfa(true);
                }
            }
            var fullCtx = false;
            var s0_closure = this.computeStartState(dfa.atnStartState, RuleContext.EMPTY, fullCtx);

            if( dfa.precedenceDfa) {
                // If this is a precedence DFA, we use applyPrecedenceFilter
                // to convert the computed start state to a precedence start
                // state. We then use DFA.setPrecedenceStartState to set the
                // appropriate start state for the precedence level rather
                // than simply setting DFA.s0.
                //
                s0_closure = this.applyPrecedenceFilter(s0_closure);
                s0 = this.addDFAState(dfa, new DFAState(null, s0_closure));
                dfa.setPrecedenceStartState(this.parser.getPrecedence(), s0);
            } else {
                s0 = this.addDFAState(dfa, new DFAState(null, s0_closure));
                dfa.s0 = s0;
            }
        }
        var alt = this.execATN(dfa, s0, input, index, outerContext);
        if (this.debug) {
            console.log("DFA after predictATN: " + dfa.toString(this.parser.literalNames));
        }
        return alt;
    } finally {
        this._dfa = null;
        this.mergeCache = null; // wack cache after each prediction
        input.seek(index);
        input.release(m);
    }
};
// Performs ATN simulation to compute a predicted alternative based
//  upon the remaining input, but also updates the DFA cache to avoid
//  having to traverse the ATN again for the same input sequence.

// There are some key conditions we're looking for after computing a new
// set of ATN configs (proposed DFA state):
      // if the set is empty, there is no viable alternative for current symbol
      // does the state uniquely predict an alternative?
      // does the state have a conflict that would prevent us from
      //   putting it on the work list?

// We also have some key operations to do:
      // add an edge from previous DFA state to potentially new DFA state, D,
      //   upon current symbol but only if adding to work list, which means in all
      //   cases except no viable alternative (and possibly non-greedy decisions?)
      // collecting predicates and adding semantic context to DFA accept states
      // adding rule context to context-sensitive DFA accept states
      // consuming an input symbol
      // reporting a conflict
      // reporting an ambiguity
      // reporting a context sensitivity
      // reporting insufficient predicates

// cover these cases:
//    dead end
//    single alt
//    single alt + preds
//    conflict
//    conflict + preds
//
ParserATNSimulator.prototype.execATN = function(dfa, s0, input, startIndex, outerContext ) {
    if (this.debug || this.debug_list_atn_decisions) {
        console.log("execATN decision " + dfa.decision +
                " exec LA(1)==" + this.getLookaheadName(input) +
                " line " + input.LT(1).line + ":" + input.LT(1).column);
    }
    var alt;
    var previousD = s0;

    if (this.debug) {
        console.log("s0 = " + s0);
    }
    var t = input.LA(1);
    while(true) { // while more work
        var D = this.getExistingTargetState(previousD, t);
        if(D===null) {
            D = this.computeTargetState(dfa, previousD, t);
        }
        if(D===ATNSimulator.ERROR) {
            // if any configs in previous dipped into outer context, that
            // means that input up to t actually finished entry rule
            // at least for SLL decision. Full LL doesn't dip into outer
            // so don't need special case.
            // We will get an error no matter what so delay until after
            // decision; better error message. Also, no reachable target
            // ATN states in SLL implies LL will also get nowhere.
            // If conflict in states that dip out, choose min since we
            // will get error no matter what.
            var e = this.noViableAlt(input, outerContext, previousD.configs, startIndex);
            input.seek(startIndex);
            alt = this.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(previousD.configs, outerContext);
            if(alt!==ATN.INVALID_ALT_NUMBER) {
                return alt;
            } else {
                throw e;
            }
        }
        if(D.requiresFullContext && this.predictionMode !== PredictionMode.SLL) {
            // IF PREDS, MIGHT RESOLVE TO SINGLE ALT => SLL (or syntax error)
            var conflictingAlts = null;
            if (D.predicates!==null) {
                if (this.debug) {
                    console.log("DFA state has preds in DFA sim LL failover");
                }
                var conflictIndex = input.index;
                if(conflictIndex !== startIndex) {
                    input.seek(startIndex);
                }
                conflictingAlts = this.evalSemanticContext(D.predicates, outerContext, true);
                if (conflictingAlts.length===1) {
                    if(this.debug) {
                        console.log("Full LL avoided");
                    }
                    return conflictingAlts.minValue();
                }
                if (conflictIndex !== startIndex) {
                    // restore the index so reporting the fallback to full
                    // context occurs with the index at the correct spot
                    input.seek(conflictIndex);
                }
            }
            if (this.dfa_debug) {
                console.log("ctx sensitive state " + outerContext +" in " + D);
            }
            var fullCtx = true;
            var s0_closure = this.computeStartState(dfa.atnStartState, outerContext, fullCtx);
            this.reportAttemptingFullContext(dfa, conflictingAlts, D.configs, startIndex, input.index);
            alt = this.execATNWithFullContext(dfa, D, s0_closure, input, startIndex, outerContext);
            return alt;
        }
        if (D.isAcceptState) {
            if (D.predicates===null) {
                return D.prediction;
            }
            var stopIndex = input.index;
            input.seek(startIndex);
            var alts = this.evalSemanticContext(D.predicates, outerContext, true);
            if (alts.length===0) {
                throw this.noViableAlt(input, outerContext, D.configs, startIndex);
            } else if (alts.length===1) {
                return alts.minValue();
            } else {
                // report ambiguity after predicate evaluation to make sure the correct set of ambig alts is reported.
                this.reportAmbiguity(dfa, D, startIndex, stopIndex, false, alts, D.configs);
                return alts.minValue();
            }
        }
        previousD = D;

        if (t !== Token.EOF) {
            input.consume();
            t = input.LA(1);
        }
    }
};
//
// Get an existing target state for an edge in the DFA. If the target state
// for the edge has not yet been computed or is otherwise not available,
// this method returns {@code null}.
//
// @param previousD The current DFA state
// @param t The next input symbol
// @return The existing target DFA state for the given input symbol
// {@code t}, or {@code null} if the target state for this edge is not
// already cached
//
ParserATNSimulator.prototype.getExistingTargetState = function(previousD, t) {
    var edges = previousD.edges;
    if (edges===null) {
        return null;
    } else {
        return edges[t + 1] || null;
    }
};
//
// Compute a target state for an edge in the DFA, and attempt to add the
// computed state and corresponding edge to the DFA.
//
// @param dfa The DFA
// @param previousD The current DFA state
// @param t The next input symbol
//
// @return The computed target DFA state for the given input symbol
// {@code t}. If {@code t} does not lead to a valid DFA state, this method
// returns {@link //ERROR}.
//
ParserATNSimulator.prototype.computeTargetState = function(dfa, previousD, t) {
   var reach = this.computeReachSet(previousD.configs, t, false);
    if(reach===null) {
        this.addDFAEdge(dfa, previousD, t, ATNSimulator.ERROR);
        return ATNSimulator.ERROR;
    }
    // create new target state; we'll add to DFA after it's complete
    var D = new DFAState(null, reach);

    var predictedAlt = this.getUniqueAlt(reach);

    if (this.debug) {
        var altSubSets = PredictionMode.getConflictingAltSubsets(reach);
        console.log("SLL altSubSets=" + Utils.arrayToString(altSubSets) +
                    ", previous=" + previousD.configs +
                    ", configs=" + reach +
                    ", predict=" + predictedAlt +
                    ", allSubsetsConflict=" +
                    PredictionMode.allSubsetsConflict(altSubSets) + ", conflictingAlts=" +
                    this.getConflictingAlts(reach));
    }
    if (predictedAlt!==ATN.INVALID_ALT_NUMBER) {
        // NO CONFLICT, UNIQUELY PREDICTED ALT
        D.isAcceptState = true;
        D.configs.uniqueAlt = predictedAlt;
        D.prediction = predictedAlt;
    } else if (PredictionMode.hasSLLConflictTerminatingPrediction(this.predictionMode, reach)) {
        // MORE THAN ONE VIABLE ALTERNATIVE
        D.configs.conflictingAlts = this.getConflictingAlts(reach);
        D.requiresFullContext = true;
        // in SLL-only mode, we will stop at this state and return the minimum alt
        D.isAcceptState = true;
        D.prediction = D.configs.conflictingAlts.minValue();
    }
    if (D.isAcceptState && D.configs.hasSemanticContext) {
        this.predicateDFAState(D, this.atn.getDecisionState(dfa.decision));
        if( D.predicates!==null) {
            D.prediction = ATN.INVALID_ALT_NUMBER;
        }
    }
    // all adds to dfa are done after we've created full D state
    D = this.addDFAEdge(dfa, previousD, t, D);
    return D;
};

ParserATNSimulator.prototype.predicateDFAState = function(dfaState, decisionState) {
    // We need to test all predicates, even in DFA states that
    // uniquely predict alternative.
    var nalts = decisionState.transitions.length;
    // Update DFA so reach becomes accept state with (predicate,alt)
    // pairs if preds found for conflicting alts
    var altsToCollectPredsFrom = this.getConflictingAltsOrUniqueAlt(dfaState.configs);
    var altToPred = this.getPredsForAmbigAlts(altsToCollectPredsFrom, dfaState.configs, nalts);
    if (altToPred!==null) {
        dfaState.predicates = this.getPredicatePredictions(altsToCollectPredsFrom, altToPred);
        dfaState.prediction = ATN.INVALID_ALT_NUMBER; // make sure we use preds
    } else {
        // There are preds in configs but they might go away
        // when OR'd together like {p}? || NONE == NONE. If neither
        // alt has preds, resolve to min alt
        dfaState.prediction = altsToCollectPredsFrom.minValue();
    }
};

// comes back with reach.uniqueAlt set to a valid alt
ParserATNSimulator.prototype.execATNWithFullContext = function(dfa, D, // how far we got before failing over
                                     s0,
                                     input,
                                     startIndex,
                                     outerContext) {
    if (this.debug || this.debug_list_atn_decisions) {
        console.log("execATNWithFullContext "+s0);
    }
    var fullCtx = true;
    var foundExactAmbig = false;
    var reach = null;
    var previous = s0;
    input.seek(startIndex);
    var t = input.LA(1);
    var predictedAlt = -1;
    while (true) { // while more work
        reach = this.computeReachSet(previous, t, fullCtx);
        if (reach===null) {
            // if any configs in previous dipped into outer context, that
            // means that input up to t actually finished entry rule
            // at least for LL decision. Full LL doesn't dip into outer
            // so don't need special case.
            // We will get an error no matter what so delay until after
            // decision; better error message. Also, no reachable target
            // ATN states in SLL implies LL will also get nowhere.
            // If conflict in states that dip out, choose min since we
            // will get error no matter what.
            var e = this.noViableAlt(input, outerContext, previous, startIndex);
            input.seek(startIndex);
            var alt = this.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(previous, outerContext);
            if(alt!==ATN.INVALID_ALT_NUMBER) {
                return alt;
            } else {
                throw e;
            }
        }
        var altSubSets = PredictionMode.getConflictingAltSubsets(reach);
        if(this.debug) {
            console.log("LL altSubSets=" + altSubSets + ", predict=" +
                  PredictionMode.getUniqueAlt(altSubSets) + ", resolvesToJustOneViableAlt=" +
                  PredictionMode.resolvesToJustOneViableAlt(altSubSets));
        }
        reach.uniqueAlt = this.getUniqueAlt(reach);
        // unique prediction?
        if(reach.uniqueAlt!==ATN.INVALID_ALT_NUMBER) {
            predictedAlt = reach.uniqueAlt;
            break;
        } else if (this.predictionMode !== PredictionMode.LL_EXACT_AMBIG_DETECTION) {
            predictedAlt = PredictionMode.resolvesToJustOneViableAlt(altSubSets);
            if(predictedAlt !== ATN.INVALID_ALT_NUMBER) {
                break;
            }
        } else {
            // In exact ambiguity mode, we never try to terminate early.
            // Just keeps scarfing until we know what the conflict is
            if (PredictionMode.allSubsetsConflict(altSubSets) && PredictionMode.allSubsetsEqual(altSubSets)) {
                foundExactAmbig = true;
                predictedAlt = PredictionMode.getSingleViableAlt(altSubSets);
                break;
            }
            // else there are multiple non-conflicting subsets or
            // we're not sure what the ambiguity is yet.
            // So, keep going.
        }
        previous = reach;
        if( t !== Token.EOF) {
            input.consume();
            t = input.LA(1);
        }
    }
    // If the configuration set uniquely predicts an alternative,
    // without conflict, then we know that it's a full LL decision
    // not SLL.
    if (reach.uniqueAlt !== ATN.INVALID_ALT_NUMBER ) {
        this.reportContextSensitivity(dfa, predictedAlt, reach, startIndex, input.index);
        return predictedAlt;
    }
    // We do not check predicates here because we have checked them
    // on-the-fly when doing full context prediction.

    //
    // In non-exact ambiguity detection mode, we might	actually be able to
    // detect an exact ambiguity, but I'm not going to spend the cycles
    // needed to check. We only emit ambiguity warnings in exact ambiguity
    // mode.
    //
    // For example, we might know that we have conflicting configurations.
    // But, that does not mean that there is no way forward without a
    // conflict. It's possible to have nonconflicting alt subsets as in:

    // altSubSets=[{1, 2}, {1, 2}, {1}, {1, 2}]

    // from
    //
    //    [(17,1,[5 $]), (13,1,[5 10 $]), (21,1,[5 10 $]), (11,1,[$]),
    //     (13,2,[5 10 $]), (21,2,[5 10 $]), (11,2,[$])]
    //
    // In this case, (17,1,[5 $]) indicates there is some next sequence that
    // would resolve this without conflict to alternative 1. Any other viable
    // next sequence, however, is associated with a conflict.  We stop
    // looking for input because no amount of further lookahead will alter
    // the fact that we should predict alternative 1.  We just can't say for
    // sure that there is an ambiguity without looking further.

    this.reportAmbiguity(dfa, D, startIndex, input.index, foundExactAmbig, null, reach);

    return predictedAlt;
};

ParserATNSimulator.prototype.computeReachSet = function(closure, t, fullCtx) {
    if (this.debug) {
        console.log("in computeReachSet, starting closure: " + closure);
    }
    if( this.mergeCache===null) {
        this.mergeCache = new DoubleDict();
    }
    var intermediate = new ATNConfigSet(fullCtx);

    // Configurations already in a rule stop state indicate reaching the end
    // of the decision rule (local context) or end of the start rule (full
    // context). Once reached, these configurations are never updated by a
    // closure operation, so they are handled separately for the performance
    // advantage of having a smaller intermediate set when calling closure.
    //
    // For full-context reach operations, separate handling is required to
    // ensure that the alternative matching the longest overall sequence is
    // chosen when multiple such configurations can match the input.
    
    var skippedStopStates = null;

    // First figure out where we can reach on input t
    for (var i=0; i<closure.items.length;i++) {
        var c = closure.items[i];
        if(this.debug) {
            console.log("testing " + this.getTokenName(t) + " at " + c);
        }
        if (c.state instanceof RuleStopState) {
            if (fullCtx || t === Token.EOF) {
                if (skippedStopStates===null) {
                    skippedStopStates = [];
                }
                skippedStopStates.push(c);
                if(this.debug) {
                    console.log("added " + c + " to skippedStopStates");
                }
            }
            continue;
        }
        for(var j=0;j<c.state.transitions.length;j++) {
            var trans = c.state.transitions[j];
            var target = this.getReachableTarget(trans, t);
            if (target!==null) {
                var cfg = new ATNConfig({state:target}, c);
                intermediate.add(cfg, this.mergeCache);
                if(this.debug) {
                    console.log("added " + cfg + " to intermediate");
                }
            }
        }
    }
    // Now figure out where the reach operation can take us...
    var reach = null;

    // This block optimizes the reach operation for intermediate sets which
    // trivially indicate a termination state for the overall
    // adaptivePredict operation.
    //
    // The conditions assume that intermediate
    // contains all configurations relevant to the reach set, but this
    // condition is not true when one or more configurations have been
    // withheld in skippedStopStates, or when the current symbol is EOF.
    //
    if (skippedStopStates===null && t!==Token.EOF) {
        if (intermediate.items.length===1) {
            // Don't pursue the closure if there is just one state.
            // It can only have one alternative; just add to result
            // Also don't pursue the closure if there is unique alternative
            // among the configurations.
            reach = intermediate;
        } else if (this.getUniqueAlt(intermediate)!==ATN.INVALID_ALT_NUMBER) {
            // Also don't pursue the closure if there is unique alternative
            // among the configurations.
            reach = intermediate;
        }
    }
    // If the reach set could not be trivially determined, perform a closure
    // operation on the intermediate set to compute its initial value.
    //
    if (reach===null) {
        reach = new ATNConfigSet(fullCtx);
        var closureBusy = new Set();
        var treatEofAsEpsilon = t === Token.EOF;
        for (var k=0; k<intermediate.items.length;k++) {
            this.closure(intermediate.items[k], reach, closureBusy, false, fullCtx, treatEofAsEpsilon);
        }
    }
    if (t === Token.EOF) {
        // After consuming EOF no additional input is possible, so we are
        // only interested in configurations which reached the end of the
        // decision rule (local context) or end of the start rule (full
        // context). Update reach to contain only these configurations. This
        // handles both explicit EOF transitions in the grammar and implicit
        // EOF transitions following the end of the decision or start rule.
        //
        // When reach==intermediate, no closure operation was performed. In
        // this case, removeAllConfigsNotInRuleStopState needs to check for
        // reachable rule stop states as well as configurations already in
        // a rule stop state.
        //
        // This is handled before the configurations in skippedStopStates,
        // because any configurations potentially added from that list are
        // already guaranteed to meet this condition whether or not it's
        // required.
        //
        reach = this.removeAllConfigsNotInRuleStopState(reach, reach === intermediate);
    }
    // If skippedStopStates!==null, then it contains at least one
    // configuration. For full-context reach operations, these
    // configurations reached the end of the start rule, in which case we
    // only add them back to reach if no configuration during the current
    // closure operation reached such a state. This ensures adaptivePredict
    // chooses an alternative matching the longest overall sequence when
    // multiple alternatives are viable.
    //
    if (skippedStopStates!==null && ( (! fullCtx) || (! PredictionMode.hasConfigInRuleStopState(reach)))) {
        for (var l=0; l<skippedStopStates.length;l++) {
            reach.add(skippedStopStates[l], this.mergeCache);
        }
    }
    if (reach.items.length===0) {
        return null;
    } else {
        return reach;
    }
};
//
// Return a configuration set containing only the configurations from
// {@code configs} which are in a {@link RuleStopState}. If all
// configurations in {@code configs} are already in a rule stop state, this
// method simply returns {@code configs}.
//
// <p>When {@code lookToEndOfRule} is true, this method uses
// {@link ATN//nextTokens} for each configuration in {@code configs} which is
// not already in a rule stop state to see if a rule stop state is reachable
// from the configuration via epsilon-only transitions.</p>
//
// @param configs the configuration set to update
// @param lookToEndOfRule when true, this method checks for rule stop states
// reachable by epsilon-only transitions from each configuration in
// {@code configs}.
//
// @return {@code configs} if all configurations in {@code configs} are in a
// rule stop state, otherwise return a new configuration set containing only
// the configurations from {@code configs} which are in a rule stop state
//
ParserATNSimulator.prototype.removeAllConfigsNotInRuleStopState = function(configs, lookToEndOfRule) {
    if (PredictionMode.allConfigsInRuleStopStates(configs)) {
        return configs;
    }
    var result = new ATNConfigSet(configs.fullCtx);
    for(var i=0; i<configs.items.length;i++) {
        var config = configs.items[i];
        if (config.state instanceof RuleStopState) {
            result.add(config, this.mergeCache);
            continue;
        }
        if (lookToEndOfRule && config.state.epsilonOnlyTransitions) {
            var nextTokens = this.atn.nextTokens(config.state);
            if (nextTokens.contains(Token.EPSILON)) {
                var endOfRuleState = this.atn.ruleToStopState[config.state.ruleIndex];
                result.add(new ATNConfig({state:endOfRuleState}, config), this.mergeCache);
            }
        }
    }
    return result;
};

ParserATNSimulator.prototype.computeStartState = function(p, ctx, fullCtx) {
    // always at least the implicit call to start rule
    var initialContext = predictionContextFromRuleContext(this.atn, ctx);
    var configs = new ATNConfigSet(fullCtx);
    for(var i=0;i<p.transitions.length;i++) {
        var target = p.transitions[i].target;
        var c = new ATNConfig({ state:target, alt:i+1, context:initialContext }, null);
        var closureBusy = new Set();
        this.closure(c, configs, closureBusy, true, fullCtx, false);
    }
    return configs;
};

//
// This method transforms the start state computed by
// {@link //computeStartState} to the special start state used by a
// precedence DFA for a particular precedence value. The transformation
// process applies the following changes to the start state's configuration
// set.
//
// <ol>
// <li>Evaluate the precedence predicates for each configuration using
// {@link SemanticContext//evalPrecedence}.</li>
// <li>Remove all configurations which predict an alternative greater than
// 1, for which another configuration that predicts alternative 1 is in the
// same ATN state with the same prediction context. This transformation is
// valid for the following reasons:
// <ul>
// <li>The closure block cannot contain any epsilon transitions which bypass
// the body of the closure, so all states reachable via alternative 1 are
// part of the precedence alternatives of the transformed left-recursive
// rule.</li>
// <li>The "primary" portion of a left recursive rule cannot contain an
// epsilon transition, so the only way an alternative other than 1 can exist
// in a state that is also reachable via alternative 1 is by nesting calls
// to the left-recursive rule, with the outer calls not being at the
// preferred precedence level.</li>
// </ul>
// </li>
// </ol>
//
// <p>
// The prediction context must be considered by this filter to address
// situations like the following.
// </p>
// <code>
// <pre>
// grammar TA;
// prog: statement* EOF;
// statement: letterA | statement letterA 'b' ;
// letterA: 'a';
// </pre>
// </code>
// <p>
// If the above grammar, the ATN state immediately before the token
// reference {@code 'a'} in {@code letterA} is reachable from the left edge
// of both the primary and closure blocks of the left-recursive rule
// {@code statement}. The prediction context associated with each of these
// configurations distinguishes between them, and prevents the alternative
// which stepped out to {@code prog} (and then back in to {@code statement}
// from being eliminated by the filter.
// </p>
//
// @param configs The configuration set computed by
// {@link //computeStartState} as the start state for the DFA.
// @return The transformed configuration set representing the start state
// for a precedence DFA at a particular precedence level (determined by
// calling {@link Parser//getPrecedence}).
//
ParserATNSimulator.prototype.applyPrecedenceFilter = function(configs) {
	var config;
	var statesFromAlt1 = [];
    var configSet = new ATNConfigSet(configs.fullCtx);
    for(var i=0; i<configs.items.length; i++) {
        config = configs.items[i];
        // handle alt 1 first
        if (config.alt !== 1) {
            continue;
        }
        var updatedContext = config.semanticContext.evalPrecedence(this.parser, this._outerContext);
        if (updatedContext===null) {
            // the configuration was eliminated
            continue;
        }
        statesFromAlt1[config.state.stateNumber] = config.context;
        if (updatedContext !== config.semanticContext) {
            configSet.add(new ATNConfig({semanticContext:updatedContext}, config), this.mergeCache);
        } else {
            configSet.add(config, this.mergeCache);
        }
    }
    for(i=0; i<configs.items.length; i++) {
        config = configs.items[i];
        if (config.alt === 1) {
            // already handled
            continue;
        }
        // In the future, this elimination step could be updated to also
        // filter the prediction context for alternatives predicting alt>1
        // (basically a graph subtraction algorithm).
		if (!config.precedenceFilterSuppressed) {
            var context = statesFromAlt1[config.state.stateNumber] || null;
            if (context!==null && context.equals(config.context)) {
                // eliminated
                continue;
            }
		}
        configSet.add(config, this.mergeCache);
    }
    return configSet;
};

ParserATNSimulator.prototype.getReachableTarget = function(trans, ttype) {
    if (trans.matches(ttype, 0, this.atn.maxTokenType)) {
        return trans.target;
    } else {
        return null;
    }
};

ParserATNSimulator.prototype.getPredsForAmbigAlts = function(ambigAlts, configs, nalts) {
    // REACH=[1|1|[]|0:0, 1|2|[]|0:1]
    // altToPred starts as an array of all null contexts. The entry at index i
    // corresponds to alternative i. altToPred[i] may have one of three values:
    //   1. null: no ATNConfig c is found such that c.alt==i
    //   2. SemanticContext.NONE: At least one ATNConfig c exists such that
    //      c.alt==i and c.semanticContext==SemanticContext.NONE. In other words,
    //      alt i has at least one unpredicated config.
    //   3. Non-NONE Semantic Context: There exists at least one, and for all
    //      ATNConfig c such that c.alt==i, c.semanticContext!=SemanticContext.NONE.
    //
    // From this, it is clear that NONE||anything==NONE.
    //
    var altToPred = [];
    for(var i=0;i<configs.items.length;i++) {
        var c = configs.items[i];
        if(ambigAlts.contains( c.alt )) {
            altToPred[c.alt] = SemanticContext.orContext(altToPred[c.alt] || null, c.semanticContext);
        }
    }
    var nPredAlts = 0;
    for (i =1;i< nalts+1;i++) {
        var pred = altToPred[i] || null;
        if (pred===null) {
            altToPred[i] = SemanticContext.NONE;
        } else if (pred !== SemanticContext.NONE) {
            nPredAlts += 1;
        }
    }
    // nonambig alts are null in altToPred
    if (nPredAlts===0) {
        altToPred = null;
    }
    if (this.debug) {
        console.log("getPredsForAmbigAlts result " + Utils.arrayToString(altToPred));
    }
    return altToPred;
};

ParserATNSimulator.prototype.getPredicatePredictions = function(ambigAlts, altToPred) {
    var pairs = [];
    var containsPredicate = false;
    for (var i=1; i<altToPred.length;i++) {
        var pred = altToPred[i];
        // unpredicated is indicated by SemanticContext.NONE
        if( ambigAlts!==null && ambigAlts.contains( i )) {
            pairs.push(new PredPrediction(pred, i));
        }
        if (pred !== SemanticContext.NONE) {
            containsPredicate = true;
        }
    }
    if (! containsPredicate) {
        return null;
    }
    return pairs;
};

//
// This method is used to improve the localization of error messages by
// choosing an alternative rather than throwing a
// {@link NoViableAltException} in particular prediction scenarios where the
// {@link //ERROR} state was reached during ATN simulation.
//
// <p>
// The default implementation of this method uses the following
// algorithm to identify an ATN configuration which successfully parsed the
// decision entry rule. Choosing such an alternative ensures that the
// {@link ParserRuleContext} returned by the calling rule will be complete
// and valid, and the syntax error will be reported later at a more
// localized location.</p>
//
// <ul>
// <li>If a syntactically valid path or paths reach the end of the decision rule and
// they are semantically valid if predicated, return the min associated alt.</li>
// <li>Else, if a semantically invalid but syntactically valid path exist
// or paths exist, return the minimum associated alt.
// </li>
// <li>Otherwise, return {@link ATN//INVALID_ALT_NUMBER}.</li>
// </ul>
//
// <p>
// In some scenarios, the algorithm described above could predict an
// alternative which will result in a {@link FailedPredicateException} in
// the parser. Specifically, this could occur if the <em>only</em> configuration
// capable of successfully parsing to the end of the decision rule is
// blocked by a semantic predicate. By choosing this alternative within
// {@link //adaptivePredict} instead of throwing a
// {@link NoViableAltException}, the resulting
// {@link FailedPredicateException} in the parser will identify the specific
// predicate which is preventing the parser from successfully parsing the
// decision rule, which helps developers identify and correct logic errors
// in semantic predicates.
// </p>
//
// @param configs The ATN configurations which were valid immediately before
// the {@link //ERROR} state was reached
// @param outerContext The is the \gamma_0 initial parser context from the paper
// or the parser stack at the instant before prediction commences.
//
// @return The value to return from {@link //adaptivePredict}, or
// {@link ATN//INVALID_ALT_NUMBER} if a suitable alternative was not
// identified and {@link //adaptivePredict} should report an error instead.
//
ParserATNSimulator.prototype.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule = function(configs, outerContext) {
    var cfgs = this.splitAccordingToSemanticValidity(configs, outerContext);
    var semValidConfigs = cfgs[0];
    var semInvalidConfigs = cfgs[1];
    var alt = this.getAltThatFinishedDecisionEntryRule(semValidConfigs);
    if (alt!==ATN.INVALID_ALT_NUMBER) { // semantically/syntactically viable path exists
        return alt;
    }
    // Is there a syntactically valid path with a failed pred?
    if (semInvalidConfigs.items.length>0) {
        alt = this.getAltThatFinishedDecisionEntryRule(semInvalidConfigs);
        if (alt!==ATN.INVALID_ALT_NUMBER) { // syntactically viable path exists
            return alt;
        }
    }
    return ATN.INVALID_ALT_NUMBER;
};
    
ParserATNSimulator.prototype.getAltThatFinishedDecisionEntryRule = function(configs) {
    var alts = [];
    for(var i=0;i<configs.items.length; i++) {
        var c = configs.items[i];
        if (c.reachesIntoOuterContext>0 || ((c.state instanceof RuleStopState) && c.context.hasEmptyPath())) {
            if(alts.indexOf(c.alt)<0) {
                alts.push(c.alt);
            }
        }
    }
    if (alts.length===0) {
        return ATN.INVALID_ALT_NUMBER;
    } else {
        return Math.min.apply(null, alts);
    }
};
// Walk the list of configurations and split them according to
//  those that have preds evaluating to true/false.  If no pred, assume
//  true pred and include in succeeded set.  Returns Pair of sets.
//
//  Create a new set so as not to alter the incoming parameter.
//
//  Assumption: the input stream has been restored to the starting point
//  prediction, which is where predicates need to evaluate.
//
ParserATNSimulator.prototype.splitAccordingToSemanticValidity = function( configs, outerContext) {
    var succeeded = new ATNConfigSet(configs.fullCtx);
    var failed = new ATNConfigSet(configs.fullCtx);
    for(var i=0;i<configs.items.length; i++) {
        var c = configs.items[i];
        if (c.semanticContext !== SemanticContext.NONE) {
            var predicateEvaluationResult = c.semanticContext.evaluate(this.parser, outerContext);
            if (predicateEvaluationResult) {
                succeeded.add(c);
            } else {
                failed.add(c);
            }
        } else {
            succeeded.add(c);
        }
    }
    return [succeeded, failed];
};

// Look through a list of predicate/alt pairs, returning alts for the
//  pairs that win. A {@code NONE} predicate indicates an alt containing an
//  unpredicated config which behaves as "always true." If !complete
//  then we stop at the first predicate that evaluates to true. This
//  includes pairs with null predicates.
//
ParserATNSimulator.prototype.evalSemanticContext = function(predPredictions, outerContext, complete) {
    var predictions = new BitSet();
    for(var i=0;i<predPredictions.length;i++) {
    	var pair = predPredictions[i];
        if (pair.pred === SemanticContext.NONE) {
            predictions.add(pair.alt);
            if (! complete) {
                break;
            }
            continue;
        }
        var predicateEvaluationResult = pair.pred.evaluate(this.parser, outerContext);
        if (this.debug || this.dfa_debug) {
            console.log("eval pred " + pair + "=" + predicateEvaluationResult);
        }
        if (predicateEvaluationResult) {
            if (this.debug || this.dfa_debug) {
                console.log("PREDICT " + pair.alt);
            }
            predictions.add(pair.alt);
            if (! complete) {
                break;
            }
        }
    }
    return predictions;
};

// TODO: If we are doing predicates, there is no point in pursuing
//     closure operations if we reach a DFA state that uniquely predicts
//     alternative. We will not be caching that DFA state and it is a
//     waste to pursue the closure. Might have to advance when we do
//     ambig detection thought :(
//

ParserATNSimulator.prototype.closure = function(config, configs, closureBusy, collectPredicates, fullCtx, treatEofAsEpsilon) {
    var initialDepth = 0;
    this.closureCheckingStopState(config, configs, closureBusy, collectPredicates,
                             fullCtx, initialDepth, treatEofAsEpsilon);
};


ParserATNSimulator.prototype.closureCheckingStopState = function(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon) {
    if (this.debug) {
        console.log("closure(" + config.toString(this.parser,true) + ")");
        console.log("configs(" + configs.toString() + ")");
        if(config.reachesIntoOuterContext>50) {
            throw "problem";
        }
    }
    if (config.state instanceof RuleStopState) {
        // We hit rule end. If we have context info, use it
        // run thru all possible stack tops in ctx
        if (! config.context.isEmpty()) {
            for ( var i =0; i<config.context.length; i++) {
                if (config.context.getReturnState(i) === PredictionContext.EMPTY_RETURN_STATE) {
                    if (fullCtx) {
                        configs.add(new ATNConfig({state:config.state, context:PredictionContext.EMPTY}, config), this.mergeCache);
                        continue;
                    } else {
                        // we have no context info, just chase follow links (if greedy)
                        if (this.debug) {
                            console.log("FALLING off rule " + this.getRuleName(config.state.ruleIndex));
                        }
                        this.closure_(config, configs, closureBusy, collectPredicates,
                                 fullCtx, depth, treatEofAsEpsilon);
                    }
                    continue;
                }
                returnState = this.atn.states[config.context.getReturnState(i)];
                newContext = config.context.getParent(i); // "pop" return state
                var parms = {state:returnState, alt:config.alt, context:newContext, semanticContext:config.semanticContext};
                c = new ATNConfig(parms, null);
                // While we have context to pop back from, we may have
                // gotten that context AFTER having falling off a rule.
                // Make sure we track that we are now out of context.
                c.reachesIntoOuterContext = config.reachesIntoOuterContext;
                this.closureCheckingStopState(c, configs, closureBusy, collectPredicates, fullCtx, depth - 1, treatEofAsEpsilon);
            }
            return;
        } else if( fullCtx) {
            // reached end of start rule
            configs.add(config, this.mergeCache);
            return;
        } else {
            // else if we have no context info, just chase follow links (if greedy)
            if (this.debug) {
                console.log("FALLING off rule " + this.getRuleName(config.state.ruleIndex));
            }
        }
    }
    this.closure_(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon);
};

// Do the actual work of walking epsilon edges//
ParserATNSimulator.prototype.closure_ = function(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon) {
    var p = config.state;
    // optimization
    if (! p.epsilonOnlyTransitions) {
        configs.add(config, this.mergeCache);
        // make sure to not return here, because EOF transitions can act as
        // both epsilon transitions and non-epsilon transitions.
    }
    for(var i = 0;i<p.transitions.length; i++) {
        var t = p.transitions[i];
        var continueCollecting = collectPredicates && !(t instanceof ActionTransition);
        var c = this.getEpsilonTarget(config, t, continueCollecting, depth === 0, fullCtx, treatEofAsEpsilon);
        if (c!==null) {
			if (!t.isEpsilon && closureBusy.add(c)!==c){
				// avoid infinite recursion for EOF* and EOF+
				continue;
			}
            var newDepth = depth;
            if ( config.state instanceof RuleStopState) {
                // target fell off end of rule; mark resulting c as having dipped into outer context
                // We can't get here if incoming config was rule stop and we had context
                // track how far we dip into outer context.  Might
                // come in handy and we avoid evaluating context dependent
                // preds if this is > 0.

                if (closureBusy.add(c)!==c) {
                    // avoid infinite recursion for right-recursive rules
                    continue;
                }

				if (this._dfa !== null && this._dfa.precedenceDfa) {
					if (t.outermostPrecedenceReturn === this._dfa.atnStartState.ruleIndex) {
						c.precedenceFilterSuppressed = true;
					}
				}

                c.reachesIntoOuterContext += 1;
                configs.dipsIntoOuterContext = true; // TODO: can remove? only care when we add to set per middle of this method
                newDepth -= 1;
                if (this.debug) {
                    console.log("dips into outer ctx: " + c);
                }
            } else if (t instanceof RuleTransition) {
                // latch when newDepth goes negative - once we step out of the entry context we can't return
                if (newDepth >= 0) {
                    newDepth += 1;
                }
            }
            this.closureCheckingStopState(c, configs, closureBusy, continueCollecting, fullCtx, newDepth, treatEofAsEpsilon);
        }
    }
};

ParserATNSimulator.prototype.getRuleName = function( index) {
    if (this.parser!==null && index>=0) {
        return this.parser.ruleNames[index];
    } else {
        return "<rule " + index + ">";
    }
};

ParserATNSimulator.prototype.getEpsilonTarget = function(config, t, collectPredicates, inContext, fullCtx, treatEofAsEpsilon) {
    switch(t.serializationType) {
    case Transition.RULE:
        return this.ruleTransition(config, t);
    case Transition.PRECEDENCE:
        return this.precedenceTransition(config, t, collectPredicates, inContext, fullCtx);
    case Transition.PREDICATE:
        return this.predTransition(config, t, collectPredicates, inContext, fullCtx);
    case Transition.ACTION:
        return this.actionTransition(config, t);
    case Transition.EPSILON:
        return new ATNConfig({state:t.target}, config);
    case Transition.ATOM:
    case Transition.RANGE:
    case Transition.SET:
        // EOF transitions act like epsilon transitions after the first EOF
        // transition is traversed
        if (treatEofAsEpsilon) {
            if (t.matches(Token.EOF, 0, 1)) {
                return new ATNConfig({state: t.target}, config);
            }
        }
        return null;
    default:
    	return null;
    }
};

ParserATNSimulator.prototype.actionTransition = function(config, t) {
    if (this.debug) {
        console.log("ACTION edge " + t.ruleIndex + ":" + t.actionIndex);
    }
    return new ATNConfig({state:t.target}, config);
};

ParserATNSimulator.prototype.precedenceTransition = function(config, pt,  collectPredicates, inContext, fullCtx) {
    if (this.debug) {
        console.log("PRED (collectPredicates=" + collectPredicates + ") " +
                pt.precedence + ">=_p, ctx dependent=true");
        if (this.parser!==null) {
        	console.log("context surrounding pred is " + Utils.arrayToString(this.parser.getRuleInvocationStack()));
        }
    }
    var c = null;
    if (collectPredicates && inContext) {
        if (fullCtx) {
            // In full context mode, we can evaluate predicates on-the-fly
            // during closure, which dramatically reduces the size of
            // the config sets. It also obviates the need to test predicates
            // later during conflict resolution.
            var currentPosition = this._input.index;
            this._input.seek(this._startIndex);
            var predSucceeds = pt.getPredicate().evaluate(this.parser, this._outerContext);
            this._input.seek(currentPosition);
            if (predSucceeds) {
                c = new ATNConfig({state:pt.target}, config); // no pred context
            }
        } else {
            newSemCtx = SemanticContext.andContext(config.semanticContext, pt.getPredicate());
            c = new ATNConfig({state:pt.target, semanticContext:newSemCtx}, config);
        }
    } else {
        c = new ATNConfig({state:pt.target}, config);
    }
    if (this.debug) {
        console.log("config from pred transition=" + c);
    }
    return c;
};

ParserATNSimulator.prototype.predTransition = function(config, pt, collectPredicates, inContext, fullCtx) {
    if (this.debug) {
        console.log("PRED (collectPredicates=" + collectPredicates + ") " + pt.ruleIndex +
                ":" + pt.predIndex + ", ctx dependent=" + pt.isCtxDependent);
        if (this.parser!==null) {
            console.log("context surrounding pred is " + Utils.arrayToString(this.parser.getRuleInvocationStack()));
        }
    }
    var c = null;
    if (collectPredicates && ((pt.isCtxDependent && inContext) || ! pt.isCtxDependent)) {
        if (fullCtx) {
            // In full context mode, we can evaluate predicates on-the-fly
            // during closure, which dramatically reduces the size of
            // the config sets. It also obviates the need to test predicates
            // later during conflict resolution.
            var currentPosition = this._input.index;
            this._input.seek(this._startIndex);
            var predSucceeds = pt.getPredicate().evaluate(this.parser, this._outerContext);
            this._input.seek(currentPosition);
            if (predSucceeds) {
                c = new ATNConfig({state:pt.target}, config); // no pred context
            }
        } else {
            var newSemCtx = SemanticContext.andContext(config.semanticContext, pt.getPredicate());
            c = new ATNConfig({state:pt.target, semanticContext:newSemCtx}, config);
        }
    } else {
        c = new ATNConfig({state:pt.target}, config);
    }
    if (this.debug) {
        console.log("config from pred transition=" + c);
    }
    return c;
};

ParserATNSimulator.prototype.ruleTransition = function(config, t) {
    if (this.debug) {
        console.log("CALL rule " + this.getRuleName(t.target.ruleIndex) + ", ctx=" + config.context);
    }
    var returnState = t.followState;
    var newContext = SingletonPredictionContext.create(config.context, returnState.stateNumber);
    return new ATNConfig({state:t.target, context:newContext}, config );
};

ParserATNSimulator.prototype.getConflictingAlts = function(configs) {
    var altsets = PredictionMode.getConflictingAltSubsets(configs);
    return PredictionMode.getAlts(altsets);
};

 // Sam pointed out a problem with the previous definition, v3, of
 // ambiguous states. If we have another state associated with conflicting
 // alternatives, we should keep going. For example, the following grammar
 //
 // s : (ID | ID ID?) ';' ;
 //
 // When the ATN simulation reaches the state before ';', it has a DFA
 // state that looks like: [12|1|[], 6|2|[], 12|2|[]]. Naturally
 // 12|1|[] and 12|2|[] conflict, but we cannot stop processing this node
 // because alternative to has another way to continue, via [6|2|[]].
 // The key is that we have a single state that has config's only associated
 // with a single alternative, 2, and crucially the state transitions
 // among the configurations are all non-epsilon transitions. That means
 // we don't consider any conflicts that include alternative 2. So, we
 // ignore the conflict between alts 1 and 2. We ignore a set of
 // conflicting alts when there is an intersection with an alternative
 // associated with a single alt state in the state&rarr;config-list map.
 //
 // It's also the case that we might have two conflicting configurations but
 // also a 3rd nonconflicting configuration for a different alternative:
 // [1|1|[], 1|2|[], 8|3|[]]. This can come about from grammar:
 //
 // a : A | A | A B ;
 //
 // After matching input A, we reach the stop state for rule A, state 1.
 // State 8 is the state right before B. Clearly alternatives 1 and 2
 // conflict and no amount of further lookahead will separate the two.
 // However, alternative 3 will be able to continue and so we do not
 // stop working on this state. In the previous example, we're concerned
 // with states associated with the conflicting alternatives. Here alt
 // 3 is not associated with the conflicting configs, but since we can continue
 // looking for input reasonably, I don't declare the state done. We
 // ignore a set of conflicting alts when we have an alternative
 // that we still need to pursue.
//

ParserATNSimulator.prototype.getConflictingAltsOrUniqueAlt = function(configs) {
    var conflictingAlts = null;
    if (configs.uniqueAlt!== ATN.INVALID_ALT_NUMBER) {
        conflictingAlts = new BitSet();
        conflictingAlts.add(configs.uniqueAlt);
    } else {
        conflictingAlts = configs.conflictingAlts;
    }
    return conflictingAlts;
};

ParserATNSimulator.prototype.getTokenName = function( t) {
    if (t===Token.EOF) {
        return "EOF";
    }
    if( this.parser!==null && this.parser.literalNames!==null) {
        if (t >= this.parser.literalNames.length) {
            console.log("" + t + " ttype out of range: " + this.parser.literalNames);
            console.log("" + this.parser.getInputStream().getTokens());
        } else {
            return this.parser.literalNames[t] + "<" + t + ">";
        }
    }
    return "" + t;
};

ParserATNSimulator.prototype.getLookaheadName = function(input) {
    return this.getTokenName(input.LA(1));
};

// Used for debugging in adaptivePredict around execATN but I cut
//  it out for clarity now that alg. works well. We can leave this
//  "dead" code for a bit.
//
ParserATNSimulator.prototype.dumpDeadEndConfigs = function(nvae) {
    console.log("dead end configs: ");
    var decs = nvae.getDeadEndConfigs();
    for(var i=0; i<decs.length; i++) {
    	var c = decs[i];
        var trans = "no edges";
        if (c.state.transitions.length>0) {
            var t = c.state.transitions[0];
            if (t instanceof AtomTransition) {
                trans = "Atom "+ this.getTokenName(t.label);
            } else if (t instanceof SetTransition) {
                var neg = (t instanceof NotSetTransition);
                trans = (neg ? "~" : "") + "Set " + t.set;
            }
        }
        console.error(c.toString(this.parser, true) + ":" + trans);
    }
};

ParserATNSimulator.prototype.noViableAlt = function(input, outerContext, configs, startIndex) {
    return new NoViableAltException(this.parser, input, input.get(startIndex), input.LT(1), configs, outerContext);
};

ParserATNSimulator.prototype.getUniqueAlt = function(configs) {
    var alt = ATN.INVALID_ALT_NUMBER;
    for(var i=0;i<configs.items.length;i++) {
    	var c = configs.items[i];
        if (alt === ATN.INVALID_ALT_NUMBER) {
            alt = c.alt // found first alt
        } else if( c.alt!==alt) {
            return ATN.INVALID_ALT_NUMBER;
        }
    }
    return alt;
};

//
// Add an edge to the DFA, if possible. This method calls
// {@link //addDFAState} to ensure the {@code to} state is present in the
// DFA. If {@code from} is {@code null}, or if {@code t} is outside the
// range of edges that can be represented in the DFA tables, this method
// returns without adding the edge to the DFA.
//
// <p>If {@code to} is {@code null}, this method returns {@code null}.
// Otherwise, this method returns the {@link DFAState} returned by calling
// {@link //addDFAState} for the {@code to} state.</p>
//
// @param dfa The DFA
// @param from The source state for the edge
// @param t The input symbol
// @param to The target state for the edge
//
// @return If {@code to} is {@code null}, this method returns {@code null};
// otherwise this method returns the result of calling {@link //addDFAState}
// on {@code to}
//
ParserATNSimulator.prototype.addDFAEdge = function(dfa, from_, t, to) {
    if( this.debug) {
        console.log("EDGE " + from_ + " -> " + to + " upon " + this.getTokenName(t));
    }
    if (to===null) {
        return null;
    }
    to = this.addDFAState(dfa, to); // used existing if possible not incoming
    if (from_===null || t < -1 || t > this.atn.maxTokenType) {
        return to;
    }
    if (from_.edges===null) {
        from_.edges = [];
    }
    from_.edges[t+1] = to; // connect

    if (this.debug) {
        var names = this.parser===null ? null : this.parser.literalNames;
        console.log("DFA=\n" + dfa.toString(names));
    }
    return to;
};
//
// Add state {@code D} to the DFA if it is not already present, and return
// the actual instance stored in the DFA. If a state equivalent to {@code D}
// is already in the DFA, the existing state is returned. Otherwise this
// method returns {@code D} after adding it to the DFA.
//
// <p>If {@code D} is {@link //ERROR}, this method returns {@link //ERROR} and
// does not change the DFA.</p>
//
// @param dfa The dfa
// @param D The DFA state to add
// @return The state stored in the DFA. This will be either the existing
// state if {@code D} is already in the DFA, or {@code D} itself if the
// state was not already present.
//
ParserATNSimulator.prototype.addDFAState = function(dfa, D) {
    if (D == ATNSimulator.ERROR) {
        return D;
    }
    var hash = D.hashString();
    var existing = dfa.states[hash] || null;
    if(existing!==null) {
        return existing;
    }
    D.stateNumber = dfa.states.length;
    if (! D.configs.readonly) {
        D.configs.optimizeConfigs(this);
        D.configs.setReadonly(true);
    }
    dfa.states[hash] = D;
    if (this.debug) {
        console.log("adding new DFA state: " + D);
    }
    return D;
};

ParserATNSimulator.prototype.reportAttemptingFullContext = function(dfa, conflictingAlts, configs, startIndex, stopIndex) {
    if (this.debug || this.retry_debug) {
        var interval = new Interval(startIndex, stopIndex + 1);
        console.log("reportAttemptingFullContext decision=" + dfa.decision + ":" + configs +
                           ", input=" + this.parser.getTokenStream().getText(interval));
    }
    if (this.parser!==null) {
        this.parser.getErrorListenerDispatch().reportAttemptingFullContext(this.parser, dfa, startIndex, stopIndex, conflictingAlts, configs);
    }
};

ParserATNSimulator.prototype.reportContextSensitivity = function(dfa, prediction, configs, startIndex, stopIndex) {
    if (this.debug || this.retry_debug) {
        var interval = new Interval(startIndex, stopIndex + 1);
        console.log("reportContextSensitivity decision=" + dfa.decision + ":" + configs +
                           ", input=" + this.parser.getTokenStream().getText(interval));
    }
    if (this.parser!==null) {
        this.parser.getErrorListenerDispatch().reportContextSensitivity(this.parser, dfa, startIndex, stopIndex, prediction, configs);
    }
};
    
// If context sensitive parsing, we know it's ambiguity not conflict//
ParserATNSimulator.prototype.reportAmbiguity = function(dfa, D, startIndex, stopIndex,
                               exact, ambigAlts, configs ) {
    if (this.debug || this.retry_debug) {
        var interval = new Interval(startIndex, stopIndex + 1);
        console.log("reportAmbiguity " + ambigAlts + ":" + configs +
                           ", input=" + this.parser.getTokenStream().getText(interval));
    }
    if (this.parser!==null) {
        this.parser.getErrorListenerDispatch().reportAmbiguity(this.parser, dfa, startIndex, stopIndex, exact, ambigAlts, configs);
    }
};
            
exports.ParserATNSimulator = ParserATNSimulator;
},{"./../IntervalSet":14,"./../ParserRuleContext":18,"./../PredictionContext":19,"./../RuleContext":21,"./../Token":22,"./../Utils":23,"./../dfa/DFAState":42,"./../error/Errors":47,"./ATN":24,"./ATNConfig":25,"./ATNConfigSet":26,"./ATNSimulator":29,"./ATNState":30,"./PredictionMode":36,"./SemanticContext":37,"./Transition":38}],36:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//
// This enumeration defines the prediction modes available in ANTLR 4 along with
// utility methods for analyzing configuration sets for conflicts and/or
// ambiguities.

var Set = require('./../Utils').Set;
var BitSet = require('./../Utils').BitSet;
var AltDict = require('./../Utils').AltDict;
var ATN = require('./ATN').ATN;
var RuleStopState = require('./ATNState').RuleStopState;

function PredictionMode() {
	return this;
}

//
// The SLL(*) prediction mode. This prediction mode ignores the current
// parser context when making predictions. This is the fastest prediction
// mode, and provides correct results for many grammars. This prediction
// mode is more powerful than the prediction mode provided by ANTLR 3, but
// may result in syntax errors for grammar and input combinations which are
// not SLL.
//
// <p>
// When using this prediction mode, the parser will either return a correct
// parse tree (i.e. the same parse tree that would be returned with the
// {@link //LL} prediction mode), or it will report a syntax error. If a
// syntax error is encountered when using the {@link //SLL} prediction mode,
// it may be due to either an actual syntax error in the input or indicate
// that the particular combination of grammar and input requires the more
// powerful {@link //LL} prediction abilities to complete successfully.</p>
//
// <p>
// This prediction mode does not provide any guarantees for prediction
// behavior for syntactically-incorrect inputs.</p>
//
PredictionMode.SLL = 0;
//
// The LL(*) prediction mode. This prediction mode allows the current parser
// context to be used for resolving SLL conflicts that occur during
// prediction. This is the fastest prediction mode that guarantees correct
// parse results for all combinations of grammars with syntactically correct
// inputs.
//
// <p>
// When using this prediction mode, the parser will make correct decisions
// for all syntactically-correct grammar and input combinations. However, in
// cases where the grammar is truly ambiguous this prediction mode might not
// report a precise answer for <em>exactly which</em> alternatives are
// ambiguous.</p>
//
// <p>
// This prediction mode does not provide any guarantees for prediction
// behavior for syntactically-incorrect inputs.</p>
//
PredictionMode.LL = 1;
//
// The LL(*) prediction mode with exact ambiguity detection. In addition to
// the correctness guarantees provided by the {@link //LL} prediction mode,
// this prediction mode instructs the prediction algorithm to determine the
// complete and exact set of ambiguous alternatives for every ambiguous
// decision encountered while parsing.
//
// <p>
// This prediction mode may be used for diagnosing ambiguities during
// grammar development. Due to the performance overhead of calculating sets
// of ambiguous alternatives, this prediction mode should be avoided when
// the exact results are not necessary.</p>
//
// <p>
// This prediction mode does not provide any guarantees for prediction
// behavior for syntactically-incorrect inputs.</p>
//
PredictionMode.LL_EXACT_AMBIG_DETECTION = 2;


//
// Computes the SLL prediction termination condition.
//
// <p>
// This method computes the SLL prediction termination condition for both of
// the following cases.</p>
//
// <ul>
// <li>The usual SLL+LL fallback upon SLL conflict</li>
// <li>Pure SLL without LL fallback</li>
// </ul>
//
// <p><strong>COMBINED SLL+LL PARSING</strong></p>
//
// <p>When LL-fallback is enabled upon SLL conflict, correct predictions are
// ensured regardless of how the termination condition is computed by this
// method. Due to the substantially higher cost of LL prediction, the
// prediction should only fall back to LL when the additional lookahead
// cannot lead to a unique SLL prediction.</p>
//
// <p>Assuming combined SLL+LL parsing, an SLL configuration set with only
// conflicting subsets should fall back to full LL, even if the
// configuration sets don't resolve to the same alternative (e.g.
// {@code {1,2}} and {@code {3,4}}. If there is at least one non-conflicting
// configuration, SLL could continue with the hopes that more lookahead will
// resolve via one of those non-conflicting configurations.</p>
//
// <p>Here's the prediction termination rule them: SLL (for SLL+LL parsing)
// stops when it sees only conflicting configuration subsets. In contrast,
// full LL keeps going when there is uncertainty.</p>
//
// <p><strong>HEURISTIC</strong></p>
//
// <p>As a heuristic, we stop prediction when we see any conflicting subset
// unless we see a state that only has one alternative associated with it.
// The single-alt-state thing lets prediction continue upon rules like
// (otherwise, it would admit defeat too soon):</p>
//
// <p>{@code [12|1|[], 6|2|[], 12|2|[]]. s : (ID | ID ID?) ';' ;}</p>
//
// <p>When the ATN simulation reaches the state before {@code ';'}, it has a
// DFA state that looks like: {@code [12|1|[], 6|2|[], 12|2|[]]}. Naturally
// {@code 12|1|[]} and {@code 12|2|[]} conflict, but we cannot stop
// processing this node because alternative to has another way to continue,
// via {@code [6|2|[]]}.</p>
//
// <p>It also let's us continue for this rule:</p>
//
// <p>{@code [1|1|[], 1|2|[], 8|3|[]] a : A | A | A B ;}</p>
//
// <p>After matching input A, we reach the stop state for rule A, state 1.
// State 8 is the state right before B. Clearly alternatives 1 and 2
// conflict and no amount of further lookahead will separate the two.
// However, alternative 3 will be able to continue and so we do not stop
// working on this state. In the previous example, we're concerned with
// states associated with the conflicting alternatives. Here alt 3 is not
// associated with the conflicting configs, but since we can continue
// looking for input reasonably, don't declare the state done.</p>
//
// <p><strong>PURE SLL PARSING</strong></p>
//
// <p>To handle pure SLL parsing, all we have to do is make sure that we
// combine stack contexts for configurations that differ only by semantic
// predicate. From there, we can do the usual SLL termination heuristic.</p>
//
// <p><strong>PREDICATES IN SLL+LL PARSING</strong></p>
//
// <p>SLL decisions don't evaluate predicates until after they reach DFA stop
// states because they need to create the DFA cache that works in all
// semantic situations. In contrast, full LL evaluates predicates collected
// during start state computation so it can ignore predicates thereafter.
// This means that SLL termination detection can totally ignore semantic
// predicates.</p>
//
// <p>Implementation-wise, {@link ATNConfigSet} combines stack contexts but not
// semantic predicate contexts so we might see two configurations like the
// following.</p>
//
// <p>{@code (s, 1, x, {}), (s, 1, x', {p})}</p>
//
// <p>Before testing these configurations against others, we have to merge
// {@code x} and {@code x'} (without modifying the existing configurations).
// For example, we test {@code (x+x')==x''} when looking for conflicts in
// the following configurations.</p>
//
// <p>{@code (s, 1, x, {}), (s, 1, x', {p}), (s, 2, x'', {})}</p>
//
// <p>If the configuration set has predicates (as indicated by
// {@link ATNConfigSet//hasSemanticContext}), this algorithm makes a copy of
// the configurations to strip out all of the predicates so that a standard
// {@link ATNConfigSet} will merge everything ignoring predicates.</p>
//
PredictionMode.hasSLLConflictTerminatingPrediction = function( mode, configs) {
    // Configs in rule stop states indicate reaching the end of the decision
    // rule (local context) or end of start rule (full context). If all
    // configs meet this condition, then none of the configurations is able
    // to match additional input so we terminate prediction.
    //
    if (PredictionMode.allConfigsInRuleStopStates(configs)) {
        return true;
    }
    // pure SLL mode parsing
    if (mode === PredictionMode.SLL) {
        // Don't bother with combining configs from different semantic
        // contexts if we can fail over to full LL; costs more time
        // since we'll often fail over anyway.
        if (configs.hasSemanticContext) {
            // dup configs, tossing out semantic predicates
            var dup = new ATNConfigSet();
            for(var i=0;i<configs.items.length;i++) {
            	var c = configs.items[i];
                c = new ATNConfig({semanticContext:SemanticContext.NONE}, c);
                dup.add(c);
            }
            configs = dup;
        }
        // now we have combined contexts for configs with dissimilar preds
    }
    // pure SLL or combined SLL+LL mode parsing
    var altsets = PredictionMode.getConflictingAltSubsets(configs);
    return PredictionMode.hasConflictingAltSet(altsets) && !PredictionMode.hasStateAssociatedWithOneAlt(configs);
};

// Checks if any configuration in {@code configs} is in a
// {@link RuleStopState}. Configurations meeting this condition have reached
// the end of the decision rule (local context) or end of start rule (full
// context).
//
// @param configs the configuration set to test
// @return {@code true} if any configuration in {@code configs} is in a
// {@link RuleStopState}, otherwise {@code false}
PredictionMode.hasConfigInRuleStopState = function(configs) {
	for(var i=0;i<configs.items.length;i++) {
		var c = configs.items[i];
        if (c.state instanceof RuleStopState) {
            return true;
        }
	}
    return false;
};

// Checks if all configurations in {@code configs} are in a
// {@link RuleStopState}. Configurations meeting this condition have reached
// the end of the decision rule (local context) or end of start rule (full
// context).
//
// @param configs the configuration set to test
// @return {@code true} if all configurations in {@code configs} are in a
// {@link RuleStopState}, otherwise {@code false}
PredictionMode.allConfigsInRuleStopStates = function(configs) {
	for(var i=0;i<configs.items.length;i++) {
		var c = configs.items[i];
        if (!(c.state instanceof RuleStopState)) {
            return false;
        }
	}
    return true;
};

//
// Full LL prediction termination.
//
// <p>Can we stop looking ahead during ATN simulation or is there some
// uncertainty as to which alternative we will ultimately pick, after
// consuming more input? Even if there are partial conflicts, we might know
// that everything is going to resolve to the same minimum alternative. That
// means we can stop since no more lookahead will change that fact. On the
// other hand, there might be multiple conflicts that resolve to different
// minimums. That means we need more look ahead to decide which of those
// alternatives we should predict.</p>
//
// <p>The basic idea is to split the set of configurations {@code C}, into
// conflicting subsets {@code (s, _, ctx, _)} and singleton subsets with
// non-conflicting configurations. Two configurations conflict if they have
// identical {@link ATNConfig//state} and {@link ATNConfig//context} values
// but different {@link ATNConfig//alt} value, e.g. {@code (s, i, ctx, _)}
// and {@code (s, j, ctx, _)} for {@code i!=j}.</p>
//
// <p>Reduce these configuration subsets to the set of possible alternatives.
// You can compute the alternative subsets in one pass as follows:</p>
//
// <p>{@code A_s,ctx = {i | (s, i, ctx, _)}} for each configuration in
// {@code C} holding {@code s} and {@code ctx} fixed.</p>
//
// <p>Or in pseudo-code, for each configuration {@code c} in {@code C}:</p>
//
// <pre>
// map[c] U= c.{@link ATNConfig//alt alt} // map hash/equals uses s and x, not
// alt and not pred
// </pre>
//
// <p>The values in {@code map} are the set of {@code A_s,ctx} sets.</p>
//
// <p>If {@code |A_s,ctx|=1} then there is no conflict associated with
// {@code s} and {@code ctx}.</p>
//
// <p>Reduce the subsets to singletons by choosing a minimum of each subset. If
// the union of these alternative subsets is a singleton, then no amount of
// more lookahead will help us. We will always pick that alternative. If,
// however, there is more than one alternative, then we are uncertain which
// alternative to predict and must continue looking for resolution. We may
// or may not discover an ambiguity in the future, even if there are no
// conflicting subsets this round.</p>
//
// <p>The biggest sin is to terminate early because it means we've made a
// decision but were uncertain as to the eventual outcome. We haven't used
// enough lookahead. On the other hand, announcing a conflict too late is no
// big deal; you will still have the conflict. It's just inefficient. It
// might even look until the end of file.</p>
//
// <p>No special consideration for semantic predicates is required because
// predicates are evaluated on-the-fly for full LL prediction, ensuring that
// no configuration contains a semantic context during the termination
// check.</p>
//
// <p><strong>CONFLICTING CONFIGS</strong></p>
//
// <p>Two configurations {@code (s, i, x)} and {@code (s, j, x')}, conflict
// when {@code i!=j} but {@code x=x'}. Because we merge all
// {@code (s, i, _)} configurations together, that means that there are at
// most {@code n} configurations associated with state {@code s} for
// {@code n} possible alternatives in the decision. The merged stacks
// complicate the comparison of configuration contexts {@code x} and
// {@code x'}. Sam checks to see if one is a subset of the other by calling
// merge and checking to see if the merged result is either {@code x} or
// {@code x'}. If the {@code x} associated with lowest alternative {@code i}
// is the superset, then {@code i} is the only possible prediction since the
// others resolve to {@code min(i)} as well. However, if {@code x} is
// associated with {@code j>i} then at least one stack configuration for
// {@code j} is not in conflict with alternative {@code i}. The algorithm
// should keep going, looking for more lookahead due to the uncertainty.</p>
//
// <p>For simplicity, I'm doing a equality check between {@code x} and
// {@code x'} that lets the algorithm continue to consume lookahead longer
// than necessary. The reason I like the equality is of course the
// simplicity but also because that is the test you need to detect the
// alternatives that are actually in conflict.</p>
//
// <p><strong>CONTINUE/STOP RULE</strong></p>
//
// <p>Continue if union of resolved alternative sets from non-conflicting and
// conflicting alternative subsets has more than one alternative. We are
// uncertain about which alternative to predict.</p>
//
// <p>The complete set of alternatives, {@code [i for (_,i,_)]}, tells us which
// alternatives are still in the running for the amount of input we've
// consumed at this point. The conflicting sets let us to strip away
// configurations that won't lead to more states because we resolve
// conflicts to the configuration with a minimum alternate for the
// conflicting set.</p>
//
// <p><strong>CASES</strong></p>
//
// <ul>
//
// <li>no conflicts and more than 1 alternative in set =&gt; continue</li>
//
// <li> {@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s, 3, z)},
// {@code (s', 1, y)}, {@code (s', 2, y)} yields non-conflicting set
// {@code {3}} U conflicting sets {@code min({1,2})} U {@code min({1,2})} =
// {@code {1,3}} =&gt; continue
// </li>
//
// <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 1, y)},
// {@code (s', 2, y)}, {@code (s'', 1, z)} yields non-conflicting set
// {@code {1}} U conflicting sets {@code min({1,2})} U {@code min({1,2})} =
// {@code {1}} =&gt; stop and predict 1</li>
//
// <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 1, y)},
// {@code (s', 2, y)} yields conflicting, reduced sets {@code {1}} U
// {@code {1}} = {@code {1}} =&gt; stop and predict 1, can announce
// ambiguity {@code {1,2}}</li>
//
// <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 2, y)},
// {@code (s', 3, y)} yields conflicting, reduced sets {@code {1}} U
// {@code {2}} = {@code {1,2}} =&gt; continue</li>
//
// <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 3, y)},
// {@code (s', 4, y)} yields conflicting, reduced sets {@code {1}} U
// {@code {3}} = {@code {1,3}} =&gt; continue</li>
//
// </ul>
//
// <p><strong>EXACT AMBIGUITY DETECTION</strong></p>
//
// <p>If all states report the same conflicting set of alternatives, then we
// know we have the exact ambiguity set.</p>
//
// <p><code>|A_<em>i</em>|&gt;1</code> and
// <code>A_<em>i</em> = A_<em>j</em></code> for all <em>i</em>, <em>j</em>.</p>
//
// <p>In other words, we continue examining lookahead until all {@code A_i}
// have more than one alternative and all {@code A_i} are the same. If
// {@code A={{1,2}, {1,3}}}, then regular LL prediction would terminate
// because the resolved set is {@code {1}}. To determine what the real
// ambiguity is, we have to know whether the ambiguity is between one and
// two or one and three so we keep going. We can only stop prediction when
// we need exact ambiguity detection when the sets look like
// {@code A={{1,2}}} or {@code {{1,2},{1,2}}}, etc...</p>
//
PredictionMode.resolvesToJustOneViableAlt = function(altsets) {
    return PredictionMode.getSingleViableAlt(altsets);
};

//
// Determines if every alternative subset in {@code altsets} contains more
// than one alternative.
//
// @param altsets a collection of alternative subsets
// @return {@code true} if every {@link BitSet} in {@code altsets} has
// {@link BitSet//cardinality cardinality} &gt; 1, otherwise {@code false}
//
PredictionMode.allSubsetsConflict = function(altsets) {
    return ! PredictionMode.hasNonConflictingAltSet(altsets);
};
//
// Determines if any single alternative subset in {@code altsets} contains
// exactly one alternative.
//
// @param altsets a collection of alternative subsets
// @return {@code true} if {@code altsets} contains a {@link BitSet} with
// {@link BitSet//cardinality cardinality} 1, otherwise {@code false}
//
PredictionMode.hasNonConflictingAltSet = function(altsets) {
	for(var i=0;i<altsets.length;i++) {
		var alts = altsets[i];
        if (alts.length===1) {
            return true;
        }
	}
    return false;
};

//
// Determines if any single alternative subset in {@code altsets} contains
// more than one alternative.
//
// @param altsets a collection of alternative subsets
// @return {@code true} if {@code altsets} contains a {@link BitSet} with
// {@link BitSet//cardinality cardinality} &gt; 1, otherwise {@code false}
//
PredictionMode.hasConflictingAltSet = function(altsets) {
	for(var i=0;i<altsets.length;i++) {
		var alts = altsets[i];
        if (alts.length>1) {
            return true;
        }
	}
    return false;
};

//
// Determines if every alternative subset in {@code altsets} is equivalent.
//
// @param altsets a collection of alternative subsets
// @return {@code true} if every member of {@code altsets} is equal to the
// others, otherwise {@code false}
//
PredictionMode.allSubsetsEqual = function(altsets) {
    var first = null;
	for(var i=0;i<altsets.length;i++) {
		var alts = altsets[i];
        if (first === null) {
            first = alts;
        } else if (alts!==first) {
            return false;
        }
	}
    return true;
};

//
// Returns the unique alternative predicted by all alternative subsets in
// {@code altsets}. If no such alternative exists, this method returns
// {@link ATN//INVALID_ALT_NUMBER}.
//
// @param altsets a collection of alternative subsets
//
PredictionMode.getUniqueAlt = function(altsets) {
    var all = PredictionMode.getAlts(altsets);
    if (all.length===1) {
        return all.minValue();
    } else {
        return ATN.INVALID_ALT_NUMBER;
    }
};

// Gets the complete set of represented alternatives for a collection of
// alternative subsets. This method returns the union of each {@link BitSet}
// in {@code altsets}.
//
// @param altsets a collection of alternative subsets
// @return the set of represented alternatives in {@code altsets}
//
PredictionMode.getAlts = function(altsets) {
    var all = new BitSet();
    altsets.map( function(alts) { all.or(alts); });
    return all;
};

//
// This function gets the conflicting alt subsets from a configuration set.
// For each configuration {@code c} in {@code configs}:
//
// <pre>
// map[c] U= c.{@link ATNConfig//alt alt} // map hash/equals uses s and x, not
// alt and not pred
// </pre>
//
PredictionMode.getConflictingAltSubsets = function(configs) {
    var configToAlts = {};
	for(var i=0;i<configs.items.length;i++) {
		var c = configs.items[i];
        var key = "key_" + c.state.stateNumber + "/" + c.context;
        var alts = configToAlts[key] || null;
        if (alts === null) {
            alts = new BitSet();
            configToAlts[key] = alts;
        }
        alts.add(c.alt);
	}
	var values = [];
	for(var k in configToAlts) {
		if(k.indexOf("key_")!==0) {
			continue;
		}
		values.push(configToAlts[k]);
	}
    return values;
};

//
// Get a map from state to alt subset from a configuration set. For each
// configuration {@code c} in {@code configs}:
//
// <pre>
// map[c.{@link ATNConfig//state state}] U= c.{@link ATNConfig//alt alt}
// </pre>
//
PredictionMode.getStateToAltMap = function(configs) {
    var m = new AltDict();
    configs.items.map(function(c) {
        var alts = m.get(c.state);
        if (alts === null) {
            alts = new BitSet();
            m.put(c.state, alts);
        }
        alts.add(c.alt);
    });
    return m;
};

PredictionMode.hasStateAssociatedWithOneAlt = function(configs) {
    var values = PredictionMode.getStateToAltMap(configs).values();
    for(var i=0;i<values.length;i++) {
        if (values[i].length===1) {
            return true;
        }
    }
    return false;
};

PredictionMode.getSingleViableAlt = function(altsets) {
    var result = null;
	for(var i=0;i<altsets.length;i++) {
		var alts = altsets[i];
        var minAlt = alts.minValue();
        if(result===null) {
            result = minAlt;
        } else if(result!==minAlt) { // more than 1 viable alt
            return ATN.INVALID_ALT_NUMBER;
        }
	}
    return result;
};

exports.PredictionMode = PredictionMode;
},{"./../Utils":23,"./ATN":24,"./ATNState":30}],37:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

// A tree structure used to record the semantic context in which
//  an ATN configuration is valid.  It's either a single predicate,
//  a conjunction {@code p1&&p2}, or a sum of products {@code p1||p2}.
//
//  <p>I have scoped the {@link AND}, {@link OR}, and {@link Predicate} subclasses of
//  {@link SemanticContext} within the scope of this outer class.</p>
//

var Set = require('./../Utils').Set;

function SemanticContext() {
	return this;
}

// For context independent predicates, we evaluate them without a local
// context (i.e., null context). That way, we can evaluate them without
// having to create proper rule-specific context during prediction (as
// opposed to the parser, which creates them naturally). In a practical
// sense, this avoids a cast exception from RuleContext to myruleContext.
//
// <p>For context dependent predicates, we must pass in a local context so that
// references such as $arg evaluate properly as _localctx.arg. We only
// capture context dependent predicates in the context in which we begin
// prediction, so we passed in the outer context here in case of context
// dependent predicate evaluation.</p>
//
SemanticContext.prototype.evaluate = function(parser, outerContext) {
};

//
// Evaluate the precedence predicates for the context and reduce the result.
//
// @param parser The parser instance.
// @param outerContext The current parser context object.
// @return The simplified semantic context after precedence predicates are
// evaluated, which will be one of the following values.
// <ul>
// <li>{@link //NONE}: if the predicate simplifies to {@code true} after
// precedence predicates are evaluated.</li>
// <li>{@code null}: if the predicate simplifies to {@code false} after
// precedence predicates are evaluated.</li>
// <li>{@code this}: if the semantic context is not changed as a result of
// precedence predicate evaluation.</li>
// <li>A non-{@code null} {@link SemanticContext}: the new simplified
// semantic context after precedence predicates are evaluated.</li>
// </ul>
//
SemanticContext.prototype.evalPrecedence = function(parser, outerContext) {
	return this;
};

SemanticContext.andContext = function(a, b) {
	if (a === null || a === SemanticContext.NONE) {
		return b;
	}
	if (b === null || b === SemanticContext.NONE) {
		return a;
	}
	var result = new AND(a, b);
	if (result.opnds.length === 1) {
		return result.opnds[0];
	} else {
		return result;
	}
};

SemanticContext.orContext = function(a, b) {
	if (a === null) {
		return b;
	}
	if (b === null) {
		return a;
	}
	if (a === SemanticContext.NONE || b === SemanticContext.NONE) {
		return SemanticContext.NONE;
	}
	var result = new OR(a, b);
	if (result.opnds.length === 1) {
		return result.opnds[0];
	} else {
		return result;
	}
};

function Predicate(ruleIndex, predIndex, isCtxDependent) {
	SemanticContext.call(this);
	this.ruleIndex = ruleIndex === undefined ? -1 : ruleIndex;
	this.predIndex = predIndex === undefined ? -1 : predIndex;
	this.isCtxDependent = isCtxDependent === undefined ? false : isCtxDependent; // e.g., $i ref in pred
	return this;
}

Predicate.prototype = Object.create(SemanticContext.prototype);
Predicate.prototype.constructor = Predicate;

//The default {@link SemanticContext}, which is semantically equivalent to
//a predicate of the form {@code {true}?}.
//
SemanticContext.NONE = new Predicate();


Predicate.prototype.evaluate = function(parser, outerContext) {
	var localctx = this.isCtxDependent ? outerContext : null;
	return parser.sempred(localctx, this.ruleIndex, this.predIndex);
};

Predicate.prototype.hashString = function() {
	return "" + this.ruleIndex + "/" + this.predIndex + "/" + this.isCtxDependent;
};

Predicate.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof Predicate)) {
		return false;
	} else {
		return this.ruleIndex === other.ruleIndex &&
				this.predIndex === other.predIndex &&
				this.isCtxDependent === other.isCtxDependent;
	}
};

Predicate.prototype.toString = function() {
	return "{" + this.ruleIndex + ":" + this.predIndex + "}?";
};

function PrecedencePredicate(precedence) {
	SemanticContext.call(this);
	this.precedence = precedence === undefined ? 0 : precedence;
}

PrecedencePredicate.prototype = Object.create(SemanticContext.prototype);
PrecedencePredicate.prototype.constructor = PrecedencePredicate;

PrecedencePredicate.prototype.evaluate = function(parser, outerContext) {
	return parser.precpred(outerContext, this.precedence);
};

PrecedencePredicate.prototype.evalPrecedence = function(parser, outerContext) {
	if (parser.precpred(outerContext, this.precedence)) {
		return SemanticContext.NONE;
	} else {
		return null;
	}
};

PrecedencePredicate.prototype.compareTo = function(other) {
	return this.precedence - other.precedence;
};

PrecedencePredicate.prototype.hashString = function() {
	return "31";
};

PrecedencePredicate.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof PrecedencePredicate)) {
		return false;
	} else {
		return this.precedence === other.precedence;
	}
};

PrecedencePredicate.prototype.toString = function() {
	return "{"+this.precedence+">=prec}?";
};



PrecedencePredicate.filterPrecedencePredicates = function(set) {
	var result = [];
	set.values().map( function(context) {
		if (context instanceof PrecedencePredicate) {
			result.push(context);
		}
	});
	return result;
};


// A semantic context which is true whenever none of the contained contexts
// is false.
//
function AND(a, b) {
	SemanticContext.call(this);
	var operands = new Set();
	if (a instanceof AND) {
		a.opnds.map(function(o) {
			operands.add(o);
		});
	} else {
		operands.add(a);
	}
	if (b instanceof AND) {
		b.opnds.map(function(o) {
			operands.add(o);
		});
	} else {
		operands.add(b);
	}
	var precedencePredicates = PrecedencePredicate.filterPrecedencePredicates(operands);
	if (precedencePredicates.length > 0) {
		// interested in the transition with the lowest precedence
		var reduced = null;
		precedencePredicates.map( function(p) {
			if(reduced===null || p.precedence<reduced.precedence) {
				reduced = p;
			}
		});
		operands.add(reduced);
	}
	this.opnds = operands.values();
	return this;
}

AND.prototype = Object.create(SemanticContext.prototype);
AND.prototype.constructor = AND;

AND.prototype.equals = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof AND)) {
		return false;
	} else {
		return this.opnds === other.opnds;
	}
};

AND.prototype.hashString = function() {
	return "" + this.opnds + "/AND";
};
//
// {@inheritDoc}
//
// <p>
// The evaluation of predicates by this context is short-circuiting, but
// unordered.</p>
//
AND.prototype.evaluate = function(parser, outerContext) {
	for (var i = 0; i < this.opnds.length; i++) {
		if (!this.opnds[i].evaluate(parser, outerContext)) {
			return false;
		}
	}
	return true;
};

AND.prototype.evalPrecedence = function(parser, outerContext) {
	var differs = false;
	var operands = [];
	for (var i = 0; i < this.opnds.length; i++) {
		var context = this.opnds[i];
		var evaluated = context.evalPrecedence(parser, outerContext);
		differs |= (evaluated !== context);
		if (evaluated === null) {
			// The AND context is false if any element is false
			return null;
		} else if (evaluated !== SemanticContext.NONE) {
			// Reduce the result by skipping true elements
			operands.push(evaluated);
		}
	}
	if (!differs) {
		return this;
	}
	if (operands.length === 0) {
		// all elements were true, so the AND context is true
		return SemanticContext.NONE;
	}
	var result = null;
	operands.map(function(o) {
		result = result === null ? o : SemanticPredicate.andContext(result, o);
	});
	return result;
};

AND.prototype.toString = function() {
	var s = "";
	this.opnds.map(function(o) {
		s += "&& " + o.toString();
	});
	return s.length > 3 ? s.slice(3) : s;
};

//
// A semantic context which is true whenever at least one of the contained
// contexts is true.
//
function OR(a, b) {
	SemanticContext.call(this);
	var operands = new Set();
	if (a instanceof OR) {
		a.opnds.map(function(o) {
			operands.add(o);
		});
	} else {
		operands.add(a);
	}
	if (b instanceof OR) {
		b.opnds.map(function(o) {
			operands.add(o);
		});
	} else {
		operands.add(b);
	}

	var precedencePredicates = PrecedencePredicate.filterPrecedencePredicates(operands);
	if (precedencePredicates.length > 0) {
		// interested in the transition with the highest precedence
		var s = precedencePredicates.sort(function(a, b) {
			return a.compareTo(b);
		});
		var reduced = s[s.length-1];
		operands.add(reduced);
	}
	this.opnds = operands.values();
	return this;
}

OR.prototype = Object.create(SemanticContext.prototype);
OR.prototype.constructor = OR;

OR.prototype.constructor = function(other) {
	if (this === other) {
		return true;
	} else if (!(other instanceof OR)) {
		return false;
	} else {
		return this.opnds === other.opnds;
	}
};

OR.prototype.hashString = function() {
	return "" + this.opnds + "/OR"; 
};

// <p>
// The evaluation of predicates by this context is short-circuiting, but
// unordered.</p>
//
OR.prototype.evaluate = function(parser, outerContext) {
	for (var i = 0; i < this.opnds.length; i++) {
		if (this.opnds[i].evaluate(parser, outerContext)) {
			return true;
		}
	}
	return false;
};

OR.prototype.evalPrecedence = function(parser, outerContext) {
	var differs = false;
	var operands = [];
	for (var i = 0; i < this.opnds.length; i++) {
		var context = this.opnds[i];
		var evaluated = context.evalPrecedence(parser, outerContext);
		differs |= (evaluated !== context);
		if (evaluated === SemanticContext.NONE) {
			// The OR context is true if any element is true
			return SemanticContext.NONE;
		} else if (evaluated !== null) {
			// Reduce the result by skipping false elements
			operands.push(evaluated);
		}
	}
	if (!differs) {
		return this;
	}
	if (operands.length === 0) {
		// all elements were false, so the OR context is false
		return null;
	}
	var result = null;
	operands.map(function(o) {
		return result === null ? o : SemanticContext.orContext(result, o);
	});
	return result;
};

AND.prototype.toString = function() {
	var s = "";
	this.opnds.map(function(o) {
		s += "|| " + o.toString();
	});
	return s.length > 3 ? s.slice(3) : s;
};

exports.SemanticContext = SemanticContext;
exports.PrecedencePredicate = PrecedencePredicate;
exports.Predicate = Predicate;

},{"./../Utils":23}],38:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

//  An ATN transition between any two ATN states.  Subclasses define
//  atom, set, epsilon, action, predicate, rule transitions.
//
//  <p>This is a one way link.  It emanates from a state (usually via a list of
//  transitions) and has a target state.</p>
//
//  <p>Since we never have to change the ATN transitions once we construct it,
//  we can fix these transitions as specific classes. The DFA transitions
//  on the other hand need to update the labels as it adds transitions to
//  the states. We'll use the term Edge for the DFA to distinguish them from
//  ATN transitions.</p>

var Token = require('./../Token').Token;
var Interval = require('./../IntervalSet').Interval;
var IntervalSet = require('./../IntervalSet').IntervalSet;
var Predicate = require('./SemanticContext').Predicate;
var PrecedencePredicate = require('./SemanticContext').PrecedencePredicate;

function Transition (target) {
    // The target of this transition.
    if (target===undefined || target===null) {
        throw "target cannot be null.";
    }
    this.target = target;
    // Are we epsilon, action, sempred?
    this.isEpsilon = false;
    this.label = null;
    return this;
}
    // constants for serialization
Transition.EPSILON = 1;
Transition.RANGE = 2;
Transition.RULE = 3;
Transition.PREDICATE = 4; // e.g., {isType(input.LT(1))}?
Transition.ATOM = 5;
Transition.ACTION = 6;
Transition.SET = 7; // ~(A|B) or ~atom, wildcard, which convert to next 2
Transition.NOT_SET = 8;
Transition.WILDCARD = 9;
Transition.PRECEDENCE = 10;

Transition.serializationNames = [
            "INVALID",
            "EPSILON",
            "RANGE",
            "RULE",
            "PREDICATE",
            "ATOM",
            "ACTION",
            "SET",
            "NOT_SET",
            "WILDCARD",
            "PRECEDENCE"
        ];

Transition.serializationTypes = {
        EpsilonTransition: Transition.EPSILON,
        RangeTransition: Transition.RANGE,
        RuleTransition: Transition.RULE,
        PredicateTransition: Transition.PREDICATE,
        AtomTransition: Transition.ATOM,
        ActionTransition: Transition.ACTION,
        SetTransition: Transition.SET,
        NotSetTransition: Transition.NOT_SET,
        WildcardTransition: Transition.WILDCARD,
        PrecedencePredicateTransition: Transition.PRECEDENCE
    };


// TODO: make all transitions sets? no, should remove set edges
function AtomTransition(target, label) {
	Transition.call(this, target);
	this.label_ = label; // The token type or character value; or, signifies special label.
    this.label = this.makeLabel();
    this.serializationType = Transition.ATOM;
    return this;
}

AtomTransition.prototype = Object.create(Transition.prototype);
AtomTransition.prototype.constructor = AtomTransition;

AtomTransition.prototype.makeLabel = function() {
	var s = new IntervalSet();
    s.addOne(this.label_);
    return s;
};

AtomTransition.prototype.matches = function( symbol, minVocabSymbol,  maxVocabSymbol) {
    return this.label_ === symbol;
};

AtomTransition.prototype.toString = function() {
	return this.label_;
};

function RuleTransition(ruleStart, ruleIndex, precedence, followState) {
	Transition.call(this, ruleStart);
    this.ruleIndex = ruleIndex; // ptr to the rule definition object for this rule ref
    this.precedence = precedence;
    this.followState = followState; // what node to begin computations following ref to rule
    this.serializationType = Transition.RULE;
    this.isEpsilon = true;
    return this;
}

RuleTransition.prototype = Object.create(Transition.prototype);
RuleTransition.prototype.constructor = RuleTransition;

RuleTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return false;
};


function EpsilonTransition(target, outermostPrecedenceReturn) {
	Transition.call(this, target);
    this.serializationType = Transition.EPSILON;
    this.isEpsilon = true;
    this.outermostPrecedenceReturn = outermostPrecedenceReturn;
    return this;
}

EpsilonTransition.prototype = Object.create(Transition.prototype);
EpsilonTransition.prototype.constructor = EpsilonTransition;

EpsilonTransition.prototype.matches = function( symbol, minVocabSymbol,  maxVocabSymbol) {
	return false;
};

EpsilonTransition.prototype.toString = function() {
	return "epsilon";
};

function RangeTransition(target, start, stop) {
	Transition.call(this, target);
	this.serializationType = Transition.RANGE;
    this.start = start;
    this.stop = stop;
    this.label = this.makeLabel();
    return this;
}

RangeTransition.prototype = Object.create(Transition.prototype);
RangeTransition.prototype.constructor = RangeTransition;

RangeTransition.prototype.makeLabel = function() {
    var s = new IntervalSet();
    s.addRange(this.start, this.stop);
    return s;
};

RangeTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return symbol >= this.start && symbol <= this.stop;
};

RangeTransition.prototype.toString = function() {
	return "'" + String.fromCharCode(this.start) + "'..'" + String.fromCharCode(this.stop) + "'";
};

function AbstractPredicateTransition(target) {
	Transition.call(this, target);
	return this;
}

AbstractPredicateTransition.prototype = Object.create(Transition.prototype);
AbstractPredicateTransition.prototype.constructor = AbstractPredicateTransition;

function PredicateTransition(target, ruleIndex, predIndex, isCtxDependent) {
	AbstractPredicateTransition.call(this, target);
    this.serializationType = Transition.PREDICATE;
    this.ruleIndex = ruleIndex;
    this.predIndex = predIndex;
    this.isCtxDependent = isCtxDependent; // e.g., $i ref in pred
    this.isEpsilon = true;
    return this;
}

PredicateTransition.prototype = Object.create(AbstractPredicateTransition.prototype);
PredicateTransition.prototype.constructor = PredicateTransition;

PredicateTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return false;
};

PredicateTransition.prototype.getPredicate = function() {
	return new Predicate(this.ruleIndex, this.predIndex, this.isCtxDependent);
};

PredicateTransition.prototype.toString = function() {
	return "pred_" + this.ruleIndex + ":" + this.predIndex;
};

function ActionTransition(target, ruleIndex, actionIndex, isCtxDependent) {
	Transition.call(this, target);
    this.serializationType = Transition.ACTION;
    this.ruleIndex = ruleIndex;
    this.actionIndex = actionIndex===undefined ? -1 : actionIndex;
    this.isCtxDependent = isCtxDependent===undefined ? false : isCtxDependent; // e.g., $i ref in pred
    this.isEpsilon = true;
    return this;
}

ActionTransition.prototype = Object.create(Transition.prototype);
ActionTransition.prototype.constructor = ActionTransition;


ActionTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return false;
};

ActionTransition.prototype.toString = function() {
	return "action_" + this.ruleIndex + ":" + this.actionIndex;
};
        

// A transition containing a set of values.
function SetTransition(target, set) {
	Transition.call(this, target);
	this.serializationType = Transition.SET;
    if (set !==undefined && set !==null) {
        this.label = set;
    } else {
        this.label = new IntervalSet();
        this.label.addOne(Token.INVALID_TYPE);
    }
    return this;
}

SetTransition.prototype = Object.create(Transition.prototype);
SetTransition.prototype.constructor = SetTransition;

SetTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return this.label.contains(symbol);
};
        

SetTransition.prototype.toString = function() {
	return this.label.toString();
};

function NotSetTransition(target, set) {
	SetTransition.call(this, target, set);
	this.serializationType = Transition.NOT_SET;
	return this;
}

NotSetTransition.prototype = Object.create(SetTransition.prototype);
NotSetTransition.prototype.constructor = NotSetTransition;

NotSetTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return symbol >= minVocabSymbol && symbol <= maxVocabSymbol &&
			!SetTransition.prototype.matches.call(this, symbol, minVocabSymbol, maxVocabSymbol);
};

NotSetTransition.prototype.toString = function() {
	return '~' + SetTransition.prototype.toString.call(this);
};

function WildcardTransition(target) {
	Transition.call(this, target);
	this.serializationType = Transition.WILDCARD;
	return this;
}

WildcardTransition.prototype = Object.create(Transition.prototype);
WildcardTransition.prototype.constructor = WildcardTransition;


WildcardTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return symbol >= minVocabSymbol && symbol <= maxVocabSymbol;
};

WildcardTransition.prototype.toString = function() {
	return ".";
};

function PrecedencePredicateTransition(target, precedence) {
	AbstractPredicateTransition.call(this, target);
    this.serializationType = Transition.PRECEDENCE;
    this.precedence = precedence;
    this.isEpsilon = true;
    return this;
}

PrecedencePredicateTransition.prototype = Object.create(AbstractPredicateTransition.prototype);
PrecedencePredicateTransition.prototype.constructor = PrecedencePredicateTransition;

PrecedencePredicateTransition.prototype.matches = function(symbol, minVocabSymbol,  maxVocabSymbol) {
	return false;
};

PrecedencePredicateTransition.prototype.getPredicate = function() {
	return new PrecedencePredicate(this.precedence);
};

PrecedencePredicateTransition.prototype.toString = function() {
	return this.precedence + " >= _p";
};
        
exports.Transition = Transition;
exports.AtomTransition = AtomTransition;
exports.SetTransition = SetTransition;
exports.NotSetTransition = NotSetTransition;
exports.RuleTransition = RuleTransition;
exports.ActionTransition = ActionTransition;
exports.EpsilonTransition = EpsilonTransition;
exports.RangeTransition = RangeTransition;
exports.WildcardTransition = WildcardTransition;
exports.PredicateTransition = PredicateTransition;
exports.PrecedencePredicateTransition = PrecedencePredicateTransition;
exports.AbstractPredicateTransition = AbstractPredicateTransition;
},{"./../IntervalSet":14,"./../Token":22,"./SemanticContext":37}],39:[function(require,module,exports){
exports.ATN = require('./ATN').ATN;
exports.ATNDeserializer = require('./ATNDeserializer').ATNDeserializer;
exports.LexerATNSimulator = require('./LexerATNSimulator').LexerATNSimulator;
exports.ParserATNSimulator = require('./ParserATNSimulator').ParserATNSimulator;
exports.PredictionMode = require('./PredictionMode').PredictionMode;
},{"./ATN":24,"./ATNDeserializer":28,"./LexerATNSimulator":32,"./ParserATNSimulator":35,"./PredictionMode":36}],40:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var DFAState = require('./DFAState').DFAState;
var ATNConfigSet = require('./../atn/ATNConfigSet').ATNConfigSet;
var DFASerializer = require('./DFASerializer').DFASerializer;
var LexerDFASerializer = require('./DFASerializer').LexerDFASerializer;

function DFAStatesSet() {
	return this;
}

Object.defineProperty(DFAStatesSet.prototype, "length", {
	get : function() {
		return Object.keys(this).length;
	}
});

function DFA(atnStartState, decision) {
	if (decision === undefined) {
		decision = 0;
	}
	// From which ATN state did we create this DFA?
	this.atnStartState = atnStartState;
	this.decision = decision;
	// A set of all DFA states. Use {@link Map} so we can get old state back
	// ({@link Set} only allows you to see if it's there).
	this._states = new DFAStatesSet();
	this.s0 = null;
	// {@code true} if this DFA is for a precedence decision; otherwise,
	// {@code false}. This is the backing field for {@link //isPrecedenceDfa},
	// {@link //setPrecedenceDfa}.
	this.precedenceDfa = false;
	return this;
}

// Get the start state for a specific precedence value.
//
// @param precedence The current precedence.
// @return The start state corresponding to the specified precedence, or
// {@code null} if no start state exists for the specified precedence.
//
// @throws IllegalStateException if this is not a precedence DFA.
// @see //isPrecedenceDfa()

DFA.prototype.getPrecedenceStartState = function(precedence) {
	if (!(this.precedenceDfa)) {
		throw ("Only precedence DFAs may contain a precedence start state.");
	}
	// s0.edges is never null for a precedence DFA
	if (precedence < 0 || precedence >= this.s0.edges.length) {
		return null;
	}
	return this.s0.edges[precedence] || null;
};

// Set the start state for a specific precedence value.
//
// @param precedence The current precedence.
// @param startState The start state corresponding to the specified
// precedence.
//
// @throws IllegalStateException if this is not a precedence DFA.
// @see //isPrecedenceDfa()
//
DFA.prototype.setPrecedenceStartState = function(precedence, startState) {
	if (!(this.precedenceDfa)) {
		throw ("Only precedence DFAs may contain a precedence start state.");
	}
	if (precedence < 0) {
		return;
	}

	// synchronization on s0 here is ok. when the DFA is turned into a
	// precedence DFA, s0 will be initialized once and not updated again
	// s0.edges is never null for a precedence DFA
	this.s0.edges[precedence] = startState;
};

//
// Sets whether this is a precedence DFA. If the specified value differs
// from the current DFA configuration, the following actions are taken;
// otherwise no changes are made to the current DFA.
//
// <ul>
// <li>The {@link //states} map is cleared</li>
// <li>If {@code precedenceDfa} is {@code false}, the initial state
// {@link //s0} is set to {@code null}; otherwise, it is initialized to a new
// {@link DFAState} with an empty outgoing {@link DFAState//edges} array to
// store the start states for individual precedence values.</li>
// <li>The {@link //precedenceDfa} field is updated</li>
// </ul>
//
// @param precedenceDfa {@code true} if this is a precedence DFA; otherwise,
// {@code false}

DFA.prototype.setPrecedenceDfa = function(precedenceDfa) {
	if (this.precedenceDfa!==precedenceDfa) {
		this._states = new DFAStatesSet();
		if (precedenceDfa) {
			var precedenceState = new DFAState(new ATNConfigSet());
			precedenceState.edges = [];
			precedenceState.isAcceptState = false;
			precedenceState.requiresFullContext = false;
			this.s0 = precedenceState;
		} else {
			this.s0 = null;
		}
		this.precedenceDfa = precedenceDfa;
	}
};

Object.defineProperty(DFA.prototype, "states", {
	get : function() {
		return this._states;
	}
});

// Return a list of all states in this DFA, ordered by state number.
DFA.prototype.sortedStates = function() {
	// states_ is a map of state/state, where key=value
	var keys = Object.keys(this._states);
	var list = [];
	for(var i=0;i<keys.length;i++) {
		list.push(this._states[keys[i]]);
	}
	return list.sort(function(a, b) {
		return a.stateNumber - b.stateNumber;
	});
};

DFA.prototype.toString = function(literalNames, symbolicNames) {
	literalNames = literalNames || null;
	symbolicNames = symbolicNames || null;
	if (this.s0 === null) {
		return "";
	}
	var serializer = new DFASerializer(this, literalNames, symbolicNames);
	return serializer.toString();
};

DFA.prototype.toLexerString = function() {
	if (this.s0 === null) {
		return "";
	}
	var serializer = new LexerDFASerializer(this);
	return serializer.toString();
};

exports.DFA = DFA;

},{"./../atn/ATNConfigSet":26,"./DFASerializer":41,"./DFAState":42}],41:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.

//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:

//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.

//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// A DFA walker that knows how to dump them to serialized strings.#/


function DFASerializer(dfa, literalNames, symbolicNames) {
	this.dfa = dfa;
	this.literalNames = literalNames || [];
	this.symbolicNames = symbolicNames || [];
	return this;
}

DFASerializer.prototype.toString = function() {
   if(this.dfa.s0 === null) {
       return null;
   }
   var buf = "";
   var states = this.dfa.sortedStates();
   for(var i=0;i<states.length;i++) {
       var s = states[i];
       if(s.edges!==null) {
            var n = s.edges.length;
            for(var j=0;j<n;j++) {
                var t = s.edges[j] || null;
                if(t!==null && t.stateNumber !== 0x7FFFFFFF) {
                    buf = buf.concat(this.getStateString(s));
                    buf = buf.concat("-");
                    buf = buf.concat(this.getEdgeLabel(j));
                    buf = buf.concat("->");
                    buf = buf.concat(this.getStateString(t));
                    buf = buf.concat('\n');
                }
            }
       }
   }
   return buf.length===0 ? null : buf;
};

DFASerializer.prototype.getEdgeLabel = function(i) {
    if (i===0) {
        return "EOF";
    } else if(this.literalNames !==null || this.symbolicNames!==null) {
        return this.literalNames[i-1] || this.symbolicNames[i-1];
    } else {
        return String.fromCharCode(i-1);
    }
};

DFASerializer.prototype.getStateString = function(s) {
    var baseStateStr = ( s.isAcceptState ? ":" : "") + "s" + s.stateNumber + ( s.requiresFullContext ? "^" : "");
    if(s.isAcceptState) {
        if (s.predicates !== null) {
            return baseStateStr + "=>" + s.predicates.toString();
        } else {
            return baseStateStr + "=>" + s.prediction.toString();
        }
    } else {
        return baseStateStr;
    }
};

function LexerDFASerializer(dfa) {
	DFASerializer.call(this, dfa, null);
	return this;
}

LexerDFASerializer.prototype = Object.create(DFASerializer.prototype);
LexerDFASerializer.prototype.constructor = LexerDFASerializer;

LexerDFASerializer.prototype.getEdgeLabel = function(i) {
	return "'" + String.fromCharCode(i) + "'";
};

exports.DFASerializer = DFASerializer;
exports.LexerDFASerializer = LexerDFASerializer;


},{}],42:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

var ATNConfigSet = require('./../atn/ATNConfigSet').ATNConfigSet;

// Map a predicate to a predicted alternative.///

function PredPrediction(pred, alt) {
	this.alt = alt;
	this.pred = pred;
	return this;
}

PredPrediction.prototype.toString = function() {
	return "(" + this.pred + ", " + this.alt + ")";
};

// A DFA state represents a set of possible ATN configurations.
// As Aho, Sethi, Ullman p. 117 says "The DFA uses its state
// to keep track of all possible states the ATN can be in after
// reading each input symbol. That is to say, after reading
// input a1a2..an, the DFA is in a state that represents the
// subset T of the states of the ATN that are reachable from the
// ATN's start state along some path labeled a1a2..an."
// In conventional NFA&rarr;DFA conversion, therefore, the subset T
// would be a bitset representing the set of states the
// ATN could be in. We need to track the alt predicted by each
// state as well, however. More importantly, we need to maintain
// a stack of states, tracking the closure operations as they
// jump from rule to rule, emulating rule invocations (method calls).
// I have to add a stack to simulate the proper lookahead sequences for
// the underlying LL grammar from which the ATN was derived.
//
// <p>I use a set of ATNConfig objects not simple states. An ATNConfig
// is both a state (ala normal conversion) and a RuleContext describing
// the chain of rules (if any) followed to arrive at that state.</p>
//
// <p>A DFA state may have multiple references to a particular state,
// but with different ATN contexts (with same or different alts)
// meaning that state was reached via a different set of rule invocations.</p>
// /

function DFAState(stateNumber, configs) {
	if (stateNumber === null) {
		stateNumber = -1;
	}
	if (configs === null) {
		configs = new ATNConfigSet();
	}
	this.stateNumber = stateNumber;
	this.configs = configs;
	// {@code edges[symbol]} points to target of symbol. Shift up by 1 so (-1)
	// {@link Token//EOF} maps to {@code edges[0]}.
	this.edges = null;
	this.isAcceptState = false;
	// if accept state, what ttype do we match or alt do we predict?
	// This is set to {@link ATN//INVALID_ALT_NUMBER} when {@link
	// //predicates}{@code !=null} or
	// {@link //requiresFullContext}.
	this.prediction = 0;
	this.lexerActionExecutor = null;
	// Indicates that this state was created during SLL prediction that
	// discovered a conflict between the configurations in the state. Future
	// {@link ParserATNSimulator//execATN} invocations immediately jumped doing
	// full context prediction if this field is true.
	this.requiresFullContext = false;
	// During SLL parsing, this is a list of predicates associated with the
	// ATN configurations of the DFA state. When we have predicates,
	// {@link //requiresFullContext} is {@code false} since full context
	// prediction evaluates predicates
	// on-the-fly. If this is not null, then {@link //prediction} is
	// {@link ATN//INVALID_ALT_NUMBER}.
	//
	// <p>We only use these for non-{@link //requiresFullContext} but
	// conflicting states. That
	// means we know from the context (it's $ or we don't dip into outer
	// context) that it's an ambiguity not a conflict.</p>
	//
	// <p>This list is computed by {@link
	// ParserATNSimulator//predicateDFAState}.</p>
	this.predicates = null;
	return this;
}

// Get the set of all alts mentioned by all ATN configurations in this
// DFA state.
DFAState.prototype.getAltSet = function() {
	var alts = new Set();
	if (this.configs !== null) {
		for (var i = 0; i < this.configs.length; i++) {
			var c = this.configs[i];
			alts.add(c.alt);
		}
	}
	if (alts.length === 0) {
		return null;
	} else {
		return alts;
	}
};

// Two {@link DFAState} instances are equal if their ATN configuration sets
// are the same. This method is used to see if a state already exists.
//
// <p>Because the number of alternatives and number of ATN configurations are
// finite, there is a finite number of DFA states that can be processed.
// This is necessary to show that the algorithm terminates.</p>
//
// <p>Cannot test the DFA state numbers here because in
// {@link ParserATNSimulator//addDFAState} we need to know if any other state
// exists that has this exact set of ATN configurations. The
// {@link //stateNumber} is irrelevant.</p>
DFAState.prototype.equals = function(other) {
	// compare set of ATN configurations in this set with other
	if (this === other) {
		return true;
	} else if (!(other instanceof DFAState)) {
		return false;
	} else {
		return this.configs.equals(other.configs);
	}
};

DFAState.prototype.toString = function() {
	return "" + this.stateNumber + ":" + this.hashString();
};

DFAState.prototype.hashString = function() {
	return "" +  this.configs +
			(this.isAcceptState ?
					"=>" + (this.predicates !== null ?
								this.predicates :
								this.prediction) :
					"");
};

exports.DFAState = DFAState;
exports.PredPrediction = PredPrediction;
},{"./../atn/ATNConfigSet":26}],43:[function(require,module,exports){
exports.DFA = require('./DFA').DFA;
exports.DFASerializer = require('./DFASerializer').DFASerializer;
exports.LexerDFASerializer = require('./DFASerializer').LexerDFASerializer;
exports.PredPrediction = require('./DFAState').PredPrediction;

},{"./DFA":40,"./DFASerializer":41,"./DFAState":42}],44:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

//
// This implementation of {@link ANTLRErrorListener} can be used to identify
// certain potential correctness and performance problems in grammars. "Reports"
// are made by calling {@link Parser//notifyErrorListeners} with the appropriate
// message.
//
// <ul>
// <li><b>Ambiguities</b>: These are cases where more than one path through the
// grammar can match the input.</li>
// <li><b>Weak context sensitivity</b>: These are cases where full-context
// prediction resolved an SLL conflict to a unique alternative which equaled the
// minimum alternative of the SLL conflict.</li>
// <li><b>Strong (forced) context sensitivity</b>: These are cases where the
// full-context prediction resolved an SLL conflict to a unique alternative,
// <em>and</em> the minimum alternative of the SLL conflict was found to not be
// a truly viable alternative. Two-stage parsing cannot be used for inputs where
// this situation occurs.</li>
// </ul>

var BitSet = require('./../Utils').BitSet;
var ErrorListener = require('./ErrorListener').ErrorListener;
var Interval = require('./../IntervalSet').Interval;

function DiagnosticErrorListener(exactOnly) {
	ErrorListener.call(this);
	exactOnly = exactOnly || true;
	// whether all ambiguities or only exact ambiguities are reported.
	this.exactOnly = exactOnly;
	return this;
}

DiagnosticErrorListener.prototype = Object.create(ErrorListener.prototype);
DiagnosticErrorListener.prototype.constructor = DiagnosticErrorListener;

DiagnosticErrorListener.prototype.reportAmbiguity = function(recognizer, dfa,
		startIndex, stopIndex, exact, ambigAlts, configs) {
	if (this.exactOnly && !exact) {
		return;
	}
	var msg = "reportAmbiguity d=" +
			this.getDecisionDescription(recognizer, dfa) +
			": ambigAlts=" +
			this.getConflictingAlts(ambigAlts, configs) +
			", input='" +
			recognizer.getTokenStream().getText(new Interval(startIndex, stopIndex)) + "'";
	recognizer.notifyErrorListeners(msg);
};

DiagnosticErrorListener.prototype.reportAttemptingFullContext = function(
		recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
	var msg = "reportAttemptingFullContext d=" +
			this.getDecisionDescription(recognizer, dfa) +
			", input='" +
			recognizer.getTokenStream().getText(new Interval(startIndex, stopIndex)) + "'";
	recognizer.notifyErrorListeners(msg);
};

DiagnosticErrorListener.prototype.reportContextSensitivity = function(
		recognizer, dfa, startIndex, stopIndex, prediction, configs) {
	var msg = "reportContextSensitivity d=" +
			this.getDecisionDescription(recognizer, dfa) +
			", input='" +
			recognizer.getTokenStream().getText(new Interval(startIndex, stopIndex)) + "'";
	recognizer.notifyErrorListeners(msg);
};

DiagnosticErrorListener.prototype.getDecisionDescription = function(recognizer, dfa) {
	var decision = dfa.decision;
	var ruleIndex = dfa.atnStartState.ruleIndex;

	var ruleNames = recognizer.ruleNames;
	if (ruleIndex < 0 || ruleIndex >= ruleNames.length) {
		return "" + decision;
	}
	var ruleName = ruleNames[ruleIndex] || null;
	if (ruleName === null || ruleName.length === 0) {
		return "" + decision;
	}
	return "" + decision + " (" + ruleName + ")";
};

//
// Computes the set of conflicting or ambiguous alternatives from a
// configuration set, if that information was not already provided by the
// parser.
//
// @param reportedAlts The set of conflicting or ambiguous alternatives, as
// reported by the parser.
// @param configs The conflicting or ambiguous configuration set.
// @return Returns {@code reportedAlts} if it is not {@code null}, otherwise
// returns the set of alternatives represented in {@code configs}.
//
DiagnosticErrorListener.prototype.getConflictingAlts = function(reportedAlts, configs) {
	if (reportedAlts !== null) {
		return reportedAlts;
	}
	var result = new BitSet();
	for (var i = 0; i < configs.items.length; i++) {
		result.add(configs.items[i].alt);
	}
	return "{" + result.values().join(", ") + "}";
};

exports.DiagnosticErrorListener = DiagnosticErrorListener;
},{"./../IntervalSet":14,"./../Utils":23,"./ErrorListener":45}],45:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Provides an empty default implementation of {@link ANTLRErrorListener}. The
// default implementation of each method does nothing, but can be overridden as
// necessary.

function ErrorListener() {
	return this;
}

ErrorListener.prototype.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
};

ErrorListener.prototype.reportAmbiguity = function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
};

ErrorListener.prototype.reportAttemptingFullContext = function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
};

ErrorListener.prototype.reportContextSensitivity = function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
};

function ConsoleErrorListener() {
	ErrorListener.call(this);
	return this;
}

ConsoleErrorListener.prototype = Object.create(ErrorListener.prototype);
ConsoleErrorListener.prototype.constructor = ConsoleErrorListener;

//
// Provides a default instance of {@link ConsoleErrorListener}.
//
ConsoleErrorListener.INSTANCE = new ConsoleErrorListener();

//
// {@inheritDoc}
//
// <p>
// This implementation prints messages to {@link System//err} containing the
// values of {@code line}, {@code charPositionInLine}, and {@code msg} using
// the following format.</p>
//
// <pre>
// line <em>line</em>:<em>charPositionInLine</em> <em>msg</em>
// </pre>
//
ConsoleErrorListener.prototype.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
    console.error("line " + line + ":" + column + " " + msg);
};

function ProxyErrorListener(delegates) {
	ErrorListener.call(this);
    if (delegates===null) {
        throw "delegates";
    }
    this.delegates = delegates;
	return this;
}

ProxyErrorListener.prototype = Object.create(ErrorListener.prototype);
ProxyErrorListener.prototype.constructor = ProxyErrorListener;

ProxyErrorListener.prototype.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
    this.delegates.map(function(d) { d.syntaxError(recognizer, offendingSymbol, line, column, msg, e); });
};

ProxyErrorListener.prototype.reportAmbiguity = function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
    this.delegates.map(function(d) { d.reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs); });
};

ProxyErrorListener.prototype.reportAttemptingFullContext = function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
	this.delegates.map(function(d) { d.reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs); });
};

ProxyErrorListener.prototype.reportContextSensitivity = function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
	this.delegates.map(function(d) { d.reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, configs); });
};

exports.ErrorListener = ErrorListener;
exports.ConsoleErrorListener = ConsoleErrorListener;
exports.ProxyErrorListener = ProxyErrorListener;


},{}],46:[function(require,module,exports){
//
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

var Token = require('./../Token').Token;
var Errors = require('./Errors');
var NoViableAltException = Errors.NoViableAltException;
var InputMismatchException = Errors.InputMismatchException;
var FailedPredicateException = Errors.FailedPredicateException;
var ParseCancellationException = Errors.ParseCancellationException;
var ATNState = require('./../atn/ATNState').ATNState;
var Interval = require('./../IntervalSet').Interval;
var IntervalSet = require('./../IntervalSet').IntervalSet;

function ErrorStrategy() {
	
}

ErrorStrategy.prototype.reset = function(recognizer){
};

ErrorStrategy.prototype.recoverInline = function(recognizer){
};

ErrorStrategy.prototype.recover = function(recognizer, e){
};

ErrorStrategy.prototype.sync = function(recognizer){
};

ErrorStrategy.prototype.inErrorRecoveryMode = function(recognizer){
};

ErrorStrategy.prototype.reportError = function(recognizer){
};



// This is the default implementation of {@link ANTLRErrorStrategy} used for
// error reporting and recovery in ANTLR parsers.
//
function DefaultErrorStrategy() {
	ErrorStrategy.call(this);
    // Indicates whether the error strategy is currently "recovering from an
    // error". This is used to suppress reporting multiple error messages while
    // attempting to recover from a detected syntax error.
    //
    // @see //inErrorRecoveryMode
    //
    this.errorRecoveryMode = false;

    // The index into the input stream where the last error occurred.
    // This is used to prevent infinite loops where an error is found
    // but no token is consumed during recovery...another error is found,
    // ad nauseum. This is a failsafe mechanism to guarantee that at least
    // one token/tree node is consumed for two errors.
    //
    this.lastErrorIndex = -1;
    this.lastErrorStates = null;
    return this;
}

DefaultErrorStrategy.prototype = Object.create(ErrorStrategy.prototype);
DefaultErrorStrategy.prototype.constructor = DefaultErrorStrategy;

// <p>The default implementation simply calls {@link //endErrorCondition} to
// ensure that the handler is not in error recovery mode.</p>
DefaultErrorStrategy.prototype.reset = function(recognizer) {
    this.endErrorCondition(recognizer);
};

//
// This method is called to enter error recovery mode when a recognition
// exception is reported.
//
// @param recognizer the parser instance
//
DefaultErrorStrategy.prototype.beginErrorCondition = function(recognizer) {
    this.errorRecoveryMode = true;
};

DefaultErrorStrategy.prototype.inErrorRecoveryMode = function(recognizer) {
    return this.errorRecoveryMode;
};

//
// This method is called to leave error recovery mode after recovering from
// a recognition exception.
//
// @param recognizer
//
DefaultErrorStrategy.prototype.endErrorCondition = function(recognizer) {
    this.errorRecoveryMode = false;
    this.lastErrorStates = null;
    this.lastErrorIndex = -1;
};

//
// {@inheritDoc}
//
// <p>The default implementation simply calls {@link //endErrorCondition}.</p>
//
DefaultErrorStrategy.prototype.reportMatch = function(recognizer) {
    this.endErrorCondition(recognizer);
};

//
// {@inheritDoc}
//
// <p>The default implementation returns immediately if the handler is already
// in error recovery mode. Otherwise, it calls {@link //beginErrorCondition}
// and dispatches the reporting task based on the runtime type of {@code e}
// according to the following table.</p>
//
// <ul>
// <li>{@link NoViableAltException}: Dispatches the call to
// {@link //reportNoViableAlternative}</li>
// <li>{@link InputMismatchException}: Dispatches the call to
// {@link //reportInputMismatch}</li>
// <li>{@link FailedPredicateException}: Dispatches the call to
// {@link //reportFailedPredicate}</li>
// <li>All other types: calls {@link Parser//notifyErrorListeners} to report
// the exception</li>
// </ul>
//
DefaultErrorStrategy.prototype.reportError = function(recognizer, e) {
   // if we've already reported an error and have not matched a token
   // yet successfully, don't report any errors.
    if(this.inErrorRecoveryMode(recognizer)) {
        return; // don't report spurious errors
    }
    this.beginErrorCondition(recognizer);
    if ( e instanceof NoViableAltException ) {
        this.reportNoViableAlternative(recognizer, e);
    } else if ( e instanceof InputMismatchException ) {
        this.reportInputMismatch(recognizer, e);
    } else if ( e instanceof FailedPredicateException ) {
        this.reportFailedPredicate(recognizer, e);
    } else {
        console.log("unknown recognition error type: " + e.constructor.name);
        console.log(e.stack);
        recognizer.notifyErrorListeners(e.getOffendingToken(), e.getMessage(), e);
    }
};
//
// {@inheritDoc}
//
// <p>The default implementation resynchronizes the parser by consuming tokens
// until we find one in the resynchronization set--loosely the set of tokens
// that can follow the current rule.</p>
//
DefaultErrorStrategy.prototype.recover = function(recognizer, e) {
    if (this.lastErrorIndex===recognizer.getInputStream().index &&
        this.lastErrorStates !== null && this.lastErrorStates.indexOf(recognizer.state)>=0) {
		// uh oh, another error at same token index and previously-visited
		// state in ATN; must be a case where LT(1) is in the recovery
		// token set so nothing got consumed. Consume a single token
		// at least to prevent an infinite loop; this is a failsafe.
		recognizer.consume();
    }
    this.lastErrorIndex = recognizer._input.index;
    if (this.lastErrorStates === null) {
        this.lastErrorStates = [];
    }
    this.lastErrorStates.push(recognizer.state);
    var followSet = this.getErrorRecoverySet(recognizer);
    this.consumeUntil(recognizer, followSet);
};

// The default implementation of {@link ANTLRErrorStrategy//sync} makes sure
// that the current lookahead symbol is consistent with what were expecting
// at this point in the ATN. You can call this anytime but ANTLR only
// generates code to check before subrules/loops and each iteration.
//
// <p>Implements Jim Idle's magic sync mechanism in closures and optional
// subrules. E.g.,</p>
//
// <pre>
// a : sync ( stuff sync )* ;
// sync : {consume to what can follow sync} ;
// </pre>
//
// At the start of a sub rule upon error, {@link //sync} performs single
// token deletion, if possible. If it can't do that, it bails on the current
// rule and uses the default error recovery, which consumes until the
// resynchronization set of the current rule.
//
// <p>If the sub rule is optional ({@code (...)?}, {@code (...)*}, or block
// with an empty alternative), then the expected set includes what follows
// the subrule.</p>
//
// <p>During loop iteration, it consumes until it sees a token that can start a
// sub rule or what follows loop. Yes, that is pretty aggressive. We opt to
// stay in the loop as long as possible.</p>
//
// <p><strong>ORIGINS</strong></p>
//
// <p>Previous versions of ANTLR did a poor job of their recovery within loops.
// A single mismatch token or missing token would force the parser to bail
// out of the entire rules surrounding the loop. So, for rule</p>
//
// <pre>
// classDef : 'class' ID '{' member* '}'
// </pre>
//
// input with an extra token between members would force the parser to
// consume until it found the next class definition rather than the next
// member definition of the current class.
//
// <p>This functionality cost a little bit of effort because the parser has to
// compare token set at the start of the loop and at each iteration. If for
// some reason speed is suffering for you, you can turn off this
// functionality by simply overriding this method as a blank { }.</p>
//
DefaultErrorStrategy.prototype.sync = function(recognizer) {
    // If already recovering, don't try to sync
    if (this.inErrorRecoveryMode(recognizer)) {
        return;
    }
    var s = recognizer._interp.atn.states[recognizer.state];
    var la = recognizer.getTokenStream().LA(1);
    // try cheaper subset first; might get lucky. seems to shave a wee bit off
    if (la===Token.EOF || recognizer.atn.nextTokens(s).contains(la)) {
        return;
    }
    // Return but don't end recovery. only do that upon valid token match
    if(recognizer.isExpectedToken(la)) {
        return;
    }
    switch (s.stateType) {
    case ATNState.BLOCK_START:
    case ATNState.STAR_BLOCK_START:
    case ATNState.PLUS_BLOCK_START:
    case ATNState.STAR_LOOP_ENTRY:
       // report error and recover if possible
        if( this.singleTokenDeletion(recognizer) !== null) {
            return;
        } else {
            throw new InputMismatchException(recognizer);
        }
        break;
    case ATNState.PLUS_LOOP_BACK:
    case ATNState.STAR_LOOP_BACK:
        this.reportUnwantedToken(recognizer);
        var expecting = recognizer.getExpectedTokens();
        var whatFollowsLoopIterationOrRule = expecting.addSet(this.getErrorRecoverySet(recognizer));
        this.consumeUntil(recognizer, whatFollowsLoopIterationOrRule);
        break;
    default:
        // do nothing if we can't identify the exact kind of ATN state
    }
};

// This is called by {@link //reportError} when the exception is a
// {@link NoViableAltException}.
//
// @see //reportError
//
// @param recognizer the parser instance
// @param e the recognition exception
//
DefaultErrorStrategy.prototype.reportNoViableAlternative = function(recognizer, e) {
    var tokens = recognizer.getTokenStream();
    var input;
    if(tokens !== null) {
        if (e.startToken.type===Token.EOF) {
            input = "<EOF>";
        } else {
            input = tokens.getText(new Interval(e.startToken, e.offendingToken));
        }
    } else {
        input = "<unknown input>";
    }
    var msg = "no viable alternative at input " + this.escapeWSAndQuote(input);
    recognizer.notifyErrorListeners(msg, e.offendingToken, e);
};

//
// This is called by {@link //reportError} when the exception is an
// {@link InputMismatchException}.
//
// @see //reportError
//
// @param recognizer the parser instance
// @param e the recognition exception
//
DefaultErrorStrategy.prototype.reportInputMismatch = function(recognizer, e) {
    var msg = "mismatched input " + this.getTokenErrorDisplay(e.offendingToken) +
          " expecting " + e.getExpectedTokens().toString(recognizer.literalNames, recognizer.symbolicNames);
    recognizer.notifyErrorListeners(msg, e.offendingToken, e);
};

//
// This is called by {@link //reportError} when the exception is a
// {@link FailedPredicateException}.
//
// @see //reportError
//
// @param recognizer the parser instance
// @param e the recognition exception
//
DefaultErrorStrategy.prototype.reportFailedPredicate = function(recognizer, e) {
    var ruleName = recognizer.ruleNames[recognizer._ctx.ruleIndex];
    var msg = "rule " + ruleName + " " + e.message;
    recognizer.notifyErrorListeners(msg, e.offendingToken, e);
};

// This method is called to report a syntax error which requires the removal
// of a token from the input stream. At the time this method is called, the
// erroneous symbol is current {@code LT(1)} symbol and has not yet been
// removed from the input stream. When this method returns,
// {@code recognizer} is in error recovery mode.
//
// <p>This method is called when {@link //singleTokenDeletion} identifies
// single-token deletion as a viable recovery strategy for a mismatched
// input error.</p>
//
// <p>The default implementation simply returns if the handler is already in
// error recovery mode. Otherwise, it calls {@link //beginErrorCondition} to
// enter error recovery mode, followed by calling
// {@link Parser//notifyErrorListeners}.</p>
//
// @param recognizer the parser instance
//
DefaultErrorStrategy.prototype.reportUnwantedToken = function(recognizer) {
    if (this.inErrorRecoveryMode(recognizer)) {
        return;
    }
    this.beginErrorCondition(recognizer);
    var t = recognizer.getCurrentToken();
    var tokenName = this.getTokenErrorDisplay(t);
    var expecting = this.getExpectedTokens(recognizer);
    var msg = "extraneous input " + tokenName + " expecting " +
        expecting.toString(recognizer.literalNames, recognizer.symbolicNames);
    recognizer.notifyErrorListeners(msg, t, null);
};
// This method is called to report a syntax error which requires the
// insertion of a missing token into the input stream. At the time this
// method is called, the missing token has not yet been inserted. When this
// method returns, {@code recognizer} is in error recovery mode.
//
// <p>This method is called when {@link //singleTokenInsertion} identifies
// single-token insertion as a viable recovery strategy for a mismatched
// input error.</p>
//
// <p>The default implementation simply returns if the handler is already in
// error recovery mode. Otherwise, it calls {@link //beginErrorCondition} to
// enter error recovery mode, followed by calling
// {@link Parser//notifyErrorListeners}.</p>
//
// @param recognizer the parser instance
//
DefaultErrorStrategy.prototype.reportMissingToken = function(recognizer) {
    if ( this.inErrorRecoveryMode(recognizer)) {
        return;
    }
    this.beginErrorCondition(recognizer);
    var t = recognizer.getCurrentToken();
    var expecting = this.getExpectedTokens(recognizer);
    var msg = "missing " + expecting.toString(recognizer.literalNames, recognizer.symbolicNames) +
          " at " + this.getTokenErrorDisplay(t);
    recognizer.notifyErrorListeners(msg, t, null);
};

// <p>The default implementation attempts to recover from the mismatched input
// by using single token insertion and deletion as described below. If the
// recovery attempt fails, this method throws an
// {@link InputMismatchException}.</p>
//
// <p><strong>EXTRA TOKEN</strong> (single token deletion)</p>
//
// <p>{@code LA(1)} is not what we are looking for. If {@code LA(2)} has the
// right token, however, then assume {@code LA(1)} is some extra spurious
// token and delete it. Then consume and return the next token (which was
// the {@code LA(2)} token) as the successful result of the match operation.</p>
//
// <p>This recovery strategy is implemented by {@link
// //singleTokenDeletion}.</p>
//
// <p><strong>MISSING TOKEN</strong> (single token insertion)</p>
//
// <p>If current token (at {@code LA(1)}) is consistent with what could come
// after the expected {@code LA(1)} token, then assume the token is missing
// and use the parser's {@link TokenFactory} to create it on the fly. The
// "insertion" is performed by returning the created token as the successful
// result of the match operation.</p>
//
// <p>This recovery strategy is implemented by {@link
// //singleTokenInsertion}.</p>
//
// <p><strong>EXAMPLE</strong></p>
//
// <p>For example, Input {@code i=(3;} is clearly missing the {@code ')'}. When
// the parser returns from the nested call to {@code expr}, it will have
// call chain:</p>
//
// <pre>
// stat &rarr; expr &rarr; atom
// </pre>
//
// and it will be trying to match the {@code ')'} at this point in the
// derivation:
//
// <pre>
// =&gt; ID '=' '(' INT ')' ('+' atom)* ';'
// ^
// </pre>
//
// The attempt to match {@code ')'} will fail when it sees {@code ';'} and
// call {@link //recoverInline}. To recover, it sees that {@code LA(1)==';'}
// is in the set of tokens that can follow the {@code ')'} token reference
// in rule {@code atom}. It can assume that you forgot the {@code ')'}.
//
DefaultErrorStrategy.prototype.recoverInline = function(recognizer) {
    // SINGLE TOKEN DELETION
    var matchedSymbol = this.singleTokenDeletion(recognizer);
    if (matchedSymbol !== null) {
        // we have deleted the extra token.
        // now, move past ttype token as if all were ok
        recognizer.consume();
        return matchedSymbol;
    }
    // SINGLE TOKEN INSERTION
    if (this.singleTokenInsertion(recognizer)) {
        return this.getMissingSymbol(recognizer);
    }
    // even that didn't work; must throw the exception
    throw new InputMismatchException(recognizer);
};

//
// This method implements the single-token insertion inline error recovery
// strategy. It is called by {@link //recoverInline} if the single-token
// deletion strategy fails to recover from the mismatched input. If this
// method returns {@code true}, {@code recognizer} will be in error recovery
// mode.
//
// <p>This method determines whether or not single-token insertion is viable by
// checking if the {@code LA(1)} input symbol could be successfully matched
// if it were instead the {@code LA(2)} symbol. If this method returns
// {@code true}, the caller is responsible for creating and inserting a
// token with the correct type to produce this behavior.</p>
//
// @param recognizer the parser instance
// @return {@code true} if single-token insertion is a viable recovery
// strategy for the current mismatched input, otherwise {@code false}
//
DefaultErrorStrategy.prototype.singleTokenInsertion = function(recognizer) {
    var currentSymbolType = recognizer.getTokenStream().LA(1);
    // if current token is consistent with what could come after current
    // ATN state, then we know we're missing a token; error recovery
    // is free to conjure up and insert the missing token
    var atn = recognizer._interp.atn;
    var currentState = atn.states[recognizer.state];
    var next = currentState.transitions[0].target;
    var expectingAtLL2 = atn.nextTokens(next, recognizer._ctx);
    if (expectingAtLL2.contains(currentSymbolType) ){
        this.reportMissingToken(recognizer);
        return true;
    } else {
        return false;
    }
};

// This method implements the single-token deletion inline error recovery
// strategy. It is called by {@link //recoverInline} to attempt to recover
// from mismatched input. If this method returns null, the parser and error
// handler state will not have changed. If this method returns non-null,
// {@code recognizer} will <em>not</em> be in error recovery mode since the
// returned token was a successful match.
//
// <p>If the single-token deletion is successful, this method calls
// {@link //reportUnwantedToken} to report the error, followed by
// {@link Parser//consume} to actually "delete" the extraneous token. Then,
// before returning {@link //reportMatch} is called to signal a successful
// match.</p>
//
// @param recognizer the parser instance
// @return the successfully matched {@link Token} instance if single-token
// deletion successfully recovers from the mismatched input, otherwise
// {@code null}
//
DefaultErrorStrategy.prototype.singleTokenDeletion = function(recognizer) {
    var nextTokenType = recognizer.getTokenStream().LA(2);
    var expecting = this.getExpectedTokens(recognizer);
    if (expecting.contains(nextTokenType)) {
        this.reportUnwantedToken(recognizer);
        // print("recoverFromMismatchedToken deleting " \
        // + str(recognizer.getTokenStream().LT(1)) \
        // + " since " + str(recognizer.getTokenStream().LT(2)) \
        // + " is what we want", file=sys.stderr)
        recognizer.consume(); // simply delete extra token
        // we want to return the token we're actually matching
        var matchedSymbol = recognizer.getCurrentToken();
        this.reportMatch(recognizer); // we know current token is correct
        return matchedSymbol;
    } else {
        return null;
    }
};

// Conjure up a missing token during error recovery.
//
// The recognizer attempts to recover from single missing
// symbols. But, actions might refer to that missing symbol.
// For example, x=ID {f($x);}. The action clearly assumes
// that there has been an identifier matched previously and that
// $x points at that token. If that token is missing, but
// the next token in the stream is what we want we assume that
// this token is missing and we keep going. Because we
// have to return some token to replace the missing token,
// we have to conjure one up. This method gives the user control
// over the tokens returned for missing tokens. Mostly,
// you will want to create something special for identifier
// tokens. For literals such as '{' and ',', the default
// action in the parser or tree parser works. It simply creates
// a CommonToken of the appropriate type. The text will be the token.
// If you change what tokens must be created by the lexer,
// override this method to create the appropriate tokens.
//
DefaultErrorStrategy.prototype.getMissingSymbol = function(recognizer) {
    var currentSymbol = recognizer.getCurrentToken();
    var expecting = this.getExpectedTokens(recognizer);
    var expectedTokenType = expecting.first(); // get any element
    var tokenText;
    if (expectedTokenType===Token.EOF) {
        tokenText = "<missing EOF>";
    } else {
        tokenText = "<missing " + recognizer.literalNames[expectedTokenType] + ">";
    }
    var current = currentSymbol;
    var lookback = recognizer.getTokenStream().LT(-1);
    if (current.type===Token.EOF && lookback !== null) {
        current = lookback;
    }
    return recognizer.getTokenFactory().create(current.source,
        expectedTokenType, tokenText, Token.DEFAULT_CHANNEL,
        -1, -1, current.line, current.column);
};

DefaultErrorStrategy.prototype.getExpectedTokens = function(recognizer) {
    return recognizer.getExpectedTokens();
};

// How should a token be displayed in an error message? The default
// is to display just the text, but during development you might
// want to have a lot of information spit out. Override in that case
// to use t.toString() (which, for CommonToken, dumps everything about
// the token). This is better than forcing you to override a method in
// your token objects because you don't have to go modify your lexer
// so that it creates a new Java type.
//
DefaultErrorStrategy.prototype.getTokenErrorDisplay = function(t) {
    if (t === null) {
        return "<no token>";
    }
    var s = t.text;
    if (s === null) {
        if (t.type===Token.EOF) {
            s = "<EOF>";
        } else {
            s = "<" + t.type + ">";
        }
    }
    return this.escapeWSAndQuote(s);
};

DefaultErrorStrategy.prototype.escapeWSAndQuote = function(s) {
    s = s.replace(/\n/g,"\\n");
    s = s.replace(/\r/g,"\\r");
    s = s.replace(/\t/g,"\\t");
    return "'" + s + "'";
};

// Compute the error recovery set for the current rule. During
// rule invocation, the parser pushes the set of tokens that can
// follow that rule reference on the stack; this amounts to
// computing FIRST of what follows the rule reference in the
// enclosing rule. See LinearApproximator.FIRST().
// This local follow set only includes tokens
// from within the rule; i.e., the FIRST computation done by
// ANTLR stops at the end of a rule.
//
// EXAMPLE
//
// When you find a "no viable alt exception", the input is not
// consistent with any of the alternatives for rule r. The best
// thing to do is to consume tokens until you see something that
// can legally follow a call to r//or* any rule that called r.
// You don't want the exact set of viable next tokens because the
// input might just be missing a token--you might consume the
// rest of the input looking for one of the missing tokens.
//
// Consider grammar:
//
// a : '[' b ']'
// | '(' b ')'
// ;
// b : c '^' INT ;
// c : ID
// | INT
// ;
//
// At each rule invocation, the set of tokens that could follow
// that rule is pushed on a stack. Here are the various
// context-sensitive follow sets:
//
// FOLLOW(b1_in_a) = FIRST(']') = ']'
// FOLLOW(b2_in_a) = FIRST(')') = ')'
// FOLLOW(c_in_b) = FIRST('^') = '^'
//
// Upon erroneous input "[]", the call chain is
//
// a -> b -> c
//
// and, hence, the follow context stack is:
//
// depth follow set start of rule execution
// 0 <EOF> a (from main())
// 1 ']' b
// 2 '^' c
//
// Notice that ')' is not included, because b would have to have
// been called from a different context in rule a for ')' to be
// included.
//
// For error recovery, we cannot consider FOLLOW(c)
// (context-sensitive or otherwise). We need the combined set of
// all context-sensitive FOLLOW sets--the set of all tokens that
// could follow any reference in the call chain. We need to
// resync to one of those tokens. Note that FOLLOW(c)='^' and if
// we resync'd to that token, we'd consume until EOF. We need to
// sync to context-sensitive FOLLOWs for a, b, and c: {']','^'}.
// In this case, for input "[]", LA(1) is ']' and in the set, so we would
// not consume anything. After printing an error, rule c would
// return normally. Rule b would not find the required '^' though.
// At this point, it gets a mismatched token error and throws an
// exception (since LA(1) is not in the viable following token
// set). The rule exception handler tries to recover, but finds
// the same recovery set and doesn't consume anything. Rule b
// exits normally returning to rule a. Now it finds the ']' (and
// with the successful match exits errorRecovery mode).
//
// So, you can see that the parser walks up the call chain looking
// for the token that was a member of the recovery set.
//
// Errors are not generated in errorRecovery mode.
//
// ANTLR's error recovery mechanism is based upon original ideas:
//
// "Algorithms + Data Structures = Programs" by Niklaus Wirth
//
// and
//
// "A note on error recovery in recursive descent parsers":
// http://portal.acm.org/citation.cfm?id=947902.947905
//
// Later, Josef Grosch had some good ideas:
//
// "Efficient and Comfortable Error Recovery in Recursive Descent
// Parsers":
// ftp://www.cocolab.com/products/cocktail/doca4.ps/ell.ps.zip
//
// Like Grosch I implement context-sensitive FOLLOW sets that are combined
// at run-time upon error to avoid overhead during parsing.
//
DefaultErrorStrategy.prototype.getErrorRecoverySet = function(recognizer) {
    var atn = recognizer._interp.atn;
    var ctx = recognizer._ctx;
    var recoverSet = new IntervalSet();
    while (ctx !== null && ctx.invokingState>=0) {
        // compute what follows who invoked us
        var invokingState = atn.states[ctx.invokingState];
        var rt = invokingState.transitions[0];
        var follow = atn.nextTokens(rt.followState);
        recoverSet.addSet(follow);
        ctx = ctx.parentCtx;
    }
    recoverSet.removeOne(Token.EPSILON);
    return recoverSet;
};

// Consume tokens until one matches the given token set.//
DefaultErrorStrategy.prototype.consumeUntil = function(recognizer, set) {
    var ttype = recognizer.getTokenStream().LA(1);
    while( ttype !== Token.EOF && !set.contains(ttype)) {
        recognizer.consume();
        ttype = recognizer.getTokenStream().LA(1);
    }
};

//
// This implementation of {@link ANTLRErrorStrategy} responds to syntax errors
// by immediately canceling the parse operation with a
// {@link ParseCancellationException}. The implementation ensures that the
// {@link ParserRuleContext//exception} field is set for all parse tree nodes
// that were not completed prior to encountering the error.
//
// <p>
// This error strategy is useful in the following scenarios.</p>
//
// <ul>
// <li><strong>Two-stage parsing:</strong> This error strategy allows the first
// stage of two-stage parsing to immediately terminate if an error is
// encountered, and immediately fall back to the second stage. In addition to
// avoiding wasted work by attempting to recover from errors here, the empty
// implementation of {@link BailErrorStrategy//sync} improves the performance of
// the first stage.</li>
// <li><strong>Silent validation:</strong> When syntax errors are not being
// reported or logged, and the parse result is simply ignored if errors occur,
// the {@link BailErrorStrategy} avoids wasting work on recovering from errors
// when the result will be ignored either way.</li>
// </ul>
//
// <p>
// {@code myparser.setErrorHandler(new BailErrorStrategy());}</p>
//
// @see Parser//setErrorHandler(ANTLRErrorStrategy)
//
function BailErrorStrategy() {
	DefaultErrorStrategy.call(this);
	return this;
}

BailErrorStrategy.prototype = Object.create(DefaultErrorStrategy.prototype);
BailErrorStrategy.prototype.constructor = BailErrorStrategy;

// Instead of recovering from exception {@code e}, re-throw it wrapped
// in a {@link ParseCancellationException} so it is not caught by the
// rule function catches. Use {@link Exception//getCause()} to get the
// original {@link RecognitionException}.
//
BailErrorStrategy.prototype.recover = function(recognizer, e) {
    var context = recognizer._ctx;
    while (context !== null) {
        context.exception = e;
        context = context.parentCtx;
    }
    throw new ParseCancellationException(e);
};
    
// Make sure we don't attempt to recover inline; if the parser
// successfully recovers, it won't throw an exception.
//
BailErrorStrategy.prototype.recoverInline = function(recognizer) {
    this.recover(recognizer, new InputMismatchException(recognizer));
};

// Make sure we don't attempt to recover from problems in subrules.//
BailErrorStrategy.prototype.sync = function(recognizer) {
    // pass
};

exports.BailErrorStrategy = BailErrorStrategy;
exports.DefaultErrorStrategy = DefaultErrorStrategy;
},{"./../IntervalSet":14,"./../Token":22,"./../atn/ATNState":30,"./Errors":47}],47:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
//  3 kinds of errors: prediction errors, failed predicate errors, and
//  mismatched input errors. In each case, the parser knows where it is
//  in the input, where it is in the ATN, the rule invocation stack,
//  and what kind of problem occurred.

var PredicateTransition = require('./../atn/Transition').PredicateTransition;

function RecognitionException(params) {
	Error.call(this);
	if (!!Error.captureStackTrace) {
        Error.captureStackTrace(this, RecognitionException);
	} else {
		var stack = new Error().stack;
	}
	this.message = params.message;
    this.recognizer = params.recognizer;
    this.input = params.input;
    this.ctx = params.ctx;
    // The current {@link Token} when an error occurred. Since not all streams
    // support accessing symbols by index, we have to track the {@link Token}
    // instance itself.
    this.offendingToken = null;
    // Get the ATN state number the parser was in at the time the error
    // occurred. For {@link NoViableAltException} and
    // {@link LexerNoViableAltException} exceptions, this is the
    // {@link DecisionState} number. For others, it is the state whose outgoing
    // edge we couldn't match.
    this.offendingState = -1;
    if (this.recognizer!==null) {
        this.offendingState = this.recognizer.state;
    }
    return this;
}

RecognitionException.prototype = Object.create(Error.prototype);
RecognitionException.prototype.constructor = RecognitionException;

// <p>If the state number is not known, this method returns -1.</p>

//
// Gets the set of input symbols which could potentially follow the
// previously matched symbol at the time this exception was thrown.
//
// <p>If the set of expected tokens is not known and could not be computed,
// this method returns {@code null}.</p>
//
// @return The set of token types that could potentially follow the current
// state in the ATN, or {@code null} if the information is not available.
// /
RecognitionException.prototype.getExpectedTokens = function() {
    if (this.recognizer!==null) {
        return this.recognizer.atn.getExpectedTokens(this.offendingState, this.ctx);
    } else {
        return null;
    }
};

RecognitionException.prototype.toString = function() {
    return this.message;
};

function LexerNoViableAltException(lexer, input, startIndex, deadEndConfigs) {
	RecognitionException.call(this, {message:"", recognizer:lexer, input:input, ctx:null});
    this.startIndex = startIndex;
    this.deadEndConfigs = deadEndConfigs;
    return this;
}

LexerNoViableAltException.prototype = Object.create(RecognitionException.prototype);
LexerNoViableAltException.prototype.constructor = LexerNoViableAltException;

LexerNoViableAltException.prototype.toString = function() {
    var symbol = "";
    if (this.startIndex >= 0 && this.startIndex < this.input.size) {
        symbol = this.input.getText((this.startIndex,this.startIndex));
    }
    return "LexerNoViableAltException" + symbol;
};

// Indicates that the parser could not decide which of two or more paths
// to take based upon the remaining input. It tracks the starting token
// of the offending input and also knows where the parser was
// in the various paths when the error. Reported by reportNoViableAlternative()
//
function NoViableAltException(recognizer, input, startToken, offendingToken, deadEndConfigs, ctx) {
	ctx = ctx || recognizer._ctx;
	offendingToken = offendingToken || recognizer.getCurrentToken();
	startToken = startToken || recognizer.getCurrentToken();
	input = input || recognizer.getInputStream();
	RecognitionException.call(this, {message:"", recognizer:recognizer, input:input, ctx:ctx});
    // Which configurations did we try at input.index() that couldn't match
	// input.LT(1)?//
    this.deadEndConfigs = deadEndConfigs;
    // The token object at the start index; the input stream might
    // not be buffering tokens so get a reference to it. (At the
    // time the error occurred, of course the stream needs to keep a
    // buffer all of the tokens but later we might not have access to those.)
    this.startToken = startToken;
    this.offendingToken = offendingToken;
}

NoViableAltException.prototype = Object.create(RecognitionException.prototype);
NoViableAltException.prototype.constructor = NoViableAltException;

// This signifies any kind of mismatched input exceptions such as
// when the current input does not match the expected token.
//
function InputMismatchException(recognizer) {
	RecognitionException.call(this, {message:"", recognizer:recognizer, input:recognizer.getInputStream(), ctx:recognizer._ctx});
    this.offendingToken = recognizer.getCurrentToken();
}

InputMismatchException.prototype = Object.create(RecognitionException.prototype);
InputMismatchException.prototype.constructor = InputMismatchException;

// A semantic predicate failed during validation. Validation of predicates
// occurs when normally parsing the alternative just like matching a token.
// Disambiguating predicate evaluation occurs when we test a predicate during
// prediction.

function FailedPredicateException(recognizer, predicate, message) {
	RecognitionException.call(this, {message:this.formatMessage(predicate,message || null), recognizer:recognizer,
                         input:recognizer.getInputStream(), ctx:recognizer._ctx});
    var s = recognizer._interp.atn.states[recognizer.state];
    var trans = s.transitions[0];
    if (trans instanceof PredicateTransition) {
        this.ruleIndex = trans.ruleIndex;
        this.predicateIndex = trans.predIndex;
    } else {
        this.ruleIndex = 0;
        this.predicateIndex = 0;
    }
    this.predicate = predicate;
    this.offendingToken = recognizer.getCurrentToken();
    return this;
}

FailedPredicateException.prototype = Object.create(RecognitionException.prototype);
FailedPredicateException.prototype.constructor = FailedPredicateException;

FailedPredicateException.prototype.formatMessage = function(predicate, message) {
    if (message !==null) {
        return message;
    } else {
        return "failed predicate: {" + predicate + "}?";
    }
};

function ParseCancellationException() {
	Error.call(this);
	Error.captureStackTrace(this, ParseCancellationException);
	return this;
}

ParseCancellationException.prototype = Object.create(Error.prototype);
ParseCancellationException.prototype.constructor = ParseCancellationException;

exports.RecognitionException = RecognitionException;
exports.NoViableAltException = NoViableAltException;
exports.LexerNoViableAltException = LexerNoViableAltException;
exports.InputMismatchException = InputMismatchException;
exports.FailedPredicateException = FailedPredicateException;

},{"./../atn/Transition":38}],48:[function(require,module,exports){
exports.RecognitionException = require('./Errors').RecognitionException;
exports.NoViableAltException = require('./Errors').NoViableAltException;
exports.LexerNoViableAltException = require('./Errors').LexerNoViableAltException;
exports.InputMismatchException = require('./Errors').InputMismatchException;
exports.FailedPredicateException = require('./Errors').FailedPredicateException;
exports.DiagnosticErrorListener = require('./DiagnosticErrorListener').DiagnosticErrorListener;
exports.BailErrorStrategy = require('./ErrorStrategy').BailErrorStrategy;
exports.ErrorListener = require('./ErrorListener').ErrorListener;
},{"./DiagnosticErrorListener":44,"./ErrorListener":45,"./ErrorStrategy":46,"./Errors":47}],49:[function(require,module,exports){
exports.atn = require('./atn/index');
exports.dfa = require('./dfa/index');
exports.tree = require('./tree/index');
exports.error = require('./error/index');
exports.Token = require('./Token').Token;
exports.CommonToken = require('./Token').Token;
exports.InputStream = require('./InputStream').InputStream;
exports.FileStream = require('./FileStream').FileStream;
exports.CommonTokenStream = require('./CommonTokenStream').CommonTokenStream;
exports.Lexer = require('./Lexer').Lexer;
exports.Parser = require('./Parser').Parser;
var pc = require('./PredictionContext');
exports.PredictionContextCache = pc.PredictionContextCache;
exports.ParserRuleContext = require('./ParserRuleContext').ParserRuleContext;
exports.Interval = require('./IntervalSet').Interval;
exports.Utils = require('./Utils');

},{"./CommonTokenStream":11,"./FileStream":12,"./InputStream":13,"./IntervalSet":14,"./Lexer":16,"./Parser":17,"./ParserRuleContext":18,"./PredictionContext":19,"./Token":22,"./Utils":23,"./atn/index":39,"./dfa/index":43,"./error/index":48,"./tree/index":52}],50:[function(require,module,exports){
// [The "BSD license"]
//  Copyright (c) 2012 Terence Parr
//  Copyright (c) 2012 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///

// The basic notion of a tree has a parent, a payload, and a list of children.
//  It is the most abstract interface for all the trees used by ANTLR.
///

var Token = require('./../Token').Token;
var Interval = require('./../IntervalSet').Interval;
var INVALID_INTERVAL = new Interval(-1, -2);

function Tree() {
	return this;
}

function SyntaxTree() {
	Tree.call(this);
	return this;
}

SyntaxTree.prototype = Object.create(Tree.prototype);
SyntaxTree.prototype.constructor = SyntaxTree;

function ParseTree() {
	SyntaxTree.call(this);
	return this;
}

ParseTree.prototype = Object.create(SyntaxTree.prototype);
ParseTree.prototype.constructor = ParseTree;

function RuleNode() {
	ParseTree.call(this);
	return this;
}

RuleNode.prototype = Object.create(ParseTree.prototype);
RuleNode.prototype.constructor = RuleNode;

function TerminalNode() {
	ParseTree.call(this);
	return this;
}

TerminalNode.prototype = Object.create(ParseTree.prototype);
TerminalNode.prototype.constructor = TerminalNode;

function ErrorNode() {
	TerminalNode.call(this);
	return this;
}

ErrorNode.prototype = Object.create(TerminalNode.prototype);
ErrorNode.prototype.constructor = ErrorNode;

function ParseTreeVisitor() {
	return this;
}

function ParseTreeListener() {
	return this;
}

ParseTreeListener.prototype.visitTerminal = function(node) {
};

ParseTreeListener.prototype.visitErrorNode = function(node) {
};

ParseTreeListener.prototype.enterEveryRule = function(node) {
};

ParseTreeListener.prototype.exitEveryRule = function(node) {
};

function TerminalNodeImpl(symbol) {
	TerminalNode.call(this);
	this.parentCtx = null;
	this.symbol = symbol;
	return this;
}

TerminalNodeImpl.prototype = Object.create(TerminalNode.prototype);
TerminalNodeImpl.prototype.constructor = TerminalNodeImpl;

TerminalNodeImpl.prototype.getChild = function(i) {
	return null;
};

TerminalNodeImpl.prototype.getSymbol = function() {
	return this.symbol;
};

TerminalNodeImpl.prototype.getParent = function() {
	return this.parentCtx;
};

TerminalNodeImpl.prototype.getPayload = function() {
	return this.symbol;
};

TerminalNodeImpl.prototype.getSourceInterval = function() {
	if (this.symbol === null) {
		return INVALID_INTERVAL;
	}
	var tokenIndex = this.symbol.tokenIndex;
	return new Interval(tokenIndex, tokenIndex);
};

TerminalNodeImpl.prototype.getChildCount = function() {
	return 0;
};

TerminalNodeImpl.prototype.accept = function(visitor) {
	return visitor.visitTerminal(this);
};

TerminalNodeImpl.prototype.getText = function() {
	return this.symbol.text;
};

TerminalNodeImpl.prototype.toString = function() {
	if (this.symbol.type === Token.EOF) {
		return "<EOF>";
	} else {
		return this.symbol.text;
	}
};

// Represents a token that was consumed during resynchronization
// rather than during a valid match operation. For example,
// we will create this kind of a node during single token insertion
// and deletion as well as during "consume until error recovery set"
// upon no viable alternative exceptions.

function ErrorNodeImpl(token) {
	TerminalNodeImpl.call(this, token);
	return this;
}

ErrorNodeImpl.prototype = Object.create(TerminalNodeImpl.prototype);
ErrorNodeImpl.prototype.constructor = ErrorNodeImpl;

ErrorNodeImpl.prototype.isErrorNode = function() {
	return true;
};

ErrorNodeImpl.prototype.accept = function(visitor) {
	return visitor.visitErrorNode(this);
};

function ParseTreeWalker() {
	return this;
}

ParseTreeWalker.prototype.walk = function(listener, t) {
	var errorNode = t instanceof ErrorNode ||
			(t.isErrorNode !== undefined && t.isErrorNode());
	if (errorNode) {
		listener.visitErrorNode(t);
	} else if (t instanceof TerminalNode) {
		listener.visitTerminal(t);
	} else {
		this.enterRule(listener, t);
		for (var i = 0; i < t.getChildCount(); i++) {
			var child = t.getChild(i);
			this.walk(listener, child);
		}
		this.exitRule(listener, t);
	}
};
//
// The discovery of a rule node, involves sending two events: the generic
// {@link ParseTreeListener//enterEveryRule} and a
// {@link RuleContext}-specific event. First we trigger the generic and then
// the rule specific. We to them in reverse order upon finishing the node.
//
ParseTreeWalker.prototype.enterRule = function(listener, r) {
	var ctx = r.getRuleContext();
	listener.enterEveryRule(ctx);
	ctx.enterRule(listener);
};

ParseTreeWalker.prototype.exitRule = function(listener, r) {
	var ctx = r.getRuleContext();
	ctx.exitRule(listener);
	listener.exitEveryRule(ctx);
};

ParseTreeWalker.DEFAULT = new ParseTreeWalker();

exports.RuleNode = RuleNode;
exports.ErrorNode = ErrorNode;
exports.TerminalNode = TerminalNode;
exports.ErrorNodeImpl = ErrorNodeImpl;
exports.TerminalNodeImpl = TerminalNodeImpl;
exports.ParseTreeListener = ParseTreeListener;
exports.ParseTreeVisitor = ParseTreeVisitor;
exports.ParseTreeWalker = ParseTreeWalker;
exports.INVALID_INTERVAL = INVALID_INTERVAL;
},{"./../IntervalSet":14,"./../Token":22}],51:[function(require,module,exports){
/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var Utils = require('./../Utils');
var Token = require('./../Token').Token;
var RuleNode = require('./Tree').RuleNode;
var ErrorNode = require('./Tree').ErrorNode;
var TerminalNode = require('./Tree').TerminalNode;
var ParserRuleContext = require('./../ParserRuleContext').ParserRuleContext;


/** A set of utility routines useful for all kinds of ANTLR trees. */
function Trees() {
}

// Print out a whole tree in LISP form. {@link //getNodeText} is used on the
//  node payloads to get the text for the nodes.  Detect
//  parse trees and extract data appropriately.
Trees.toStringTree = function(tree, ruleNames, recog) {
	ruleNames = ruleNames || null;
	recog = recog || null;
    if(recog!==null) {
       ruleNames = recog.ruleNames;
    }
    var s = Trees.getNodeText(tree, ruleNames);
    s = Utils.escapeWhitespace(s, false);
    var c = tree.getChildCount();
    if(c===0) {
        return s;
    }
    var res = "(" + s + ' ';
    if(c>0) {
        s = Trees.toStringTree(tree.getChild(0), ruleNames);
        res = res.concat(s);
    }
    for(var i=1;i<c;i++) {
        s = Trees.toStringTree(tree.getChild(i), ruleNames);
        res = res.concat(' ' + s);
    }
    res = res.concat(")");
    return res;
};

Trees.getNodeText = function(t, ruleNames, recog) {
	ruleNames = ruleNames || null;
	recog = recog || null;
    if(recog!==null) {
        ruleNames = recog.ruleNames;
    }
    if(ruleNames!==null) {
       if (t instanceof RuleNode) {
           return ruleNames[t.getRuleContext().ruleIndex];
       } else if ( t instanceof ErrorNode) {
           return t.toString();
       } else if(t instanceof TerminalNode) {
           if(t.symbol!==null) {
               return t.symbol.text;
           }
       }
    }
    // no recog for rule names
    var payload = t.getPayload();
    if (payload instanceof Token ) {
       return payload.text;
    }
    return t.getPayload().toString();
};


// Return ordered list of all children of this node
Trees.getChildren = function(t) {
	var list = [];
	for(var i=0;i<t.getChildCount();i++) {
		list.push(t.getChild(i));
	}
	return list;
};

// Return a list of all ancestors of this node.  The first node of
//  list is the root and the last is the parent of this node.
//
Trees.getAncestors = function(t) {
    var ancestors = [];
    t = t.getParent();
    while(t!==null) {
        ancestors = [t].concat(ancestors);
        t = t.getParent();
    }
    return ancestors;
};
   
Trees.findAllTokenNodes = function(t, ttype) {
    return Trees.findAllNodes(t, ttype, true);
};

Trees.findAllRuleNodes = function(t, ruleIndex) {
	return Trees.findAllNodes(t, ruleIndex, false);
};

Trees.findAllNodes = function(t, index, findTokens) {
	var nodes = [];
	Trees._findAllNodes(t, index, findTokens, nodes);
	return nodes;
};

Trees._findAllNodes = function(t, index, findTokens, nodes) {
	// check this node (the root) first
	if(findTokens && (t instanceof TerminalNode)) {
		if(t.symbol.type===index) {
			nodes.push(t);
		}
	} else if(!findTokens && (t instanceof ParserRuleContext)) {
		if(t.ruleIndex===index) {
			nodes.push(t);
		}
	}
	// check children
	for(var i=0;i<t.getChildCount();i++) {
		Trees._findAllNodes(t.getChild(i), index, findTokens, nodes);
	}
};

Trees.descendants = function(t) {
	var nodes = [t];
    for(var i=0;i<t.getChildCount();i++) {
        nodes = nodes.concat(Trees.descendants(t.getChild(i)));
    }
    return nodes;
};


exports.Trees = Trees;
},{"./../ParserRuleContext":18,"./../Token":22,"./../Utils":23,"./Tree":50}],52:[function(require,module,exports){
var Tree = require('./Tree');
exports.Trees = require('./Tree').Trees;
exports.RuleNode = Tree.RuleNode;
exports.ParseTreeListener = Tree.ParseTreeListener;
exports.ParseTreeVisitor = Tree.ParseTreeVisitor;
exports.ParseTreeWalker = Tree.ParseTreeWalker;
},{"./Tree":50}],53:[function(require,module,exports){
var JavaListener = require('./grammars/java/JavaListener.js').JavaListener;
var util = require('util');

function Transpiler() {
	JavaListener.call(this);
	return this;
}
util.inherits(Transpiler, JavaListener)

Transpiler.prototype.constructor = Transpiler;

// Enter a parse tree produced by JavaParser#compilationUnit.
Transpiler.prototype.enterCompilationUnit = function enterCompilationUnit(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#compilationUnit.
Transpiler.prototype.exitCompilationUnit = function exitCompilationUnit(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#packageDeclaration.
Transpiler.prototype.enterPackageDeclaration = function enterPackageDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#packageDeclaration.
Transpiler.prototype.exitPackageDeclaration = function exitPackageDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#importDeclaration.
Transpiler.prototype.enterImportDeclaration = function enterImportDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#importDeclaration.
Transpiler.prototype.exitImportDeclaration = function exitImportDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeDeclaration.
Transpiler.prototype.enterTypeDeclaration = function enterTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeDeclaration.
Transpiler.prototype.exitTypeDeclaration = function exitTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#modifier.
Transpiler.prototype.enterModifier = function enterModifier(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#modifier.
Transpiler.prototype.exitModifier = function exitModifier(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classOrInterfaceModifier.
Transpiler.prototype.enterClassOrInterfaceModifier = function enterClassOrInterfaceModifier(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classOrInterfaceModifier.
Transpiler.prototype.exitClassOrInterfaceModifier = function exitClassOrInterfaceModifier(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableModifier.
Transpiler.prototype.enterVariableModifier = function enterVariableModifier(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableModifier.
Transpiler.prototype.exitVariableModifier = function exitVariableModifier(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classDeclaration.
Transpiler.prototype.enterClassDeclaration = function enterClassDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classDeclaration.
Transpiler.prototype.exitClassDeclaration = function exitClassDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeParameters.
Transpiler.prototype.enterTypeParameters = function enterTypeParameters(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeParameters.
Transpiler.prototype.exitTypeParameters = function exitTypeParameters(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeParameter.
Transpiler.prototype.enterTypeParameter = function enterTypeParameter(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeParameter.
Transpiler.prototype.exitTypeParameter = function exitTypeParameter(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeBound.
Transpiler.prototype.enterTypeBound = function enterTypeBound(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeBound.
Transpiler.prototype.exitTypeBound = function exitTypeBound(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumDeclaration.
Transpiler.prototype.enterEnumDeclaration = function enterEnumDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumDeclaration.
Transpiler.prototype.exitEnumDeclaration = function exitEnumDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumConstants.
Transpiler.prototype.enterEnumConstants = function enterEnumConstants(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumConstants.
Transpiler.prototype.exitEnumConstants = function exitEnumConstants(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumConstant.
Transpiler.prototype.enterEnumConstant = function enterEnumConstant(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumConstant.
Transpiler.prototype.exitEnumConstant = function exitEnumConstant(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumBodyDeclarations.
Transpiler.prototype.enterEnumBodyDeclarations = function enterEnumBodyDeclarations(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumBodyDeclarations.
Transpiler.prototype.exitEnumBodyDeclarations = function exitEnumBodyDeclarations(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceDeclaration.
Transpiler.prototype.enterInterfaceDeclaration = function enterInterfaceDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceDeclaration.
Transpiler.prototype.exitInterfaceDeclaration = function exitInterfaceDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeList.
Transpiler.prototype.enterTypeList = function enterTypeList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeList.
Transpiler.prototype.exitTypeList = function exitTypeList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classBody.
Transpiler.prototype.enterClassBody = function enterClassBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classBody.
Transpiler.prototype.exitClassBody = function exitClassBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceBody.
Transpiler.prototype.enterInterfaceBody = function enterInterfaceBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceBody.
Transpiler.prototype.exitInterfaceBody = function exitInterfaceBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classBodyDeclaration.
Transpiler.prototype.enterClassBodyDeclaration = function enterClassBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classBodyDeclaration.
Transpiler.prototype.exitClassBodyDeclaration = function exitClassBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#memberDeclaration.
Transpiler.prototype.enterMemberDeclaration = function enterMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#memberDeclaration.
Transpiler.prototype.exitMemberDeclaration = function exitMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#methodDeclaration.
Transpiler.prototype.enterMethodDeclaration = function enterMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#methodDeclaration.
Transpiler.prototype.exitMethodDeclaration = function exitMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#genericMethodDeclaration.
Transpiler.prototype.enterGenericMethodDeclaration = function enterGenericMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#genericMethodDeclaration.
Transpiler.prototype.exitGenericMethodDeclaration = function exitGenericMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constructorDeclaration.
Transpiler.prototype.enterConstructorDeclaration = function enterConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constructorDeclaration.
Transpiler.prototype.exitConstructorDeclaration = function exitConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#genericConstructorDeclaration.
Transpiler.prototype.enterGenericConstructorDeclaration = function enterGenericConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#genericConstructorDeclaration.
Transpiler.prototype.exitGenericConstructorDeclaration = function exitGenericConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#fieldDeclaration.
Transpiler.prototype.enterFieldDeclaration = function enterFieldDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#fieldDeclaration.
Transpiler.prototype.exitFieldDeclaration = function exitFieldDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceBodyDeclaration.
Transpiler.prototype.enterInterfaceBodyDeclaration = function enterInterfaceBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceBodyDeclaration.
Transpiler.prototype.exitInterfaceBodyDeclaration = function exitInterfaceBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceMemberDeclaration.
Transpiler.prototype.enterInterfaceMemberDeclaration = function enterInterfaceMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceMemberDeclaration.
Transpiler.prototype.exitInterfaceMemberDeclaration = function exitInterfaceMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constDeclaration.
Transpiler.prototype.enterConstDeclaration = function enterConstDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constDeclaration.
Transpiler.prototype.exitConstDeclaration = function exitConstDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constantDeclarator.
Transpiler.prototype.enterConstantDeclarator = function enterConstantDeclarator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constantDeclarator.
Transpiler.prototype.exitConstantDeclarator = function exitConstantDeclarator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceMethodDeclaration.
Transpiler.prototype.enterInterfaceMethodDeclaration = function enterInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceMethodDeclaration.
Transpiler.prototype.exitInterfaceMethodDeclaration = function exitInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#genericInterfaceMethodDeclaration.
Transpiler.prototype.enterGenericInterfaceMethodDeclaration = function enterGenericInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#genericInterfaceMethodDeclaration.
Transpiler.prototype.exitGenericInterfaceMethodDeclaration = function exitGenericInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableDeclarators.
Transpiler.prototype.enterVariableDeclarators = function enterVariableDeclarators(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableDeclarators.
Transpiler.prototype.exitVariableDeclarators = function exitVariableDeclarators(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableDeclarator.
Transpiler.prototype.enterVariableDeclarator = function enterVariableDeclarator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableDeclarator.
Transpiler.prototype.exitVariableDeclarator = function exitVariableDeclarator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableDeclaratorId.
Transpiler.prototype.enterVariableDeclaratorId = function enterVariableDeclaratorId(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableDeclaratorId.
Transpiler.prototype.exitVariableDeclaratorId = function exitVariableDeclaratorId(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableInitializer.
Transpiler.prototype.enterVariableInitializer = function enterVariableInitializer(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableInitializer.
Transpiler.prototype.exitVariableInitializer = function exitVariableInitializer(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#arrayInitializer.
Transpiler.prototype.enterArrayInitializer = function enterArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#arrayInitializer.
Transpiler.prototype.exitArrayInitializer = function exitArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumConstantName.
Transpiler.prototype.enterEnumConstantName = function enterEnumConstantName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumConstantName.
Transpiler.prototype.exitEnumConstantName = function exitEnumConstantName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#type.
Transpiler.prototype.enterType = function enterType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#type.
Transpiler.prototype.exitType = function exitType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classOrInterfaceType.
Transpiler.prototype.enterClassOrInterfaceType = function enterClassOrInterfaceType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classOrInterfaceType.
Transpiler.prototype.exitClassOrInterfaceType = function exitClassOrInterfaceType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#primitiveType.
Transpiler.prototype.enterPrimitiveType = function enterPrimitiveType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#primitiveType.
Transpiler.prototype.exitPrimitiveType = function exitPrimitiveType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeArguments.
Transpiler.prototype.enterTypeArguments = function enterTypeArguments(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeArguments.
Transpiler.prototype.exitTypeArguments = function exitTypeArguments(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeArgument.
Transpiler.prototype.enterTypeArgument = function enterTypeArgument(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeArgument.
Transpiler.prototype.exitTypeArgument = function exitTypeArgument(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#qualifiedNameList.
Transpiler.prototype.enterQualifiedNameList = function enterQualifiedNameList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#qualifiedNameList.
Transpiler.prototype.exitQualifiedNameList = function exitQualifiedNameList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#formalParameters.
Transpiler.prototype.enterFormalParameters = function enterFormalParameters(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#formalParameters.
Transpiler.prototype.exitFormalParameters = function exitFormalParameters(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#formalParameterList.
Transpiler.prototype.enterFormalParameterList = function enterFormalParameterList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#formalParameterList.
Transpiler.prototype.exitFormalParameterList = function exitFormalParameterList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#formalParameter.
Transpiler.prototype.enterFormalParameter = function enterFormalParameter(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#formalParameter.
Transpiler.prototype.exitFormalParameter = function exitFormalParameter(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#lastFormalParameter.
Transpiler.prototype.enterLastFormalParameter = function enterLastFormalParameter(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#lastFormalParameter.
Transpiler.prototype.exitLastFormalParameter = function exitLastFormalParameter(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#methodBody.
Transpiler.prototype.enterMethodBody = function enterMethodBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#methodBody.
Transpiler.prototype.exitMethodBody = function exitMethodBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constructorBody.
Transpiler.prototype.enterConstructorBody = function enterConstructorBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constructorBody.
Transpiler.prototype.exitConstructorBody = function exitConstructorBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#qualifiedName.
Transpiler.prototype.enterQualifiedName = function enterQualifiedName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#qualifiedName.
Transpiler.prototype.exitQualifiedName = function exitQualifiedName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#literal.
Transpiler.prototype.enterLiteral = function enterLiteral(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#literal.
Transpiler.prototype.exitLiteral = function exitLiteral(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotation.
Transpiler.prototype.enterAnnotation = function enterAnnotation(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotation.
Transpiler.prototype.exitAnnotation = function exitAnnotation(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationName.
Transpiler.prototype.enterAnnotationName = function enterAnnotationName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationName.
Transpiler.prototype.exitAnnotationName = function exitAnnotationName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValuePairs.
Transpiler.prototype.enterElementValuePairs = function enterElementValuePairs(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValuePairs.
Transpiler.prototype.exitElementValuePairs = function exitElementValuePairs(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValuePair.
Transpiler.prototype.enterElementValuePair = function enterElementValuePair(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValuePair.
Transpiler.prototype.exitElementValuePair = function exitElementValuePair(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValue.
Transpiler.prototype.enterElementValue = function enterElementValue(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValue.
Transpiler.prototype.exitElementValue = function exitElementValue(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValueArrayInitializer.
Transpiler.prototype.enterElementValueArrayInitializer = function enterElementValueArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValueArrayInitializer.
Transpiler.prototype.exitElementValueArrayInitializer = function exitElementValueArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeDeclaration.
Transpiler.prototype.enterAnnotationTypeDeclaration = function enterAnnotationTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeDeclaration.
Transpiler.prototype.exitAnnotationTypeDeclaration = function exitAnnotationTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeBody.
Transpiler.prototype.enterAnnotationTypeBody = function enterAnnotationTypeBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeBody.
Transpiler.prototype.exitAnnotationTypeBody = function exitAnnotationTypeBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeElementDeclaration.
Transpiler.prototype.enterAnnotationTypeElementDeclaration = function enterAnnotationTypeElementDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeElementDeclaration.
Transpiler.prototype.exitAnnotationTypeElementDeclaration = function exitAnnotationTypeElementDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeElementRest.
Transpiler.prototype.enterAnnotationTypeElementRest = function enterAnnotationTypeElementRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeElementRest.
Transpiler.prototype.exitAnnotationTypeElementRest = function exitAnnotationTypeElementRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationMethodOrConstantRest.
Transpiler.prototype.enterAnnotationMethodOrConstantRest = function enterAnnotationMethodOrConstantRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationMethodOrConstantRest.
Transpiler.prototype.exitAnnotationMethodOrConstantRest = function exitAnnotationMethodOrConstantRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationMethodRest.
Transpiler.prototype.enterAnnotationMethodRest = function enterAnnotationMethodRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationMethodRest.
Transpiler.prototype.exitAnnotationMethodRest = function exitAnnotationMethodRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationConstantRest.
Transpiler.prototype.enterAnnotationConstantRest = function enterAnnotationConstantRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationConstantRest.
Transpiler.prototype.exitAnnotationConstantRest = function exitAnnotationConstantRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#defaultValue.
Transpiler.prototype.enterDefaultValue = function enterDefaultValue(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#defaultValue.
Transpiler.prototype.exitDefaultValue = function exitDefaultValue(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#block.
Transpiler.prototype.enterBlock = function enterBlock(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#block.
Transpiler.prototype.exitBlock = function exitBlock(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#blockStatement.
Transpiler.prototype.enterBlockStatement = function enterBlockStatement(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#blockStatement.
Transpiler.prototype.exitBlockStatement = function exitBlockStatement(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#localVariableDeclarationStatement.
Transpiler.prototype.enterLocalVariableDeclarationStatement = function enterLocalVariableDeclarationStatement(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#localVariableDeclarationStatement.
Transpiler.prototype.exitLocalVariableDeclarationStatement = function exitLocalVariableDeclarationStatement(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#localVariableDeclaration.
Transpiler.prototype.enterLocalVariableDeclaration = function enterLocalVariableDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#localVariableDeclaration.
Transpiler.prototype.exitLocalVariableDeclaration = function exitLocalVariableDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#statement.
Transpiler.prototype.enterStatement = function enterStatement(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#statement.
Transpiler.prototype.exitStatement = function exitStatement(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#catchClause.
Transpiler.prototype.enterCatchClause = function enterCatchClause(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#catchClause.
Transpiler.prototype.exitCatchClause = function exitCatchClause(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#catchType.
Transpiler.prototype.enterCatchType = function enterCatchType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#catchType.
Transpiler.prototype.exitCatchType = function exitCatchType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#finallyBlock.
Transpiler.prototype.enterFinallyBlock = function enterFinallyBlock(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#finallyBlock.
Transpiler.prototype.exitFinallyBlock = function exitFinallyBlock(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#resourceSpecification.
Transpiler.prototype.enterResourceSpecification = function enterResourceSpecification(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#resourceSpecification.
Transpiler.prototype.exitResourceSpecification = function exitResourceSpecification(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#resources.
Transpiler.prototype.enterResources = function enterResources(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#resources.
Transpiler.prototype.exitResources = function exitResources(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#resource.
Transpiler.prototype.enterResource = function enterResource(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#resource.
Transpiler.prototype.exitResource = function exitResource(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#switchBlockStatementGroup.
Transpiler.prototype.enterSwitchBlockStatementGroup = function enterSwitchBlockStatementGroup(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#switchBlockStatementGroup.
Transpiler.prototype.exitSwitchBlockStatementGroup = function exitSwitchBlockStatementGroup(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#switchLabel.
Transpiler.prototype.enterSwitchLabel = function enterSwitchLabel(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#switchLabel.
Transpiler.prototype.exitSwitchLabel = function exitSwitchLabel(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#forControl.
Transpiler.prototype.enterForControl = function enterForControl(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#forControl.
Transpiler.prototype.exitForControl = function exitForControl(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#forInit.
Transpiler.prototype.enterForInit = function enterForInit(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#forInit.
Transpiler.prototype.exitForInit = function exitForInit(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enhancedForControl.
Transpiler.prototype.enterEnhancedForControl = function enterEnhancedForControl(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enhancedForControl.
Transpiler.prototype.exitEnhancedForControl = function exitEnhancedForControl(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#forUpdate.
Transpiler.prototype.enterForUpdate = function enterForUpdate(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#forUpdate.
Transpiler.prototype.exitForUpdate = function exitForUpdate(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#parExpression.
Transpiler.prototype.enterParExpression = function enterParExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#parExpression.
Transpiler.prototype.exitParExpression = function exitParExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#expressionList.
Transpiler.prototype.enterExpressionList = function enterExpressionList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#expressionList.
Transpiler.prototype.exitExpressionList = function exitExpressionList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#statementExpression.
Transpiler.prototype.enterStatementExpression = function enterStatementExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#statementExpression.
Transpiler.prototype.exitStatementExpression = function exitStatementExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constantExpression.
Transpiler.prototype.enterConstantExpression = function enterConstantExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constantExpression.
Transpiler.prototype.exitConstantExpression = function exitConstantExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#expression.
Transpiler.prototype.enterExpression = function enterExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#expression.
Transpiler.prototype.exitExpression = function exitExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#primary.
Transpiler.prototype.enterPrimary = function enterPrimary(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#primary.
Transpiler.prototype.exitPrimary = function exitPrimary(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#creator.
Transpiler.prototype.enterCreator = function enterCreator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#creator.
Transpiler.prototype.exitCreator = function exitCreator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#createdName.
Transpiler.prototype.enterCreatedName = function enterCreatedName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#createdName.
Transpiler.prototype.exitCreatedName = function exitCreatedName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#innerCreator.
Transpiler.prototype.enterInnerCreator = function enterInnerCreator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#innerCreator.
Transpiler.prototype.exitInnerCreator = function exitInnerCreator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#arrayCreatorRest.
Transpiler.prototype.enterArrayCreatorRest = function enterArrayCreatorRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#arrayCreatorRest.
Transpiler.prototype.exitArrayCreatorRest = function exitArrayCreatorRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classCreatorRest.
Transpiler.prototype.enterClassCreatorRest = function enterClassCreatorRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classCreatorRest.
Transpiler.prototype.exitClassCreatorRest = function exitClassCreatorRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#explicitGenericInvocation.
Transpiler.prototype.enterExplicitGenericInvocation = function enterExplicitGenericInvocation(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#explicitGenericInvocation.
Transpiler.prototype.exitExplicitGenericInvocation = function exitExplicitGenericInvocation(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#nonWildcardTypeArguments.
Transpiler.prototype.enterNonWildcardTypeArguments = function enterNonWildcardTypeArguments(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#nonWildcardTypeArguments.
Transpiler.prototype.exitNonWildcardTypeArguments = function exitNonWildcardTypeArguments(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeArgumentsOrDiamond.
Transpiler.prototype.enterTypeArgumentsOrDiamond = function enterTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeArgumentsOrDiamond.
Transpiler.prototype.exitTypeArgumentsOrDiamond = function exitTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#nonWildcardTypeArgumentsOrDiamond.
Transpiler.prototype.enterNonWildcardTypeArgumentsOrDiamond = function enterNonWildcardTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#nonWildcardTypeArgumentsOrDiamond.
Transpiler.prototype.exitNonWildcardTypeArgumentsOrDiamond = function exitNonWildcardTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#superSuffix.
Transpiler.prototype.enterSuperSuffix = function enterSuperSuffix(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#superSuffix.
Transpiler.prototype.exitSuperSuffix = function exitSuperSuffix(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#explicitGenericInvocationSuffix.
Transpiler.prototype.enterExplicitGenericInvocationSuffix = function enterExplicitGenericInvocationSuffix(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#explicitGenericInvocationSuffix.
Transpiler.prototype.exitExplicitGenericInvocationSuffix = function exitExplicitGenericInvocationSuffix(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#arguments.
Transpiler.prototype.enterArguments = function enterArguments(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#arguments.
Transpiler.prototype.exitArguments = function exitArguments(ctx) {
	console.log(arguments.callee.name);
};



exports.Transpiler = Transpiler;

},{"./grammars/java/JavaListener.js":7,"util":5}],54:[function(require,module,exports){
var antlr4 = require("antlr4");
var JavaParser = require("./grammars/java/JavaParser.js").JavaParser;
var JavaLexer = require("./grammars/java/JavaLexer.js").JavaLexer;
var Transpiler = require("./transpiler.js").Transpiler;

module.exports.input =
"/*\n" + 
" * HelloWorld.java\n" + 
" */\n" + 
"\n" + 
"public class HelloWorld\n" + 
"{\n" + 
"	public HelloWorld() {\n" + 
"		System.out.println(\"Hello World\");\n" + 
"	}\n" + 
"}\n" + 
"\n"

module.exports.compile = function(input) {
	var chars = new antlr4.InputStream(input);
	var lexer = new JavaLexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new JavaParser(tokens);
	parser.buildParseTrees = true;
	var tree = parser.compilationUnit();

	var walker = new antlr4.tree.ParseTreeWalker();
	var listener = new Transpiler();
	walker.walk(listener, tree);

}

},{"./grammars/java/JavaLexer.js":6,"./grammars/java/JavaParser.js":8,"./transpiler.js":53,"antlr4":49}]},{},[54])(54)
});