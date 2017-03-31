'use strict';

// *********************************************************************************
// =================================================================================
// Framework.Controller
// =================================================================================
// *********************************************************************************

const EMPTYREQUEST = { uri: {} };

Object.freeze(EMPTYREQUEST);

/**
 * FrameworkController
 * @class
 * @param {String} name Controller name.
 * @param {Request} req
 * @param {Response} res
 * @param {FrameworkSubscribe} subscribe
 */
function Controller(name, req, res, subscribe, currentView) {

	this.subscribe = subscribe;
	this.name = name;
	// this.exception;

	// Sets the default language
	if (req) {
		this.language = req.$language;
		this.req = req;
	} else
		this.req = EMPTYREQUEST;

	// controller.type === 0 - classic
	// controller.type === 1 - server sent events
	this.type = 0;

	// this.layoutName = F.config['default-layout'];
	// this.themeName = F.config['default-theme'];

	this.status = 200;

	// this.isLayout = false;
	// this.isCanceled = false;
	// this.isTimeout = false;
	// this.isTransfer = false;

	this.isConnected = true;
	this.isController = true;
	this.repository = {};

	// render output
	// this.output = null;
	// this.outputPartial = null;
	// this.$model = null;

	this._currentView = currentView;

	if (res) {
		this.res = res;
		this.res.controller = this;
	} else
		this.res = EMPTYOBJECT;
}

Controller.prototype = {

	get schema() {
		return this.route.schema[0] === 'default' ? this.route.schema[1] : this.route.schema.join('/');
	},

	get workflow() {
		return this.route.schema_workflow;
	},

	get sseID() {
		return this.req.headers['last-event-id'] || null;
	},

	get route() {
		return this.subscribe.route;
	},

	get options() {
		return this.subscribe.route.options;
	},

	get flags() {
		return this.subscribe.route.flags;
	},

	get path() {
		return F.path;
	},

	get get() {
		OBSOLETE('controller.get', 'Instead of controller.get use controller.query');
		return this.req.query;
	},

	get query() {
		return this.req.query;
	},

	get post() {
		OBSOLETE('controller.post', 'Instead of controller.post use controller.body');
		return this.req.body;
	},

	get body() {
		return this.req.body;
	},

	get files() {
		return this.req.files;
	},

	get subdomain() {
		return this.req.subdomain;
	},

	get ip() {
		return this.req.ip;
	},

	get xhr() {
		return this.req.xhr;
	},

	get url() {
		return U.path(this.req.uri.pathname);
	},

	get uri() {
		return this.req.uri;
	},

	get cache() {
		return F.cache;
	},

	get config() {
		return F.config;
	},

	get controllers() {
		return F.controllers;
	},

	get isProxy() {
		return this.req.isProxy;
	},

	get isDebug() {
		return F.config.debug;
	},

	get isTest() {
		return this.req.headers['x-assertion-testing'] === '1';
	},

	get isSecure() {
		return this.req.isSecure;
	},

	get secured() {
		return this.req.secured;
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

	get referrer() {
		return this.req.headers['referer'] || '';
	},

	set user(value) {
		this.req.user = value;
	},

	get mobile() {
		return this.req.mobile;
	},

	get robot() {
		return this.req.robot;
	},

	get viewname() {
		var name = this.req.path[this.req.path.length - 1];
		if (!name || name === '/')
			name = 'index';
		return name;
	}
};

// ======================================================
// PROTOTYPES
// ======================================================

// Schema operations

Controller.prototype.$get = Controller.prototype.$read = function(helper, callback) {
	this.getSchema().get(helper, callback, this);
	return this;
};

Controller.prototype.$query = function(helper, callback) {
	this.getSchema().query(helper, callback, this);
	return this;
};

Controller.prototype.$save = function(helper, callback) {
	var self = this;
	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		self.body.$save(helper, callback);
	} else {
		var model = self.getSchema().default();
		model.$$controller = self;
		model.$save(helper, callback);
	}
	return self;
};

Controller.prototype.$remove = function(helper, callback) {
	var self = this;
	self.getSchema().remove(helper, callback, self);
	return this;
};

Controller.prototype.$workflow = function(name, helper, callback) {
	var self = this;
	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		self.body.$workflow(name, helper, callback);
	} else
		self.getSchema().workflow2(name, helper, callback, self);
	return self;
};

Controller.prototype.$workflow2 = function(name, helper, callback) {
	var self = this;
	self.getSchema().workflow2(name, helper, callback, self);
	return self;
};

Controller.prototype.$hook = function(name, helper, callback) {
	var self = this;
	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		self.body.$hook(name, helper, callback);
	} else
		self.getSchema().hook2(name, helper, callback, self);
	return self;
};

Controller.prototype.$hook2 = function(name, helper, callback) {
	var self = this;
	self.getSchema().hook2(name, helper, callback, self);
	return self;
};

Controller.prototype.$transform = function(name, helper, callback) {
	var self = this;
	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		self.body.$transform(name, helper, callback);
	} else
		self.getSchema().transform2(name, helper, callback, self);
	return self;
};

Controller.prototype.$transform2 = function(name, helper, callback) {
	var self = this;
	self.getSchema().transform2(name, helper, callback, self);
	return self;
};

Controller.prototype.$operation = function(name, helper, callback) {
	var self = this;
	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		self.body.$operation(name, helper, callback);
	} else
		self.getSchema().operation2(name, helper, callback, self);
	return self;
};

Controller.prototype.$operation2 = function(name, helper, callback) {
	var self = this;
	self.getSchema().operation2(name, helper, callback, self);
	return self;
};

Controller.prototype.$exec = function(name, helper, callback) {
	var self = this;

	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		self.body.$exec(name, helper, callback);
		return self;
	}

	var tmp = self.getSchema().create();
	tmp.$$controller = self;
	tmp.$exec(name, helper, callback);
	return self;
};

Controller.prototype.$async = function(callback, index) {
	var self = this;

	if (framework_builders.isSchema(self.body)) {
		self.body.$$controller = self;
		return self.body.$async(callback, index);
	}

	var model = self.getSchema().default();
	model.$$controller = self;
	return model.$async(callback, index);
};

Controller.prototype.getSchema = function() {
	var route = this.subscribe.route;
	if (!route.schema || !route.schema[1])
		throw new Error('The controller\'s route does not define any schema.');
	var schema = GETSCHEMA(route.schema[0], route.schema[1]);
	if (schema)
		return schema;
	throw new Error('Schema "{0}" does not exist.'.format(route.schema[1]));
};

/**
 * Renders component
 * @param {String} name A component name
 * @param {Object} settings Optional, settings.
 * @return {String}
 */
Controller.prototype.component = function(name, settings) {
	var self = this;
	var filename = F.components.views[name];

	if (filename) {
		var generator = framework_internal.viewEngine(name, filename, self);
		if (generator) {
			self.repository[REPOSITORY_COMPONENTS] = true;
			return generator.call(self, self, self.repository, self.$model, self.session, self.query, self.body, self.url, F.global, F.helpers, self.user, self.config, F.functions, 0, self.outputPartial, self.req.cookie, self.req.files, self.req.mobile, settings || EMPTYOBJECT);
		}
	}

	F.error('Error: A component "{0}" doesn\'t exist.'.format(name), self.name, self.uri);
	return '';
};

/**
 * Reads / Writes cookie
 * @param {String} name
 * @param {String} value
 * @param {String/Date} expires
 * @param {Object} options
 * @return {String/Controller}
 */
Controller.prototype.cookie = function(name, value, expires, options) {
	var self = this;
	if (value === undefined)
		return self.req.cookie(name);
	self.res.cookie(name, value, expires, options);
	return self;
};

/**
 * Clears uploaded files
 * @return {Controller}
 */
Controller.prototype.clear = function() {
	var self = this;
	self.req.clear();
	return self;
};

/**
 * Translates text
 * @param {String} text
 * @return {String}
 */
Controller.prototype.translate = function(language, text) {

	if (!text) {
		text = language;
		language = this.language;
	}

	return F.translate(language, text);
};

/**
 * Exec middleware
 * @param {String Array} names Middleware name.
 * @param {Object} options Custom options for middleware.
 * @param {Function} callback
 * @return {Controller}
 */
Controller.prototype.middleware = function(names, options, callback) {

	if (typeof(names) === 'string')
		names = [names];

	if (typeof(options) === 'function') {
		var tmp = callback;
		callback = options;
		options = tmp;
	}

	if (!options)
		options = EMPTYOBJECT;

	var self = this;
	async_middleware(0, self.req, self.res, names, () => callback && callback(), options, self);
	return self;
};

/**
 * Creates a pipe between the current request and target URL
 * @param {String} url
 * @param {Object} headers Optional, custom headers.
 * @param {Function(err)} callback Optional.
 * @return {Controller}
 */
