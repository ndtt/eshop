'use trict';

// *********************************************************************************
// =================================================================================
// Framework.Subscribe
// =================================================================================
// *********************************************************************************

function Subscribe(framework, req, res, type) {

	// type = 0 - GET, DELETE
	// type = 1 - POST, PUT
	// type = 2 - POST MULTIPART
	// type = 3 - file routing

	// this.controller;
	this.req = req;
	this.res = res;

	// Because of performance
	// this.route = null;
	// this.timeout = null;
	// this.isCanceled = false;
	// this.isTransfer = false;
	// this.header = '';
	// this.error = null;
}

Subscribe.prototype.success = function() {
	var self = this;

	self.timeout && clearTimeout(self.timeout);
	self.timeout = null;
	self.isCanceled = true;

	if (self.controller && self.controller.res) {
		self.controller.res.controller = null;
		self.controller = null;
	}

	return self;
};

Subscribe.prototype.file = function() {
	var self = this;
	self.req.on('end', () => self.doEndfile(this));
	self.req.resume();
	return self;
};

/**
 * Process MULTIPART (uploaded files)
 * @param {String} header Content-Type header.
 * @return {FrameworkSubscribe}
 */
Subscribe.prototype.multipart = function(header) {

	var self = this;
	var req = self.req;

	F.stats.request.upload++;
	self.route = F.lookup(req, req.uri.pathname, req.flags, 0);
	self.header = header;

	if (self.route) {
		F.path.verify('temp');
		framework_internal.parseMULTIPART(req, header, self.route, F.config['directory-temp'], self);
		return self;
	}

	F._request_stats(false, false);
	F.stats.request.blocked++;
	self.res.writeHead(403);
	self.res.end();
	return self;
};

Subscribe.prototype.urlencoded = function() {

	var self = this;
	self.route = F.lookup(self.req, self.req.uri.pathname, self.req.flags, 0);

	if (self.route) {
		self.req.buffer_has = true;
		self.req.buffer_exceeded = false;
		self.req.on('data', (chunk) => self.doParsepost(chunk));
		self.end();
		return self;
	}

	F.stats.request.blocked++;
	F._request_stats(false, false);
	self.res.writeHead(403);
	self.res.end();
	F.emit('request-end', self.req, self.res);
	self.req.clear(true);

	return self;
};

Subscribe.prototype.end = function() {
	var self = this;
	self.req.on('end', () => self.doEnd());
	self.req.resume();
};

/**
 * Execute controller
 * @private
 * @param {Number} status Default HTTP status.
 * @return {FrameworkSubscribe}
 */
Subscribe.prototype.execute = function(status, isError) {

	var self = this;
	var route = self.route;
	var req = self.req;
	var res = self.res;

	if (isError || !route) {
		F.stats.response['error' + status]++;
		status !== 500 && F.emit('error' + status, req, res, self.exception);
	}

	if (!route) {

		if (!status)
			status = 404;

		if (status === 400 && self.exception instanceof framework_builders.ErrorBuilder) {
			F.stats.response.errorBuilder++;
			req.$language && self.exception.setResource(req.$language);
			F.responseContent(req, res, 200, self.exception.output(), self.exception.contentType, F.config['allow-gzip']);
			return self;
		}

		F.responseContent(req, res, status, U.httpStatus(status) + prepare_error(self.exception), CONTENTTYPE_TEXTPLAIN, F.config['allow-gzip']);
		return self;
	}

	var name = route.controller;

	if (route.isMOBILE_VARY)
		req.$mobile = true;

	if (route.currentViewDirectory === undefined)
		route.currentViewDirectory = name && name[0] !== '#' && name !== 'default' && name !== 'unknown' ? '/' + name + '/' : '';

	var controller = new Controller(name, req, res, self, route.currentViewDirectory);

	controller.isTransfer = self.isTransfer;
	controller.exception = self.exception;
	self.controller = controller;

	if (!self.isCanceled && route.timeout) {
		self.timeout && clearTimeout(self.timeout);
		self.timeout = setTimeout(function() {
			self.controller && self.controller.precache && self.controller.precache(null, null, null);
			self.doCancel();
		}, route.timeout);
	}

	route.isDELAY && self.res.writeContinue();
	if (self.isSchema)
		req.body.$$controller = controller;

	if (!F._length_middleware || !route.middleware)
		self.doExecute();
	else
		async_middleware(0, req, res, route.middleware, () => self.doExecute(), route.options, controller);
};

