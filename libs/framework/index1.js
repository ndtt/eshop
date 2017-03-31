/**
 * index of index.js
 * @module Framework
 * @version 2.4.0
 */
'use strict';

const Qs = require('querystring');
const Os = require('os');
const Fs = require('fs');
const Zlib = require('zlib');
const Path = require('path');
const Crypto = require('crypto');
const Parser = require('url');
const Child = require('child_process');
const Util = require('util');
const Events = require('events');
const http = require('http');

const WebSocket = require('./websocket');
const FrameworkCache = require('./frameworkcache');
const FrameworkPath = require('./frameworkpath');
const Controller = require('./controller');

const ENCODING = 'utf8';
const RESPONSE_HEADER_CACHECONTROL = 'Cache-Control';
const RESPONSE_HEADER_CONTENTTYPE = 'Content-Type';
const RESPONSE_HEADER_CONTENTLENGTH = 'Content-Length';
const CONTENTTYPE_TEXTPLAIN = 'text/plain';
const CONTENTTYPE_TEXTHTML = 'text/html';
const REQUEST_COMPRESS_CONTENTTYPE = { 'text/plain': true, 'text/javascript': true, 'text/css': true, 'text/jsx': true, 'application/x-javascript': true, 'application/json': true, 'text/xml': true, 'image/svg+xml': true, 'text/x-markdown': true, 'text/html': true };
const TEMPORARY_KEY_REGEX = /\//g;
const REG_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
const REG_ROBOT = /search|agent|bot|crawler|spider/i;
const REG_VERSIONS = /(href|src)="[a-zA-Z0-9\/\:\-\.]+\.(jpg|js|css|png|gif|svg|html|ico|json|less|sass|scss|swf|txt|webp|woff|woff2|xls|xlsx|xml|xsl|xslt|zip|rar|csv|doc|docx|eps|gzip|jpe|jpeg|manifest|mov|mp3|flac|mp4|ogg|package|pdf)"/gi;
const REG_MULTIPART = /\/form\-data$/i;
const REG_COMPILECSS = /url\(.*?\)/g;
const REG_ROUTESTATIC = /^(\/\/|https\:|http\:)+/;
const REG_RANGE = /bytes=/;
const REG_EMPTY = /\s/g;
const REG_ACCEPTCLEANER = /\s|\./g;
const REG_SANITIZE_BACKSLASH = /\/\//g;
const REG_WEBSOCKET_ERROR = /ECONNRESET|EHOSTUNREACH|EPIPE|is closed/i;
const REG_WINDOWSPATH = /\\/g;
const REG_SCRIPTCONTENT = /\<|\>|;/;
const REG_HTTPHTTPS = /^(\/)?(http|https)\:\/\//i;
const REG_NOCOMPRESS = /[\.|-]+min\.(css|js)$/i;
const REG_TEXTAPPLICATION = /text|application/;
const REG_ENCODINGCLEANER = /[\;\s]charset=utf\-8/g;
const REQUEST_PROXY_FLAGS = ['post', 'json'];
const REQUEST_INSTALL_FLAGS = ['get'];
const REQUEST_DOWNLOAD_FLAGS = ['get', 'dnscache'];
const QUERYPARSEROPTIONS = { maxKeys: 69 };
const EMPTYARRAY = [];
const EMPTYOBJECT = {};
//const EMPTYREQUEST = { uri: {} };
const SINGLETONS = {};
const REPOSITORY_HEAD = '$head';
const REPOSITORY_META = '$meta';
const REPOSITORY_COMPONENTS = '$components';
const REPOSITORY_META_TITLE = '$title';
const REPOSITORY_META_DESCRIPTION = '$description';
const REPOSITORY_META_KEYWORDS = '$keywords';
const REPOSITORY_META_AUTHOR = '$author';
const REPOSITORY_META_IMAGE = '$image';
const REPOSITORY_PLACE = '$place';
const REPOSITORY_SITEMAP = '$sitemap';
const ATTR_END = '"';
const ETAG = '858';

Object.freeze(EMPTYOBJECT);
Object.freeze(EMPTYARRAY);
//Object.freeze(EMPTYREQUEST);

global.EMPTYOBJECT = EMPTYOBJECT;
global.EMPTYARRAY = EMPTYARRAY;

var RANGE = { start: 0, end: 0 };
var HEADERS = {};
var SUCCESSHELPER = { success: true };