Controller.prototype.pipe = function(url, headers, callback) {

	var self = this;

	if (typeof(headers) === 'function') {
		var tmp = callback;
		callback = headers;
		headers = tmp;
	}

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	F.responsePipe(self.req, self.res, url, headers, null, function() {
		self.subscribe.success();
		callback && callback();
	});

	return self;
};

Controller.prototype.encrypt = function() {
	return F.encrypt.apply(framework, arguments);
};

Controller.prototype.decrypt = function() {
	return F.decrypt.apply(framework, arguments);
};

/**
 * Creates a hash (alias for F.hash())
 * @return {Controller}
 */
Controller.prototype.hash = function() {
	return F.hash.apply(framework, arguments);
};

/**
 * Sets a response header
 * @param {String} name
 * @param {String} value
 * @return {Controller}
 */
Controller.prototype.header = function(name, value) {
	this.res.setHeader(name, value);
	return this;
};

/**
 * Gets a hostname
 * @param {String} path
 * @return {Controller}
 */
Controller.prototype.host = function(path) {
	return this.req.hostname(path);
};

Controller.prototype.hostname = function(path) {
	return this.req.hostname(path);
};

Controller.prototype.resource = function(name, key) {
	return F.resource(name, key);
};

/**
 * Error caller
 * @param {Error/String} err
 * @return {Controller/Function}
 */
Controller.prototype.error = function(err) {
	var self = this;

	// Custom errors
	if (err instanceof ErrorBuilder) {
		self.content(err);
		return self;
	}

	var result = F.error(typeof(err) === 'string' ? new Error(err) : err, self.name, self.uri);

	if (err === undefined)
		return result;

	if (self.subscribe) {
		self.subscribe.exception = err;
		self.exception = err;
	}

	return self;
};

Controller.prototype.invalid = function(status) {
	var self = this;

	if (status)
		self.status = status;

	var builder = new ErrorBuilder();
	setImmediate(n => self.content(builder));
	return builder;
};

/**
 * Registers a new problem
 * @param {String} message
 * @return {Controller}
 */
Controller.prototype.wtf = Controller.prototype.problem = function(message) {
	F.problem(message, this.name, this.uri, this.ip);
	return this;
};

/**
 * Registers a new change
 * @param {String} message
 * @return {Controller}
 */
Controller.prototype.change = function(message) {
	F.change(message, this.name, this.uri, this.ip);
	return this;
};

/**
 * Trace
 * @param {String} message
 * @return {Controller}
 */
Controller.prototype.trace = function(message) {
	F.trace(message, this.name, this.uri, this.ip);
	return this;
};

/**
 * Transfer to new route
 * @param {String} url Relative URL.
 * @param {String Array} flags Route flags (optional).
 * @return {Boolean}
 */
Controller.prototype.transfer = function(url, flags) {

	var self = this;
	var length = F.routes.web.length;
	var path = framework_internal.routeSplit(url.trim());

	var isSystem = url[0] === '#';
	var noFlag = !flags || flags.length === 0 ? true : false;
	var selected = null;

	self.req.$isAuthorized = true;

	for (var i = 0; i < length; i++) {

		var route = F.routes.web[i];

		if (route.isASTERIX) {
			if (!framework_internal.routeCompare(path, route.url, isSystem, true))
				continue;
		} else {
			if (!framework_internal.routeCompare(path, route.url, isSystem))
				continue;
		}

		if (noFlag) {
			selected = route;
			break;
		}

		if (route.flags && route.flags.length) {
			var result = framework_internal.routeCompareFlags(route.flags, flags, true);
			if (result === -1)
				self.req.$isAuthorized = false;
			if (result < 1)
				continue;
		}

		selected = route;
		break;
	}


	if (!selected)
		return false;

	self.cancel();
	self.req.path = EMPTYARRAY;
	self.subscribe.isTransfer = true;
	self.subscribe.success();
	self.subscribe.route = selected;
	self.subscribe.execute(404);
	return true;

};

Controller.prototype.cancel = function() {
	this.isCanceled = true;
	return this;
};

Controller.prototype.log = function() {
	F.log.apply(framework, arguments);
	return this;
};

Controller.prototype.logger = function() {
	F.logger.apply(framework, arguments);
	return this;
};

Controller.prototype.meta = function() {
	var self = this;

	if (arguments[0])
		self.repository[REPOSITORY_META_TITLE] = arguments[0];

	if (arguments[1])
		self.repository[REPOSITORY_META_DESCRIPTION] = arguments[1];

	if (arguments[2] && arguments[2].length)
		self.repository[REPOSITORY_META_KEYWORDS] = arguments[2] instanceof Array ? arguments[2].join(', ') : arguments[2];

	if (arguments[3])
		self.repository[REPOSITORY_META_IMAGE] = arguments[3];

	return self;
};

Controller.prototype.$dns = function(value) {

	var builder = '';
	var length = arguments.length;

	for (var i = 0; i < length; i++)
		builder += '<link rel="dns-prefetch" href="' + this._preparehostname(arguments[i]) + '" />';

	this.head(builder);
	return '';
};

Controller.prototype.$prefetch = function() {

	var builder = '';
	var length = arguments.length;

	for (var i = 0; i < length; i++)
		builder += '<link rel="prefetch" href="' + this._preparehostname(arguments[i]) + '" />';

	this.head(builder);
	return '';
};

Controller.prototype.$prerender = function(value) {

	var builder = '';
	var length = arguments.length;

	for (var i = 0; i < length; i++)
		builder += '<link rel="prerender" href="' + this._preparehostname(arguments[i]) + '" />';

	this.head(builder);
	return '';
};

Controller.prototype.$next = function(value) {
	this.head('<link rel="next" href="' + this._preparehostname(value) + '" />');
	return '';
};

Controller.prototype.$prev = function(value) {
	this.head('<link rel="prev" href="' + this._preparehostname(value) + '" />');
	return '';
};

Controller.prototype.$canonical = function(value) {
	this.head('<link rel="canonical" href="' + this._preparehostname(value) + '" />');
	return '';
};

Controller.prototype.$meta = function() {
	var self = this;

	if (arguments.length) {
		self.meta.apply(self, arguments);
		return '';
	}

	F.emit('controller-render-meta', self);
	var repository = self.repository;
	return F.onMeta.call(self, repository[REPOSITORY_META_TITLE], repository[REPOSITORY_META_DESCRIPTION], repository[REPOSITORY_META_KEYWORDS], repository[REPOSITORY_META_IMAGE]);
};

Controller.prototype.title = function(value) {
	this.$title(value);
	return this;
};

Controller.prototype.description = function(value) {
	this.$description(value);
	return this;
};

Controller.prototype.keywords = function(value) {
	this.$keywords(value);
	return this;
};

Controller.prototype.author = function(value) {
	this.$author(value);
	return this;
};

Controller.prototype.$title = function(value) {
	if (value)
		this.repository[REPOSITORY_META_TITLE] = value;
	return '';
};

Controller.prototype.$title2 = function(value) {
	var current = this.repository[REPOSITORY_META_TITLE];
	if (value)
		this.repository[REPOSITORY_META_TITLE] = (current ? current : '') + value;
	return '';
};

Controller.prototype.$description = function(value) {
	if (value)
		this.repository[REPOSITORY_META_DESCRIPTION] = value;
	return '';
};

Controller.prototype.$keywords = function(value) {
	if (value && value.length)
		this.repository[REPOSITORY_META_KEYWORDS] = value instanceof Array ? value.join(', ') : value;
	return '';
};

Controller.prototype.$author = function(value) {
	if (value)
		this.repository[REPOSITORY_META_AUTHOR] = value;
	return '';
};

Controller.prototype.sitemap_navigation = function(name, language) {
	return F.sitemap_navigation(name, language || this.language);
};

Controller.prototype.sitemap_url = function(name, a, b, c, d, e, f) {
	if (!name)
		name = this.repository[REPOSITORY_SITEMAP];
	var item = F.sitemap(name, true, this.language);
	return item ? item.url.format(a, b, c, d, e, f) : '';
};

Controller.prototype.sitemap_name = function(name, a, b, c, d, e, f) {
	if (!name)
		name = this.repository[REPOSITORY_SITEMAP];
	var item = F.sitemap(name, true, this.language);
	return item ? item.name.format(a, b, c, d, e, f) : '';
};

Controller.prototype.sitemap_change = function(name, type, a, b, c, d, e, f) {

	var self = this;
	var sitemap = self.repository[REPOSITORY_SITEMAP];

	if (!sitemap)
		sitemap = self.sitemap(name);

	if (!sitemap.$cloned) {
		sitemap = U.clone(sitemap);
		sitemap.$cloned = true;
		self.repository[REPOSITORY_SITEMAP] = sitemap;
	}

	var isFn = typeof(a) === 'function';

	for (var i = 0, length = sitemap.length; i < length; i++) {

		var item = sitemap[i];
		if (item.id !== name)
			continue;

		var tmp = item[type];

		if (isFn)
			item[type] = a(item[type]);
		else if (type === 'name')
			item[type] = item.formatName ? item[type].format(a, b, c, d, e, f) : a;
		else if (type === 'url')
			item[type] = item.formatUrl ? item[type].format(a, b, c, d, e, f) : a;
		else
			item[type] = a;

		if (type === 'name' && self.repository[REPOSITORY_META_TITLE] === tmp)
			self.repository[REPOSITORY_META_TITLE] = item[type];

		return self;
	}

	return self;
};

