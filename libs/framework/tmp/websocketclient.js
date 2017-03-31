'use strict';

/**
 * WebSocket controller
 * @param {Request} req
 * @param {Socket} socket
 * @param {String} head
 */
function WebSocketClient(req, socket, head) {
	this.$ping = true;
	this.container;
	this._id;
	this.id = '';
	this.socket = socket;
	this.req = req;
	// this.isClosed = false;
	this.errors = 0;
	this.buffer = U.createBufferSize();
	this.length = 0;

	// 1 = raw - not implemented
	// 2 = plain
	// 3 = JSON

	this.type = 2;
	// this._isClosed = false;
}

WebSocketClient.prototype = {

	get protocol() {
		return (this.req.headers['sec-websocket-protocol'] || '').replace(REG_EMPTY, '').split(',');
	},

	get ip() {
		return this.req.ip;
	},

	get get() {
		return this.req.query;
	},

	get query() {
		return this.req.query;
	},

	get uri() {
		return this.req.uri;
	},

	get config() {
		return this.container.config;
	},

	get global() {
		return this.container.global;
	},

	get session() {
		return this.req.session;
	},

	set session(value) {
		this.req.session = value;
	},

	get user() {
		return this.req.user;
	},

	set user(value) {
		this.req.user = value;
	}
};

WebSocketClient.prototype.__proto__ = Object.create(Events.EventEmitter.prototype, {
	constructor: {
		value: WebSocketClient,
		enumberable: false
	}
});

WebSocketClient.prototype.isWebSocket = true;

WebSocketClient.prototype.cookie = function(name) {
	return this.req.cookie(name);
};

WebSocketClient.prototype.prepare = function(flags, protocols, allow, length, version) {

	flags = flags || EMPTYARRAY;
	protocols = protocols || EMPTYARRAY;
	allow = allow || EMPTYARRAY;

	this.length = length;

	var origin = this.req.headers['origin'] || '';
	var length = allow.length;

	if (length) {
		if (allow.indexOf('*') === -1) {
			for (var i = 0; i < length; i++) {
				if (origin.indexOf(allow[i]) === -1)
					return false;
			}
		}
	}

	length = protocols.length;
	if (length) {
		for (var i = 0; i < length; i++) {
			if (this.protocol.indexOf(protocols[i]) === -1)
				return false;
		}
	}

	if (SOCKET_ALLOW_VERSION.indexOf(U.parseInt(this.req.headers['sec-websocket-version'])) === -1)
		return false;

	var header = protocols.length ? SOCKET_RESPONSE_PROTOCOL.format(this._request_accept_key(this.req), protocols.join(', ')) : SOCKET_RESPONSE.format(this._request_accept_key(this.req));
	this.socket.write(U.createBuffer(header, 'binary'));

	this._id = (this.ip || '').replace(/\./g, '') + U.GUID(20);
	this.id = this._id;
	return true;
};

/**
 * Add a container to client
 * @param {WebSocket} container
 * @return {WebSocketClient}
 */
WebSocketClient.prototype.upgrade = function(container) {

	var self = this;
	self.container = container;

	//self.socket.setTimeout(0);
	//self.socket.setNoDelay(true);
	//self.socket.setKeepAlive(true, 0);

	self.socket.on('data', n => self._ondata(n));
	self.socket.on('error', n => self._onerror(n));
	self.socket.on('close', () => self._onclose());
	self.socket.on('end', () => self._onclose());
	self.container._add(self);
	self.container._refresh();

	F.emit('websocket-begin', self.container, self);
	self.container.emit('open', self);
	return self;
};

/**
 * Internal handler written by Jozef Gula
 * @param {Buffer} data
 * @return {Framework}
 */
WebSocketClient.prototype._ondata = function(data) {

	if (data)
		this.buffer = Buffer.concat([this.buffer, data]);

	if (this.buffer.length > this.length) {
		this.errors++;
		this.container.emit('error', new Error('Maximum request length exceeded.'), this);
		return;
	}

	switch (this.buffer[0] & 0x0f) {
		case 0x01:
			// text message or JSON message
			this.type !== 1 && this.parse();
			break;
		case 0x02:
			// binary message
			this.type === 1 && this.parse();
			break;
		case 0x08:
			// close
			this.close();
			break;
		case 0x09:
			// ping, response pong
			this.socket.write(U.getWebSocketFrame(0, '', 0x0A));
			this.buffer = U.createBufferSize();
			this.$ping = true;
			break;
		case 0x0a:
			// pong
			this.$ping = true;
			this.buffer = U.createBufferSize();
			break;
	}
};

