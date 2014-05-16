var Eventr = require('../');

var fetchurl = function (url, callback) {
  var page = 'page ' + url;
  setTimeout(function () {
    callback(null, page);
  }, 5);
};

describe('eventr.js', function () {
  it('should work with one event', function () {
    var et = new Eventr();
    et.on('hello', function (edata) {
      edata.should.equal('ok');
    });
    et.emit('hello', 'ok');
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
      edata.page1.should.equal('page 1');
      edata.page2.should.equal('page 2');
      done();
    });
  });
});