Controller.prototype.sitemap_replace = function(name, title, url) {
	var self = this;
	var sitemap = self.repository[REPOSITORY_SITEMAP];
	if (!sitemap)
		sitemap = self.sitemap(name);

	if (!sitemap.$cloned) {
		sitemap = U.clone(sitemap);
		sitemap.$cloned = true;
		self.repository[REPOSITORY_SITEMAP] = sitemap;
	}

	for (var i = 0, length = sitemap.length; i < length; i++) {
		var item = sitemap[i];
		if (item.id !== name)
			continue;
		var is = self.repository[REPOSITORY_META_TITLE] === item.name;
		item.name = typeof(title) === 'function' ? title(item.name) : item.formatName ? item.name.format(title) : title;
		item.url = typeof(url) === 'function' ? url(item.url) : item.formatUrl ? item.url.format(url) : url;
		if (is)
			self.repository[REPOSITORY_META_TITLE] = item.name;
		return self;
	}

	return self;
};

Controller.prototype.$sitemap_change = function(name, type, value, format) {
	this.sitemap_change.apply(this, arguments);
	return '';
};

Controller.prototype.$sitemap_replace = function(name, title, url, format) {
	this.sitemap_replace.apply(this, arguments);
	return '';
};

Controller.prototype.sitemap = function(name) {
	var self = this;
	var sitemap;

	if (name instanceof Array) {
		self.repository[REPOSITORY_SITEMAP] = name;
		return self;
	}

	if (!name) {
		sitemap = self.repository[REPOSITORY_SITEMAP];
		return sitemap ? sitemap : self.repository.sitemap || EMPTYARRAY;
	}

	sitemap = F.sitemap(name, false, self.language);
	self.repository[REPOSITORY_SITEMAP] = sitemap;
	if (!self.repository[REPOSITORY_META_TITLE]) {
		sitemap = sitemap.last();
		if (sitemap)
			self.repository[REPOSITORY_META_TITLE] = sitemap.name;
	}

	return self.repository[REPOSITORY_SITEMAP];
};

Controller.prototype.$sitemap = function(name) {
	var self = this;
	self.sitemap.apply(self, arguments);
	return '';
};

Controller.prototype.module = function(name) {
	return F.module(name);
};

Controller.prototype.layout = function(name) {
	var self = this;
	self.layoutName = name;
	return self;
};

Controller.prototype.theme = function(name) {
	var self = this;
	self.themeName = name;
	return self;
};

/**
 * Layout setter for views
 * @param {String} name Layout name
 * @return {String}
 */
Controller.prototype.$layout = function(name) {
	var self = this;
	self.layoutName = name;
	return '';
};

Controller.prototype.model = function(name) {
	return F.model(name);
};

/**
 * Send e-mail
 * @param {String or Array} address E-mail address.
 * @param {String} subject E-mail subject.
 * @param {String} view View name.
 * @param {Object} model Optional.
 * @param {Function(err)} callback Optional.
 * @return {MailMessage}
 */
Controller.prototype.mail = function(address, subject, view, model, callback) {

	if (typeof(model) === 'function') {
		callback = model;
		model = null;
	}

	var self = this;

	if (typeof(self.language) === 'string')
		subject = subject.indexOf('@(') === -1 ? F.translate(self.language, subject) : F.translator(self.language, subject);

	// Backup layout
	var layoutName = self.layoutName;
	var body = self.view(view, model, true);
	self.layoutName = layoutName;
	return F.onMail(address, subject, body, callback);
};

/*
	Check if ETag or Last Modified has modified
	@compare {String or Date}
	@strict {Boolean} :: if strict then use equal date else use great than date (default: false)

	if @compare === {String} compare if-none-match
	if @compare === {Date} compare if-modified-since

	return {Boolean};
*/
Controller.prototype.notModified = function(compare, strict) {
	return F.notModified(this.req, this.res, compare, strict);
};

/*
	Set last modified header or Etag
	@value {String or Date}

	if @value === {String} set ETag
	if @value === {Date} set LastModified

	return {Controller};
*/
Controller.prototype.setModified = function(value) {
	F.setModified(this.req, this.res, value);
	return this;
};

/**
 * Sets expire headers
 * @param {Date} date
 */
Controller.prototype.setExpires = function(date) {
	date && this.res.setHeader('Expires', date.toUTCString());
	return this;
};

Controller.prototype.$template = function(name, model, expire, key) {
	return this.$viewToggle(true, name, model, expire, key);
};

Controller.prototype.$templateToggle = function(visible, name, model, expire, key) {
	return this.$viewToggle(visible, name, model, expire, key);
};

Controller.prototype.$view = function(name, model, expire, key) {
	return this.$viewToggle(true, name, model, expire, key);
};

Controller.prototype.$viewCompile = function(body, model) {
	var self = this;
	var layout = self.layoutName;
	self.layoutName = '';
	var value = self.viewCompile(body, model, null, true);
	self.layoutName = layout;
	return value || '';
};

Controller.prototype.$viewToggle = function(visible, name, model, expire, key) {

	if (!visible)
		return '';

	var self = this;
	var cache;

	if (expire) {
		cache = '$view.' + name + '.' + (key || '');
		var output = self.cache.read2(cache);
		if (output)
			return output;
	}

	var layout = self.layoutName;
	self.layoutName = '';
	var value = self.view(name, model, null, true);
	self.layoutName = layout;

	if (!value)
		return '';

	expire && self.cache.add(cache, value, expire);
	return value;
};

/**
 * Adds a place into the places.
 * @param {String} name A place name.
 * @param {String} arg1 A content 1, optional
 * @param {String} arg2 A content 2, optional
 * @param {String} argN A content 2, optional
 * @return {String/Controller} String is returned when the method contains only `name` argument
 */
Controller.prototype.place = function(name) {

	var key = REPOSITORY_PLACE + '_' + name;
	var length = arguments.length;

	if (length === 1)
		return this.repository[key] || '';

	var output = '';
	for (var i = 1; i < length; i++) {
		var val = arguments[i];

		if (val)
			val = val.toString();
		else
			val = '';

		if (val.endsWith('.js'))
			val = '<script src="' + val + '"></script>';

		output += val;
	}

	this.repository[key] = (this.repository[key] || '') + output;
	return this;
};

/**
 * Adds a content into the section
 * @param {String} name A section name.
 * @param {String} value A content.
 * @param {Boolean} replace Optional, default `false` otherwise concats contents.
 * @return {String/Controller} String is returned when the method contains only `name` argument
 */
Controller.prototype.section = function(name, value, replace) {

	var key = '$section_' + name;

	if (value === undefined)
		return this.repository[key];

	if (replace) {
		this.repository[key] = value;
		return this;
	}

	if (this.repository[key])
		this.repository[key] += value;
	else
		this.repository[key] = value;

	return this;
};

Controller.prototype.$place = function() {
	var self = this;
	if (arguments.length === 1)
		return self.place.apply(self, arguments);
	self.place.apply(self, arguments);
	return '';
};

Controller.prototype.$url = function(host) {
	return host ? this.req.hostname(this.url) : this.url;
};

Controller.prototype.$helper = function(name) {
	return this.helper.apply(this, arguments);
};

function querystring_encode(value, def) {
	return value != null ? value instanceof Date ? encodeURIComponent(value.format()) : typeof(value) === 'string' ? encodeURIComponent(value) : value.toString() : def || '';
}

// @{href({ key1: 1, key2: 2 })}
// @{href('key', 'value')}
Controller.prototype.href = function(key, value) {
	var self = this;

	if (!arguments.length) {
		var val = Qs.stringify(self.query);
		return val ? '?' + val : '';
	}

	var type = typeof(key);
	var obj;

	if (type === 'string') {

		var cachekey = '$href' + key;
		var str = self[cachekey] || '';

		if (!str) {

			obj = U.copy(self.query);
			for (var i = 2; i < arguments.length; i++)
				obj[arguments[i]] = undefined;

			obj[key] = '\0';

			var arr = Object.keys(obj);
			for (var i = 0, length = arr.length; i < length; i++) {
				var val = obj[arr[i]];
				if (val !== undefined)
					str += (str ? '&' : '') + arr[i] + '=' + (key === arr[i] ? '\0' : querystring_encode(val));
			}
			self[cachekey] = str;
		}

		str = str.replace('\0', querystring_encode(value, self.query[key]));

		for (var i = 2; i < arguments.length; i++) {
			var beg = str.indexOf(arguments[i] + '=');
			if (beg === -1)
				continue;
			var end = str.indexOf('&', beg);
			str = str.substring(0, beg) + str.substring(end === -1 ? str.length : end + 1);
		}

		return str ? '?' + str : '';
	}

	if (value) {
		obj = U.copy(self.query);
		U.extend(obj, value);
	}

	if (value != null)
		obj[key] = value;

	obj = Qs.stringify(obj);

	if (value === undefined && type === 'string')
		obj += (obj ? '&' : '') + key;

	return self.url + (obj ? '?' + obj : '');
};

