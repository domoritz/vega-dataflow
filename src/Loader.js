var Base = require('./Node').prototype,
    Deps = require('./Dependencies'),
    io = require('socket.io-client');

var QUERY = 'query';
var SOCKET = 'http://localhost:8080';

function Loader(ds) {
  this._ds = ds;
  Base.init.call(this, ds._graph);

  // set router to guarantee that node will be evaluated
	this.router(true);

	// expect a signal called "query"
	this.dependency(Deps.SIGNALS, [QUERY]);

	// set up socket connection
	this._socket = io.connect(SOCKET);

	this._socket.on('set', function (data) {
		ds.values(data);
    ds.fire();
  });
}

var prototype = (Loader.prototype = Object.create(Base));
prototype.constructor = Loader;

prototype.evaluate = function(pulse) {
	var signals = pulse.signals;
	if (signals[QUERY]) {
		var query = this._ds._graph.signal(QUERY).value();
		this._socket.emit('query', query);
	}

	return pulse;
};

module.exports = Loader;