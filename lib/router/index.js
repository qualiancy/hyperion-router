/*!
 * Hyperion Router (router)
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('hyperion-router:router')
  , EventEmitter = require('drip').EnhancedEmitter
  , extend = require('tea-extend')
  , inherits = require('tea-inherits')
  , type = require('tea-type');

/*!
 * Internal dependencies
 */

var methods = require('./methods')
  , Route = require('./route');

/*!
 * Constants
 */

var NOOP = function () {};

/*!
 * Primary Exports
 */

module.exports = Router;

/**
 *
 * @api public
 */

function Router () {
  EventEmitter.call(this, { delimeter: ':' });
  this.routes = {};
}

/*!
 * Inherit from Drip EnhancedEmitter
 */

inherits(Router, EventEmitter);

/**
 * Add a route this router.
 *
 * @param {String} method
 * @param {String|RegExp}
 * @param {Function} args ...
 * @return {Object} Route
 * @api public
 */

Router.prototype.addRoute = function () {
  var args = [].slice.call(arguments, 0)
    , callbacks = args.slice(2)
    , method = args[0].toLowerCase()
    , path = args[1]
    , route = new Route(method, path, callbacks);
  if (!this.routes[method]) this.routes[method] = [];
  debug('[add] (%d) %s %s', route.callbacks.length, method.toUpperCase(), path);
  this.routes[method].push(route);
  return route;
};

/**
 * Create an object that exposes all possible
 * request method types a function for easy mounting.
 *
 * @return {Function} map.get
 * @api public
 */

Router.prototype.map = function () {
  var self = this
    , proto = {};

  methods.forEach(function (method) {
    proto[method] = function () {
      var args = [].slice.call(arguments, 0);
      self.addRoute.apply(self, [ method ].concat(args));
      return this;
    };
  });

  function map () { map.get.apply(map, arguments); }
  extend(map, proto);
  return map;
}

/**
 * Dispatch a request to all callbacks that match
 * the request's parameters.
 *
 * Expects `request` object to contain a property
 * named method and a property names path.
 *
 * If a response object is omitted, the callbacks
 * invoked for matching routes will also omit a
 * response object.
 *
 * ```js
 * // with res
 * app.map('/', function (req, res, next) {
 *   // ...
 * });
 *
 * app.dispatch(req, res, done);
 *
 * // without res
 * app.map('/', function (req, next) {
 *   // ...
 * });
 *
 * app.dispatch(req, done);
 * ```
 *
 * @param {Object} request object
 * @param {Object} response object (optional)
 * @param {Function} callback
 */

Router.prototype.dispatch = function () {
  var self = this
    , args = [].slice.call(arguments, 0)
    , req = args[0]
    , method = req.method || 'get'
    , path = req.url
    , event = { path: path, method: method }
    , routes = this.routes[method.toLowerCase()]
    , stack = [];

  var res = null
    , out = NOOP;

  // prepare arguments for stack
  if (args.length === 2 && type.is(args[1], 'function')) {
    out = args[1];
  } else if (args.length === 2 && type.is(args[1], 'object')) {
    res = args[1];
  } else if (args.length === 3) {
    res = args[1];
    out = args[2];
  }

  // no method matches?
  if (!routes) {
    debug('[dispatch] no stack for method %s', method);
    return out();
  }

  debug('[dispatch] %s %s', method.toUpperCase(), path);

  // prepare stack
  routes.forEach(function (route) {
    if (route.match(path)) {
      route.callbacks.forEach(function (cb) {
        stack.push({ route: route, fn: cb });
      });
    }
  });

  // called upon completion, proxy to out with events
  function finish (err, result) {
    self.emit([ 'dispatch', 'post' ], event, err || null, result || null);
    out(err, result);
  }

  // handler for iterating through stack
  function iterate (i) {
    var line = stack[i]
      , mint;

    if (!line) return finish();

    function next (err, result) {
      if (false === err && !result) {
        return finish(false);
      } else if (err || result) {
        return finish(err, result)
      } else {
        iterate(++req.index);
      }
    }

    req.index = i;
    req.params = line.route.params(path);
    mint = res ? [ req, res, next ] : [ req, next ];
    line.fn.apply(null, mint);
  }

  // trigger start
  this.emit([ 'dispatch', 'pre' ], event);
  iterate(0);
};
