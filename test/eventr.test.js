var Eventr = require('../');
var pedding = require('pedding');

var getRandom = function () {
  var result = Math.random() * 10;
  result = ~~result;
  return result;
};

var fetchurl = function (url, callback) {
  var page = 'pagecontent' + url;
  setTimeout(function () {
    callback(null, page);
  }, getRandom());
};

var fetchurlErr = function (url, callback) {
  setTimeout(function () {
    callback(new Error('404 status'));
  }, getRandom());
};

describe('eventr.js', function () {

  describe('`emit`', function () {

    it('should work with one event', function (done) {
      var et = new Eventr();
      et.emit('hello', 'ok');
      et.on('hello', function (edata) {
        edata.should.equal('ok');
        done();
      });
    });

    it('should work with event array', function (done) {
      var et = new Eventr();
      fetchurl('1', function (err, content) {
        et.emit('page1', content);
      });
      fetchurl('2', function (err, content) {
        et.emit('page2', content);
      });
      et.on(['page1', 'page2'], function (edata) {
        edata.page1.should.equal('pagecontent1');
        edata.page2.should.equal('pagecontent2');
        done();
      });
    });

    it('should work with multi listeners', function (done) {
      var et = new Eventr();

      fetchurl('1', function (err, content) {
        et.emit('page1', content);
      });
      fetchurl('2', function (err, content) {
        et.emit('page2', content);
      });
      done = pedding(2, done);

      et.on('page1', function (edata) {
        edata.should.equal('pagecontent1');
        done();
      });
      et.on(['page1', 'page2'], function (edata) {
        edata.page1.should.equal('pagecontent1');
        edata.page2.should.equal('pagecontent2');
        done();
      });
    });

    it('should work in order', function (done) {
      var et = new Eventr();
      fetchurl('file1', function (err, content) {
        et.emit('file1', content);
      });
      fetchurl('file2', function (err, content) {
        et.emit('file2', content);
      });
      et.on(['file1', 'file2'], function (edata) {
        et.emit('file3', edata);
      });
      et.on('file3', function (edata) {
        // concat file1 and file2
        var content = edata.file1 + edata.file2;
        content.should.equal('pagecontentfile1pagecontentfile2');
        done();
      });
    });
  });

  describe('`emitNow`', function () {

    it('should omit `ok1` when emit prematurely', function (done) {
      var et = new Eventr();
      et.emitNow('hello', 'ok1');
      et.on('hello', function (edata) {
        edata.should.not.equal('ok1');
        edata.should.equal('ok2');
        done();
      });
      et.emitNow('hello', 'ok2');
    });
  });

  describe('`done`', function () {
    it('should work with `done()`', function (done) {
      var et = new Eventr();
      fetchurl('1', et.done(function (content) {
        et.emit('page1', content);
      }));
      et.on('page1', function (edata) {
        edata.should.equal('pagecontent1');
        done();
      });
    });

    it('should work with `done(eventName)`', function (done) {
      var et = new Eventr();
      fetchurl('1', et.done('page1'));
      et.on('page1', function (edata) {
        edata.should.equal('pagecontent1');
        done();
      });
    });

    it('should work with `done(eventName, thenFn)`', function (done) {
      var et = new Eventr();
      fetchurl('1', et.done('page1', function (data) {
        return data + 'then';
      }));
      et.on('page1', function (edata) {
        edata.should.equal('pagecontent1then');
        done();
      });
    });
  });

  describe('`err`', function () {
    it('should `err(errHandler)`', function (done) {
      function errHandler(err) {}
      var et = new Eventr();
      et.err(errHandler);
      et._errFn.should.equal(errHandler);
      done();
    });

    it('should `err(err)`', function (done) {
      function errHandler(err) {
        err.should.Error;
        done();
      }
      var et = new Eventr();
      et.err(errHandler);
      fetchurlErr('google', et.done());
    });
  });

  describe('delegate to `async`', function () {
    it('should work with `Eventr.map`', function (done) {
      Eventr.map(['url1', 'url2', 'url3', 'url4'],
        function (item, callback) {
          fetchurl(item, callback);
        },
        function (err, results) {
          if (err) {
            return done(err);
          }
          results.should.eql([
            "pagecontenturl1",
            "pagecontenturl2",
            "pagecontenturl3",
            "pagecontenturl4"
          ]);
          done();
        });
    });

    it('should `et.map`', function (done) {
      var et = new Eventr();
      et.map(['url1', 'url2', 'url3', 'url4'],
        fetchurl,
        function (err, results) {
          if (err) {
            return done(err);
          }
          results.should.eql([
            "pagecontenturl1",
            "pagecontenturl2",
            "pagecontenturl3",
            "pagecontenturl4"
          ]);
          done();
        });
    });
  });
});