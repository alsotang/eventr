# Eventr

[![Build Status](https://travis-ci.org/alsotang/eventr.svg?branch=master)](https://travis-ci.org/alsotang/eventr)


## usage

### normal usage

```js
it('should work with one event', function (done) {
  var et = new Eventr();
  et.emit('hello', 'ok');
  et.on('hello', function (edata) {
    edata.should.equal('ok');
    done();
  });
});
```

### event array

```js
it('should work with event array', function (done) {
  var et = new Eventr();
  fetchurl('google', function (err, content) {
    et.emit('page1', content);
  });
  fetchurl('yahoo', function (err, content) {
    et.emit('page2', content);
  });
  et.on(['page1', 'page2'], function (edata) {
    edata.page1.should.equal('pagecontentgoogle');
    edata.page2.should.equal('pagecontentyahoo');
    done();
  });
});
```

### chain two listeners

```js
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
```

## TODO

- [ ] browser support
- [ ] UMD support
- [ ] browser unit test