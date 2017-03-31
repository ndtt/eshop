'use strict';


/**
 * Add a cookie into the response
 * @param {String} name
 * @param {Object} value
 * @param {Date/String} expires
 * @param {Object} options Additional options.
 * @return {Response}
 */
http.ServerResponse.prototype.cookie = function(name, value, expires, options) {

	var self = this;

	if (self.headersSent || self.success)
		return;

	var cookieHeaderStart = name + '=';
	var builder = [cookieHeaderStart + value];
	var type = typeof(expires);

	if (expires && !U.isDate(expires) && type === 'object') {
		options = expires;
		expires = options.expires || options.expire || null;
	}

	if (type === 'string')
		expires = expires.parseDateExpiration();

	if (!options)
		options = {};

	options.path = options.path || '/';
	expires &&  builder.push('Expires=' + expires.toUTCString());
	options.domain && builder.push('Domain=' + options.domain);
	options.path && builder.push('Path=' + options.path);
	options.secure && builder.push('Secure');

	if (options.httpOnly || options.httponly || options.HttpOnly)
		builder.push('HttpOnly');

	var arr = self.getHeader('set-cookie') || [];

	// Cookie, already, can be in array, resulting in duplicate 'set-cookie' header
	var idx = arr.findIndex(cookieStr => cookieStr.startsWith(cookieHeaderStart));
	idx !== -1 && arr.splice(idx, 1);
	arr.push(builder.join('; '));
	self.setHeader('Set-Cookie', arr);
	return self;
};

/**
 * Disable HTTP cache for current response
 * @return {Response}
 */
http.ServerResponse.prototype.noCache = function() {
	var self = this;
	self.removeHeader(RESPONSE_HEADER_CACHECONTROL);
	self.removeHeader('Etag');
	self.removeHeader('Last-Modified');
	return self;
};

/**
 * Send
 * @param {Number} code Response status code, optional
 * @param {Object} body Body
 * @param {String} type Content-Type, optional
 * @return {Response}
 */
http.ServerResponse.prototype.send = function(code, body, type) {

	var self = this;

	if (self.headersSent)
		return self;

	self.controller && self.controller.subscribe.success();

	var res = self;
	var req = self.req;
	var contentType = type;
	var isHEAD = req.method === 'HEAD';

	if (body === undefined) {
		body = code;
		code = 200;
	}

	switch (typeof(body)) {
		case 'string':
			if (!contentType)
				contentType = 'text/html';
			break;

		case 'number':
			if (!contentType)
				contentType = 'text/plain';
			body = U.httpStatus(body);
			break;

		case 'boolean':
		case 'object':
			if (!isHEAD) {
				if (body instanceof framework_builders.ErrorBuilder) {
					body = obj.output();
					contentType = obj.contentType;
					F.stats.response.errorBuilder++;
				} else
					body = JSON.stringify(body);
				if (!contentType)
					contentType = 'application/json';
			}
			break;
	}

	var accept = req.headers['accept-encoding'] || '';
	var headers = {};

	headers[RESPONSE_HEADER_CACHECONTROL] = 'private';
	headers['Vary'] = 'Accept-Encoding' + (req.$mobile ? ', User-Agent' : '');

	// Safari resolve
	if (contentType === 'application/json')
		headers[RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';

	if ((/text|application/).test(contentType))
		contentType += '; charset=utf-8';

	headers[RESPONSE_HEADER_CONTENTTYPE] = contentType;
	F.responseCustom(req, res);

	if (!accept && isGZIP(req))
		accept = 'gzip';

	var compress = accept.indexOf('gzip') !== -1;

	if (isHEAD) {
		if (compress)
			headers['Content-Encoding'] = 'gzip';
		res.writeHead(200, headers);
		res.end();
		return self;
	}

	if (!compress) {
		res.writeHead(code, headers);
		res.end(body, ENCODING);
		return self;
	}

	var buffer = U.createBuffer(body);
	Zlib.gzip(buffer, function(err, data) {

		if (err) {
			res.writeHead(code, headers);
			res.end(body, ENCODING);
			return;
		}

		headers['Content-Encoding'] = 'gzip';
		res.writeHead(code, headers);
		res.end(data, ENCODING);
	});

	return self;
};

http.ServerResponse.prototype.throw400 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response400(this.req, this, problem);
};

http.ServerResponse.prototype.setModified = function(value) {
	F.setModified(this.req, this, value);
	return this;
};

http.ServerResponse.prototype.throw401 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response401(this.req, this, problem);
};

http.ServerResponse.prototype.throw403 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response403(this.req, this, problem);
};

http.ServerResponse.prototype.throw404 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response404(this.req, this, problem);
};

