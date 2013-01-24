/*!
 * Attach chai to global should
 */

global.chai = require('chai');
global.should = global.chai.should();

/*!
 * Chai Plugins
 */

global.chai.use(require('chai-spies'));
//global.chai.use(require('chai-http'));

/*!
 * Import project
 */

global.router = require('../..');

/*!
 * Helper to load internals for cov unit tests
 */

function req (name) {
  return process.env.router_COV
    ? require('../../lib-cov/router/' + name)
    : require('../../lib/router/' + name);
}

/*!
 * Load unexposed modules for unit tests
 */

global.__router = {
    methods: req('methods')
};