Subscribe.prototype.prepare = function(flags, url) {

	var self = this;
	var req = self.req;
	var res = self.res;
	var auth = F.onAuthorize;

	if (auth) {
		var length = flags.length;
		auth(req, res, flags, function(isAuthorized, user) {

			var hasRoles = length !== flags.length;

			if (hasRoles)
				req.$flags += flags.slice(length).join('');

			if (typeof(isAuthorized) !== 'boolean') {
				user = isAuthorized;
				isAuthorized = !user;
			}

			req.isAuthorized = isAuthorized;
			self.doAuthorize(isAuthorized, user, hasRoles);
		});
		return self;
	}

	if (!self.route)
		self.route = F.lookup(req, req.buffer_exceeded ? '#431' : url || req.uri.pathname, req.flags, 0);

	if (!self.route)
		self.route = F.lookup(req, '#404', EMPTYARRAY, 0);

	var code = req.buffer_exceeded ? 431 : 404;

	if (!self.schema || !self.route)
		self.execute(code);
	else
		self.validate(self.route, () => self.execute(code));

	return self;
};

Subscribe.prototype.doExecute = function() {

	var self = this;
	var name = self.route.controller;
	var controller = self.controller;
	var req = self.req;

	try {

		if (F.onTheme)
			controller.themeName = F.onTheme(controller);

		if (controller.isCanceled)
			return self;

		F.emit('controller', controller, name, self.route.options);

		if (controller.isCanceled)
			return self;

		if (self.route.isCACHE && !F.temporary.other[req.uri.pathname])
			F.temporary.other[req.uri.pathname] = req.path;

		if (self.route.isGENERATOR)
			async.call(controller, self.route.execute, true)(controller, framework_internal.routeParam(self.route.param.length ? req.split : req.path, self.route));
		else
			self.route.execute.apply(controller, framework_internal.routeParam(self.route.param.length ? req.split : req.path, self.route));

	} catch (err) {
		controller = null;
		F.error(err, name, req.uri);
		self.exception = err;
		self.route = F.lookup(req, '#500', EMPTYARRAY, 0);
		self.execute(500, true);
	}

	return self;
};

Subscribe.prototype.doAuthorize = function(isLogged, user, roles) {

	var self = this;
	var req = self.req;
	var membertype = isLogged ? 1 : 2;

	req.$flags += membertype

	if (user)
		req.user = user;

	if (self.route && self.route.isUNIQUE && !roles && (!self.route.MEMBER || self.route.MEMBER === membertype)) {
		if (self.schema)
			self.validate(self.route, () => self.execute(code));
		else
			self.execute(req.buffer_exceeded ? 431 : 401, true);
		return;
	}

	var route = F.lookup(req, req.buffer_exceeded ? '#431' : req.uri.pathname, req.flags, req.buffer_exceeded ? 0 : membertype);
	var status = req.$isAuthorized ? 404 : 401;
	var code = req.buffer_exceeded ? 431 : status;

	if (!route)
		route = F.lookup(req, '#' + status, EMPTYARRAY, 0);

	self.route = route;

	if (self.route && self.schema)
		self.validate(self.route, () => self.execute(code));
	else
		self.execute(code);

	return self;
};

Subscribe.prototype.doEnd = function() {

	var self = this;
	var req = self.req;
	var res = self.res;
	var route = self.route;

	if (req.buffer_exceeded) {
		route = F.lookup(req, '#431', EMPTYARRAY, 0);
		req.buffer_data = null;

		if (!route) {
			F.response431(req, res);
			return self;
		}

		self.route = route;
		self.execute(431, true);
		return self;
	}

	if (req.buffer_data && (!route || !route.isBINARY))
		req.buffer_data = req.buffer_data.toString(ENCODING);

	if (!req.buffer_data) {
		if (route && route.schema)
			self.schema = true;
		req.buffer_data = null;
		self.prepare(req.flags, req.uri.pathname);
		return self;
	}

	if (route.isXML) {

		if (req.$type !== 2) {
			self.route400('Invalid "Content-Type".');
			req.buffer_data = null;
			return self;
		}

		try {
			req.body = F.onParseXML(req.buffer_data.trim(), req);
			req.buffer_data = null;
			self.prepare(req.flags, req.uri.pathname);
		} catch (err) {
			F.error(err, null, req.uri);
			self.route500(err);
		}
		return self;
	}

	if (self.route.isRAW) {
		req.body = req.buffer_data;
		req.buffer_data = null;
		self.prepare(req.flags, req.uri.pathname);
		return self;
	}

	if (!req.$type) {
		req.buffer_data = null;
		self.route400('Invalid "Content-Type".');
		return self;
	}

	if (req.$type === 1) {
		try {
			req.body = F.onParseJSON(req.buffer_data, req);
			req.buffer_data = null;
		} catch (e) {
			self.route400('Invalid JSON data.');
			return self;
		}
	} else
		req.body = F.onParseQuery(req.buffer_data, req);

	if (self.route.schema)
		self.schema = true;

	req.buffer_data = null;
	self.prepare(req.flags, req.uri.pathname);
	return self;
};