http.ServerResponse.prototype.throw408 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response408(this.req, this, problem);
};

http.ServerResponse.prototype.throw431 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response431(this.req, this, problem);
};

http.ServerResponse.prototype.throw500 = function(error) {
	this.controller && this.controller.subscribe.success();
	F.response500(this.req, this, error);
};

http.ServerResponse.prototype.throw501 = function(problem) {
	this.controller && this.controller.subscribe.success();
	F.response501(this.req, this, problem);
};

/**
 * Responds with a static file
 * @param {Function} done Optional, callback.
 * @return {Response}
 */
http.ServerResponse.prototype.continue = function(done) {
	var self = this;
	if (self.headersSent) {
		done && done();
		return self;
	}
	self.controller && self.controller.subscribe.success();
	F.responseStatic(self.req, self, done);
	return self;
};

/**
 * Response custom content
 * @param {Number} code
 * @param {String} body
 * @param {String} type
 * @param {Boolean} compress Disallows GZIP compression. Optional, default: true.
 * @param {Object} headers Optional, additional headers.
 * @return {Response}
 */
http.ServerResponse.prototype.content = function(code, body, type, compress, headers) {
	var self = this;
	if (self.headersSent)
		return self;
	self.controller && self.controller.subscribe.success();
	F.responseContent(self.req, self, code, body, type, compress, headers);
	return self;
};

/**
 * Response redirect
 * @param {String} url
 * @param {Boolean} permanent Optional, default: false.
 * @return {Framework}
 */
http.ServerResponse.prototype.redirect = function(url, permanent) {
	var self = this;
	if (self.headersSent)
		return self;
	self.controller && self.controller.subscribe.success();
	F.responseRedirect(self.req, self, url, permanent);
	return self;
};

/**
 * Responds with a file
 * @param {String} filename
 * @param {String} download Optional, a download name.
 * @param {Object} headers Optional, additional headers.
 * @param {Function} done Optional, callback.
 * @return {Framework}
 */
http.ServerResponse.prototype.file = function(filename, download, headers, done) {
	var self = this;
	if (self.headersSent) {
		done && done();
		return self;
	}
	self.controller && self.controller.subscribe.success();
	F.responseFile(self.req, self, filename, download, headers, done);
	return self;
};

/**
 * Responds with a stream
 * @param {String} contentType
 * @param {Stream} stream
 * @param {String} download Optional, a download name.
 * @param {Object} headers Optional, additional headers.
 * @param {Function} done Optional, callback.
 * @return {Framework}
 */
http.ServerResponse.prototype.stream = function(contentType, stream, download, headers, done, nocompress) {
	var self = this;
	if (self.headersSent) {
		done && done();
		return self;
	}

	self.controller && self.controller.subscribe.success();
	F.responseStream(self.req, self, contentType, stream, download, headers, done, nocompress);
	return self;
};

/**
 * Responds with an image
 * @param {String or Stream} filename
 * @param {String} fnProcess
 * @param {Object} headers Optional, additional headers.
 * @param {Function} done Optional, callback.
 * @return {Framework}
 */
http.ServerResponse.prototype.image = function(filename, fnProcess, headers, done) {
	var self = this;
	if (self.headersSent) {
		done && done();
		return self;
	}
	self.controller && self.controller.subscribe.success();
	F.responseImage(self.req, self, filename, fnProcess, headers, done);
	return self;
};

/**
 * Response JSON
 * @param {Object} obj
 * @return {Response}
 */
http.ServerResponse.prototype.json = function(obj) {
	var self = this;
	return self.send(200, obj, 'application/json');
};

var _tmp = http.IncomingMessage.prototype;

http.IncomingMessage.prototype = {

	get ip() {

		var self = this;
		if (self._ip)
			return self._ip;

		//  x-forwarded-for: client, proxy1, proxy2, ...
		var proxy = self.headers['x-forwarded-for'];
		if (proxy)
			self._ip = proxy.split(',', 1)[0] || self.connection.remoteAddress;
		else if (!self._ip)
			self._ip = self.connection.remoteAddress;

		return self._ip;
	},

	get query() {
		var self = this;
		if (self._dataGET)
			return self._dataGET;
		self._dataGET = F.onParseQuery(self.uri.query, self);
		return self._dataGET;
	},

	set query(value) {
		this._dataGET = value;
	},

	get subdomain() {

		var self = this;

		if (self._subdomain)
			return self._subdomain;

		var subdomain = self.uri.host.toLowerCase().replace(/^www\./i, '').split('.');
		if (subdomain.length > 2)
			self._subdomain = subdomain.slice(0, subdomain.length - 2); // example: [subdomain].domain.com
		else
			self._subdomain = null;

		return self._subdomain;
	},

	get host() {
		return this.headers['host'];
	},

	get split() {
		if (this.$path)
			return this.$path;
		return this.$path = framework_internal.routeSplit(this.uri.pathname, true);
	},

	get secured() {
		return this.uri.protocol === 'https:' || this.uri.protocol === 'wss:';
	},

	get language() {
		if (!this.$language)
			this.$language = (((this.headers['accept-language'] || '').split(';')[0] || '').split(',')[0] || '').toLowerCase();
		return this.$language;
	},

	get mobile() {
		if (this.$mobile === undefined)
			this.$mobile = REG_MOBILE.test(this.headers['user-agent']);
		return this.$mobile;
	},

	get robot() {
		if (this.$robot === undefined)
			this.$robot = REG_ROBOT.test(this.headers['user-agent']);
		return this.$robot;
	},

	set language(value) {
		this.$language = value;
	}
};