// MIT
// Written by Jozef Gula
WebSocketClient.prototype.parse = function() {

	var bLength = this.buffer[1];
	if (((bLength & 0x80) >> 7) !== 1)
		return this;

	var length = U.getMessageLength(this.buffer, F.isLE);
	var index = (this.buffer[1] & 0x7f);

	index = (index == 126) ? 4 : (index == 127 ? 10 : 2);
	if ((index + length + 4) > (this.buffer.length))
		return this;

	var mask = U.createBufferSize(4);
	this.buffer.copy(mask, 0, index, index + 4);

	// TEXT
	if (this.type !== 1) {
		var output = '';
		for (var i = 0; i < length; i++)
			output += String.fromCharCode(this.buffer[index + 4 + i] ^ mask[i % 4]);

		// JSON
		if (this.type === 3) {
			try {
				output = this.container.config['default-websocket-encodedecode'] === true ? $decodeURIComponent(output) : output;
				output.isJSON() && this.container.emit('message', this, F.onParseJSON(output, this.req));
			} catch (ex) {
				if (DEBUG) {
					this.errors++;
					this.container.emit('error', new Error('JSON parser: ' + ex.toString()), this);
				}
			}
		} else
			this.container.emit('message', this, this.container.config['default-websocket-encodedecode'] === true ? $decodeURIComponent(output) : output);
	} else {
		var binary = U.createBufferSize(length);
		for (var i = 0; i < length; i++)
			binary[i] = this.buffer[index + 4 + i] ^ mask[i % 4];
		this.container.emit('message', this, new Uint8Array(binary).buffer);
	}

	this.buffer = this.buffer.slice(index + length + 4, this.buffer.length);
	this.buffer.length >= 2 && U.getMessageLength(this.buffer, F.isLE) && this.parse();
	return this;
};

WebSocketClient.prototype._onerror = function(err) {

	if (this.isClosed)
		return;

	if (REG_WEBSOCKET_ERROR.test(err.stack)) {
		this.isClosed = true;
		this._onclose();
	} else
		this.container.emit('error', err, this);
};

WebSocketClient.prototype._onclose = function() {
	if (this._isClosed)
		return;
	this.isClosed = true;
	this._isClosed = true;
	this.container._remove(this._id);
	this.container._refresh();
	this.container.emit('close', this);
	this.socket.removeAllListeners();
	this.removeAllListeners();
	F.emit('websocket-end', this.container, this);
};

/**
 * Sends a message
 * @param {String/Object} message
 * @param {Boolean} raw The message won't be converted e.g. to JSON.
 * @return {WebSocketClient}
 */
WebSocketClient.prototype.send = function(message, raw, replacer) {

	if (this.isClosed)
		return this;

	if (this.type !== 1) {
		var data = this.type === 3 ? (raw ? message : JSON.stringify(message, replacer)) : (message || '').toString();
		if (this.container.config['default-websocket-encodedecode'] === true && data)
			data = encodeURIComponent(data);
		this.socket.write(U.getWebSocketFrame(0, data, 0x01));
	} else
		message && this.socket.write(U.getWebSocketFrame(0, new Int8Array(message), 0x02));

	return this;
};

/**
 * Ping message
 * @return {WebSocketClient}
 */
WebSocketClient.prototype.ping = function() {
	if (this.isClosed)
		return this;
	this.socket.write(U.getWebSocketFrame(0, '', 0x09));
	this.$ping = false;
	return this;
};

/**
 * Close connection
 * @param {String} message Message.
 * @param {Number} code WebSocket code.
 * @return {WebSocketClient}
 */
WebSocketClient.prototype.close = function(message, code) {
	if (this.isClosed)
		return this;
	this.isClosed = true;
	this.socket.end(U.getWebSocketFrame(code || 1000,  message ? encodeURIComponent(message) : '', 0x08));
	return this;
};

/**
 * Create a signature for the WebSocket
 * @param {Request} req
 * @return {String}
 */
WebSocketClient.prototype._request_accept_key = function(req) {
	var sha1 = Crypto.createHash('sha1');
	sha1.update((req.headers['sec-websocket-key'] || '') + SOCKET_HASH);
	return sha1.digest('base64');
};