Controller.prototype.$checked = function(bool, charBeg, charEnd) {
	return this.$isValue(bool, charBeg, charEnd, 'checked="checked"');
};

Controller.prototype.$disabled = function(bool, charBeg, charEnd) {
	return this.$isValue(bool, charBeg, charEnd, 'disabled="disabled"');
};

Controller.prototype.$selected = function(bool, charBeg, charEnd) {
	return this.$isValue(bool, charBeg, charEnd, 'selected="selected"');
};

/**
 * Fake function for assign value
 * @private
 * @param {Object} value Value to eval.
 * return {String} Returns empty string.
 */
Controller.prototype.$set = function(value) {
	return '';
};

Controller.prototype.$readonly = function(bool, charBeg, charEnd) {
	return this.$isValue(bool, charBeg, charEnd, 'readonly="readonly"');
};

Controller.prototype.$header = function(name, value) {
	this.header(name, value);
	return '';
};

Controller.prototype.$text = function(model, name, attr) {
	return this.$input(model, 'text', name, attr);
};

Controller.prototype.$password = function(model, name, attr) {
	return this.$input(model, 'password', name, attr);
};

Controller.prototype.$hidden = function(model, name, attr) {
	return this.$input(model, 'hidden', name, attr);
};

Controller.prototype.$radio = function(model, name, value, attr) {

	if (typeof(attr) === 'string') {
		var label = attr;
		attr = SINGLETON('!$radio');
		attr.label = label;
	}

	attr.value = value;
	return this.$input(model, 'radio', name, attr);
};

Controller.prototype.$checkbox = function(model, name, attr) {

	if (typeof(attr) === 'string') {
		var label = attr;
		attr = SINGLETON('!$checkbox');
		attr.label = label;
	}

	return this.$input(model, 'checkbox', name, attr);
};

Controller.prototype.$textarea = function(model, name, attr) {

	var builder = '<textarea';

	if (typeof(attr) !== 'object')
		attr = EMPTYOBJECT;

	builder += ' name="' + name + '" id="' + (attr.id || name) + ATTR_END;

	for (var key in attr) {
		switch (key) {
			case 'name':
			case 'id':
				break;
			case 'required':
			case 'disabled':
			case 'readonly':
			case 'value':
				builder += ' ' + key + '="' + key + ATTR_END;
				break;
			default:
				builder += ' ' + key + '="' + attr[key].toString().encode() + ATTR_END;
				break;
		}
	}

	if (model === undefined)
		return builder + '></textarea>';

	return builder + '>' + ((model[name] || attr.value) || '') + '</textarea>';
};

Controller.prototype.$input = function(model, type, name, attr) {

	var builder = ['<input'];

	if (typeof(attr) !== 'object')
		attr = EMPTYOBJECT;

	var val = attr.value || '';

	builder += ' type="' + type + ATTR_END;

	if (type === 'radio')
		builder += ' name="' + name + ATTR_END;
	else
		builder += ' name="' + name + '" id="' + (attr.id || name) + ATTR_END;

	if (attr.autocomplete) {
		if (attr.autocomplete === true || attr.autocomplete === 'on')
			builder += ' autocomplete="on"';
		else
			builder += ' autocomplete="off"';
	}

	for (var key in attr) {
		switch (key) {
			case 'name':
			case 'id':
			case 'type':
			case 'autocomplete':
			case 'checked':
			case 'value':
			case 'label':
				break;
			case 'required':
			case 'disabled':
			case 'readonly':
			case 'autofocus':
				builder += ' ' + key + '="' + key + ATTR_END;
				break;
			default:
				builder += ' ' + key + '="' + attr[key].toString().encode() + ATTR_END;
				break;
		}
	}

	var value = '';

	if (model !== undefined) {
		value = model[name];

		if (type === 'checkbox') {
			if (value == '1' || value === 'true' || value === true || value === 'on')
				builder += ' checked="checked"';
			value = val || '1';
		}

		if (type === 'radio') {

			val = (val || '').toString();

			if (value.toString() === val)
				builder += ' checked="checked"';

			value = val || '';
		}
	}

	if (value === undefined)
		builder += ' value="' + (attr.value || '').toString().encode() + ATTR_END;
	else
		builder += ' value="' + (value || '').toString().encode() + ATTR_END;

	builder += ' />';
	return attr.label ? ('<label>' + builder + ' <span>' + attr.label + '</span></label>') : builder;
};

Controller.prototype._preparehostname = function(value) {
	if (!value)
		return value;
	var tmp = value.substring(0, 5);
	return tmp !== 'http:' && tmp !== 'https' && (tmp[0] !== '/' || tmp[1] !== '/') ? this.host(value) : value;
};

Controller.prototype.head = function() {

	var self = this;

	if (!arguments.length) {
		// OBSOLETE: this is useless
		// F.emit('controller-render-head', self);
		var author = self.repository[REPOSITORY_META_AUTHOR] || self.config.author;
		return (author ? '<meta name="author" content="' + author + '" />' : '') + (self.repository[REPOSITORY_HEAD] || '') + (self.repository[REPOSITORY_COMPONENTS] ? F.components.links : '');
	}

	var header = (self.repository[REPOSITORY_HEAD] || '');

	for (var i = 0; i < arguments.length; i++) {

		var val = arguments[i];
		var key = '$head-' + val;

		if (self.repository[key])
			continue;

		self.repository[key] = true;

		if (val[0] === '<') {
			header += val;
			continue;
		}

		var tmp = val.substring(0, 7);
		var is = (tmp[0] !== '/' && tmp[1] !== '/') && tmp !== 'http://' && tmp !== 'https:/';
		var ext = U.getExtension(val);
		if (ext === 'css')
			header += '<link type="text/css" rel="stylesheet" href="' + (is ? self.routeStyle(val) : val) + '" />';
		else if (ext === 'js')
			header += '<script src="' + (is ? self.routeScript(val) : val) + '"></script>';
	}

	self.repository[REPOSITORY_HEAD] = header;
	return self;
};

Controller.prototype.$head = function() {
	this.head.apply(this, arguments);
	return '';
};

Controller.prototype.$isValue = function(bool, charBeg, charEnd, value) {
	if (!bool)
		return '';
	charBeg = charBeg || ' ';
	charEnd = charEnd || '';
	return charBeg + value + charEnd;
};

Controller.prototype.$modified = function(value) {

	var self = this;
	var type = typeof(value);
	var date;

	if (type === 'number') {
		date = new Date(value);
	} else if (type === 'string') {

		var d = value.split(' ');

		date = d[0].split('-');
		var time = (d[1] || '').split(':');

		var year = U.parseInt(date[0] || '');
		var month = U.parseInt(date[1] || '') - 1;
		var day = U.parseInt(date[2] || '') - 1;

		if (month < 0)
			month = 0;

		if (day < 0)
			day = 0;

		var hour = U.parseInt(time[0] || '');
		var minute = U.parseInt(time[1] || '');
		var second = U.parseInt(time[2] || '');

		date = new Date(year, month, day, hour, minute, second, 0);
	} else if (U.isDate(value))
		date = value;

	date && self.setModified(date);
	return '';
};

Controller.prototype.$etag = function(value) {
	this.setModified(value);
	return '';
};

Controller.prototype.$options = function(arr, selected, name, value) {

	var type = typeof(arr);
	if (!arr)
		return '';

	var isObject = false;
	var tmp = null;

	if (!(arr instanceof Array) && type === 'object') {
		isObject = true;
		tmp = arr;
		arr = Object.keys(arr);
	}

	if (!U.isArray(arr))
		arr = [arr];

	selected = selected || '';

	var options = '';

	if (!isObject) {
		if (value === undefined)
			value = value || name || 'value';
		if (name === undefined)
			name = name || 'name';
	}

	var isSelected = false;
	var length = 0;

	length = arr.length;

	for (var i = 0; i < length; i++) {

		var o = arr[i];
		var type = typeof(o);
		var text = '';
		var val = '';
		var sel = false;

		if (isObject) {
			if (name === true) {
				val = tmp[o];
				text = o;
				if (!value)
					value = '';
			} else {
				val = o;
				text = tmp[o];
				if (!text)
					text = '';
			}

		} else if (type === 'object') {

			text = (o[name] || '');
			val = (o[value] || '');

			if (typeof(text) === 'function')
				text = text(i);

			if (typeof(val) === 'function')
				val = val(i, text);

		} else {
			text = o;
			val = o;
		}

		if (!isSelected) {
			sel = val == selected;
			isSelected = sel;
		}

		options += '<option value="' + val.toString().encode() + '"' + (sel ? ' selected="selected"' : '') + '>' + text.toString().encode() + '</option>';
	}

	return options;
};

