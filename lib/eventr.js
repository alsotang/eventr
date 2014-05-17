var DELIMITER1 = '@^_^@';
var DELIMITER2 = '@T_T@';
var DELIMITER3 = '@-_-@';

var emit = function (eventName, data) {
  var self = this;

  for (var eventKey in self._callbacks) {
    var ref = eventKey.split(DELIMITER3);
    var eventNameArr = ref[0].split(DELIMITER1);
    var total = Number(ref[1]);

    if (~eventNameArr.indexOf(eventName)) {
      var eventNameKey = eventKey + DELIMITER2 + eventName;

      if (!self._fired[eventNameKey]) {
        self._fired[eventNameKey] = [];
      }
      self._fired[eventNameKey].push(data);

      var eventNameKeyArr = eventNameArr.map(function (ename) {
        return eventKey + DELIMITER2 + ename;
      });
      var isAllFired = eventNameKeyArr.every(function (key) {
        return key in self._fired;
      });

      if (isAllFired && total == self._fired[eventNameKey].length) {
        var edata = {};
        eventNameKeyArr.forEach(function (key) {
          var eventName = key.split(DELIMITER2)[1];
          edata[eventName] = self._fired[key];
          if (total == 1) {
            edata[eventName] = edata[eventName][0];
          }
          delete self._fired[key];
        });
        if (eventNameArr.length == 1) {
          edata = edata[eventName];
        }

        self._callbacks[eventKey].forEach(function (cb) {
          cb(edata);
        });
      }
    }
  }
};

// Eventr constructor
var Eventr = function () {
  if (!(this instanceof Eventr)) {
    return new Eventr();
  }
  this._callbacks = {};
  this._fired = {};
};

Eventr.prototype.on = function (eventName, total, callback) {
  var self = this;
  if (typeof total == 'function' && !callback) {
    callback = total;
    total = 1;
  }
  if (typeof eventName == 'string') {
    eventName = [eventName];
  }
  var eventKey = eventName.join(DELIMITER1) + DELIMITER3 + total;
  if (!self._callbacks[eventKey]) {
    self._callbacks[eventKey] = [];
  }
  self._callbacks[eventKey].push(callback);
};

Eventr.prototype.emit = function () {
  var self = this;
  var args = arguments;
  process.nextTick(function () {
    emit.apply(self, args);
  });
};

Eventr.prototype.emitNow = function () {
  var self = this;
  var args = arguments;
  emit.apply(self, args);
};

Eventr.prototype.err = function (err) {
  if (typeof err == 'function') {
    this._errFn = err;
    return;
  }
  this._errFn(err);
};

Eventr.prototype.done = function (eventName, thenFn) {
  var self = this;
  return function (err, data) {
    if (err) {
      return self.err(err, data);
    }
    if (typeof eventName == 'function') {
      eventName(data);
      return;
    }
    if (typeof thenFn == 'function') {
      data = thenFn(data);
    }
    self.emit(eventName, data);
  };
};

module.exports = Eventr;