// Cached headers for repeated usage
HEADERS['responseCode'] = {};
HEADERS['responseCode'][RESPONSE_HEADER_CONTENTTYPE] = CONTENTTYPE_TEXTPLAIN;
HEADERS['responseRedirect'] = {};
HEADERS['responseRedirect'][RESPONSE_HEADER_CONTENTTYPE] = CONTENTTYPE_TEXTHTML + '; charset=utf-8';
HEADERS['responseRedirect'][RESPONSE_HEADER_CONTENTLENGTH] = '0';
HEADERS['sse'] = {};
HEADERS['sse'][RESPONSE_HEADER_CACHECONTROL] = 'no-cache, no-store, must-revalidate';
HEADERS['sse']['Pragma'] = 'no-cache';
HEADERS['sse']['Expires'] = '0';
HEADERS['sse'][RESPONSE_HEADER_CONTENTTYPE] = 'text/event-stream';
HEADERS['sse']['X-Powered-By'] = 'Total.js';
HEADERS['mmr'] = {};
HEADERS['mmr'][RESPONSE_HEADER_CACHECONTROL] = 'no-cache, no-store, must-revalidate';
HEADERS['mmr']['Pragma'] = 'no-cache';
HEADERS['mmr']['Expires'] = '0';
HEADERS['mmr']['X-Powered-By'] = 'Total.js';
HEADERS['proxy'] = {};
HEADERS['proxy']['X-Proxy'] = 'total.js';
HEADERS['responseFile.lastmodified'] = {};;
HEADERS['responseFile.lastmodified']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.lastmodified'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseFile.lastmodified']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.release.compress'] = {};
HEADERS['responseFile.release.compress'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseFile.release.compress']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.release.compress']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.release.compress']['Last-Modified'] = 'Mon, 01 Jan 2001 08:00:00 GMT';
HEADERS['responseFile.release.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseFile.release.compress']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.release.compress.range'] = {};
HEADERS['responseFile.release.compress.range']['Accept-Ranges'] = 'bytes';
HEADERS['responseFile.release.compress.range'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseFile.release.compress.range']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.release.compress.range']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.release.compress.range']['Last-Modified'] = 'Mon, 01 Jan 2001 08:00:00 GMT';
HEADERS['responseFile.release.compress.range']['Content-Encoding'] = 'gzip';
HEADERS['responseFile.release.compress.range'][RESPONSE_HEADER_CONTENTLENGTH] = '0';
HEADERS['responseFile.release.compress.range']['Content-Range'] = '';
HEADERS['responseFile.release.compress.range']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.release'] = {};
HEADERS['responseFile.release'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseFile.release']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.release']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.release']['Last-Modified'] = 'Mon, 01 Jan 2001 08:00:00 GMT';
HEADERS['responseFile.release']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.release.range'] = {};
HEADERS['responseFile.release.range']['Accept-Ranges'] = 'bytes';
HEADERS['responseFile.release.range'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseFile.release.range']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.release.range']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.release.range']['Last-Modified'] = 'Mon, 01 Jan 2001 08:00:00 GMT';
HEADERS['responseFile.release.range'][RESPONSE_HEADER_CONTENTLENGTH] = '0';
HEADERS['responseFile.release.range']['Content-Range'] = '';
HEADERS['responseFile.release.range']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.debug.compress'] = {};
HEADERS['responseFile.debug.compress'][RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';
HEADERS['responseFile.debug.compress']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.debug.compress']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.debug.compress']['Pragma'] = 'no-cache';
HEADERS['responseFile.debug.compress']['Expires'] = '0';
HEADERS['responseFile.debug.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseFile.debug.compress']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.debug.compress.range'] = {};
HEADERS['responseFile.debug.compress.range']['Accept-Ranges'] = 'bytes';
HEADERS['responseFile.debug.compress.range'][RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';
HEADERS['responseFile.debug.compress.range']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.debug.compress.range']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.debug.compress.range']['Content-Encoding'] = 'gzip';
HEADERS['responseFile.debug.compress.range']['Pragma'] = 'no-cache';
HEADERS['responseFile.debug.compress.range']['Expires'] = '0';
HEADERS['responseFile.debug.compress.range'][RESPONSE_HEADER_CONTENTLENGTH] = '0';
HEADERS['responseFile.debug.compress.range']['Content-Range'] = '';
HEADERS['responseFile.debug.compress.range']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.debug'] = {};
HEADERS['responseFile.debug'][RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';
HEADERS['responseFile.debug']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.debug']['Pragma'] = 'no-cache';
HEADERS['responseFile.debug']['Expires'] = '0';
HEADERS['responseFile.debug']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.debug']['X-Powered-By'] = 'Total.js';
HEADERS['responseFile.debug.range'] = {};
HEADERS['responseFile.debug.range']['Accept-Ranges'] = 'bytes';
HEADERS['responseFile.debug.range'][RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';
HEADERS['responseFile.debug.range']['Vary'] = 'Accept-Encoding';
HEADERS['responseFile.debug.range']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseFile.debug.range']['Pragma'] = 'no-cache';
HEADERS['responseFile.debug.range']['Expires'] = '0';
HEADERS['responseFile.debug.range'][RESPONSE_HEADER_CONTENTLENGTH] = '0';
HEADERS['responseFile.debug.range']['Content-Range'] = '';
HEADERS['responseFile.debug.range']['X-Powered-By'] = 'Total.js';
HEADERS['responseContent.mobile.compress'] = {};
HEADERS['responseContent.mobile.compress']['Vary'] = 'Accept-Encoding, User-Agent';
HEADERS['responseContent.mobile.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseContent.mobile'] = {};
HEADERS['responseContent.mobile']['Vary'] = 'Accept-Encoding, User-Agent';
HEADERS['responseContent.mobile']['X-Powered-By'] = 'Total.js';
HEADERS['responseContent.compress'] = {};
HEADERS['responseContent.compress'][RESPONSE_HEADER_CACHECONTROL] = 'private';
HEADERS['responseContent.compress']['Vary'] = 'Accept-Encoding';
HEADERS['responseContent.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseContent.compress']['X-Powered-By'] = 'Total.js';
HEADERS['responseContent'] = {};
HEADERS['responseContent']['Vary'] = 'Accept-Encoding';
HEADERS['responseContent']['X-Powered-By'] = 'Total.js';
HEADERS['responseStream.release.compress'] = {};
HEADERS['responseStream.release.compress'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseStream.release.compress']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseStream.release.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseStream.release.compress']['X-Powered-By'] = 'Total.js';
HEADERS['responseStream.release'] = {};
HEADERS['responseStream.release'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';
HEADERS['responseStream.release']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseStream.release']['X-Powered-By'] = 'Total.js';
HEADERS['responseStream.debug.compress'] = {};
HEADERS['responseStream.debug.compress'][RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';
HEADERS['responseStream.debug.compress']['Pragma'] = 'no-cache';
HEADERS['responseStream.debug.compress']['Expires'] = '0';
HEADERS['responseStream.debug.compress']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseStream.debug.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseStream.debug.compress']['X-Powered-By'] = 'Total.js';
HEADERS['responseStream.debug'] = {};
HEADERS['responseStream.debug'][RESPONSE_HEADER_CACHECONTROL] = 'private, no-cache, no-store, must-revalidate';
HEADERS['responseStream.debug']['Pragma'] = 'no-cache';
HEADERS['responseStream.debug']['Expires'] = '0';
HEADERS['responseStream.debug']['Access-Control-Allow-Origin'] = '*';
HEADERS['responseStream.debug']['X-Powered-By'] = 'Total.js';
HEADERS['responseBinary.compress'] = {};
HEADERS['responseBinary.compress'][RESPONSE_HEADER_CACHECONTROL] = 'public';
HEADERS['responseBinary.compress']['Content-Encoding'] = 'gzip';
HEADERS['responseBinary.compress']['X-Powered-By'] = 'Total.js';
HEADERS['responseBinary'] = {};
HEADERS['responseBinary'][RESPONSE_HEADER_CACHECONTROL] = 'public';
HEADERS['responseBinary']['X-Powered-By'] = 'Total.js';
HEADERS.redirect = { 'Location': '' };
HEADERS.authorization = { user: '', password: '', empty: true };
HEADERS.fsStreamRead = { flags: 'r', mode: '0666', autoClose: true }
HEADERS.fsStreamReadRange = { flags: 'r', mode: '0666', autoClose: true, start: 0, end: 0 };
HEADERS.workers = { cwd: '' };
HEADERS.mmrpipe = { end: false };
HEADERS['responseLocalize'] = {};
HEADERS['responseNotModified'] = {};
HEADERS['responseNotModified'][RESPONSE_HEADER_CACHECONTROL] = 'public, max-age=11111111';

Object.freeze(HEADERS.authorization);

var IMAGEMAGICK = false;
var _controller = '';
var _owner = '';
var _test;
var _flags;

// GO ONLINE MODE
if (!global.framework_internal)
	global.framework_internal = require('./internal');

if (!global.framework_builders)
	global.framework_builders = require('./builders');

if (!global.framework_utils)
	global.framework_utils = require('./utils');

if (!global.framework_mail)
	global.framework_mail = require('./mail');

if (!global.framework_image)
	global.framework_image = require('./image');

if (!global.framework_nosql)
	global.framework_nosql = require('./nosql');

global.Builders = framework_builders;
var utils = U = global.Utils = global.utils = global.U = global.framework_utils;
global.Mail = framework_mail;

global.WTF = function(message, name, uri) {
	return F.problem(message, name, uri);
};

global.INCLUDE = global.SOURCE = function(name, options) {
	return F.source(name, options);
};

global.MODULE = function(name) {
	return F.module(name);
};

global.NOSQL = function(name) {
	return F.nosql(name);
};

global.NOBIN = function(name) {
	return F.nosql(name).binary;
};

global.NOCOUNTER = function(name) {
	return F.nosql(name).counter;
};

global.NOMEM = global.NOSQLMEMORY = function(name, view) {
	return global.framework_nosql.inmemory(name, view);
};

global.DB = global.DATABASE = function() {
	return typeof(F.database) === 'object' ? F.database : F.database.apply(framework, arguments);
};

global.CONFIG = function(name) {
	return F.config[name];
};

global.UPTODATE = function(type, url, options, interval, callback) {
	return F.uptodate(type, url, options, interval, callback);
};

global.INSTALL = function(type, name, declaration, options, callback) {
	return F.install(type, name, declaration, options, callback);
};

global.UNINSTALL = function(type, name, options) {
	return F.uninstall(type, name, options);
};

global.RESOURCE = function(name, key) {
	return F.resource(name, key);
};

global.TRANSLATE = function(name, key) {
	return F.translate(name, key);
};

global.TRANSLATOR = function(name, text) {
	return F.translator(name, text);
};

global.LOG = function() {
	return F.log.apply(F, arguments);
};

global.TRACE = function(message, name, uri, ip) {
	return F.trace(message, name, uri, ip);
};

global.LOGGER = function() {
	return F.logger.apply(F, arguments);
};

global.MODEL = function(name) {
	return F.model(name);
};

global.$$$ = global.GETSCHEMA = function(group, name, fn, timeout) {
	return framework_builders.getschema(group, name, fn, timeout);
};

global.CREATE = function(group, name) {
	return framework_builders.getschema(group, name).default();
};

global.SCRIPT = function(body, value, callback) {
	return F.script(body, value, callback);
};

global.UID = function() {
	var plus = UIDGENERATOR.index % 2 ? 1 : 0;
	return UIDGENERATOR.date + (UIDGENERATOR.index++).padLeft(4, '0') + UIDGENERATOR.instance + plus;
};

global.MAKE = global.TRANSFORM = function(transform, fn) {

	if (typeof(transform) === 'function') {
		var tmp = fn;
		fn = transform;
		transform = tmp;
	}

	var obj;

	if (typeof(fn) === 'function') {
		obj = {};
		fn.call(obj, obj);
	} else
		obj = fn;

	return transform ? TransformBuilder.transform.apply(obj, arguments) : obj;
};

global.SINGLETON = function(name, def) {
	return SINGLETONS[name] || (SINGLETONS[name] = (new Function('return ' + (def || '{}')))());
};

global.NEWTRANSFORM = function(name, fn, isDefault) {
	return TransformBuilder.addTransform.apply(this, arguments);
};

global.NEWSCHEMA = function(group, name) {
	if (!name) {
		name = group;
		group = 'default';
	}
	return framework_builders.newschema(group, name);
};

global.EACHSCHEMA = function(group, fn) {
	return framework_builders.eachschema(group, fn);
};

global.FUNCTION = function(name) {
	return F.functions[name];
};

global.ROUTING = function(name) {
	return F.routing(name);
};

global.SCHEDULE = function(date, each, fn) {
	return F.schedule(date, each, fn);
};

global.FINISHED = function(stream, callback) {
	framework_internal.onFinished(stream, callback);
};

global.DESTROY = function(stream) {
	framework_internal.destroyStream(stream);
};

global.CLEANUP = function(stream, callback) {

	var fn = function() {
		FINISHED(stream, function() {
			DESTROY(stream);
			if (callback) {
				callback();
				callback = null;
			}
		});
	};

	stream.on('error', fn);

	if (stream.readable)
		stream.on('end', fn);
	else
		stream.on('finish', fn);
};

global.SUCCESS = function(success, value) {

	if (typeof(success) === 'function') {
		return function(err, value) {
			success(err, SUCCESS(err, value));
		};
	}

	var err;

	if (success instanceof Error) {
		err = success;
		success = false;
	} else if (success instanceof framework_builders.ErrorBuilder) {
		if (success.hasError()) {
			err = success.output();
			success = false;
		} else
			success = true;
	} else if (success == null)
		success = true;

	SUCCESSHELPER.success = success ? true : false;
	SUCCESSHELPER.value = value == null ? undefined : value;
	SUCCESSHELPER.error = err ? err : undefined;
	return SUCCESSHELPER;
};

global.TRY = function(fn, err) {
	try {
		fn();
		return true;
	} catch (e) {
		err && err(e);
		return false;
	}
};

global.OBSOLETE = function(name, message) {
	console.log(F.datetime.format('yyyy-MM-dd HH:mm:ss') + ' :: OBSOLETE / IMPORTANT ---> "' + name + '"', message);
	if (global.F)
		F.stats.other.obsolete++;
};

global.DEBUG = false;
global.TEST = false;
global.RELEASE = false;
global.is_client = false;
global.is_server = true;

var directory = U.$normalize(require.main ? Path.dirname(require.main.filename) : process.cwd());

// F._service() changes the values below:
var DATE_EXPIRES = new Date().add('y', 1).toUTCString();

const UIDGENERATOR = { date: new Date().format('yyMMddHHmm'), instance: 'abcdefghijklmnoprstuwxy'.split('').random().join('').substring(0, 3), index: 1 };
const EMPTYBUFFER = U.createBufferSize(0);
global.EMPTYBUFFER = EMPTYBUFFER;

const controller_error_status = function(controller, status, problem) {

	if (status !== 500 && problem)
		controller.problem(problem);

	if (controller.res.success || controller.res.headersSent || !controller.isConnected)
		return controller;

	controller.precache && controller.precache(null, null, null);
	controller.req.path = EMPTYARRAY;
	controller.subscribe.success();
	controller.subscribe.route = F.lookup(controller.req, '#' + status, EMPTYARRAY, 0);
	controller.subscribe.exception = problem;
	controller.subscribe.execute(status, true);
	return controller;
};


function Framework() {

	this.id = null;
	this.version = 2400;
	this.version_header = '2.4.0';
	this.version_node = process.version.toString().replace('v', '').replace(/\./g, '').parseFloat();

	this.config = {

		debug: false,
		trace: true,
		'trace-console': true,

		name: 'Total.js',
		version: '1.0.0',
		author: '',
		secret: Os.hostname() + '-' + Os.platform() + '-' + Os.arch(),

		'default-xpoweredby': 'Total.js',
		'etag-version': '',
		'directory-controllers': '/controllers/',
		'directory-components': '/components/',
		'directory-views': '/views/',
		'directory-definitions': '/definitions/',
		'directory-temp': '/tmp/',
		'directory-models': '/models/',
		'directory-resources': '/resources/',
		'directory-public': '/public/',
		'directory-public-virtual': '/app/',
		'directory-modules': '/modules/',
		'directory-source': '/source/',
		'directory-logs': '/logs/',
		'directory-tests': '/tests/',
		'directory-databases': '/databases/',
		'directory-workers': '/workers/',
		'directory-packages': '/packages/',
		'directory-private': '/private/',
		'directory-isomorphic': '/isomorphic/',
		'directory-configs': '/configs/',
		'directory-services': '/services/',
		'directory-themes': '/themes/',

		// all HTTP static request are routed to directory-public
		'static-url': '',
		'static-url-script': '/js/',
		'static-url-style': '/css/',
		'static-url-image': '/img/',
		'static-url-video': '/video/',
		'static-url-font': '/fonts/',
		'static-url-download': '/download/',
		'static-url-components': '/components.',
		'static-accepts': { 'flac': true, 'jpg': true, 'png': true, 'gif': true, 'ico': true, 'js': true, 'css': true, 'txt': true, 'xml': true, 'woff': true, 'woff2': true, 'otf': true, 'ttf': true, 'eot': true, 'svg': true, 'zip': true, 'rar': true, 'pdf': true, 'docx': true, 'xlsx': true, 'doc': true, 'xls': true, 'html': true, 'htm': true, 'appcache': true, 'manifest': true, 'map': true, 'ogv': true, 'ogg': true, 'mp4': true, 'mp3': true, 'webp': true, 'webm': true, 'swf': true, 'package': true, 'json': true, 'md': true, 'm4v': true, 'jsx': true },

		// 'static-accepts-custom': [],

		'default-layout': 'layout',
		'default-theme': '',

		// default maximum request size / length
		// default 10 kB
		'default-request-length': 10,
		'default-websocket-request-length': 2,
		'default-websocket-encodedecode': true,
		'default-maximum-file-descriptors': 0,
		'default-timezone': '',
		'default-root': '',
		'default-response-maxage': '11111111',

		// Seconds (2 minutes)
		'default-cors-maxage': 120,

		// in milliseconds
		'default-request-timeout': 5000,

		// otherwise is used ImageMagick (Heroku supports ImageMagick)
		// gm = graphicsmagick or im = imagemagick
		'default-image-converter': 'gm',
		'default-image-quality': 93,

		'allow-handle-static-files': true,
		'allow-gzip': true,
		'allow-websocket': true,
		'allow-compile-script': true,
		'allow-compile-style': true,
		'allow-compile-html': true,
		'allow-performance': false,
		'allow-custom-titles': false,
		'allow-cache-snapshot': false,
		'disable-strict-server-certificate-validation': true,
		'disable-clear-temporary-directory': false,

		// Used in F._service()
		// All values are in minutes
		'default-interval-clear-resources': 20,
		'default-interval-clear-cache': 10,
		'default-interval-precompile-views': 61,
		'default-interval-websocket-ping': 3,
		'default-interval-clear-dnscache': 120,
		'default-interval-uptodate': 5
	};

	this.global = {};
	this.resources = {};
	this.connections = {};
	this.functions = {};
	this.themes = {};
	this.versions = null;
	this.workflows = {};
	this.uptodates = null;
	this.schedules = [];

	this.isDebug = true;
	this.isTest = false;
	this.isLoaded = false;
	this.isWorker = true;
	this.isCluster = require('cluster').isWorker;

	this.routes = {
		sitemap: null,
		web: [],
		files: [],
		cors: [],
		websockets: [],
		middleware: {},
		redirects: {},
		resize: {},
		request: [],
		views: {},
		merge: {},
		mapping: {},
		packages: {},
		blocks: {},
		resources: {},
		mmr: {}
	};

	this.owners = [];
	this.modificators = null;
	this.helpers = {};
	this.modules = {};
	this.models = {};
	this.sources = {};
	this.controllers = {};
	this.dependencies = {};
	this.isomorphic = {};
	this.components = { has: false, css: false, js: false, views: {}, instances: {}, version: null };
	this.convertors = [];
	this.tests = [];
	this.errors = [];
	this.problems = [];
	this.changes = [];
	this.server = null;
	this.port = 0;
	this.ip = '';

	this.validators = {
		email: new RegExp('^[a-zA-Z0-9-_.+]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
		url: /^(http|https):\/\/(?:(?:(?:[\w\.\-\+!$&'\(\)*\+,;=]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$/i,
		phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
		zip: /^\d{5}(?:[-\s]\d{4})?$/,
		uid: /^\d{14,}[a-z]{3}[01]{1}$/
	};

	this.workers = {};
	this.databases = {};
	this.directory = HEADERS.workers.cwd = directory;
	this.isLE = Os.endianness ? Os.endianness() === 'LE' : true;
	this.isHTTPS = false;
	this.datetime = new Date();

	// It's hidden
	// this.waits = {};

	this.temporary = {
		path: {},
		notfound: {},
		processing: {},
		range: {},
		views: {},
		versions: {},
		dependencies: {}, // temporary for module dependencies
		other: {},
		internal: {} // controllers/modules names for the routing
	};

	this.stats = {

		other: {
			websocketPing: 0,
			websocketCleaner: 0,
			obsolete: 0,
			restart: 0,
			mail: 0
		},

		request: {
			request: 0,
			pending: 0,
			web: 0,
			xhr: 0,
			file: 0,
			websocket: 0,
			get: 0,
			options: 0,
			head: 0,
			post: 0,
			put: 0,
			path: 0,
			upload: 0,
			schema: 0,
			mmr: 0,
			blocked: 0,
			'delete': 0,
			mobile: 0,
			desktop: 0
		},
		response: {
			view: 0,
			json: 0,
			websocket: 0,
			timeout: 0,
			custom: 0,
			binary: 0,
			pipe: 0,
			file: 0,
			image: 0,
			destroy: 0,
			stream: 0,
			streaming: 0,
			plain: 0,
			empty: 0,
			redirect: 0,
			forward: 0,
			notModified: 0,
			sse: 0,
			mmr: 0,
			errorBuilder: 0,
			error400: 0,
			error401: 0,
			error403: 0,
			error404: 0,
			error408: 0,
			error431: 0,
			error500: 0,
			error501: 0
		}
	};

	// intialize cache
	this.cache = new FrameworkCache();
	this.path = new FrameworkPath();

	this._request_check_redirect = false;
	this._request_check_referer = false;
	this._request_check_POST = false;
	this._request_check_robot = false;
	this._length_middleware = 0;
	this._length_request_middleware = 0;
	this._length_files = 0;
	this._length_wait = 0;
	this._length_themes = 0;
	this._length_cors = 0;
	this._length_subdomain_web = 0;
	this._length_subdomain_websocket = 0;
	this._length_convertors = 0;

	this.isVirtualDirectory = false;
	this.isTheme = false;
	this.isWindows = Os.platform().substring(0, 3).toLowerCase() === 'win';
}

// ======================================================
// PROTOTYPES
// ======================================================










































Framework.prototype = {
	get onLocate() {
		return this.onLocale;
	},
	set onLocate(value) {
		OBSOLETE('F.onLocate', 'Rename "F.onLocate" method for "F.onLocale".');
		this.onLocale = value;
	}
}

Framework.prototype.__proto__ = Object.create(Events.EventEmitter.prototype, {
	constructor: {
		value: WebSocket,
		enumberable: false
	}
});

/**
 * Load framework
 * @return {Framework}
 */
Framework.prototype.$load = function(types, targetdirectory) {

	var arr = [];
	var dir = '';

	if (!targetdirectory)
		targetdirectory = directory;

	targetdirectory = '~' + targetdirectory;

	function listing(directory, level, output, extension, isTheme) {

		if (!existsSync(dir))
			return;

		if (!extension)
			extension = '.js';

		Fs.readdirSync(directory).forEach(function(o) {
			var isDirectory = Fs.statSync(Path.join(directory, o)).isDirectory();

			if (isDirectory && isTheme) {
				output.push({ name: o });
				return;
			}

			if (isDirectory) {

				if (extension === '.package' && o.endsWith(extension)) {
					var name = o.substring(0, o.length - extension.length);
					output.push({ name: name[0] === '/' ? name.substring(1) : name, filename: Path.join(dir, o), is: true });
					return;
				}

				level++;
				listing(Path.join(directory, o), level, output, extension);
				return;
			}

			var ext = U.getExtension(o).toLowerCase();
			if (ext)
				ext = '.' + ext;
			if (ext !== extension)
				return;
			var name = (level ? U.$normalize(directory).replace(dir, '') + '/' : '') + o.substring(0, o.length - ext.length);
			output.push({ name: name[0] === '/' ? name.substring(1) : name, filename: Path.join(dir, name) + extension });
		});
	}

	try {
		// Reads name of resources
		F.temporary.internal.resources = Fs.readdirSync(F.path.resources()).map(n => n.substring(0, n.lastIndexOf('.')));
	} catch (e) {
		F.temporary.internal.resources = [];
	}

	if (!types || types.indexOf('modules') !== -1) {
		dir = U.combine(targetdirectory, F.config['directory-modules']);
		arr = [];
		listing(dir, 0, arr, '.js');
		arr.forEach((item) => F.install('module', item.name, item.filename, undefined, undefined, undefined, true));
	}

	if (!types || types.indexOf('isomorphic') !== -1) {
		dir = U.combine(targetdirectory, F.config['directory-isomorphic']);
		arr = [];
		listing(dir, 0, arr, '.js');
		arr.forEach((item) => F.install('isomorphic', item.name, item.filename, undefined, undefined, undefined, true));
	}

	if (!types || types.indexOf('packages') !== -1) {
		dir = U.combine(targetdirectory, F.config['directory-packages']);
		arr = [];
		listing(dir, 0, arr, '.package');

		var dirtmp = U.$normalize(dir);

		arr.forEach(function(item) {

			if (item.is) {
				U.ls(item.filename, function(files, directories) {

					var dir = F.path.temp(item.name) + '.package';

					if (!existsSync(dir))
						Fs.mkdirSync(dir);

					for (var i = 0, length = directories.length; i < length; i++) {
						var target = F.path.temp(U.$normalize(directories[i]).replace(dirtmp, '') + '/');
						if (!existsSync(target))
							Fs.mkdirSync(target);
					}

					files.wait(function(filename, next) {
						var stream = Fs.createReadStream(filename);
						stream.pipe(Fs.createWriteStream(Path.join(dir, filename.replace(item.filename, '').replace(/\.package$/i, ''))));
						stream.on('end', next);
					}, function() {
						// Windows sometimes doesn't load package and delay solves the problem.
						setTimeout(() => F.install('package2', item.name, item.filename, undefined, undefined, undefined, true), 50);
					});
				});
				return;
			}

			F.install('package', item.name, item.filename, undefined, undefined, undefined, true);
		});
	}

	if (!types || types.indexOf('models') !== -1) {
		dir = U.combine(targetdirectory, F.config['directory-models']);
		arr = [];
		listing(dir, 0, arr);
		arr.forEach((item) => F.install('model', item.name, item.filename, undefined, undefined, undefined, true));
	}

	if (!types || types.indexOf('themes') !== -1) {
		arr = [];
		dir = U.combine(targetdirectory, F.config['directory-themes']);
		listing(dir, 0, arr, undefined, true);
		arr.forEach(function(item) {
			var themeName = item.name;
			var themeDirectory = Path.join(dir, themeName);
			var filename = Path.join(themeDirectory, 'index.js');
			F.themes[item.name] = U.path(themeDirectory);
			F._length_themes++;
			existsSync(filename) && F.install('theme', item.name, filename, undefined, undefined, undefined, true);
			/*
			@TODO: FOR FUTURE VERSION
			var components = [];
			var components_dir = U.combine(targetdirectory, F.config['directory-themes'], themeName, F.config['directory-components']);
			existsSync(components_dir) && listing(components_dir, 0, components, '.html', true);
			components_dir && components.forEach((item) => F.install('component', themeName + '/' + item.name, item.filename, undefined, undefined, undefined));
			*/
		});
	}

	if (!types || types.indexOf('definitions') !== -1) {
		dir = U.combine(targetdirectory, F.config['directory-definitions']);
		arr = [];
		listing(dir, 0, arr);
		arr.forEach((item) => F.install('definition', item.name, item.filename, undefined, undefined, undefined, true));
	}

	if (!types || types.indexOf('controllers') !== -1) {
		arr = [];
		dir = U.combine(targetdirectory, F.config['directory-controllers']);
		listing(dir, 0, arr);
		arr.forEach((item) => F.install('controller', item.name, item.filename, undefined, undefined, undefined, true));
	}

	if (!types || types.indexOf('components') !== -1) {
		arr = [];
		dir = U.combine(targetdirectory, F.config['directory-components']);
		listing(dir, 0, arr, '.html');
		arr.forEach((item) => F.install('component', item.name, item.filename, undefined, undefined, undefined));
	}

	F.$routesSort();

	if (!types || types.indexOf('dependencies') !== -1)
		F._configure_dependencies();

	return F;
};

Framework.prototype.$startup = function(callback) {

	var dir = Path.join(directory, '/startup/');

	if (!existsSync(dir))
		return callback();

	var run = [];

	Fs.readdirSync(dir).forEach(function(o) {
		var extension = U.getExtension(o).toLowerCase();
		if (extension === 'js')
			run.push(o);
	});

	if (!run.length)
		return callback();

	run.wait(function(filename, next) {
		var fn = dir + filename + new Date().format('yyMMdd_HHmmss');
		Fs.renameSync(dir + filename, fn);
		var fork = Child.fork(fn, [], { cwd: directory });
		fork.on('exit', function() {
			fork = null;
			next();
		});
	}, callback);

	return this;
};

/**
 * Sort all routes
 * @return {Framework}
 */
Framework.prototype.$routesSort = function(type) {

	F.routes.web.sort(function(a, b) {
		return a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0;
	});

	F.routes.websockets.sort(function(a, b) {
		return a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0;
	});

	var cache = {};
	var length = F.routes.web.length;
	var url;

	for (var i = 0; i < length; i++) {
		var route = F.routes.web[i];
		var name = F.temporary.internal[route.controller];
		if (name)
			route.controller = name;
		if (!route.isMOBILE || route.isUPLOAD || route.isXHR || route.isJSON || route.isSYSTEM || route.isXML || route.flags.indexOf('get') === -1)
			continue;
		url = route.url.join('/');
		cache[url] = true;
	}

	for (var i = 0; i < length; i++) {
		var route = F.routes.web[i];
		if (route.isMOBILE || route.isUPLOAD || route.isXHR || route.isJSON || route.isSYSTEM || route.isXML || route.flags.indexOf('get') === -1)
			continue;
		url = route.url.join('/');
		route.isMOBILE_VARY = cache[url] === true;
	}

	(!type || type === 1) && F.routes.web.forEach(function(route) {
		var tmp = F.routes.web.findItem(function(item) {
			return item.hash === route.hash && item !== route;
		});
		route.isUNIQUE = tmp == null;
	});

	// Clears cache
	Object.keys(F.temporary.other).forEach(function(key) {
		if (key[0] === '#')
			F.temporary.other[key] = undefined;
	});

	return F;
};

Framework.prototype._configure = function(arr, rewrite) {

	var type = typeof(arr);
	if (type === 'string') {
		var filename = prepare_filename(arr);
		if (!existsSync(filename, true))
			return F;
		arr = Fs.readFileSync(filename).toString(ENCODING).split('\n');
	}

	if (!arr) {

		var filenameA = U.combine('/', 'config');
		var filenameB = U.combine('/', 'config-' + (F.config.debug ? 'debug' : 'release'));

		arr = [];

		// read all files from "configs" directory
		var configs = F.path.configs();
		if (existsSync(configs)) {
			var tmp = Fs.readdirSync(configs);
			for (var i = 0, length = tmp.length; i < length; i++) {
				var skip = tmp[i].match(/\-(debug|release|test)$/i);
				if (skip) {
					skip = skip[0].toString().toLowerCase();
					if (skip === '-debug' && !F.isDebug)
						continue;
					if (skip === '-release' && F.isDebug)
						continue;
					if (skip === '-test' && !F.isTest)
						continue;
				}
				arr = arr.concat(Fs.readFileSync(configs + tmp[i]).toString(ENCODING).split('\n'));
			}
		}

		if (existsSync(filenameA) && Fs.lstatSync(filenameA).isFile())
			arr = arr.concat(Fs.readFileSync(filenameA).toString(ENCODING).split('\n'));

		if (existsSync(filenameB) && Fs.lstatSync(filenameB).isFile())
			arr = arr.concat(Fs.readFileSync(filenameB).toString(ENCODING).split('\n'));
	}

	var done = function() {
		process.title = 'total: ' + F.config.name.removeDiacritics().toLowerCase().replace(REG_EMPTY, '-').substring(0, 8);
		F.isVirtualDirectory = existsSync(U.combine(F.config['directory-public-virtual']));
	};

	if (!arr instanceof Array || !arr.length) {
		done();
		return F;
	}

	if (rewrite === undefined)
		rewrite = true;

	var obj = {};
	var accepts = null;
	var length = arr.length;
	var tmp;
	var subtype;
	var value;

	for (var i = 0; i < length; i++) {
		var str = arr[i];

		if (!str || str[0] === '#' || (str[0] === '/' || str[1] === '/'))
			continue;

		var index = str.indexOf(':');
		if (index === -1)
			continue;

		var name = str.substring(0, index).trim();
		if (name === 'debug' || name === 'resources')
			continue;

		value = str.substring(index + 1).trim();
		index = name.indexOf('(');

		if (index !== -1) {
			subtype = name.substring(index + 1, name.indexOf(')')).trim().toLowerCase();
			name = name.substring(0, index).trim();
		} else
			subtype = '';

		switch (name) {
			case 'default-cors-maxage':
			case 'default-request-length':
			case 'default-websocket-request-length':
			case 'default-request-timeout':
			case 'default-interval-clear-cache':
			case 'default-interval-clear-resources':
			case 'default-interval-precompile-views':
			case 'default-interval-uptodate':
			case 'default-interval-websocket-ping':
			case 'default-maximum-file-descriptors':
			case 'default-interval-clear-dnscache':
				obj[name] = U.parseInt(value);
				break;

			case 'static-accepts-custom':
				accepts = value.replace(REG_ACCEPTCLEANER, '').split(',');
				break;

			case 'default-root':
				if (value)
					obj[name] = U.path(value);
				break;

			case 'static-accepts':
				obj[name] = {};
				tmp = value.replace(REG_ACCEPTCLEANER, '').split(',');
				for (var j = 0; j < tmp.length; j++)
					obj[name][tmp[j].substring(1)] = true;
				break;

			case 'allow-gzip':
			case 'allow-websocket':
			case 'allow-performance':
			case 'allow-compile-html':
			case 'allow-compile-style':
			case 'allow-compile-script':
			case 'disable-strict-server-certificate-validation':
			case 'disable-clear-temporary-directory':
			case 'trace':
			case 'allow-cache-snapshot':
				obj[name] = value.toLowerCase() === 'true' || value === '1' || value === 'on';
				break;

			case 'allow-compress-html':
				obj['allow-compile-html'] = value.toLowerCase() === 'true' || value === '1' || value === 'on';
				break;

			case 'version':
				obj[name] = value;
				break;

			default:

				if (subtype === 'string')
					obj[name] = value;
				else if (subtype === 'number' || subtype === 'currency' || subtype === 'float' || subtype === 'double')
					obj[name] = value.isNumber(true) ? value.parseFloat() : value.parseInt();
				else if (subtype === 'boolean' || subtype === 'bool')
					obj[name] = value.parseBoolean();
				else if (subtype === 'eval' || subtype === 'object' || subtype === 'array') {
					try {
						obj[name] = new Function('return ' + value)();
					} catch (e) {
						F.error(e, 'F.configure(' + name + ')');
					}
				} else if (subtype === 'json')
					obj[name] = value.parseJSON();
				else if (subtype === 'date' || subtype === 'datetime' || subtype === 'time')
					obj[name] = value.parseDate();
				else if (subtype === 'env' || subtype === 'environment')
					obj[name] = process.env[value];
				else
					obj[name] = value.isNumber() ? U.parseInt(value) : value.isNumber(true) ? U.parseFloat(value) : value.isBoolean() ? value.toLowerCase() === 'true' : value;
				break;
		}
	}

	U.extend(F.config, obj, rewrite);

	if (!F.config['directory-temp'])
		F.config['directory-temp'] = '~' + U.path(Path.join(Os.tmpdir(), 'totaljs' + F.directory.hash()));

	if (!F.config['etag-version'])
		F.config['etag-version'] = F.config.version.replace(/\.|\s/g, '');

	if (F.config['default-timezone'])
		process.env.TZ = F.config['default-timezone'];

	accepts && accepts.length && accepts.forEach(accept => F.config['static-accepts'][accept] = true);

	if (F.config['disable-strict-server-certificate-validation'] === true)
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

	if (F.config['allow-performance'])
		http.globalAgent.maxSockets = 9999;

	var xpowered = F.config['default-xpoweredby'];

	Object.keys(HEADERS).forEach(function(key) {
		Object.keys(HEADERS[key]).forEach(function(subkey) {
			if (subkey === 'Cache-Control')
				HEADERS[key][subkey] = HEADERS[key][subkey].replace(/max-age=\d+/, 'max-age=' + F.config['default-response-maxage']);
			if (subkey === 'X-Powered-By') {
				if (xpowered)
					HEADERS[key][subkey] = xpowered;
				else
					delete HEADERS[key][subkey];

			}
		});
	});

	IMAGEMAGICK = F.config['default-image-converter'] === 'im';
	done();
	F.emit('configure', F.config);
	return F;
};

Framework.prototype._configure_versions = function(arr, clean) {

	if (arr === undefined || typeof(arr) === 'string') {
		var filename = prepare_filename(arr || 'versions');
		if (existsSync(filename, true))
			arr = Fs.readFileSync(filename).toString(ENCODING).split('\n');
		else
			arr = null;
	}

	if (!arr) {
		if (clean)
			F.versions = null;
		return F;
	}

	if (!clean)
		F.versions = {};

	if (!F.versions)
		F.versions = {};

	for (var i = 0, length = arr.length; i < length; i++) {

		var str = arr[i];

		if (!str || str[0] === '#' || str.substring(0, 3) === '// ')
			continue;

		if (str[0] !== '/')
			str = '/' + str;

		var index = str.indexOf(' :');
		var ismap = false;

		if (index === -1) {
			index = str.indexOf('\t:');
			if (index === -1) {
				index = str.indexOf('-->');
				if (index === -1)
					continue;
				ismap = true;
			}
		}

		var len = ismap ? 3 : 2;
		var key = str.substring(0, index).trim();
		var filename = str.substring(index + len).trim();
		F.versions[key] = filename;
		ismap && F.map(filename, F.path.public(key));
	}

	return F;
};

Framework.prototype._configure_dependencies = function(arr) {

	if (!arr || typeof(arr) === 'string') {
		var filename = prepare_filename(arr || 'dependencies');
		if (existsSync(filename, true))
			arr = Fs.readFileSync(filename).toString(ENCODING).split('\n');
		else
			arr = null;
	}

	if (!arr)
		return F;

	var type;
	var options;
	var interval;

	for (var i = 0, length = arr.length; i < length; i++) {

		var str = arr[i];

		if (!str || str[0] === '#' || str.substring(0, 3) === '// ')
			continue;

		var index = str.indexOf(' :');
		if (index === -1) {
			index = str.indexOf('\t:');
			if (index === -1)
				continue;
		}

		var key = str.substring(0, index).trim();
		var url = str.substring(index + 2).trim();

		options = undefined;
		interval = undefined;

		index = key.indexOf('(');
		if (index !== -1) {
			interval = key.substring(index, key.indexOf(')', index)).replace(/\(|\)/g, '').trim();
			key = key.substring(0, index).trim();
		}

		index = url.indexOf('-->');
		if (index !== -1) {
			var opt = url.substring(index + 3).trim();
			if (opt.isJSON())
				options = JSON.parse(opt);
			url = url.substring(0, index).trim();
		}

		switch (key) {
			case 'package':
			case 'packages':
			case 'pkg':
				type = 'package';
				break;
			case 'module':
			case 'modules':
				type = 'module';
				break;
			case 'model':
			case 'models':
				type = 'model';
				break;
			case 'source':
			case 'sources':
				type = 'source';
				break;
			case 'controller':
			case 'controllers':
				type = 'controller';
				break;
			case 'view':
			case 'views':
				type = 'view';
				break;
			case 'version':
			case 'versions':
				type = 'version';
				break;
			case 'config':
			case 'configuration':
				type = 'config';
				break;
			case 'isomorphic':
			case 'isomorphics':
				type = 'isomorphic';
				break;
			case 'definition':
			case 'definitions':
				type = 'definition';
				break;
			case 'middleware':
			case 'middlewares':
				type = 'middleware';
				break;
			case 'component':
			case 'components':
				type = 'component';
				break;
		}

		if (type) {
			if (interval)
				F.uptodate(type, url, options, interval);
			else
				F.install(type, url, options);
		}
	}

	return F;
};


Framework.prototype._configure_workflows = function(arr, clean) {

	if (arr === undefined || typeof(arr) === 'string') {
		var filename = prepare_filename(arr || 'workflows');
		if (existsSync(filename, true))
			arr = Fs.readFileSync(filename).toString(ENCODING).split('\n');
		else
			arr = null;
	}

	if (clean)
		F.workflows = {};

	if (!arr || !arr.length)
		return F;

	arr.forEach(function(line) {
		line = line.trim();
		if (line.startsWith('//'))
			return;
		var index = line.indexOf(':');
		if (index === -1)
			return;

		var key = line.substring(0, index).trim();
		var response = -1;
		var builder = [];

		// sub-type
		var subindex = key.indexOf('(');
		if (subindex !== -1) {
			var type = key.substring(subindex + 1, key.indexOf(')', subindex + 1)).trim();
			key = key.substring(0, subindex).trim();
			type = type.replace(/^default\//gi, '');
			key = type + '#' + key;
		}

		line.substring(index + 1).split('-->').forEach(function(operation, index) {
			operation = operation.trim().replace(/\"/g, '\'');

			if (operation.endsWith('(response)')) {
				response = index;
				operation = operation.replace('(response)', '').trim();
			}

			var what = operation.split(':');
			if (what.length === 2)
				builder.push('$' + what[0].trim() + '(' + what[1].trim() + ', options)');
			else
				builder.push('$' + what[0] + '(options)');
		});

		F.workflows[key] = new Function('model', 'options', 'callback', 'return model.$async(callback' + (response === -1 ? '' : ', ' + response) + ').' + builder.join('.') + ';');
	});

	return F;
};

Framework.prototype._configure_sitemap = function(arr, clean) {

	if (!arr || typeof(arr) === 'string') {
		var filename = prepare_filename(arr || 'sitemap');
		if (existsSync(filename, true))
			arr = Fs.readFileSync(filename).toString(ENCODING).split('\n');
		else
			arr = null;
	}

	if (!arr || !arr.length)
		return F;

	if (clean || !F.routes.sitemap)
		F.routes.sitemap = {};

	for (var i = 0, length = arr.length; i < length; i++) {

		var str = arr[i];
		if (!str || str[0] === '#' || str.substring(0, 3) === '// ')
			continue;

		var index = str.indexOf(' :');
		if (index === -1) {
			index = str.indexOf('\t:');
			if (index === -1)
				continue;
		}

		var key = str.substring(0, index).trim();
		var val = str.substring(index + 2).trim();
		var a = val.split('-->');
		var url = a[1].trim();
		var wildcard = false;

		if (url.endsWith('*')) {
			wildcard = true;
			url = url.substring(0, url.length - 1);
		}

		var name = a[0].trim();
		var localizeName = name.startsWith('@(');
		var localizeUrl = url.startsWith('@(');

		if (localizeName)
			name = name.substring(2, name.length - 1).trim();

		if (localizeUrl)
			url = url.substring(2, url.length - 1).trim();

		F.routes.sitemap[key] = { name: name, url: url, parent: a[2] ? a[2].trim() : null, wildcard: wildcard, formatName: name.indexOf('{') !== -1, formatUrl: url.indexOf('{') !== -1, localizeName: localizeName, localizeUrl: localizeUrl };
	}

	return F;
};

/**
 * Internal service
 * @private
 * @param {Number} count Run count.
 * @return {Framework}
 */
Framework.prototype._service = function(count) {

	UIDGENERATOR.date = F.datetime.format('yyMMddHHmm');
	UIDGENERATOR.index = 1;

	var releasegc = false;

	// clears temporary memory for non-exist files
	F.temporary.notfound = {};

	// every 7 minutes (default) service clears static cache
	if (count % F.config['default-interval-clear-cache'] === 0) {

		F.emit('clear', 'temporary', F.temporary);
		F.temporary.path = {};
		F.temporary.range = {};
		F.temporary.views = {};
		F.temporary.other = {};
		global.$VIEWCACHE && global.$VIEWCACHE.length && (global.$VIEWCACHE = []);

		// Clears command cache
		Image.clear();

		var dt = F.datetime.add('-5 minutes');
		for (var key in F.databases)
			F.databases[key] && F.databases[key].inmemorylastusage < dt && F.databases[key].release();

		releasegc = true;
	}

	// every 61 minutes (default) services precompile all (installed) views
	if (count % F.config['default-interval-precompile-views'] === 0) {
		for (var key in F.routes.views) {
			var item = F.routes.views[key];
			F.install('view', key, item.url, null);
		}
	}

	if (count % F.config['default-interval-clear-dnscache'] === 0) {
		F.emit('clear', 'dns');
		U.clearDNS();
	}

	var ping = F.config['default-interval-websocket-ping'];
	if (ping > 0 && count % ping === 0) {
		for (var item in F.connections) {
			var conn = F.connections[item];
			if (conn) {
				conn.check();
				conn.ping();
			}
		}
	}

	if (F.uptodates && (count % F.config['default-interval-uptodate'] === 0) && F.uptodates.length) {
		var hasUpdate = false;
		F.uptodates.wait(function(item, next) {

			if (item.updated.add(item.interval) > F.datetime)
				return next();

			item.updated = F.datetime;
			item.count++;

			setTimeout(function() {

				F.install(item.type, item.url, item.options, function(err, name, skip) {

					if (skip)
						return next();

					if (err) {
						item.errors.push(err);
						item.errors.length > 50 && F.errors.shift();
					} else {
						hasUpdate = true;
						item.name = name;
						F.emit('uptodate', item.type, name);
					}

					item.callback && item.callback(err, name);
					next();

				}, undefined, undefined, undefined, undefined, item.name);

			}, item.name ? 500 : 1);

		}, function() {
			if (hasUpdate) {
				F.temporary.path = {};
				F.temporary.range = {};
				F.temporary.views = {};
				F.temporary.other = {};
				global.$VIEWCACHE && global.$VIEWCACHE.length && (global.$VIEWCACHE = []);
			}
		});
	}

	// every 20 minutes (default) service clears resources
	if (count % F.config['default-interval-clear-resources'] === 0) {
		F.emit('clear', 'resources');
		F.resources = {};
		releasegc = true;
	}

	// Update expires date
	count % 1000 === 0 && (DATE_EXPIRES = F.datetime.add('y', 1).toUTCString());

	F.emit('service', count);
	releasegc && global.gc && setTimeout(() => global.gc(), 1000);

	// Run schedules
	if (!F.schedules.length)
		return F;

	var expire = F.datetime.getTime();
	var index = 0;

	while (true) {
		var schedule = F.schedules[index++];
		if (!schedule)
			break;
		if (schedule.expire > expire)
			continue;

		index--;

		if (schedule.repeat)
			schedule.expire = F.datetime.add(schedule.repeat);
		else
			F.schedules.splice(index, 1);

		schedule.fn.call(F);
	}

	return F;
};

/**
 * Initialize framework
 * @param  {Object} http
 * @param  {Boolean} debug
 * @param  {Object} options
 * @return {Framework}
 */
Framework.prototype.initialize = function(http, debug, options, restart) {

	if (!options)
		options = {};

	var port = options.port;
	var ip = options.ip;

	if (options.config)
		U.copy(options.config, F.config);

	F.isHTTPS = typeof(http.STATUS_CODES) === 'undefined';
	if (isNaN(port) && typeof(port) !== 'string')
		port = null;

	F.config.debug = debug;
	F.isDebug = debug;

	global.DEBUG = debug;
	global.RELEASE = !debug;
	global.I = global.isomorphic = F.isomorphic;

	F._configure();
	F._configure_versions();
	F._configure_workflows();
	F._configure_sitemap();
	F.isTest && F._configure('config-test', false);
	F.cache.init();
	F.emit('init');

	// clears static files
	F.clear(function() {

		F.$load(undefined, directory);

		if (!port) {
			if (F.config['default-port'] === 'auto') {
				var envPort = +(process.env.PORT || '');
				if (!isNaN(envPort))
					port = envPort;
			} else
				port = F.config['default-port'];
		}

		F.port = port || 8000;

		if (ip !== null) {
			F.ip = ip || F.config['default-ip'] || '127.0.0.1';
			if (F.ip === 'null' || F.ip === 'undefined' || F.ip === 'auto')
				F.ip = undefined;
		} else
			F.ip = undefined;

		if (F.ip == null)
			F.ip = 'auto';

		if (F.server) {
			F.server.removeAllListeners();

			Object.keys(F.connections).forEach(function(key) {
				var item = F.connections[key];
				if (!item)
					return;
				item.removeAllListeners();
				item.close();
			});

			F.server.close();
		}

		if (options.https)
			F.server = http.createServer(options.https, F.listener);
		else
			F.server = http.createServer(F.listener);

		F.config['allow-performance'] && F.server.on('connection', function(socket) {
			socket.setNoDelay(true);
			socket.setKeepAlive(true, 10);
		});

		F.config['allow-websocket'] && F.server.on('upgrade', F._upgrade);
		F.server.listen(F.port, F.ip === 'auto' ? undefined : F.ip);
		F.isLoaded = true;

		if (!process.connected || restart)
			F.console();

		setTimeout(function() {
			try {
				F.emit('load', F);
				F.emit('ready', F);
			} catch (err) {
				F.error(err, 'F.on("load/ready")');
			}

			F.removeAllListeners('load');
			F.removeAllListeners('ready');
			options.package && INSTALL('package', options.package);
		}, 500);

		if (F.isTest) {
			var sleep = options.sleep || options.delay || 1000;
			global.TEST = true;
			global.assert = require('assert');
			setTimeout(() => F.test(true, options.tests || options.test), sleep);
			return F;
		}

		setTimeout(function() {
			if (F.isTest)
				return;
			delete F.tests;
			delete F.test;
			delete F.testing;
			delete F.assert;
		}, 5000);
	}, true);

	return F;
};

/**
 * Request processing
 * @private
 * @param {Request} req
 * @param {Response} res
 */
Framework.prototype.listener = function(req, res) {

	if (F._length_wait)
		return F.response503(req, res);
	else if (!req.host) // HTTP 1.0 without host
		return F.response400(req, res);

	var headers = req.headers;
	var protocol = req.connection.encrypted || headers['x-forwarded-protocol'] === 'https' ? 'https' : 'http';

	res.req = req;
	req.res = res;
	req.uri = framework_internal.parseURI(protocol, req);

	F.stats.request.request++;
	F.emit('request', req, res);

	if (F._request_check_redirect) {
		var redirect = F.routes.redirects[protocol + '://' + req.host];
		if (redirect) {
			F.stats.response.forward++;
			F.responseRedirect(req, res, redirect.url + (redirect.path ? req.url : ''), redirect.permanent);
			return;
		}
	}

	req.path = framework_internal.routeSplit(req.uri.pathname);
	req.processing = 0;
	req.isAuthorized = true;
	req.xhr = headers['x-requested-with'] === 'XMLHttpRequest';
	res.success = false;
	req.session = null;
	req.user = null;
	req.isStaticFile = F.config['allow-handle-static-files'] && U.isStaticFile(req.uri.pathname);

	var can = true;

	if (req.isStaticFile) {
		req.extension = U.getExtension(req.uri.pathname);
		switch (req.extension) {
			case 'html':
			case 'htm':
			case 'txt':
			case 'md':
				break;
			default:
				can = false;
				break;
		}
	}

	if (can && F.onLocale)
		req.$language = F.onLocale(req, res, req.isStaticFile);

	F._request_stats(true, true);

	if (F._length_request_middleware)
		async_middleware(0, req, res, F.routes.request, () => F._request_continue(res.req, res, res.req.headers, protocol));
	else
		F._request_continue(req, res, headers, protocol);
};

/**
 * Install type with its declaration
 * @param {String} type Available types: model, module, controller, source.
 * @param {String} name Default name (optional).
 * @param {String or Function} declaration
 * @param {Object} options Custom options, optional.
 * @param {Object} internal Internal/Temporary options, optional.
 * @param {Boolean} useRequired Internal, optional.
 * @param {Boolean} skipEmit Internal, optional.
 * @param {String} uptodateName Internal, optional.
 * @return {Framework}
 */
Framework.prototype.install = function(type, name, declaration, options, callback, internal, useRequired, skipEmit, uptodateName) {

	var obj = null;

	if (type !== 'config' && type !== 'version' && typeof(name) === 'string') {
		if (name.startsWith('http://') || name.startsWith('https://')) {
			if (typeof(declaration) === 'object') {
				callback = options;
				options = declaration;
				declaration = name;
				name = '';
			}
		} else if (name[0] === '@') {
			declaration = F.path.package(name.substring(1));
			name = Path.basename(name).replace(/\.js$/i, '');
			if (useRequired === undefined)
				useRequired = true;
		}
	}

	var t = typeof(declaration);
	var key = '';
	var tmp;
	var content;

	F.datetime = new Date();

	if (t === 'object') {
		t = typeof(options);
		if (t === 'function')
			callback = options;
		options = declaration;
		declaration = undefined;
	}

	if (declaration === undefined) {
		declaration = name;
		name = '';
	}

	if (typeof(options) === 'function') {
		callback = options;
		options = undefined;
	}

	// Check if declaration is a valid URL address
	if (type !== 'eval' && typeof(declaration) === 'string') {

		if (declaration.startsWith('http://') || declaration.startsWith('https://')) {
			if (type === 'package') {
				U.download(declaration, REQUEST_INSTALL_FLAGS, function(err, response) {

					if (err) {
						F.error(err, 'F.install(\'{0}\', \'{1}\')'.format(type, declaration), null);
						callback && callback(err);
						return;
					}

					var id = Path.basename(declaration, '.package');
					var filename = F.path.temp(id + '.download');
					var stream = Fs.createWriteStream(filename);
					var md5 = Crypto.createHash('md5');

					response.on('data', (buffer) => md5.update(buffer));
					response.pipe(stream);

					stream.on('finish', function() {
						var hash = md5.digest('hex');

						if (F.temporary.versions[declaration] === hash) {
							callback && callback(null, uptodateName || name, true);
							return;
						}

						F.temporary.versions[declaration] = hash;
						F.install(type, id, filename, options, callback, undefined, undefined, true, uptodateName);
					});
				});
				return F;
			}

			U.request(declaration, REQUEST_INSTALL_FLAGS, function(err, data, code) {

				if (code !== 200 && !err)
					err = new Error(data);

				if (err) {
					F.error(err, 'F.install(\'{0}\', \'{1}\')'.format(type, declaration), null);
					callback && callback(err);
				} else {

					var hash = data.hash('md5');

					if (F.temporary.versions[declaration] === hash) {
						callback && callback(null, uptodateName || name, true);
						return;
					}

					F.temporary.versions[declaration] = hash;
					F.install(type, name, data, options, callback, declaration, undefined, undefined, uptodateName);
				}

			});
			return F;
		} else {
			if (declaration[0] === '~')
				declaration = declaration.substring(1);
			if (type !== 'config' && type !== 'resource' && type !== 'package' && type !== 'component' && !REG_SCRIPTCONTENT.test(declaration)) {
				if (!existsSync(declaration))
					throw new Error('The ' + type + ': ' + declaration + ' doesn\'t exist.');
				useRequired = true;
			}
		}
	}

	if (type === 'middleware') {

		F.routes.middleware[name] = typeof(declaration) === 'function' ? declaration : eval(declaration);
		F._length_middleware = Object.keys(F.routes.middleware).length;

		callback && callback(null, name);

		key = type + '.' + name;

		if (F.dependencies[key]) {
			F.dependencies[key].updated = F.datetime;
		} else {
			F.dependencies[key] = { name: name, type: type, installed: F.datetime, updated: null, count: 0 };
			if (internal)
				F.dependencies[key].url = internal;
		}

		F.dependencies[key].count++;

		setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		return F;
	}

	if (type === 'config' || type === 'configuration' || type === 'settings') {

		F._configure(declaration instanceof Array ? declaration : declaration.toString().split('\n'), true);
		setTimeout(function() {
			delete F.temporary['mail-settings'];
			F.emit(type + '#' + name, F.config);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'version' || type === 'versions') {

		F._configure_versions(declaration.toString().split('\n'));
		setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'workflow' || type === 'workflows') {

		F._configure_workflows(declaration.toString().split('\n'));
		setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'sitemap') {

		F._configure_sitemap(declaration.toString().split('\n'));
		setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'component') {

		if (!name && internal)
			name = U.getName(internal).replace(/\.html/gi, '').trim();

		F.uninstall(type, uptodateName || name, uptodateName ? 'uptodate' : undefined);

		var hash = '\n/*' + name.hash() + '*/\n';
		var temporary = (F.id ? 'i-' + F.id + '_' : '') + 'components';
		content = parseComponent(internal ? declaration : Fs.readFileSync(declaration).toString(ENCODING), name);
		content.js && Fs.appendFileSync(F.path.temp(temporary + '.js'), hash + (F.config.debug ? component_debug(name, content.js, 'js') : content.js) + hash.substring(0, hash.length - 1));
		content.css && Fs.appendFileSync(F.path.temp(temporary + '.css'), hash + (F.config.debug ? component_debug(name, content.css, 'css') : content.css) + hash.substring(0, hash.length - 1));

		if (content.js)
			F.components.js = true;

		if (content.css)
			F.components.css = true;

		F.components.views[name] = '.' + F.path.temp('component_' + name);
		F.components.has = true;

		Fs.writeFile(F.components.views[name].substring(1) + '.html', U.minifyHTML(content.body), NOOP);

		var link = F.config['static-url-components'];
		F.components.version = F.datetime.getTime();
		F.components.links = (F.components.js ? '<script src="{0}js?version={1}"></script>'.format(link, F.components.version) : '') + (F.components.css ? '<link type="text/css" rel="stylesheet" href="{0}css?version={1}" />'.format(link, F.components.version) : '');

		if (content.install) {
			try {
				_owner = type + '#' + name;
				var obj = (new Function('var exports={};' + content.install + ';return exports;'))();
				obj.$owner = _owner;
				_controller = '';
				F.components.instances[name] = obj;
				obj = typeof(obj.install) === 'function' && obj.install(options || F.config[_owner], name);
			} catch(e) {
				F.error(e, 'F.install(\'component\', \'{0}\')'.format(name));
			}
		} else if (!internal) {
			var js = declaration.replace(/\.html$/i, '.js');
			if (existsSync(js)) {
				_owner = type + '#' + name;
				obj = require(js);
				obj.$owner = _owner;
				_controller = '';
				F.components.instances[name] = obj;
				typeof(obj.install) === 'function' && obj.install(options || F.config[_owner], name);
				(function(name, filename) {
					setTimeout(function() {
						delete require.cache[name];
					}, 1000);
				})(require.resolve(declaration), declaration);
			}
		}

		!skipEmit && setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'package') {

		var backup = new Backup();
		var id = Path.basename(declaration, '.' + U.getExtension(declaration));
		var dir = F.config['directory-temp'][0] === '~' ? Path.join(F.config['directory-temp'].substring(1), id + '.package') : Path.join(F.path.root(), F.config['directory-temp'], id + '.package');

		F.routes.packages[id] = dir;
		backup.restore(declaration, dir, function() {

			var filename = Path.join(dir, 'index.js');
			if (!existsSync(filename)) {
				callback && callback(null, name);
				return;
			}

			F.install('module', id, filename, options, function(err) {

				setTimeout(function() {
					F.emit(type + '#' + name);
					F.emit('install', type, name);
				}, 500);

				callback && callback(err, name);
			}, internal, useRequired, true);
		});

		return F;
	}

	if (type === 'theme') {

		_owner = type + '#' + name;
		obj = require(declaration);
		obj.$owner = _owner;

		typeof(obj.install) === 'function' && obj.install(options || F.config[_owner], name);

		!skipEmit && setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);

		(function(name, filename) {
			setTimeout(function() {
				delete require.cache[name];
			}, 1000);
		})(require.resolve(declaration), declaration);
		return F;
	}

	if (type === 'package2') {
		var id = U.getName(declaration, '.package');
		var dir = F.config['directory-temp'][0] === '~' ? Path.join(F.config['directory-temp'].substring(1), id) : Path.join(F.path.root(), F.config['directory-temp'], id);
		var filename = Path.join(dir, 'index.js');
		F.install('module', id, filename, options, function(err) {
			setTimeout(function() {
				F.emit(type + '#' + name);
				F.emit('install', type, name);
			}, 500);
			callback && callback(err, name);
		}, internal, useRequired, true);
		return F;
	}

	var plus = F.id ? 'i-' + F.id + '_' : '';

	if (type === 'view') {

		var item = F.routes.views[name];
		key = type + '.' + name;

		if (item === undefined) {
			item = {};
			item.filename = F.path.temporary(plus + 'installed-view-' + U.GUID(10) + '.tmp');
			item.url = internal;
			item.count = 0;
			F.routes.views[name] = item;
		}

		item.count++;
		Fs.writeFileSync(item.filename, framework_internal.modificators(declaration, name));

		setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'definition' || type === 'eval') {

		_controller = '';
		_owner = type + '#' + name;

		try {

			if (useRequired) {
				delete require.cache[require.resolve(declaration)];
				obj = require(declaration);

				(function(name) {
					setTimeout(() => delete require.cache[name], 1000);
				})(require.resolve(declaration));
			}
			else
				obj = typeof(declaration) === 'function' ? eval('(' + declaration.toString() + ')()') : eval(declaration);

		} catch (ex) {
			F.error(ex, 'F.install(\'' + type + '\')', null);
			callback && callback(ex, name);
			return F;
		}

		callback && callback(null, name);

		setTimeout(function() {
			F.emit(type + '#' + name);
			F.emit('install', type, name);
		}, 500);

		return F;
	}

	if (type === 'isomorphic') {

		content = '';

		try {

			if (!name && typeof(internal) === 'string') {
				var tmp = internal.match(/[a-z0-9]+\.js$/i);
				if (tmp)
					name = tmp.toString().replace(/\.js/i, '');
			}

			if (useRequired) {
				delete require.cache[require.resolve(declaration)];
				obj = require(declaration);
				content = Fs.readFileSync(declaration).toString(ENCODING);
				(function(name) {
					setTimeout(() => delete require.cache[name], 1000);
				})(require.resolve(declaration));
			}
			else {
				obj = typeof(declaration) === 'function' ? eval('(' + declaration.toString() + ')()') : eval(declaration);
				content = declaration.toString();
			}

		} catch (ex) {
			F.error(ex, 'F.install(\'' + type + '\')', null);
			callback && callback(ex, name);
			return F;
		}

		if (typeof(obj.id) === 'string')
			name = obj.id;
		else if (typeof(obj.name) === 'string')
			name = obj.name;

		if (obj.url) {
			if (obj.url[0] !== '/')
				obj.url = '/' + obj.url;
		} else
			obj.url = '/' + name + '.js';

		tmp = F.path.temp('isomorphic_' + name + '.min.js');
		F.map(framework_internal.preparePath(obj.url), tmp);
		F.isomorphic[name] = obj;
		Fs.writeFileSync(tmp, prepare_isomorphic(name, framework_internal.compile_javascript(content, '#' + name)));
		callback && callback(null, name);

		setTimeout(function() {
			F.emit(type + '#' + name, obj);
			F.emit('install', type, name, obj);
		}, 500);

		return F;
	}

	if (type === 'model' || type === 'source') {

		_controller = '';
		_owner = type + '#' + name;

		try {

			if (useRequired) {
				obj = require(declaration);
				(function(name) {
					setTimeout(() => delete require.cache[name], 1000);
				})(require.resolve(declaration));
			}
			else {

				if (typeof(declaration) !== 'string')
					declaration = declaration.toString();

				if (!name && typeof(internal) === 'string') {
					var tmp = internal.match(/[a-z0-9]+\.js$/i);
					if (tmp)
						name = tmp.toString().replace(/\.js/i, '');
				}

				var filename = F.path.temporary(plus + 'installed-' + type + '-' + U.GUID(10) + '.js');
				Fs.writeFileSync(filename, declaration);
				obj = require(filename);

				(function(name, filename) {
					setTimeout(function() {
						Fs.unlinkSync(filename);
						delete require.cache[name];
					}, 1000);
				})(require.resolve(filename), filename);
			}

		} catch (ex) {
			F.error(ex, 'F.install(\'' + type + '\', \'' + name + '\')', null);
			callback && callback(ex, name);
			return F;
		}

		if (typeof(obj.id) === 'string')
			name = obj.id;
		else if (typeof(obj.name) === 'string')
			name = obj.name;

		_owner = type + '#' + name;
		obj.$owner = _owner;

		if (!name)
			name = (Math.random() * 10000) >> 0;

		key = type + '.' + name;
		tmp = F.dependencies[key];

		F.uninstall(type, uptodateName || name, uptodateName ? 'uptodate' : undefined);

		if (tmp) {
			F.dependencies[key] = tmp;
			F.dependencies[key].updated = F.datetime;
		}
		else {
			F.dependencies[key] = { name: name, type: type, installed: F.datetime, updated: null, count: 0 };
			if (internal)
				F.dependencies[key].url = internal;
		}

		F.dependencies[key].count++;

		if (obj.reinstall)
			F.dependencies[key].reinstall = obj.reinstall.toString().parseDateExpiration();
		else
			delete F.dependencies[key];

		if (type === 'model')
			F.models[name] = obj;
		else
			F.sources[name] = obj;

		typeof(obj.install) === 'function' && obj.install(options || F.config[_owner], name);

		!skipEmit && setTimeout(function() {
			F.emit(type + '#' + name, obj);
			F.emit('install', type, name, obj);
		}, 500);

		callback && callback(null, name);
		return F;
	}

	if (type === 'module' || type === 'controller') {

		// for inline routes
		var _ID = _controller = 'TMP' + U.random(10000);
		_owner = type + '#' + name;

		try {
			if (useRequired) {
				obj = require(declaration);
				(function(name) {
					setTimeout(function() {
						delete require.cache[name];
					}, 1000);
				})(require.resolve(declaration));
			} else {

				if (typeof(declaration) !== 'string')
					declaration = declaration.toString();

				if (!name && typeof(internal) === 'string') {
					var tmp = internal.match(/[a-z0-9]+\.js$/i);
					if (tmp)
						name = tmp.toString().replace(/\.js/i, '');
				}
				filename = F.path.temporary(plus + 'installed-' + type + '-' + U.GUID(10) + '.js');
				Fs.writeFileSync(filename, declaration);
				obj = require(filename);
				(function(name, filename) {
					setTimeout(function() {
						Fs.unlinkSync(filename);
						delete require.cache[name];
					}, 1000);
				})(require.resolve(filename), filename);
			}

		} catch (ex) {
			F.error(ex, 'F.install(\'' + type + '\', \'' + (name ? '' : internal) + '\')', null);
			callback && callback(ex, name);
			return F;
		}

		if (typeof(obj.id) === 'string')
			name = obj.id;
		else if (typeof(obj.name) === 'string')
			name = obj.name;

		if (!name)
			name = (Math.random() * 10000) >> 0;

		_owner = type + '#' + name;
		obj.$owner = _owner;

		obj.booting && setTimeout(function() {

			var tmpdir = F.path.temp(name + '.package/');
			if (obj.booting === 'root') {
				F.directory = directory = tmpdir;
				F.temporary.path = {};
				F.temporary.notfound = {};
				F._configure();
				F._configure_versions();
				F._configure_dependencies();
				F._configure_sitemap();
				F._configure_workflows();
			} else {

				F._configure('@' + name + '/config');

				if (F.config.debug)
					F._configure('@' + name + '/config-debug');
				else
					F._configure('@' + name + '/config-release');

				F.isTest && F._configure('@' + name + '/config-test');
				F._configure_versions('@' + name + '/versions');
				F._configure_dependencies('@' + name + '/dependencies');
				F._configure_sitemap('@' + name + '/sitemap');
				F._configure_workflows('@' + name + '/workflows');
			}

			F.$load(undefined, tmpdir);
		}, 100);

		key = type + '.' + name;
		tmp = F.dependencies[key];

		F.uninstall(type, uptodateName || name, uptodateName ? 'uptodate' : undefined);

		if (tmp) {
			F.dependencies[key] = tmp;
			F.dependencies[key].updated = F.datetime;
		}
		else {
			F.dependencies[key] = { name: name, type: type, installed: F.datetime, updated: null, count: 0, _id: _ID };
			if (internal)
				F.dependencies[key].url = internal;
		}

		F.dependencies[key].dependencies = obj.dependencies;
		F.dependencies[key].count++;
		F.dependencies[key].processed = false;

		if (obj.reinstall)
			F.dependencies[key].reinstall = obj.reinstall.toString().parseDateExpiration();
		else
			delete F.dependencies[key].reinstall;

		_controller = _ID;

		if (obj.dependencies instanceof Array) {
			for (var i = 0, length = obj.dependencies.length; i < length; i++) {
				if (!F.dependencies[type + '.' + obj.dependencies[i]]) {
					F.temporary.dependencies[key] = { obj: obj, options: options, callback: callback, skipEmit: skipEmit };
					return F;
				}
			}
		}

		F.install_make(key, name, obj, options, callback, skipEmit, type);

		if (type === 'module')
			F.modules[name] = obj;
		else
			F.controllers[name] = obj;

		F.install_prepare();
	}

	return F;
};

Framework.prototype.install_prepare = function(noRecursive) {

	var keys = Object.keys(F.temporary.dependencies);

	if (!keys.length)
		return;

	// check dependencies
	for (var i = 0, length = keys.length; i < length; i++) {

		var k = keys[i];
		var a = F.temporary.dependencies[k];
		var b = F.dependencies[k];
		var skip = false;

		if (b.processed)
			continue;

		for (var j = 0, jl = b.dependencies.length; j < jl; j++) {
			var d = F.dependencies['module.' + b.dependencies[j]];
			if (!d || !d.processed) {
				skip = true;
				break;
			}
		}

		if (skip)
			continue;

		delete F.temporary.dependencies[k];

		if (b.type === 'module')
			F.modules[b.name] = a.obj;
		else
			F.controllers[b.name] = a.obj;

		F.install_make(k, b.name, a.obj, a.options, a.callback, a.skipEmit, b.type);
	}

	keys = Object.keys(F.temporary.dependencies);

	clearTimeout(F.temporary.other.dependencies);
	F.temporary.other.dependencies = setTimeout(function() {
		var keys = Object.keys(F.temporary.dependencies);
		if (keys.length)
			throw new Error('Dependency exception (module): missing dependencies for: ' + keys.join(', ').trim());
		delete F.temporary.other.dependencies;
	}, 1500);

	if (!keys.length || noRecursive)
		return F;

	F.install_prepare(true);
	return F;
};

Framework.prototype.install_make = function(key, name, obj, options, callback, skipEmit, type) {

	var me = F.dependencies[key];
	var routeID = me._id;
	var type = me.type;

	F.temporary.internal[me._id] = name;
	_controller = routeID;
	_owner = type + '#' + name.replace(/\.package$/gi, '');

	typeof(obj.install) === 'function' && obj.install(options || F.config[_owner], name);
	me.processed = true;

	var id = (type === 'module' ? '#' : '') + name;
	var length = F.routes.web.length;
	for (var i = 0; i < length; i++) {
		if (F.routes.web[i].controller === routeID)
			F.routes.web[i].controller = id;
	}

	length = F.routes.websockets.length;
	for (var i = 0; i < length; i++) {
		if (F.routes.websockets[i].controller === routeID)
			F.routes.websockets[i].controller = id;
	}

	length = F.routes.files.length;
	for (var i = 0; i < length; i++) {
		if (F.routes.files[i].controller === routeID)
			F.routes.files[i].controller = id;
	}

	F.$routesSort();
	_controller = '';

	if (!skipEmit) {
		setTimeout(function() {
			F.emit(type + '#' + name, obj);
			F.emit('install', type, name, obj);
		}, 500);
	}

	callback && callback(null, name);
	return F;
};

/**
 * Uninstall type
 * @param {String} type Available types: model, module, controller, source.
 * @param {String} name
 * @param {Object} options Custom options, optional.
 * @param {Object} skipEmit Internal, optional.
 * @return {Framework}
 */
Framework.prototype.uninstall = function(type, name, options, skipEmit) {

	var obj = null;
	var id = type + '#' + name;

	if (type === 'schema') {
		framework_builders.remove(name);
	} else if (type === 'mapping') {
		delete F.routes.mapping[name];
	} else if (type === 'isomorphic') {
		var obj = F.isomorphic[name];
		if (obj.url)
			delete F.routes.mapping[F._version(obj.url)];
		delete F.isomorphic[name];
	} else if (type === 'middleware') {

		if (!F.routes.middleware[name])
			return F;

		delete F.routes.middleware[name];
		delete F.dependencies[type + '.' + name];
		F._length_middleware = Object.keys(F.routes.middleware).length;

		var tmp;

		for (var i = 0, length = F.routes.web.length; i < length; i++) {
			tmp = F.routes.web[i];
			if (tmp.middleware && tmp.middleware.length)
				tmp.middleware = tmp.middleware.remove(name);
		}

		for (var i = 0, length = F.routes.websockets.length; i < length; i++) {
			tmp = F.routes.websocket[i];
			if (tmp.middleware && tmp.middleware.length)
				tmp.middleware = tmp.middleware.remove(name);
		}

		for (var i = 0, length = F.routes.files.length; i < length; i++) {
			tmp = F.routes.files[i];
			if (tmp.middleware && tmp.middleware.length)
				tmp.middleware = tmp.middleware.remove(name);
		}

	} else if (type === 'package') {
		delete F.routes.packages[name];
		F.uninstall('module', name, options, true);
		return F;
	} else if (type === 'view' || type === 'precompile') {

		obj = F.routes.views[name];

		if (!obj)
			return F;

		delete F.routes.views[name];
		delete F.dependencies[type + '.' + name];

		fsFileExists(obj.filename, function(e) {
			e && Fs.unlink(obj.filename, NOOP);
		});

	} else if (type === 'model' || type === 'source') {

		obj = type === 'model' ? F.models[name] : F.sources[name];

		if (!obj)
			return F;

		if (obj.id)
			delete require.cache[require.resolve(obj.id)];

		F.$uninstall(id);
		typeof(obj.uninstall) === 'function' && obj.uninstall(options, name);

		if (type === 'model')
			delete F.models[name];
		else
			delete F.sources[name];

		delete F.dependencies[type + '.' + name];

	} else if (type === 'module' || type === 'controller') {

		var isModule = type === 'module';
		obj = isModule ? F.modules[name] : F.controllers[name];

		if (!obj)
			return F;

		if (obj.id)
			delete require.cache[require.resolve(obj.id)];

		F.$uninstall(id, (isModule ? '#' : '') + name);

		if (obj) {
			obj.uninstall && obj.uninstall(options, name);
			if (isModule)
				delete F.modules[name];
			else
				delete F.controllers[name];
		}

	} else if (type === 'component') {

		if (!F.components.instances[name])
			return F;

		obj = F.components.instances[name];

		if (obj) {
			F.$uninstall(id);
			obj.uninstall && obj.uninstall(options, name);
			delete F.components.instances[name];
		}

		delete F.components.instances[name];
		delete F.components.views[name];

		var temporary = (F.id ? 'i-' + F.id + '_' : '') + 'components';
		var data;
		var index;
		var beg = '\n/*' + name.hash() + '*/\n';
		var end = beg.substring(0, beg.length - 1);
		var is = false;

		if (F.components.js) {
			data = Fs.readFileSync(F.path.temp(temporary + '.js')).toString('utf-8');
			index = data.indexOf(beg);
			if (index !== -1) {
				data = data.substring(0, index) + data.substring(data.indexOf(end, index + end.length) + end.length);
				Fs.writeFileSync(F.path.temp(temporary + '.js'), data);
				is = true;
			}
		}

		if (F.components.css) {
			data = Fs.readFileSync(F.path.temp(temporary + '.css')).toString('utf-8');
			index = data.indexOf(beg);
			if (index !== -1) {
				data = data.substring(0, index) + data.substring(data.indexOf(end, index +end.length) + end.length);
				Fs.writeFileSync(F.path.temp(temporary + '.css'), data);
				is = true;
			}
		}

		if (is)
			F.components.version = U.GUID(5);
	}

	!skipEmit && F.emit('uninstall', type, name);
	return F;
};


/**
 * Add a route
 * @param {String} url
 * @param {Function} funcExecute Action.
 * @param {String Array} flags
 * @param {Number} length Maximum length of request data.
 * @param {String Array} middleware Loads custom middleware.
 * @param {Number timeout Response timeout.
 * @return {Framework}
 */
Framework.prototype.web = Framework.prototype.route = function(url, funcExecute, flags, length, language) {

	var name;
	var tmp;
	var viewname;
	var sitemap;
	var sitemap_language = language !== undefined;

	if (url instanceof Array) {
		url.forEach(url => F.route(url, funcExecute, flags, length));
		return F;
	}

	var CUSTOM = typeof(url) === 'function' ? url : null;
	if (CUSTOM)
		url = '/';

	if (url[0] === '#') {
		url = url.substring(1);
		if (url !== '400' && url !== '401' && url !== '403' && url !== '404' && url !== '408' && url !== '431' && url !== '500' && url !== '501') {

			var sitemapflags = funcExecute instanceof Array ? funcExecute : flags;
			if (!(sitemapflags instanceof Array))
				sitemapflags = EMPTYARRAY;

			sitemap = F.sitemap(url, true, language);
			if (sitemap) {

				name = url;
				url = sitemap.url;
				if (sitemap.wildcard)
					url += '*';

				if (sitemap.localizeUrl) {
					if (language === undefined) {
						sitemap_language = true;
						var sitemaproutes = {};
						F.temporary.internal.resources.forEach(function(language) {
							var item = F.sitemap(sitemap.id, true, language);
							if (item.url && item.url !== url)
								sitemaproutes[item.url] = { name: sitemap.id, language: language };
						});

						Object.keys(sitemaproutes).forEach(key => F.route('#' + sitemap.id, funcExecute, flags, length, sitemaproutes[key].language));
					}
				}

			} else
				throw new Error('Sitemap item "' + url + '" not found.');
		} else
			url = '#' + url;
	}

	if (!url)
		url = '/';

	if (url[0] !== '[' && url[0] !== '/')
		url = '/' + url;

	if (url.endsWith('/'))
		url = url.substring(0, url.length - 1);

	url = framework_internal.encodeUnicodeURL(url);

	var type = typeof(funcExecute);
	var index = 0;
	var urlcache = url;

	if (!name)
		name = url;

	if (type === 'object' || funcExecute instanceof Array) {
		tmp = funcExecute;
		funcExecute = flags;
		flags = tmp;
	}

	var priority = 0;
	var subdomain = null;

	priority = url.count('/');

	if (url[0] === '[') {
		index = url.indexOf(']');
		if (index > 0) {
			subdomain = url.substring(1, index).trim().toLowerCase().split(',');
			url = url.substring(index + 1);
			priority += subdomain.indexOf('*') !== -1 ? 50 : 100;
		}
	}

	var isASTERIX = url.indexOf('*') !== -1;
	if (isASTERIX) {
		url = url.replace('*', '').replace('//', '/');
		priority = priority - 100;
	}

	var isRaw = false;
	var isNOXHR = false;
	var method = '';
	var schema;
	var workflow;
	var isMOBILE = false;
	var isJSON = false;
	var isDELAY = false;
	var isROBOT = false;
	var isBINARY = false;
	var isCORS = false;
	var isROLE = false;
	var middleware = null;
	var timeout;
	var options;
	var corsflags = [];
	var membertype = 0;
	var isGENERATOR = false;
	var description;

	if (_flags) {
		if (!flags)
			flags = [];
		_flags.forEach(function(flag) {
			flags.indexOf(flag) === -1 && flags.push(flag);
		});
	}

	if (flags) {

		tmp = [];
		var count = 0;

		for (var i = 0; i < flags.length; i++) {

			var tt = typeof(flags[i]);

			if (tt === 'number') {
				timeout = flags[i];
				continue;
			}

			if (tt === 'object') {
				options = flags[i];
				continue;
			}

			var first = flags[i][0];

			if (first === '&') {
				// resource (sitemap localization)
				// doesn't used now
				continue;
			}

			// TODO: remove in future versions
			if (first === '%') {
				F.behaviour();
				continue;
			}

			if (first === '#') {
				if (!middleware)
					middleware = [];
				middleware.push(flags[i].substring(1));
				continue;
			}

			if (first === '*') {

				workflow = flags[i].trim().substring(1);
				index = workflow.indexOf('-->');

				if (index !== -1) {
					schema = workflow.substring(0, index).trim();
					workflow = workflow.substring(index + 3).trim();
				} else {
					schema = workflow;
					workflow = null;
				}
				schema = schema.replace(/\\/g, '/').split('/');

				if (schema.length === 1) {
					schema[1] = schema[0];
					schema[0] = 'default';
				}

				index = schema[1].indexOf('#');
				if (index !== -1) {
					schema[2] = schema[1].substring(index + 1).trim();
					schema[1] = schema[1].substring(0, index).trim();
				}

				continue;
			}

			// Comment
			if (flags[i].substring(0, 3) === '// ') {
				description = flags[i].substring(3).trim();
				continue;
			}

			var flag = flags[i].toString().toLowerCase();

			if (flag.startsWith('http://') || flag.startsWith('https://')) {
				corsflags.push(flag);
				continue;
			}

			count++;

			switch (flag) {

				case 'json':
					isJSON = true;
					continue;

				case 'delay':
					count--;
					isDELAY = true;
					continue;

				case 'binary':
					isBINARY = true;
					continue;

				case 'cors':
					isCORS = true;
					count--;
					continue;

				case 'credential':
				case 'credentials':
					corsflags.push(flag);
					count--;
					continue;

				case 'sync':
				case 'yield':
				case 'synchronize':
					isGENERATOR = true;
					count--;
					continue;

				case 'noxhr':
				case '-xhr':
					isNOXHR = true;
					continue;
				case 'raw':
					isRaw = true;
					tmp.push(flag);
					break;
				case 'mobile':
					isMOBILE = true;
					break;
				case 'robot':
					isROBOT = true;
					F._request_check_robot = true;
					break;
				case 'authorize':
				case 'authorized':
				case 'logged':
					membertype = 1;
					priority += 2;
					tmp.push('authorize');
					break;
				case 'unauthorize':
				case 'unauthorized':
				case 'unlogged':
					membertype = 2;
					priority += 2;
					tmp.push('unauthorize');
					break;
				case 'referer':
				case 'referrer':
					tmp.push('referer');
					break;
				case 'delete':
				case 'get':
				case 'head':
				case 'options':
				case 'patch':
				case 'post':
				case 'propfind':
				case 'put':
				case 'trace':
					tmp.push(flag);
					method += (method ? ',' : '') + flag;
					corsflags.push(flag);
					break;
				default:
					if (flag[0] === '@')
						isROLE = true;
					tmp.push(flag);
					break;
			}
		}
		flags = tmp;
		priority += (count * 2);
	} else {
		flags = ['get'];
		method = 'get';
	}

	if (type === 'string') {
		viewname = funcExecute;
		funcExecute = (function(name, sitemap, language) {
			if (language && !this.language)
				this.language = language;
			var themeName = U.parseTheme(name);
			if (themeName)
				name = prepare_viewname(name);
			return function() {
				sitemap && this.sitemap(sitemap.id, language);
				if (name[0] === '~')
					this.themeName = '';
				else if (themeName)
					this.themeName = themeName;

				if (!this.route.workflow)
					return this.view(name);
				var self = this;
				this.$exec(this.route.workflow, this, function(err, response) {
					if (err)
						self.content(err);
					else
						self.view(name, response);
				});
			};
		})(viewname, sitemap, language);
	} else if (typeof(funcExecute) !== 'function') {

		viewname = (sitemap && sitemap.url !== '/' ? sitemap.id : workflow ? '' : url) || '';

		if (!workflow || (!viewname && !workflow)) {
			if (viewname.endsWith('/'))
				viewname = viewname.substring(0, viewname.length - 1);

			index = viewname.lastIndexOf('/');
			if (index !== -1)
				viewname = viewname.substring(index + 1);

			if (!viewname || viewname === '/')
				viewname = 'index';

			funcExecute = (function(name, sitemap, language) {
				return function() {
					if (language && !this.language)
						this.language = language;
					sitemap && this.sitemap(sitemap.id, language);
					name[0] === '~' && this.theme('');
					if (!this.route.workflow)
						return this.view(name);
					var self = this;
					this.$exec(this.route.workflow, this, function(err, response) {
						if (err)
							self.content(err);
						else
							self.view(name, response);
					});
				};
			})(viewname, sitemap, language);
		} else if (workflow)
			funcExecute = controller_json_workflow;
	}

	if (!isGENERATOR)
		isGENERATOR = (funcExecute.constructor.name === 'GeneratorFunction' || funcExecute.toString().indexOf('function*') === 0);

	var url2 = framework_internal.preparePath(url.trim());
	var urlraw = U.path(url2) + (isASTERIX ? '*' : '');
	var hash = url2.hash();
	var routeURL = framework_internal.routeSplitCreate(url2);
	var arr = [];
	var reg = null;
	var regIndex = null;

	if (url.indexOf('{') !== -1) {
		routeURL.forEach(function(o, i) {
			if (o.substring(0, 1) !== '{')
				return;

			arr.push(i);

			var sub = o.substring(1, o.length - 1);

			if (sub[0] !== '/')
				return;

			var index = sub.lastIndexOf('/');
			if (index === -1)
				return;

			if (!reg) {
				reg = {};
				regIndex = [];
			}

			reg[i] = new RegExp(sub.substring(1, index), sub.substring(index + 1));
			regIndex.push(i);
		});

		priority -= arr.length;
	}

	if (url.indexOf('#') !== -1)
		priority -= 100;

	if (flags.indexOf('proxy') !== -1) {
		isJSON = true;
		priority++;
	}

	if ((isJSON || flags.indexOf('xml') !== -1 || isRaw) && (flags.indexOf('delete') === -1 && flags.indexOf('post') === -1 && flags.indexOf('put') === -1) && flags.indexOf('patch') === -1) {
		flags.push('post');
		method += (method ? ',' : '') + 'post';
		priority++;
	}

	if (flags.indexOf('upload') !== -1) {
		if (flags.indexOf('post') === -1 && flags.indexOf('put') === -1) {
			flags.push('post');
			method += (method ? ',' : '') + 'post';
		}
	}

	if (flags.indexOf('get') === -1 &&
		flags.indexOf('options') === -1 &&
		flags.indexOf('post') === -1 &&
		flags.indexOf('delete') === -1 &&
		flags.indexOf('put') === -1 &&
		flags.indexOf('upload') === -1 &&
		flags.indexOf('head') === -1 &&
		flags.indexOf('trace') === -1 &&
		flags.indexOf('patch') === -1 &&
		flags.indexOf('propfind') === -1) {
			flags.push('get');
			method += (method ? ',' : '') + 'get';
		}

	if (flags.indexOf('referer') !== -1)
		F._request_check_referer = true;

	if (!F._request_check_POST && (flags.indexOf('delete') !== -1 || flags.indexOf('post') !== -1 || flags.indexOf('put') !== -1 || flags.indexOf('upload') !== -1 || flags.indexOf('json') !== -1 || flags.indexOf('patch') !== -1 || flags.indexOf('options') !== -1))
		F._request_check_POST = true;

	var isMULTIPLE = false;

	if (method.indexOf(',') !== -1)
		isMULTIPLE = true;

	if (method.indexOf(',') !== -1 || method === '')
		method = undefined;
	else
		method = method.toUpperCase();

	if (name[1] === '#')
		name = name.substring(1);

	if (isBINARY && !isRaw) {
		isBINARY = false;
		console.warn('F.route() skips "binary" flag because the "raw" flag is not defined.');
	}

	if (subdomain)
		F._length_subdomain_web++;

	F.routes.web.push({
		hash: hash,
		name: name,
		priority: priority,
		sitemap: sitemap ? sitemap.id : '',
		schema: schema,
		workflow: workflow,
		subdomain: subdomain,
		description: description,
		controller: _controller ? _controller : 'unknown',
		owner: _owner,
		urlraw: urlraw,
		url: routeURL,
		param: arr,
		flags: flags || EMPTYARRAY,
		flags2: flags_to_object(flags),
		method: method,
		execute: funcExecute,
		length: (length || F.config['default-request-length']) * 1024,
		middleware: middleware,
		timeout: timeout === undefined ? (isDELAY ? 0 : F.config['default-request-timeout']) : timeout,
		isGET: flags.indexOf('get') !== -1,
		isMULTIPLE: isMULTIPLE,
		isJSON: isJSON,
		isXML: flags.indexOf('xml') !== -1,
		isRAW: isRaw,
		isBINARY: isBINARY,
		isMOBILE: isMOBILE,
		isROBOT: isROBOT,
		isMOBILE_VARY: isMOBILE,
		isGENERATOR: isGENERATOR,
		MEMBER: membertype,
		isASTERIX: isASTERIX,
		isROLE: isROLE,
		isREFERER: flags.indexOf('referer') !== -1,
		isHTTPS: flags.indexOf('https') !== -1,
		isHTTP: flags.indexOf('http') !== -1,
		isDEBUG: flags.indexOf('debug') !== -1,
		isRELEASE: flags.indexOf('release') !== -1,
		isPROXY: flags.indexOf('proxy') !== -1,
		isBOTH: isNOXHR ? false : true,
		isXHR: flags.indexOf('xhr') !== -1,
		isUPLOAD: flags.indexOf('upload') !== -1,
		isSYSTEM: url.startsWith('/#'),
		isCACHE: !url.startsWith('/#') && !CUSTOM && !arr.length && !isASTERIX,
		isPARAM: arr.length > 0,
		isDELAY: isDELAY,
		CUSTOM: CUSTOM,
		options: options,
		regexp: reg,
		regexpIndexer: regIndex
	});

	F.emit('route', 'web', F.routes.web[F.routes.web.length - 1]);

	// Appends cors route
	isCORS && F.cors(urlcache, corsflags);
	!_controller && F.$routesSort(1);

	return F;
};

Framework.prototype.stop = Framework.prototype.kill = function(signal) {

	for (var m in F.workers) {
		var worker = F.workers[m];
		TRY(() => worker && worker.kill && worker.kill(signal || 'SIGTERM'));
	}

	F.emit('exit', signal);

	if (!F.isWorker && typeof(process.send) === 'function')
		TRY(() => process.send('stop'));

	F.cache.stop();
	F.server && F.server.close();

	setTimeout(() => process.exit(signal || 'SIGTERM'), TEST ? 2000 : 100);
	return F;
};

/**
 * Clear temporary directory
 * @param {Function} callback
 * @param {Boolean} isInit Private argument.
 * @return {Framework}
 */
Framework.prototype.clear = function(callback, isInit) {

	var dir = F.path.temp();
	var plus = F.id ? 'i-' + F.id + '_' : '';

	if (isInit) {
		if (F.config['disable-clear-temporary-directory']) {
			// clears only JS and CSS files
			U.ls(dir, function(files, directories) {
				F.unlink(files, function() {
					callback && callback();
				});
			}, function(filename, folder) {
				if (folder || (plus && !filename.substring(dir.length).startsWith(plus)))
					return false;
				var ext = U.getExtension(filename);
				return ext === 'js' || ext === 'css' || ext === 'tmp' || ext === 'upload' || ext === 'html' || ext === 'htm';
			});

			return F;
		}
	}

	if (!existsSync(dir)) {
		callback && callback();
		return F;
	}

	U.ls(dir, function(files, directories) {

		if (isInit) {
			var arr = [];
			for (var i = 0, length = files.length; i < length; i++) {
				var filename = files[i].substring(dir.length);
				if (plus && !filename.startsWith(plus))
					continue;
				filename.indexOf('/') === -1 && !filename.endsWith('.jsoncache') && arr.push(files[i]);
			}
			files = arr;
			directories = [];
		}

		F.unlink(files, function() {
			F.rmdir(directories, callback);
		});
	});

	if (!isInit) {
		// clear static cache
		F.temporary.path = {};
		F.temporary.range = {};
		F.temporary.notfound = {};
	}

	return F;
};

/**
 * Remove files in array
 * @param {String Array} arr File list.
 * @param {Function} callback
 * @return {Framework}
 */
Framework.prototype.unlink = function(arr, callback) {

	if (typeof(arr) === 'string')
		arr = [arr];

	if (!arr.length) {
		callback && callback();
		return F;
	}

	var filename = arr.shift();
	if (filename)
		Fs.unlink(filename, (err) => F.unlink(arr, callback));
	else
		callback && callback();

	return F;
};

/**
 * Remove directories in array
 * @param {String Array} arr
 * @param {Function} callback
 * @return {Framework}
 */
Framework.prototype.rmdir = function(arr, callback) {
	if (typeof(arr) === 'string')
		arr = [arr];

	if (!arr.length) {
		callback && callback();
		return F;
	}

	var path = arr.shift();
	if (path)
		Fs.rmdir(path, () => F.rmdir(arr, callback));
	else
		callback && callback();

	return F;
};

/**
 * Run framework –> HTTP
 * @param  {String} mode Framework mode.
 * @param  {Object} options Framework settings.
 * @return {Framework}
 */
Framework.prototype.http = function(mode, options) {

	if (options === undefined)
		options = {};

	if (!options.port)
		options.port = +process.argv[2];

	return F.mode(require('http'), mode, options);
};

/**
 * Run framework –> HTTPS
 * @param {String} mode Framework mode.
 * @param {Object} options Framework settings.
 * @return {Framework}
 */
Framework.prototype.https = function(mode, options) {
	return F.mode(require('https'), mode, options || {});
};

/**
 * Changes the framework mode
 * @param {String} mode New mode (e.g. debug or release)
 * @return {Framework}
 */
Framework.prototype.mode = function(http, name, options) {

	var test = false;
	var debug = false;

	if (options.directory)
		F.directory = directory = options.directory;

	if (typeof(http) === 'string') {
		switch (http) {
			case 'debug':
			case 'development':
				debug = true;
				break;
		}
		F.config.debug = debug;
		F.config.trace = debug;
		F.isDebug = debug;
		global.DEBUG = debug;
		global.RELEASE = !debug;
		return F;
	}

	F.isWorker = false;

	switch (name.toLowerCase().replace(/\.|\s/g, '-')) {
		case 'release':
		case 'production':
			break;

		case 'debug':
		case 'develop':
		case 'development':
			debug = true;
			break;

		case 'test':
		case 'testing':
		case 'test-debug':
		case 'debug-test':
		case 'testing-debug':
			test = true;
			debug = true;
			F.isTest = true;
			break;

		case 'test-release':
		case 'release-test':
		case 'testing-release':
		case 'test-production':
		case 'testing-production':
			test = true;
			debug = false;
			break;
	}

	var restart = false;
	if (F.temporary.init)
		restart = true;
	else
		F.temporary.init = { name: name, isHTTPS: typeof(http.STATUS_CODES) === 'undefined', options: options };

	F.config.trace = debug;
	F.$startup(n => F.initialize(http, debug, options, restart));
	return F;
};

/**
 * Error caller
 * @param {Error} err
 * @param {String} name Controller or Script name.
 * @param {Object} uri
 * @return {Framework}
 */
Framework.prototype.error = function(err, name, uri) {

	if (!arguments.length) {
		return function(err) {
			err && F.error(err, name, uri);
		};
	}

	if (!err)
		return F;

	if (F.errors) {
		F.datetime = new Date();
		F.errors.push({ error: err.stack, name: name, url: uri ? typeof(uri) === 'string' ? uri : Parser.format(uri) : undefined, date: F.datetime });
		F.errors.length > 50 && F.errors.shift();
	}

	F.onError(err, name, uri);
	return F;
};

/**
 * Error handler
 * @param {Error} err
 * @param {String} name
 * @param {Object} uri URI address, optional.
 * @return {Framework}
 */
Framework.prototype.onError = function(err, name, uri) {
	F.datetime = new Date();
	console.log('======= ' + (F.datetime.format('yyyy-MM-dd HH:mm:ss')) + ': ' + (name ? name + ' ---> ' : '') + err.toString() + (uri ? ' (' + Parser.format(uri) + ')' : ''), err.stack);
	return F;
};

//=================================================================================================================

var framework = new Framework();
global.framework = global.F = module.exports = framework;
global.Controller = Controller;

global.setTimeout2 = function(name, fn, timeout) {
	var key = ':' + name;
	F.temporary.internal[key] && clearTimeout(F.temporary.internal[key]);
	return F.temporary.internal[key] = setTimeout(fn, timeout);
};

global.clearTimeout2 = function(name) {
	var key = ':' + name;

	if (F.temporary.internal[key]) {
		clearTimeout(F.temporary.internal[key]);
		F.temporary.internal[key] = undefined;
		return true;
	}

	return false;
};

process.on('uncaughtException', function(e) {

	if (e.toString().indexOf('listen EADDRINUSE') !== -1) {
		if (typeof(process.send) === 'function')
			process.send('eaddrinuse');
		console.log('\nThe IP address and the PORT is already in use.\nYou must change the PORT\'s number or IP address.\n');
		process.exit('SIGTERM');
		return;
	}

	if (F.isTest) {
		// HACK: this method is created dynamically in F.testing();
		F.testContinue && F.testContinue(e);
		return;
	}

	F.error(e, '', null);
});

process.on('SIGTERM', () => F.stop());
process.on('SIGINT', () => F.stop());
process.on('exit', () => F.stop());

process.on('message', function(msg, h) {

	if (typeof(msg) !== 'string') {
		F.emit('message', msg, h);
		return;
	}

	if (msg === 'debugging') {
		U.wait(() => F.isLoaded, function() {
			F.isLoaded = undefined;
			F.console();
		}, 10000, 500);
		return;
	}

	if (msg === 'reconnect') {
		F.reconnect();
		return;
	}

	if (msg === 'reconfigure') {
		F._configure();
		F._configure_versions();
		F._configure_workflows();
		F._configure_sitemap();
		F.emit(msg);
		return;
	}

	if (msg === 'reset') {
		// F.clear();
		F.cache.clear();
		return;
	}

	if (msg === 'stop' || msg === 'exit') {
		F.stop();
		return;
	}

	F.emit('message', msg, h);
});

function fsFileRead(filename, callback) {
	U.queue('F.files', F.config['default-maximum-file-descriptors'], function(next) {
		Fs.readFile(filename, function(err, result) {
			next();
			callback(err, result);
		});
	});
};

function fsFileExists(filename, callback) {
	U.queue('F.files', F.config['default-maximum-file-descriptors'], function(next) {
		Fs.lstat(filename, function(err, stats) {
			next();
			callback(!err && stats.isFile(), stats ? stats.size : 0, stats ? stats.isFile() : false, stats);
		});
	});
};

function fsStreamRead(filename, options, callback) {

	if (!callback) {
		callback = options;
		options = undefined;
	}

	var opt;

	if (options) {
		opt = HEADERS.fsStreamReadRange
		opt.start = options.start;
		opt.end = options.end;
	} else
		opt = HEADERS.fsStreamRead;

	U.queue('F.files', F.config['default-maximum-file-descriptors'], function(next) {
		var stream = Fs.createReadStream(filename, opt);
		stream.on('error', noop);
		callback(stream, next);
	});
}

/**
 * Prepare URL address to temporary key (for caching)
 * @param {ServerRequest or String} req
 * @return {String}
 */
function createTemporaryKey(req) {
	return (req.uri ? req.uri.pathname : req).replace(TEMPORARY_KEY_REGEX, '-').substring(1);
}

function flags_to_object(flags) {
	var obj = {};
	flags.forEach(function(flag) {
		obj[flag] = true;
	});
	return obj;
}


function prepare_error(e) {
	return (RELEASE || !e) ? '' : ' :: ' + (e instanceof ErrorBuilder ? e.plain() : e.stack ? e.stack.toString() : e.toString());
}

function prepare_filename(name) {
	return name[0] === '@' ? (F.isWindows ? U.combine(F.config['directory-temp'], name.substring(1)) : F.path.package(name.substring(1))) : U.combine('/', name);
}

function prepare_staticurl(url, isDirectory) {
	if (!url)
		return url;
	if (url[0] === '~') {
		if (isDirectory)
			return U.path(url.substring(1));
	} else if (url.substring(0, 2) === '//' || url.substring(0, 6) === 'http:/' || url.substring(0, 7) === 'https:/')
		return url;
	return url;
}

function prepare_isomorphic(name, value) {
	return 'if(window["isomorphic"]===undefined)window.isomorphic=window.I={};isomorphic["' + name.replace(/\.js$/i, '') + '"]=(function(framework,F,U,utils,Utils,is_client,is_server){var module={},exports=module.exports={};' + value + ';return exports;})(null,null,null,null,null,true,false)';
}

function isGZIP(req) {
	var ua = req.headers['user-agent'];
	return ua && ua.lastIndexOf('Firefox') !== -1;
}

function prepare_viewname(value) {
	// Cleans theme name
	return value.substring(value.indexOf('/', 2) + 1);
}

function existsSync(filename, file) {
	try {
		var val = Fs.statSync(filename);
		return val ? (file ? val.isFile() : true) : false;
	} catch (e) {
		return false;
	}
}

function async_middleware(index, req, res, middleware, callback, options, controller) {

	if (res.success || res.headersSent) {
		// Prevents timeout
		controller && controller.subscribe.success();
		callback = null;
		return;
	}

	var name = middleware[index++];
	if (!name)
		return callback && callback();

	var item = F.routes.middleware[name];
	if (!item) {
		F.error('Middleware not found: ' + name, null, req.uri);
		return async_middleware(index, req, res, middleware, callback, options, controller);
	}

	var output = item.call(framework, req, res, function(err) {

		if (err) {
			res.throw500(err);
			callback = null;
			return;
		}

		async_middleware(index, req, res, middleware, callback, options, controller);
	}, options, controller);

	if (output !== false)
		return;

	callback = null;
};

function parseComponent(body, filename) {
	var response = {};

	response.css = '';
	response.js = '';
	response.install = '';

	var beg = 0;
	var end = 0;

	while (true) {
		beg = body.indexOf('<script type="text/totaljs">');
		if (beg === -1)
			break;
		end = body.indexOf('</script>', beg);
		if (end === -1)
			break;
		response.install += (response.install ? '\n' : '') + body.substring(beg, end).replace(/<(\/)?script.*?>/g, '');
		body = body.substring(0, beg).trim() + body.substring(end + 9).trim();
	}

	while (true) {
		beg = body.indexOf('<style');
		if (beg === -1)
			break;
		end = body.indexOf('</style>', beg);
		if (end === -1)
			break;
		response.css += (response.css ? '\n' : '') + body.substring(beg, end).replace(/<(\/)?style.*?>/g, '');
		body = body.substring(0, beg).trim() + body.substring(end + 8).trim();
	}

	while (true) {
		beg = body.indexOf('<script>');
		if (beg === -1) {
			beg = body.indexOf('<script type="text/javascript">');
			if (beg === -1)
				break;
		}
		end = body.indexOf('</script>', beg);
		if (end === -1)
			break;
		response.js += (response.js ? '\n' : '') + body.substring(beg, end).replace(/<(\/)?script.*?>/g, '');
		body = body.substring(0, beg).trim() + body.substring(end + 9).trim();
	}

	if (response.js)
		response.js = framework_internal.compile_javascript(response.js, filename);

	if (response.css)
		response.css = framework_internal.compile_css(response.css, filename);

	response.body = body;
	return response;
}

// Default action for workflow routing
function controller_json_workflow(id) {
	var self = this;
	self.id = id;
	self.$exec(self.route.workflow, self, self.callback());
}

// Because of controller prototypes
// It's used in F.view() and F.viewCompile()
const EMPTYCONTROLLER = new Controller('', null, null, null, '');
EMPTYCONTROLLER.isConnected = false;