/**
 * Append <script> TAG
 * @private
 * @return {String}
 */
Controller.prototype.$script = function() {
	return arguments.length === 1 ? this.$js(arguments[0]) : this.$js.apply(this, arguments);
};

/**
 * Append <script> TAG
 * @private
 * @return {String}
 */
Controller.prototype.$js = function() {
	var self = this;
	var builder = '';
	for (var i = 0; i < arguments.length; i++)
		builder += self.routeScript(arguments[i], true);
	return builder;
};

/**
 * Append <script> or <style> TAG
 * @private
 * @return {String}
 */
Controller.prototype.$absolute = function(files, base) {

	var self = this;
	var builder;
	var ftype;

	if (!base)
		base = self.hostname();

	if (files instanceof Array) {

		ftype = U.getExtension(files[0]);
		builder = '';

		for (var i = 0, length = files.length; i < length; i++) {
			switch (ftype) {
				case 'js':
					builder += self.routeScript(files[i], true, base);
					break;
				case 'css':
					builder += self.routeStyle(files[i], true, base);
					break;
				default:
					builder += self.routeStatic(files[i], base);
					break;
			}
		}

		return builder;
	}

	ftype = U.getExtension(files);

	switch (ftype) {
		case 'js':
			return self.routeScript(files, true, base);
		case 'css':
			return self.routeStyle(files, true, base);
	}

	return self.routeStatic(files, base);
};

Controller.prototype.$import = function() {

	var self = this;
	var builder = '';

	for (var i = 0; i < arguments.length; i++) {
		var filename = arguments[i];

		if (filename === 'head') {
			builder += self.head();
			continue;
		}

		if (filename === 'meta') {
			builder += self.$meta();
			continue;
		}

		if (filename === 'components')
			continue;

		var extension = filename.substring(filename.lastIndexOf('.'));
		var tag = filename[0] !== '!';
		if (!tag)
			filename = filename.substring(1);

		if (filename[0] === '#')
			extension = '.js';

		switch (extension) {
			case '.js':
				builder += self.routeScript(filename, tag);
				break;
			case '.css':
				builder += self.routeStyle(filename, tag);
				break;
			case '.ico':
				builder += self.$favicon(filename);
				break;
			case '.mp4':
			case '.avi':
			case '.ogv':
			case '.webm':
			case '.mov':
			case '.mpg':
			case '.mpe':
			case '.mpeg':
			case '.m4v':
				builder += self.routeVideo(filename);
				break;
			case '.jpg':
			case '.gif':
			case '.png':
			case '.jpeg':
				builder += self.routeImage(filename);
				break;
			default:
				builder += self.routeStatic(filename);
				break;
		}
	}

	return builder;
};

/**
 * Append <link> TAG
 * @private
 * @return {String}
 */
Controller.prototype.$css = function() {

	var self = this;
	var builder = '';

	for (var i = 0; i < arguments.length; i++)
		builder += self.routeStyle(arguments[i], true);

	return builder;
};

Controller.prototype.$image = function(name, width, height, alt, className) {

	var style = '';

	if (typeof(width) === 'object') {
		height = width.height;
		alt = width.alt;
		className = width.class;
		style = width.style;
		width = width.width;
	}

	var builder = '<img src="' + this.routeImage(name) + ATTR_END;

	if (width > 0)
		builder += ' width="' + width + ATTR_END;

	if (height > 0)
		builder += ' height="' + height + ATTR_END;

	if (alt)
		builder += ' alt="' + alt.encode() + ATTR_END;

	if (className)
		builder += ' class="' + className + ATTR_END;

	if (style)
		builder += ' style="' + style + ATTR_END;

	return builder + ' border="0" />';
};

/**
 * Create URL: DOWNLOAD (<a href="..." download="...")
 * @private
 * @param {String} filename
 * @param {String} innerHTML
 * @param {String} downloadName Optional.
 * @param {String} className Optional.
 * @return {String}
 */
Controller.prototype.$download = function(filename, innerHTML, downloadName, className) {
	var builder = '<a href="' + F.routeDownload(filename) + ATTR_END;

	if (downloadName)
		builder += ' download="' + downloadName + ATTR_END;

	if (className)
		builder += ' class="' + className + ATTR_END;

	return builder + '>' + (innerHTML || filename) + '</a>';
};

/**
 * Serialize object into the JSON
 * @private
 * @param {Object} obj
 * @param {String} id Optional.
 * @param {Boolean} beautify Optional.
 * @return {String}
 */
Controller.prototype.$json = function(obj, id, beautify, replacer) {

	if (typeof(id) === 'boolean') {
		replacer = beautify;
		beautify = id;
		id = null;
	}

	if (typeof(beautify) === 'function') {
		replacer = beautify;
		beautify = false;
	}

	var value = beautify ? JSON.stringify(obj, replacer, 4) : JSON.stringify(obj, replacer);
	return id ? ('<script type="application/json" id="' + id + '">' + value + '</script>') : value;
};

/**
 * Append FAVICON tag
 * @private
 * @param {String} name
 * @return {String}
 */
Controller.prototype.$favicon = function(name) {

	var contentType = 'image/x-icon';

	if (name == null)
		name = 'favicon.ico';

	var key = 'favicon#' + name;
	if (F.temporary.other[key])
		return F.temporary.other[key];

	if (name.lastIndexOf('.png') !== -1)
		contentType = 'image/png';
	else if (name.lastIndexOf('.gif') !== -1)
		contentType = 'image/gif';

	return F.temporary.other[key] = '<link rel="shortcut icon" href="' + F.routeStatic('/' + name) + '" type="' + contentType + '" />';
};

/**
 * Route static file helper
 * @private
 * @param {String} current
 * @param {String} name
 * @param {Function} fn
 * @return {String}
 */
Controller.prototype._routeHelper = function(name, fn) {
	return fn.call(framework, prepare_staticurl(name, false), this.themeName);
};

/**
 * Create URL: JavaScript
 * @param {String} name
 * @param {Boolean} tag Append tag?
 * @return {String}
 */
Controller.prototype.routeScript = function(name, tag, path) {

	if (name === undefined)
		name = 'default.js';

	var url;

	// isomorphic
	if (name[0] === '#') {
		var tmp = F.isomorphic[name.substring(1)];
		if (tmp)
			url = tmp.url;
		else {
			F.error('Isomorphic library {0} doesn\'t exist.'.format(name.substring(1)));
			return '';
		}
	} else {
		url = this._routeHelper(name, F.routeScript);
		if (path && U.isRelative(url))
			url = F.isWindows ? U.join(path, url) : U.join(path, url).substring(1);
	}

	return tag ? '<script src="' + url + '"></script>' : url;
};

/**
 * Create URL: CSS
 * @param {String} name
 * @param {Boolean} tag Append tag?
 * @return {String}
 */
Controller.prototype.routeStyle = function(name, tag, path) {
	var self = this;

	if (name === undefined)
		name = 'default.css';

	var url = self._routeHelper(name, F.routeStyle);
	if (path && U.isRelative(url))
		url = F.isWindows ? U.join(path, url) : U.join(path, url).substring(1);

	return tag ? '<link type="text/css" rel="stylesheet" href="' + url + '" />' : url;
};

/**
 * Create URL: IMG
 * @param {String} name
 * @return {String}
 */
Controller.prototype.routeImage = function(name) {
	return this._routeHelper(name, F.routeImage);
};

/**
 * Create URL: VIDEO
 * @param {String} name
 * @return {String}
 */
Controller.prototype.routeVideo = function(name) {
	return this._routeHelper(name, F.routeVideo);
};

/**
 * Create URL: FONT
 * @param {String} name
 * @return {String}
 */
Controller.prototype.routeFont = function(name) {
	return F.routeFont(name);
};

/**
 * Create URL: DOWNLOAD
 * @param {String} name
 * @return {String}
 */
Controller.prototype.routeDownload = function(name) {
	return this._routeHelper(name, F.routeDownload);
};

/**
 * Create URL: static files (by the config['static-url'])
 * @param {String} name
 * @return {String}
 */
Controller.prototype.routeStatic = function(name, path) {
	var url = this._routeHelper(name, F.routeStatic);
	if (path && U.isRelative(url))
		return F.isWindows ? U.join(path, url) : U.join(path, url).substring(1);
	return url;
};

/**
 * Creates a string from the view
 * @param {String} name A view name without `.html` extension.
 * @param {Object} model A model, optional.
 * @return {String}
 */
Controller.prototype.template = function(name, model) {
	return this.view(name, model, true);
};

/**
 * Renders a custom helper to a string
 * @param {String} name A helper name.
 * @return {String}
 */
Controller.prototype.helper = function(name) {
	var helper = F.helpers[name];
	if (!helper)
		return '';

	var params = [];
	for (var i = 1; i < arguments.length; i++)
		params.push(arguments[i]);

	return helper.apply(this, params);
};

