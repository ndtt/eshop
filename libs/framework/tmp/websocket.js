'use strict';

const Events = require('events');

// *********************************************************************************
// =================================================================================
// F.WebSocket
// =================================================================================
// *********************************************************************************

const NEWLINE = '\r\n';
const SOCKET_RESPONSE = 'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: {0}\r\n\r\n';
const SOCKET_RESPONSE_PROTOCOL = 'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: {0}\r\nSec-WebSocket-Protocol: {1}\r\n\r\n';
const SOCKET_RESPONSE_ERROR = 'HTTP/1.1 403 Forbidden\r\nConnection: close\r\nX-WebSocket-Reject-Reason: 403 Forbidden\r\n\r\n';
const SOCKET_HASH = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const SOCKET_ALLOW_VERSION = [13];

function WebSocket(path, name, id) {
	this._keys = [];
	this.id = id;
	this.online = 0;
	this.connections = {};
	this.repository = {};
	this.name = name;
	this.isController = true;
	this.url = U.path(path);
	this.route = null;

	// on('open', function(client) {});
	// on('close', function(client) {});
	// on('message', function(client, message) {});
	// on('error', function(error, client) {});
	// Events.EventEmitter.call(this);
}

WebSocket.prototype = {

	get global() {
		return F.global;
	},

	get config() {
		return F.config;
	},

	get cache() {
		return F.cache;
	},

	get isDebug() {
		return F.config.debug;
	},

	get path() {
		return F.path;
	},

	get fs() {
		return F.fs;
	},

	get isSecure() {
		return this.req.isSecure;
	},

	get secured() {
		return this.req.secured;
	},
}

WebSocket.prototype.__proto__ = Object.create(Events.EventEmitter.prototype, {
	constructor: {
		value: WebSocket,
		enumberable: false
	}
});

/**
 * Sends a message
 * @param {String} message
 * @param {String Array or Function(id, client)} id
 * @param {String Array or Function(id, client)} blacklist
 * @param {String} raw internal
 * @return {WebSocket}
 */
WebSocket.prototype.send = function(message, id, blacklist, replacer) {

	var keys = this._keys;
	if (!keys || !keys.length)
		return this;

	var data;
	var raw = false;

	for (var i = 0, length = keys.length; i < length; i++) {

		var _id = keys[i];
		var conn = this.connections[_id];

		if (id) {
			if (id instanceof Array) {
				if (!websocket_valid_array(_id, id))
					continue;
			} else if (id instanceof Function) {
				if (!websocket_valid_fn(_id, conn, id))
					continue;
			} else
				throw new Error('Invalid "id" argument.');
		}

		if (blacklist) {
			if (blacklist instanceof Array) {
				if (websocket_valid_array(_id, blacklist))
					continue;
			} else if (blacklist instanceof Function) {
				if (websocket_valid_fn(_id, conn, blacklist))
					continue;
			} else
				throw new Error('Invalid "blacklist" argument.');
		}

		if (data === undefined) {
			if (conn.type === 3) {
				raw = true;
				data = JSON.stringify(message, replacer);
			} else
				data = message;
		}

		conn.send(data, raw);
		F.stats.response.websocket++;
	}

	return this;
};

function websocket_valid_array(id, arr) {
	return arr.indexOf(id) !== -1;
}

function websocket_valid_fn(id, client, fn) {
	return fn && fn(id, client) ? true : false;
}

/**
 * Sends a ping message
 * @return {WebSocket}
 */
WebSocket.prototype.ping = function() {

	var keys = this._keys;
	if (!keys)
		return this;

	var length = keys.length;
	if (!length)
		return this;

	this.$ping = true;
	F.stats.other.websocketPing++;

	for (var i = 0; i < length; i++)
		this.connections[keys[i]].ping();

	return this;
};

/**
 * Closes a connection
 * @param {String Array} id Client id, optional, default `null`.
 * @param {String} message A message for the browser.
 * @param {Number} code Optional default 1000.
 * @return {Websocket}
 */
WebSocket.prototype.close = function(id, message, code) {

	var keys = this._keys;

	if (!keys)
		return this;

	if (typeof(id) === 'string') {
		code = message;
		message = id;
		id = null;
	}

	var length = keys.length;
	if (!length)
		return this;

	if (!id || !id.length) {
		for (var i = 0; i < length; i++) {
			var _id = keys[i];
			this.connections[_id].close(message, code);
			this._remove(_id);
		}
		this._refresh();
		return this;
	}

	var is = id instanceof Array;
	var fn = typeof(id) === 'function' ? id : null;

	for (var i = 0; i < length; i++) {

		var _id = keys[i];
		if (is && id.indexOf(_id) === -1)
			continue;

		var conn = this.connections[_id];
		if (fn && !fn.call(this, _id, conn))
			continue;

		conn.close(message, code);
		this._remove(_id);
	}

	this._refresh();
	return this;
};

