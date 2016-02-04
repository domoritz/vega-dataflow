var DataSource = require('./DataSource'),
  io = require('socket.io-client');

var QUERY = 'query';
var SOCKET = 'http://localhost:8080';

module.exports = function(graphProto) {
  // set up socket connection
  this._socket = io.connect(SOCKET);

  graphProto.setupDataMgr = function() {
    this.signal(QUERY).on(function(name, value) {
      this._socket.emit('query', value);
    });

    this._socket.on('values', function (data) {
      var ds = this._data[data.dataset];
      ds.values(data.values);
      ds.fire();
    }, this);

    this._socket.on('insert', function (data) {
      var ds = this._data[data.dataset];
      ds.insert(data.values);
      ds.fire();
    }, this);

    this._socket.on('remove', function () {
      // TODO
    }, this);

    this._socket.on('update', function () {
      // TODO
    }, this);
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
