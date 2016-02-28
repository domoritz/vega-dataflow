var DataSource = require('./DataSource'),
  io = require('socket.io-client');

var QUERY = 'query';
var SOCKET = 'http://localhost:8080';

function column2row(data) {
  var fields = Object.keys(data);
  var values = [];
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    while (values.length < data[field].length) {
      values.push({});
    }
    for (var j = 0; j < data[field].length; j++) {
      values[j][field] = data[field][j];
    }
  }
  return values;
}

module.exports = function(graphProto) {
  // set up socket connection
  var socket = io.connect(SOCKET);

  graphProto.setupDataMgr = function() {
    var self = this;

    // connect all signals to the socket
    Object.keys(this._signals).forEach(function(name) {
      var signal = self.signal(name);
      signal.on(function(name, value) {
        socket.emit('signal', {
          name: name,
          value: value
        });
      });

      // send initial values to socket
      socket.emit('signal', {
        name: name,
        value: signal.value()
      });
    });

    socket.on('values', function(data) {
      var ds = self._data[data.dataset];
      ds.values(column2row(data.values));
      ds.fire();
    });

    socket.on('insert', function(data) {
      var ds = self._data[data.dataset];
      ds.insert(data.values);
      ds.fire();
    });

    socket.on('remove', function () {
      // TODO
    });

    socket.on('update', function () {
      // TODO
    });
  };

  graphProto.data = function(name, pipeline, facet) {
    var db = this._data;
    if (!arguments.length) {
      var all = [], key;
      for (key in db) { all.push(db[key]); }
      return all;
    } else if (arguments.length === 1) {
      return db[name];
    } else {
      return (db[name] = new DataSource(this, name, facet).pipeline(pipeline));
    }
  };
};
