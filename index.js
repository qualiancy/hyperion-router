module.exports = process.env.router_COV
  ? require('./lib-cov/router')
  : require('./lib/router');
