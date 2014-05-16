var DELIMITER1 = '@^_^@';
var DELIMITER2 = '@T_T@';

var emit = function (eventName, data) {
  var self = this;
  for (var eventKey in self._callbacks) {
    var eventNameArr = eventKey.split(DELIMITER1);
    if (eventNameArr.indexOf(eventName) != -1) {
      self._fired[eventKey + DELIMITER2 + eventName] = data;
      var eventNameKeyArr = eventNameArr.map(function (ename) {
        return eventKey + DELIMITER2 + ename;
      });
      var isAllFired = eventNameKeyArr.every(function (key) {
        return key in self._fired;
      });
      if (isAllFired) {
        var edata;
        if (eventNameKeyArr.length == 1) {
          edata = self._fired[eventNameKeyArr[0]];
        } else {
          edata = {};
          eventNameKeyArr.forEach(function (key) {
            var eventName = key.split(DELIMITER2)[1];
            edata[eventName] = self._fired[key];
            delete self._fired[key];
          });
        }
        self._callbacks[eventKey](edata);
      }
    }
  }
};


var Eventr = function () {
  if (!(this instanceof Eventr)) {
    return new Eventr();
  }
  this._callbacks = {};
  this._fired = {};
};

Eventr.prototype.on = function (eventName, callback) {
  var self = this;
  if (typeof eventName == 'string') {
    eventName = [eventName];
  }
  if (Array.isArray(eventName)) {
    var eventKey = eventName.join(DELIMITER1);
    self._callbacks[eventKey] = callback;
  }
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

module.exports = Eventr;