/**
 * Response JSON
 * @param {Object} obj
 * @param {Object} headers Custom headers, optional.
 * @param {Boolean} beautify Beautify JSON.
 * @param {Function(key, value)} replacer JSON replacer.
 * @return {Controller}
 */
Controller.prototype.json = function(obj, headers, beautify, replacer) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	// Checks the HEAD method
	if (self.req.method === 'HEAD') {
		self.subscribe.success();
		F.responseContent(self.req, self.res, self.status, EMPTYBUFFER, 'application/json', self.config['allow-gzip'], headers);
		F.stats.response.json++;
		return self;
	}

	if (typeof(headers) === 'boolean') {
		replacer = beautify;
		beautify = headers;
	}

	var type = 'application/json';

	if (obj instanceof framework_builders.ErrorBuilder) {
		self.req.$language && !obj.isResourceCustom && obj.setResource(self.req.$language);
		if (obj.contentType)
			type = obj.contentType;
		obj = obj.output();
		F.stats.response.errorBuilder++;
	} else {

		if (framework_builders.isSchema(obj))
			obj = obj.$clean();

		if (beautify)
			obj = JSON.stringify(obj, replacer, 4);
		else
			obj = JSON.stringify(obj, replacer);
	}

	self.subscribe.success();
	F.responseContent(self.req, self.res, self.status, obj, type, self.config['allow-gzip'], headers);
	F.stats.response.json++;
	self.precache && self.precache(obj, type, headers);
	return self;
};

/**
 * Responds with JSONP
 * @param {String} name A method name.
 * @param {Object} obj Object to serialize.
 * @param {Object} headers A custom headers.
 * @param {Boolean} beautify Should be the JSON prettified? Optional, default `false`
 * @param {Function} replacer Optional, the JSON replacer.
 * @return {Controller}
 */
Controller.prototype.jsonp = function(name, obj, headers, beautify, replacer) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	// Checks the HEAD method
	if (self.req.method === 'HEAD') {
		self.subscribe.success();
		F.responseContent(self.req, self.res, self.status, EMPTYBUFFER, 'application/x-javascript', self.config['allow-gzip'], headers);
		F.stats.response.json++;
		return self;
	}

	if (typeof(headers) === 'boolean') {
		replacer = beautify;
		beautify = headers;
	}

	if (!name)
		name = 'callback';

	if (obj instanceof framework_builders.ErrorBuilder) {
		self.req.$language && !obj.isResourceCustom && obj.setResource(self.req.$language);
		obj = obj.json(beautify);
		F.stats.response.errorBuilder++;
	} else {

		if (framework_builders.isSchema(obj))
			obj = obj.$clean();

		if (beautify)
			obj = JSON.stringify(obj, replacer, 4);
		else
			obj = JSON.stringify(obj, replacer);
	}

	self.subscribe.success();
	F.responseContent(self.req, self.res, self.status, name + '(' + obj + ')', 'application/x-javascript', self.config['allow-gzip'], headers);
	F.stats.response.json++;
	self.precache && self.precache(name + '(' + obj + ')', 'application/x-javascript', headers);
	return self;
};

/**
 * Creates View or JSON callback
 * @param {String} view Optional, undefined or null returns JSON.
 * @return {Function}
 */
Controller.prototype.callback = function(view) {
	var self = this;
	return function(err, data) {

		var is = err instanceof framework_builders.ErrorBuilder;

		// NoSQL embedded database
		if (data === undefined && !U.isError(err) && !is) {
			data = err;
			err = null;
		}

		if (err) {
			if (is && !view) {
				self.req.$language && !err.isResourceCustom && err.setResource(self.req.$language);
				return self.content(err);
			}
			return is && err.unexpected ? self.view500(err) : self.view404(err);
		}

		if (typeof(view) === 'string')
			self.view(view, data);
		else
			self.json(data);
	};
};

Controller.prototype.custom = function() {
	this.subscribe.success();
	if (this.res.success || this.res.headersSent || !this.isConnected)
		return false;
	F.responseCustom(this.req, this.res);
	return true;
};

/**
 * Prevents cleaning uploaded files (need to call `controller.clear()` manually).
 * @param {Boolean} enable Optional, default `true`.
 * @return {Controller}
 */
Controller.prototype.noClear = function(enable) {
	this.req._manual = enable === undefined ? true : enable;
	return this;
};

Controller.prototype.content = function(contentBody, contentType, headers) {

	var self = this;
	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	if (contentBody instanceof ErrorBuilder) {
		var tmp = contentBody.output();
		if (!contentType)
			contentType = contentBody.contentType || 'application/json';
		contentBody = tmp;
		F.stats.response.errorBuilder++;
	}

	self.subscribe.success();
	F.responseContent(self.req, self.res, self.status, contentBody, contentType || CONTENTTYPE_TEXTPLAIN, self.config['allow-gzip'], headers);

	if (self.precache && self.status === 200) {
		self.layout('');
		self.precache(contentBody, contentType || CONTENTTYPE_TEXTPLAIN, headers, true);
	}

	return self;
};

/**
 * Responds with plain/text body
 * @param {String} body A response body (object is serialized into the JSON automatically).
 * @param {Boolean} headers A custom headers.
 * @return {Controller}
 */
Controller.prototype.plain = function(body, headers) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	// Checks the HEAD method
	if (self.req.method === 'HEAD') {
		self.subscribe.success();
		F.responseContent(self.req, self.res, self.status, EMPTYBUFFER, CONTENTTYPE_TEXTPLAIN, self.config['allow-gzip'], headers);
		F.stats.response.plain++;
		return self;
	}

	var type = typeof(body);

	if (body == null)
		body = '';
	else if (type === 'object') {
		if (framework_builders.isSchema(body))
			body = body.$clean();
		body = body ? JSON.stringify(body, null, 4) : '';
	} else
		body = body ? body.toString() : '';

	self.subscribe.success();
	F.responseContent(self.req, self.res, self.status, body, CONTENTTYPE_TEXTPLAIN, self.config['allow-gzip'], headers);
	F.stats.response.plain++;
	self.precache && self.precache(body, CONTENTTYPE_TEXTPLAIN, headers);
	return self;
};

/**
 * Creates an empty response
 * @param {Object/Number} headers A custom headers or a custom HTTP status.
 * @return {Controller}
 */
Controller.prototype.empty = function(headers) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	var code = 200;

	if (typeof(headers) === 'number') {
		code = headers;
		headers = null;
	}

	self.subscribe.success();
	F.responseContent(self.req, self.res, code, EMPTYBUFFER, CONTENTTYPE_TEXTPLAIN, false, headers);
	F.stats.response.empty++;
	return self;
};

/**
 * Destroys a request (closes it)
 * @param {String} problem Optional.
 * @return {Controller}
 */
Controller.prototype.destroy = function(problem) {
	var self = this;

	problem && self.problem(problem);
	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	self.subscribe.success();
	self.req.connection.destroy();
	F.stats.response.destroy++;
	return self;
};

/**
 * Responds with a file
 * @param {String} filename
 * @param {String} download Optional, a download name.
 * @param {Object} headers Optional, additional headers.
 * @param {Function} done Optinoal, callback.
 * @return {Controller}
 */
Controller.prototype.file = function(filename, download, headers, done) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected) {
		done && done();
		return self;
	}

	if (filename[0] === '~')
		filename = filename.substring(1);
	else
		filename = F.path.public_cache(filename);

	self.subscribe.success();
	F.responseFile(self.req, self.res, filename, download, headers, done);
	return self;
};

/**
 * Responds with an image
 * @param {String or Stream} filename
 * @param {Function(image)} fnProcess
 * @param {Object} headers Optional, additional headers.
 * @param {Function} done Optional, callback.
 * @return {Controller}
 */
Controller.prototype.image = function(filename, fnProcess, headers, done) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected) {
		done && done();
		return self;
	}

	if (typeof(filename) === 'string') {
		if (filename[0] === '~')
			filename = filename.substring(1);
		else
			filename = F.path.public_cache(filename);
	}

	self.subscribe.success();
	F.responseImage(self.req, self.res, filename, fnProcess, headers, done);
	return self;
};

/**
 * Responds with a stream
 * @param {String} contentType
 * @param {Stream} stream
 * @param {String} download Optional, a download name.
 * @param {Object} headers Optional, additional headers.
 * @param {Function} done Optinoal, callback.
 * @return {Controller}
 */
Controller.prototype.stream = function(contentType, stream, download, headers, done, nocompress) {
	var self = this;

	if (self.res.success || self.res.headersSent || !self.isConnected) {
		done && done();
		return self;
	}

	self.subscribe.success();
	F.responseStream(self.req, self.res, contentType, stream, download, headers, done, nocompress);
	return self;
};

/**
 * Throw 400 - Bad request.
 * @param  {String} problem Description of problem (optional)
 * @return {Controller}
 */
Controller.prototype.throw400 = Controller.prototype.view400 = function(problem) {
	return controller_error_status(this, 400, problem);
};

