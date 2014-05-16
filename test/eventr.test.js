var Eventr = require('../');
var pedding = require('pedding');

var fetchurl = function (url, callback) {
  var page = 'pagecontent' + url;
  setTimeout(function () {
    callback(null, page);
  }, 5);
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

});