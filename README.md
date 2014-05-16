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
* [`chain two listeners`](#chain-two-listeners)
* [`#emitNow`](#emitnow)
* [`#done and #err`](#done-and-err)
* [`methods delegate to async.js`](#methods-delegate-to-asyncjs-httpsgithubcomcaolanasync)

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
    fetchurl('file3', et.done(function (content) {
      edata.file3 = content;
      et.emit('allfile', edata);
    }));
  });

  et.on('allfile', function (edata) {
    // concat file1 and file2
    var content = edata.file1 + edata.file2 + edata.file3;
    content.should.equal('pagecontentfile1pagecontentfile2pagecontentfile3');
    done();
  });
});
```

### #emitNow

when you call `et.emit('sth', data)`, the `sth` event would trigger in process.nextTick.
If you want it emit as soon as possible, call `et.emitNow('sth', data)`.

### #done and #err

`#done` would handle callback `err` for you.

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

`#done` has three forms. each from return a `function (err, data)`.

```js
et.done(eventName) // handle err, and auto `emit(eventName, data)`
et.done(eventName, thenFn) // handle err, and auto `emit(eventName, thenFn(data))`
et.done() // only handle err, you should emit manually
```

`#err` has two form.

```js
et.err(errHandler) // errHandler is a function, et.done would use it.
et.err(err) // err is a JS Error. et use errHandler to handle it
```

### methods delegate to async.js (https://github.com/caolan/async)
Eventr delegate all these *collection methods* to async.js.
so you can use them like use async.js

```js
[
  'each', 'eachSeries', 'eachLimit',
  'map', 'mapSeries', 'mapLimit',
  'filter', 'filterSeries',
  'reject', 'rejectSeries',
  'reduce', 'reduceRight',
  'detect', 'detectSeries',
  'sortBy', 'some',
  'every',
  'concat', 'concatSeries',
]
```

```js
var Eventr = require("Eventr");
Eventr.map(['file1','file2','file3'], fs.stat, function(err, results){
    // results is now an array of stats for each file
});

// or

var ep = new Eventr();
ep.map(['file1','file2','file3'], fs.stat, function(err, results){
    // results is now an array of stats for each file
});

```

## TODO

- [ ] browser support
- [ ] UMD support
- [ ] browser unit test