/**
 * Throw 401 - Unauthorized.
 * @param  {String} problem Description of problem (optional)
 * @return {Controller}
 */
Controller.prototype.throw401 = Controller.prototype.view401 = function(problem) {
	return controller_error_status(this, 401, problem);
};

/**
 * Throw 403 - Forbidden.
 * @param  {String} problem Description of problem (optional)
 * @return {Controller}
 */
Controller.prototype.throw403 = Controller.prototype.view403 = function(problem) {
	return controller_error_status(this, 403, problem);
};

/**
 * Throw 404 - Not found.
 * @param  {String} problem Description of problem (optional)
 * @return {Controller}
 */
Controller.prototype.throw404 = Controller.prototype.view404 = function(problem) {
	return controller_error_status(this, 404, problem);
};

/**
 * Throw 500 - Internal Server Error.
 * @param {Error} error
 * @return {Controller}
 */
Controller.prototype.throw500 = Controller.prototype.view500 = function(error) {
	var self = this;
	F.error(error instanceof Error ? error : new Error((error || '').toString()), self.name, self.req.uri);
	return controller_error_status(self, 500, error);
};

/**
 * Throw 501 - Not implemented
 * @param  {String} problem Description of the problem (optional)
 * @return {Controller}
 */
Controller.prototype.throw501 = Controller.prototype.view501 = function(problem) {
	return controller_error_status(this, 501, problem);
};

/**
 * Creates a redirect
 * @param {String} url
 * @param {Boolean} permanent Is permanent? Default: `false`
 * @return {Controller}
 */
Controller.prototype.redirect = function(url, permanent) {
	var self = this;
	self.precache && self.precache(null, null, null);

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	HEADERS.redirect.Location = url;
	self.subscribe.success();
	self.res.success = true;
	self.res.writeHead(permanent ? 301 : 302, HEADERS.redirect);
	self.res.end();
	F._request_stats(false, false);
	F.emit('request-end', self.req, self.res);
	self.req.clear(true);
	F.stats.response.redirect++;
	return self;
};

/**
 * A binary response
 * @param {Buffer} buffer
 * @param {String} contentType
 * @param {String} type Transformation type: `binary`, `utf8`, `ascii`.
 * @param {String} download Optional, download name.
 * @param {Object} headers Optional, additional headers.
 * @return {Controller}
 */
Controller.prototype.binary = function(buffer, contentType, type, download, headers) {
	var self = this;
	var res = self.res;

	if (self.res.success || self.res.headersSent || !self.isConnected)
		return self;

	if (typeof(type) === 'object') {
		var tmp = type;
		type = download;
		download = headers;
		headers = tmp;
	}

	if (typeof(download) === 'object') {
		headers = download;
		download = headers;
	}

	self.subscribe.success();
	F.responseBinary(self.req, res, contentType, buffer, type, download, headers);
	return self;
};

/**
 * Basic access authentication (baa)
 * @param {String} label
 * @return {Object}
 */
Controller.prototype.baa = function(label) {

	var self = this;
	self.precache && self.precache(null, null, null);

	if (label === undefined)
		return self.req.authorization();

	var headers = SINGLETON('!controller.baa');
	headers['WWW-Authenticate'] = 'Basic realm="' + (label || 'Administration') + '"';
	F.responseContent(self.req, self.res, 401, '401: NOT AUTHORIZED', CONTENTTYPE_TEXTPLAIN, false, headers);
	self.subscribe.success();
	self.cancel();
	return null;
};

/**
 * Sends server-sent event message
 * @param {String/Object} data
 * @param {String} eventname Optional, an event name.
 * @param {String} id Optional, a custom ID.
 * @param {Number} retry A reconnection timeout in milliseconds when is an unexpected problem.
 * @return {Controller}
 */
Controller.prototype.sse = function(data, eventname, id, retry) {

	var self = this;
	var res = self.res;

	if (!self.isConnected)
		return self;

	if (!self.type && res.success)
		throw new Error('Response was sent.');

	if (self.type > 0 && self.type !== 1)
		throw new Error('Response was used.');

	if (!self.type) {

		self.type = 1;

		if (retry === undefined)
			retry = self.subscribe.route.timeout;

		self.subscribe.success();
		self.req.on('close', () => self.close());
		res.success = true;
		res.writeHead(self.status, HEADERS['sse']);
	}

	if (typeof(data) === 'object')
		data = JSON.stringify(data);
	else
		data = data.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

	var newline = '\n';
	var builder = '';

	if (eventname)
		builder = 'event: ' + eventname + newline;

	builder += 'data: ' + data + newline;

	if (id)
		builder += 'id: ' + id + newline;

	if (retry > 0)
		builder += 'retry: ' + retry + newline;

	builder += newline;
	res.write(builder);
	F.stats.response.sse++;
	return self;
};

Controller.prototype.mmr = function(name, stream, callback) {

	var self = this;
	var res = self.res;

	if (typeof(stream) === 'function') {
		callback = stream;
		stream = name;
	}

	if (!stream)
		stream = name;

	if (!self.isConnected || (!self.type && res.success) || (self.type && self.type !== 2)) {
		callback = null;
		return self;
	}

	if (!self.type) {
		self.type = 2;
		self.boundary = '----totaljs' + U.GUID(10);
		self.subscribe.success();
		self.req.on('close', () => self.close());
		res.success = true;
		HEADERS.mmr[RESPONSE_HEADER_CONTENTTYPE] = 'multipart/x-mixed-replace; boundary=' + self.boundary;
		res.writeHead(self.status, HEADERS.mmr);
	}

	res.write('--' + self.boundary + NEWLINE + RESPONSE_HEADER_CONTENTTYPE + ': ' + U.getContentType(U.getExtension(name)) + NEWLINE + NEWLINE);
	F.stats.response.mmr++;

	if (typeof(stream) === 'string')
		stream = Fs.createReadStream(stream);

	stream.pipe(res, HEADERS.mmrpipe);
	CLEANUP(stream, () => callback && callback());
	return self;
};

/**
 * Close a response
 * @param {Boolean} end
 * @return {Controller}
 */
Controller.prototype.close = function(end) {
	var self = this;

	if (end === undefined)
		end = true;

	if (!self.isConnected)
		return self;

	if (self.type) {
		self.isConnected = false;
		self.res.success = true;
		F._request_stats(false, false);
		F.emit('request-end', self.req, self.res);
		self.type = 0;
		end && self.res.end();
		return self;
	}

	self.isConnected = false;

	if (self.res.success)
		return self;

	self.res.success = true;
	F._request_stats(false, false);
	F.emit('request-end', self.req, self.res);
	end && self.res.end();
	return self;
};

/**
 * Sends an object to another total.js application (POST + JSON)
 * @param {String} url
 * @param {Object} obj
 * @param {Funciton(err, data, code, headers)} callback
 * @param {Number} timeout Timeout, optional default 10 seconds.
 * @return {EventEmitter}
 */
Controller.prototype.proxy = function(url, obj, callback, timeout) {

	var self = this;
	var tmp;

	if (typeof(callback) === 'number') {
		tmp = timeout;
		timeout = callback;
		callback = tmp;
	}

	if (typeof(obj) === 'function') {
		tmp = callback;
		callback = obj;
		obj = tmp;
	}

	return U.request(url, REQUEST_PROXY_FLAGS, obj, function(err, data, code, headers) {
		if (!callback)
			return;
		if ((headers['content-type'] || '').lastIndexOf('/json') !== -1)
			data = F.onParseJSON(data);
		callback.call(self, err, data, code, headers);
	}, null, HEADERS['proxy'], ENCODING, timeout || 10000);
};

/**
 * Creates a proxy between current request and new URL
 * @param {String} url
 * @param {Function(err, response, headers)} callback Optional.
 * @param {Object} headers Optional, additional headers.
 * @param {Number} timeout Optional, timeout (default: 10000)
 * @return {EventEmitter}
 */
Controller.prototype.proxy2 = function(url, callback, headers, timeout) {

	if (typeof(callback) === 'object') {
		timeout = headers;
		headers = callback;
		callback = undefined;
	}

	var self = this;
	var flags = [];
	var req = self.req;
	var type = req.headers['content-type'];
	var h = {};

	flags.push(req.method);
	flags.push('dnscache');

	if (type === 'application/json')
		flags.push('json');

	var c = req.method[0];
	var tmp;
	var keys;

	if (c === 'G' || c === 'H' || c === 'O') {
		if (url.indexOf('?') === -1) {
			tmp = Qs.stringify(self.query);
			if (tmp)
				url += '?' + tmp;
		}
	}

	keys = Object.keys(req.headers);
	for (var i = 0, length = keys.length; i < length; i++) {
		switch (keys[i]) {
			case 'x-forwarded-for':
			case 'x-forwarded-protocol':
			case 'x-nginx-proxy':
			case 'connection':
			case 'content-type':
			case 'host':
			case 'accept-encoding':
				break;
			default:
				h[keys[i]] = req.headers[keys[i]];
				break;
		}
	}

	if (headers) {
		keys = Object.keys(headers);
		for (var i = 0, length = keys.length; i < length; i++)
			h[keys[i]] = headers[keys[i]];
	}

	return U.request(url, flags, self.body, function(err, data, code, headers) {

		if (err) {
			callback && callback(err);
			self.invalid().push(err);
			return;
		}

		self.status = code;
		callback && callback(err, data, code, headers);
		self.content(data, (headers['content-type'] || 'text/plain').replace(REG_ENCODINGCLEANER, ''));
	}, null, h, ENCODING, timeout || 10000);
};