/**
 * Error caller
 * @param {Error/String} err
 * @return {WebSocket/Function}
 */
WebSocket.prototype.error = function(err) {
	var result = F.error(typeof(err) === 'string' ? new Error(err) : err, this.name, this.path);
	return err === undefined ? result : this;
};

/**
 * Creates a problem
 * @param {String} message
 * @return {WebSocket}
 */
WebSocket.prototype.wtf = WebSocket.prototype.problem = function(message) {
	F.problem(message, this.name, this.uri);
	return this;
};

/**
 * Creates a change
 * @param {String} message
 * @return {WebSocket}
 */
WebSocket.prototype.change = function(message) {
	F.change(message, this.name, this.uri, this.ip);
	return this;
};

/**
 * The method executes a provided function once per client.
 * @param {Function(connection, index)} fn
 * @return {WebSocket}
 */
WebSocket.prototype.all = function(fn) {
	if (this._keys) {
		for (var i = 0, length = this._keys.length; i < length; i++)
			fn(this.connections[this._keys[i]], i);
	}
	return this;
};

/**
 * Finds a connection
 * @param {String} id
 * @return {WebSocketClient}
 */
WebSocket.prototype.find = function(id) {
	var self = this;

	if (!self._keys)
		return self;

	var length = self._keys.length;
	var isFn = typeof(id) === 'function';

	for (var i = 0; i < length; i++) {
		var connection = self.connections[self._keys[i]];

		if (!isFn) {
			if (connection.id === id)
				return connection;
			continue;
		}

		if (id(connection, connection.id))
			return connection;
	}

	return null;
};

/**
 * Destroyes a WebSocket controller
 * @param {String} problem Optional.
 * @return {WebSocket}
 */
WebSocket.prototype.destroy = function(problem) {
	var self = this;

	problem && self.problem(problem);
	if (!self.connections && !self._keys)
		return self;

	self.close();
	self.emit('destroy');

	setTimeout(function() {

		self._keys.forEach(function(key) {
			var conn = self.connections[key];
			if (conn) {
				conn._isClosed = true;
				conn.socket.removeAllListeners();
				conn.removeAllListeners();
			}
		});

		self.connections = null;
		self._keys = null;
		self.route = null;
		self.buffer = null;
		delete F.connections[self.id];
		self.removeAllListeners();
	}, 1000);

	return self;
};

/**
 * Enables auto-destroy websocket controller when any user is not online
 * @param {Function} callback
 * @return {WebSocket]
 */
WebSocket.prototype.autodestroy = function(callback) {
	var self = this;
	var key = 'websocket:' + self.id;
	self.on('open', () => clearTimeout2(key));
	self.on('close', function() {
		!self.online && setTimeout2(key, function() {
			callback && callback.call(self);
			self.destroy();
		}, 5000);
	});
	return self;
};

/**
 * Internal function
 * @return {WebSocket}
 */
WebSocket.prototype._refresh = function() {
	if (this.connections) {
		this._keys = Object.keys(this.connections);
		this.online = this._keys.length;
	} else
		this.online = 0;
	return this;
};

/**
 * Internal function
 * @param {String} id
 * @return {WebSocket}
 */
WebSocket.prototype._remove = function(id) {
	if (this.connections)
		delete this.connections[id];
	return this;
};

/**
 * Internal function
 * @param {WebSocketClient} client
 * @return {WebSocket}
 */
WebSocket.prototype._add = function(client) {
	this.connections[client._id] = client;
	return this;
};

/**
 * A resource header
 * @param {String} name A resource name.
 * @param {String} key A resource key.
 * @return {String}
 */
WebSocket.prototype.resource = function(name, key) {
	return F.resource(name, key);
};

WebSocket.prototype.log = function() {
	F.log.apply(framework, arguments);
	return this;
};

WebSocket.prototype.logger = function() {
	F.logger.apply(framework, arguments);
	return this;
};

WebSocket.prototype.check = function() {

	if (!this.$ping)
		return this;

	this.all(function(client) {
		if (client.$ping)
			return;
		client.close();
		F.stats.other.websocketCleaner++;
	});

	return this;
};