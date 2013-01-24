var parsePath = require('hyperion-parse-path');

module.exports = Route;

function Route (method, path, callbacks) {
  var keys = [];
  this.callbacks = callbacks || [];
  this.re = parsePath(path, keys);
  this.keys = keys;
}

Route.prototype.match = function (path) {
  return this.re.test(path);
};

Route.prototype.params = function (path) {
  var i = 1
    , keys = this.keys
    , params = {}
    , m;

  if (!keys.length) return params;

  m = path.match(this.re);

  for (; i < m.length; i++) {
    params[keys[i - 1].key] = m[i] || null;
  }

  return params;
};