// Handle errors of decodeURIComponent
function $decodeURIComponent(value) {
	try
	{
		return decodeURIComponent(value);
	} catch (e) {
		return value;
	}
};

http.IncomingMessage.prototype.__proto__ = _tmp;

/**
 * Signature request (user-agent + ip + referer + current URL + custom key)
 * @param {String} key Custom key.
 * @return {Request}
 */
http.IncomingMessage.prototype.signature = function(key) {
	return F.encrypt((this.headers['user-agent'] || '') + '#' + this.ip + '#' + this.url + '#' + (key || ''), 'request-signature', false);
};

/**
 * Disable HTTP cache for current request
 * @return {Request}
 */
http.IncomingMessage.prototype.noCache = function() {
	delete this.headers['if-none-match'];
	delete this.headers['if-modified-since'];
	return this;
};

http.IncomingMessage.prototype.notModified = function(compare, strict) {
	return F.notModified(this, this.res, compare, strict);
};

/**
 * Read a cookie from current request
 * @param {String} name Cookie name.
 * @return {String} Cookie value (default: '')
 */
http.IncomingMessage.prototype.cookie = function(name) {

	if (this.cookies)
		return $decodeURIComponent(this.cookies[name] || '');

	var cookie = this.headers['cookie'];
	if (!cookie)
		return '';

	this.cookies = {};

	var arr = cookie.split(';');

	for (var i = 0, length = arr.length; i < length; i++) {
		var line = arr[i].trim();
		var index = line.indexOf('=');
		if (index !== -1)
			this.cookies[line.substring(0, index)] = line.substring(index + 1);
	}

	return $decodeURIComponent(this.cookies[name] || '');
};

/**
 * Read authorization header
 * @return {Object}
 */
http.IncomingMessage.prototype.authorization = function() {

	var authorization = this.headers['authorization'];
	if (!authorization)
		return HEADERS.authorization;

	var result = { user: '', password: '', empty: true };

	try {
		var arr = U.createBuffer(authorization.replace('Basic ', '').trim(), 'base64').toString(ENCODING).split(':');
		result.user = arr[0] || '';
		result.password = arr[1] || '';
		result.empty = !result.user || !result.password;
	} catch (e) {}

	return result;
};

/**
 * Authorization for custom delegates
 * @param  {Function(err, userprofile, isAuthorized)} callback
 * @return {Request}
 */
http.IncomingMessage.prototype.authorize = function(callback) {

	var auth = F.onAuthorize;

	if (!auth) {
		callback(null, null, false);
		return this;
	}

	var req = this;

	auth(req, req.res, req.flags, function(isAuthorized, user) {
		if (typeof(isAuthorized) !== 'boolean') {
			user = isAuthorized;
			isAuthorized = !user;
		}
		req.isAuthorized = isAuthorized;
		callback(null, user, isAuthorized);
	});

	return this;
};

/**
 * Clear all uplaoded files
 * @private
 * @param {Boolean} isAuto
 * @return {Request}
 */
http.IncomingMessage.prototype.clear = function(isAuto) {

	var self = this;
	var files = self.files;

	if (!files || (isAuto && self._manual))
		return self;

	self.body = null;
	self.query = null;
	self.cookies = null;

	var length = files.length;
	if (!length)
		return self;

	var arr = [];
	for (var i = 0; i < length; i++)
		files[i].rem && arr.push(files[i].path);

	F.unlink(arr);
	self.files = null;
	return self;
};

/**
 * Get host name from URL
 * @param {String} path Additional path.
 * @return {String}
 */
http.IncomingMessage.prototype.hostname = function(path) {

	var self = this;
	var uri = self.uri;

	if (path && path[0] !== '/')
		path = '/' + path;

	return uri.protocol + '//' + uri.hostname + (uri.port && uri.port !== 80 ? ':' + uri.port : '') + (path || '');
};