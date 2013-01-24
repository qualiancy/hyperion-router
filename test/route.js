var noop = function () {};

describe('Route', function () {
  describe('.match()', function () {
    var app = new router.Router();

    it('should match a basic route', function () {
      var root = app.addRoute('get', '/', noop)
        , blog = app.addRoute('get', '/blog', noop);
      root.match('/').should.be.true;
      root.match('/blog').should.be.false;
      blog.match('/').should.be.false;
      blog.match('/blog').should.be.true;
    });
  });

  describe('.params()', function () {
    var app = new router.Router();

    it('should return an empty object when no keys tagged', function () {
      var root = app.addRoute('get', '/', noop);
      root.params('/')
        .should.deep.equal({});
    });

    it('should handle a single key', function () {
      var blog = app.addRoute('get', '/blog/:id', noop);
      blog.params('/blog/123')
        .should.deep.equal({ id: '123' });
    });

    it('should handle an optional key', function () {
      var json = app.addRoute('get', '/api/:path.:format?', noop);
      json.params('/api/user.json')
        .should.deep.equal({ path: 'user', format: 'json' });
      json.params('/api/user')
        .should.deep.equal({ path: 'user', format: null });
    });
  });
});