/**
 * Renders view to response
 * @param {String} name View name without `.html` extension.
 * @param {Object} model A model, optional default: `undefined`.
 * @param {Object} headers A custom headers, optional.
 * @param {Boolean} isPartial When is `true` the method returns rendered HTML as `String`
 * @return {Controller/String}
 */
Controller.prototype.view = function(name, model, headers, partial) {

	var self = this;

	if (typeof(name) !== 'string') {
		partial = headers;
		headers = model;
		model = name;
		name = self.viewname;
	} else if (partial === undefined && typeof(headers) === 'boolean') {
		partial = headers;
		headers = null;
	}

	if (!partial && self.res && self.res.success)
		return self;

	if (self.layoutName === undefined)
		self.layoutName = F.config['default-layout'];
	if (self.themeName === undefined)
		self.themeName = F.config['default-theme'];

	// theme root `~some_view`
	// views root `~~some_view`
	// package    `@some_view`
	// theme      `=theme/view`

	var key = 'view#=' + this.themeName + '/' + self._currentView + '/' + name;
	var filename = F.temporary.other[key];
	var isLayout = self.isLayout;

	self.isLayout = false;

	// A small cache
	if (!filename) {

		// ~   --> routed into the root of views (if the controller uses a theme then is routed into the root views of the theme)
		// ~~  --> routed into the root of views (if the controller contains theme)
		// /   --> routed into the views (skipped)
		// @   --> routed into the packages
		// .   --> routed into the opened path
		// =   --> routed into the theme

		var c = name[0];
		var skip = c === '/' ? 1 : c === '~' && name[1] === '~' ? 4 : c === '~' ? 2 : c === '@' ? 3 : c === '.' ? 5 : c === '=' ? 6 : 0;
		var isTheme = false;

		filename = name;

		if (self.themeName && skip < 3) {
			filename = '.' + F.path.themes(self.themeName + '/views/' + (isLayout || skip ? '' : self._currentView.substring(1)) + (skip ? name.substring(1) : name)).replace(REG_SANITIZE_BACKSLASH, '/');
			isTheme = true;
		}

		if (skip === 4) {
			filename = filename.substring(1);
			name = name.substring(1);
			skip = 2;
		}

		if (!isTheme && !isLayout && !skip)
			filename = self._currentView + name;

		if (!isTheme && (skip === 2 || skip === 3))
			filename = name.substring(1);

		if (skip === 3)
			filename = '.' + F.path.package(filename);

		if (skip === 6) {
			c = U.parseTheme(filename);
			name = name.substring(name.indexOf('/') + 1);
			filename = '.' + F.path.themes(c + '/views/' + name).replace(REG_SANITIZE_BACKSLASH, '/');
		}

		F.temporary.other[key] = filename;
	}

	return self.$viewrender(filename, framework_internal.viewEngine(name, filename, self), model, headers, partial, isLayout);
};

Controller.prototype.viewCompile = function(body, model, headers, partial) {

	if (headers === true) {
		partial = true;
		headers = undefined;
	}

	return this.$viewrender('[dynamic view]', framework_internal.viewEngineCompile(body, this.language, this), model, headers, partial);
};

Controller.prototype.$viewrender = function(filename, generator, model, headers, partial, isLayout) {

	var self = this;
	var err;

	if (!generator) {

		err = new Error('View "' + filename + '" not found.');

		if (partial) {
			F.error(err, self.name, self.uri);
			return self.outputPartial;
		}

		if (isLayout) {
			self.subscribe.success();
			F.response500(self.req, self.res, err);
			return self;
		}

		self.view500(err);
		return self;
	}

	var value = '';
	self.$model = model;

	if (isLayout)
		self._currentView = self._defaultView || '';

	var helpers = F.helpers;

	try {
		value = generator.call(self, self, self.repository, model, self.session, self.query, self.body, self.url, F.global, helpers, self.user, self.config, F.functions, 0, partial ? self.outputPartial : self.output, self.req.cookie, self.req.files, self.req.mobile, EMPTYOBJECT);
	} catch (ex) {

		err = new Error('View "' + filename + '": ' + ex.message);

		if (!partial) {
			self.view500(err);
			return self;
		}

		self.error(err);

		if (self.partial)
			self.outputPartial = '';
		else
			self.output = '';

		isLayout = false;
		return value;
	}

	if (!isLayout && self.precache && self.status === 200 && !partial)
		self.precache(value, CONTENTTYPE_TEXTHTML, headers, true);

	if (isLayout || !self.layoutName) {

		self.outputPartial = '';
		self.output = '';
		isLayout = false;

		if (partial)
			return value;

		self.subscribe.success();

		if (!self.isConnected)
			return self;

		F.responseContent(self.req, self.res, self.status, value, CONTENTTYPE_TEXTHTML, self.config['allow-gzip'], headers);
		F.stats.response.view++;
		return self;
	}

	if (partial)
		self.outputPartial = value;
	else
		self.output = value;

	self.isLayout = true;
	value = self.view(self.layoutName, self.$model, headers, partial);

	if (partial) {
		self.outputPartial = '';
		self.isLayout = false;
		return value;
	}

	return self;
};

/**
 * Creates a cache for the response without caching layout
 * @param {String} key
 * @param {String} expires Expiration, e.g. `1 minute`
 * @param {Boolean} disabled Disables a caching, optinoal (e.g. for debug mode you can disable a cache), default: `false`
 * @param {Function()} fnTo This method is executed when the content is prepared for the cache.
 * @param {Function()} fnFrom This method is executed when the content is readed from the cache.
 * @return {Controller}
 */
Controller.prototype.memorize = function(key, expires, disabled, fnTo, fnFrom) {

	var self = this;

	if (disabled === true) {
		fnTo();
		return self;
	}

	var output = self.cache.read2(key);
	if (!output)
		return self.$memorize_prepare(key, expires, disabled, fnTo, fnFrom);

	if (typeof(disabled) === 'function') {
		var tmp = fnTo;
		fnTo = disabled;
		fnFrom = tmp;
	}

	self.layoutName = output.layout;
	self.themeName = output.theme;

	if (output.type !== CONTENTTYPE_TEXTHTML) {
		fnFrom && fnFrom();
		self.subscribe.success();
		F.responseContent(self.req, self.res, self.status, output.content, output.type, self.config['allow-gzip'], output.headers);
		return;
	}

	switch (output.type) {
		case CONTENTTYPE_TEXTPLAIN:
			F.stats.response.plain++;
			return self;
		case 'application/json':
			F.stats.response.json++;
			return self;
		case CONTENTTYPE_TEXTHTML:
			F.stats.response.view++;
			break;
	}

	var length = output.repository.length;
	for (var i = 0; i < length; i++) {
		var key = output.repository[i].key;
		if (self.repository[key] === undefined)
			self.repository[key] = output.repository[i].value;
	}

	fnFrom && fnFrom();

	if (!self.layoutName) {
		self.subscribe.success();
		self.isConnected && F.responseContent(self.req, self.res, self.status, output.content, output.type, self.config['allow-gzip'], output.headers);
		return self;
	}

	self.output = U.createBuffer(output.content);
	self.isLayout = true;
	self.view(self.layoutName, null);
	return self;
};

Controller.prototype.$memorize_prepare = function(key, expires, disabled, fnTo, fnFrom) {

	var self = this;
	var pk = '$memorize' + key;

	if (F.temporary.processing[pk]) {
		setTimeout(function() {
			!self.subscribe.isCanceled && self.memorize(key, expires, disabled, fnTo, fnFrom);
		}, 500);
		return self;
	}

	self.precache = function(value, contentType, headers, isView) {

		if (!value && !contentType && !headers) {
			delete F.temporary.processing[pk];
			self.precache = null;
			return;
		}

		var options = { content: value, type: contentType, layout: self.layoutName, theme: self.themeName };
		if (headers)
			options.headers = headers;

		if (isView) {
			options.repository = [];
			for (var name in self.repository) {
				var value = self.repository[name];
				value !== undefined && options.repository.push({ key: name, value: value });
			}
		}

		self.cache.add(key, options, expires);
		self.precache = null;
		delete F.temporary.processing[pk];
	};

	if (typeof(disabled) === 'function')
		fnTo = disabled;

	F.temporary.processing[pk] = true;
	fnTo();
	return self;
};

module.exports = Controller;