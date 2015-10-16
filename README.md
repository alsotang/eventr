# Eventr

[![Build Status](https://travis-ci.org/alsotang/eventr.svg?branch=master)](https://travis-ci.org/alsotang/eventr)

## install

`npm install eventr`

## quick example

```js
var Eventr = require('eventr');
var et = new Eventr();
et.emit('google', '!!!');
et.emit('bing', '???');
et.on(['google', 'bing'], function (edata) {
  console.log(edata.google); // => !!!
  console.log(edata.bing); // => ???
});
```

## usage

* [`normal usage`](#normal-usage)
* [`event array`](#event-array)
* [`chain multi listeners`](#chain-multi-listeners)
* [`map array to another`](#map-array-to-another)
* [`#emitNow`](#emitnow)
* [`#done and #err`](#done-and-err)
* [`methods delegate to async.js`](#methods-delegate-to-asyncjs-httpsgithubcomcaolanasync)

### normal usage

`et.on(eventName, function (edata) {})`

```js
it('should work with one event', function (done) {
  var et = new Eventr();
  et.emit('hello', 'ok');
  // edata is what you emit
  et.on('hello', function (edata) {
    edata.should.equal('ok');
    done();
  });
});
```

### event array

`et.on([eventName1, eventName2, ..], function (edata) {}`

```js
it('should work with event array', function (done) {
  var et = new Eventr();
  fetchurl('google', function (err, content) {
    et.emit('page1', content);
  });
  fetchurl('yahoo', function (err, content) {
    et.emit('page2', content);
  });
  // edata is a hash
  et.on(['page1', 'page2'], function (edata) {
    edata.page1.should.equal('pagecontentgoogle');
    edata.page2.should.equal('pagecontentyahoo');
    done();
  });
});
```

### chain multi listeners

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
    fetchurl('file3', et.done(function (content) {
      edata.file3 = content;
      et.emit('allfile', edata);
    }));
  });

  et.on('allfile', function (edata) {
    // concat file1 and file2 and file3
    var content = edata.file1 + edata.file2 + edata.file3;
    content.should.equal('pagecontentfile1pagecontentfile2pagecontentfile3');
    done();
  });
});
```

### map array to another

- `on(eventName, total, function (dataArr) {})`
- `emit(eventName, data, index)`
- `done(eventName, index)`

```js
it('should ensure `emit` order', function (done) {
  var et = new Eventr();
  et.on('doc', 5, function (docs) {
    docs.should.eql([1, 4, 9, 16, 25]);
    done();
  });

  var datas = [1, 2, 3, 4, 5];
  datas.forEach(function (d, idx) {
    setTimeout(function () {
      et.emit('doc', d * d, idx);
    }, 5 - d);
  });
});
```

### #emit and #emitNow

```js
et.emit('google', 'Im feeling lucky')
et.emitNow('google', 'Im feeling lucky')
```

when you call `et.emit('sth', data)`, the `sth` event would trigger in `process.nextTick`.
If you want it emit as soon as possible, call `et.emitNow('sth', data)`.

### #done and #err

`#done` would handle callback `err` for you.


`#done` has three forms. each form return a `function (err, data)`.

```js
et.done(eventName) // handle err, and auto `emit(eventName, data)`
et.done(eventName, thenFn) // handle err, and auto `emit(eventName, thenFn(data))`
et.done(callback) // only handle err, you should emit manually. `callback(data)` only receive data.
```

`#err` has two form.

```js
et.err(errHandler) // errHandler is a function, et.done would use it.
et.err(err) // err is a JS Error. et use errHandler to handle it
```

```js
it('should work with event array', function (done) {
  var et = new Eventr();
  et.err(done);
  fetchurl('google', et.done('page1'));
  fetchurl('yahoo', et.done('page2'));
  et.on(['page1', 'page2'], function (edata) {
    edata.page1.should.equal('pagecontentgoogle');
    edata.page2.should.equal('pagecontentyahoo');
    done();
  });
});
```

## TODO

- [ ] browser UMD support
