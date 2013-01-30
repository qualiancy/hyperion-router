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

    it('should match a regexp route', function () {
      var pull = app.addRoute('get', /\/([^\/]+)\/info\/refs$/, noop);
      pull.match('/repo/subrepo/info/refs').should.be.true;
      pull.match('/repo/subrepo/HEAD').should.be.false;
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

    it('should handle regexp parsing as key', function () {
      var pull = app.addRoute('get', /\/([^\/]+)\/info\/refs$/, noop)
        , push = app.addRoute('post', /\/([^\/]+)\/git-(.+)/, noop);
      pull.params('/repo/info/refs')
        .should.deep.equal([ 'repo' ]);
      push.params('/repo/git-upload-pack')
        .should.deep.equal([ 'repo', 'upload-pack' ]);
    });

    it('should not throw when no keys are available', function () {
      var notes = app.addRoute('get', '*', noop)
        , params;

      (function () {
        params = notes.params('/notes');
      }).should.not.throw();

      params.should.deep.equal({});
    });
  });
});
