/*!
 * Hyperion Router (route)
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var parsePath = require('hyperion-parse-path');

/*!
 * Primary Exports
 */

module.exports = Route;

/**
 *
 * @param {String} method
 * @param {String|RegExp} path
 * @param {Array} callbacks
 * @api public
 */

function Route (method, path, callbacks) {
  var keys = [];
  this.callbacks = callbacks || [];
  this.method = method;
  this.re = parsePath(path, keys);
  this.path = path;
  this.keys = keys;
}

/**
 * Determine if a given path matches
 * this route
 *
 * @param {String} path
 * @return {Boolean} is match
 * @api public
 */

Route.prototype.match = function (path) {
  return this.re.test(path);
};

/**
 * Given a path, return an object of
 * all path chunks that match up with
 * the expected keys of the path.
 *
 * @param {String} path
 * @return {Object} params
 * @api public
 */

Route.prototype.params = function (path) {
  var i = 1
    , keys = this.keys
    , params, m;

  m = path.match(this.re);

  if (this.path instanceof RegExp) {
    params = [];
    for (; i < m.length; i++) params.push(m[i]);
  } else {
    params = {};
    if (!keys.length) return params;
    for (; i < m.length; i++) params[keys[i - 1].key] = m[i] || null;
  }

  return params;
};