Subscribe.prototype.validate = function(route, next) {
	var self = this;
	var req = self.req;
	self.schema = false;

	if (!route.schema || req.method === 'DELETE')
		return next();

	F.onSchema(req, route.schema[0], route.schema[1], function(err, body) {

		if (err) {
			self.route400(err);
			next = null;
		} else {
			F.stats.request.schema++;
			req.body = body;
			self.isSchema = true;
			next();
		}

	}, route.schema[2]);
};

Subscribe.prototype.route400 = function(problem) {
	var self = this;
	self.route = F.lookup(self.req, '#400', EMPTYARRAY, 0);
	self.exception = problem;
	self.execute(400, true);
	return self;
};

Subscribe.prototype.route500 = function(problem) {
	var self = this;
	self.route = F.lookup(self.req, '#500', EMPTYARRAY, 0);
	self.exception = problem;
	self.execute(500, true);
	return self;
};

Subscribe.prototype.doEndfile = function() {

	var self = this;
	var req = self.req;
	var res = self.res;

	if (!F._length_files)
		return F.responseStatic(self.req, self.res);

	for (var i = 0; i < F._length_files; i++) {

		var file = F.routes.files[i];
		try {

			if (file.extensions && !file.extensions[self.req.extension])
				continue;

			if (file.url) {
				var skip = false;
				var length = file.url.length;

				if (!file.wildcard && !file.fixedfile && length !== req.path.length - 1)
					continue;

				for (var j = 0; j < length; j++) {
					if (file.url[j] === req.path[j])
						continue;
					skip = true;
					break;
				}

				if (skip)
					continue;

			} else if (file.onValidate && !file.onValidate.call(framework, req, res, true))
				continue;

			if (file.middleware)
				self.doEndfile_middleware(file);
			else
				file.execute.call(framework, req, res, false);

			return self;

		} catch (err) {
			F.error(err, file.controller, req.uri);
			F.responseContent(req, res, 500, '500 - internal server error', CONTENTTYPE_TEXTPLAIN, F.config['allow-gzip']);
			return self;
		}
	}

	F.responseStatic(self.req, self.res);
};

/**
 * Executes a file middleware
 * @param {FileRoute} file
 * @return {Subscribe}
 */
Subscribe.prototype.doEndfile_middleware = function(file) {
	var self = this;
	async_middleware(0, self.req, self.res, file.middleware, function() {
		try {
			file.execute.call(framework, self.req, self.res, false);
		} catch (err) {
			F.error(err, file.controller + ' :: ' + file.name, self.req.uri);
			F.responseContent(self.req, self.res, 500, '500 - internal server error', CONTENTTYPE_TEXTPLAIN, F.config['allow-gzip']);
		}
	}, file.options);
};

/**
 * Parse data from CHUNK
 * @param {Buffer} chunk
 * @return {FrameworkSubscribe}
 */
Subscribe.prototype.doParsepost = function(chunk) {

	var self = this;
	var req = self.req;

	if (req.buffer_exceeded)
		return self;

	if (!req.buffer_exceeded)
		req.buffer_data = Buffer.concat([req.buffer_data, chunk]);

	if (req.buffer_data.length < self.route.length)
		return self;

	req.buffer_exceeded = true;
	req.buffer_data = U.createBuffer();
	return self;
};

Subscribe.prototype.doCancel = function() {
	var self = this;

	F.stats.response.timeout++;
	clearTimeout(self.timeout);
	self.timeout = null;

	if (!self.controller)
		return;

	self.controller.isTimeout = true;
	self.controller.isCanceled = true;
	self.route = F.lookup(self.req, '#408', EMPTYARRAY, 0);
	self.execute(408, true);
};