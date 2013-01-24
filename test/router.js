describe('Router', function () {
  describe('.addRoute()', function () {
    it('should add a new route', function () {
      var app = new router.Router()
        , route = app.addRoute('get', '/', function () {});
    });
  });

  describe('.map()', function () {
    var app = new router.Router()
      , map = app.map();

    it('should return a function', function () {
      map.should.be.a('function');
    });

    it('should have all http methods as object methods', function () {
      __router.methods.forEach(function (method) {
        map.should.have.property(method)
          .a('function');
      });
    });
  });

  describe('.dispatch()', function () {
    it('should handle a simple request w/ response', function (done) {
      var app = new router.Router()
        , map = app.map();

      var cb = chai.spy(function (req, res, next) {
        arguments.should.have.length(3);
        req.should.have.property('method', 'GET');
        req.should.have.property('url', '/');
        req.should.have.property('index', 0);
        req.should.have.property('params')
          .deep.equal({});
        res.should.be.an('object')
          .deep.equal({});
        next();
      });

      map('/', cb);

      var req = {
          method: 'GET'
        , url: '/'
      };

      app.dispatch(req, {}, function (err, result) {
        cb.should.have.been.called.once;
        done();
      });
    });

    it('should handle a simple request w/o response', function (done) {
      var app = new router.Router()
        , map = app.map();

      var cb = chai.spy(function (req, next) {
        arguments.should.have.length(2);
        req.should.have.property('method', 'GET');
        req.should.have.property('url', '/');
        req.should.have.property('index', 0);
        req.should.have.property('params')
          .deep.equal({});
        next.should.be.a('function');
        next();
      });

      map('/', cb);

      var req = {
          method: 'GET'
        , url: '/'
      };

      app.dispatch(req, function (err, result) {
        cb.should.have.been.called.once;
        done();
      });
    });

    it('should emit pre/post events', function (done) {
      var app = new router.Router()
        , map = app.map();

      var pre = chai.spy('pre')
        , post = chai.spy('post');

      app.on('dispatch:pre', pre);
      app.on('dispatch:post', post);

      var cb = chai.spy(function (req, next) {
        next();
      });

      var req = {
          method: 'GET'
        , url: '/'
      };

      map('/', cb);

      app.dispatch(req, function (err, result) {
        pre.should.have.been.called.once;
        post.should.have.been.called.once;
        pre.should.have.always.been.called.with.exactly({ method: 'GET', path: '/' });
        post.should.have.always.been.called.with.exactly(
            { method: 'GET', path: '/' }
          , null
          , null
        );
        done();
      });
    });

    it('should dispatch correct method', function (done) {
      var app = new router.Router()
        , map = app.map();

      var get = chai.spy('get')
        , post = chai.spy('post', function (req, next) {
            next();
          })

      var req = {
          method: 'POST'
        , url: '/'
      };

      map.get('/', get);
      map.post('/', post);

      app.dispatch(req, function (err, result) {
        get.should.not.have.been.called;
        post.should.have.been.called.once;
        done();
      });
    });

    it('should provide the correct params', function (done) {
      var app = new router.Router()
        , map = app.map();

      var one = chai.spy('one', function (req, next) {
        req.params.should.have.property('page', 'ping');
        req.params.should.not.have.property('blog');
        next();
      });

      var two = chai.spy('two', function (req, next) {
        req.params.should.have.property('blog', 'ping');
        req.params.should.not.have.property('page');
        next();
      });

      map.get('/:page', one);
      map.get('/:blog', two);

      var req = {
          method: 'GET'
        , url: '/ping'
      };

      app.dispatch(req, function (err, result) {
        done();
      });
    });
  });
});
