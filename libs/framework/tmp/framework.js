/**
 * @module FrameworkUtils
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

const ENCODING = 'utf8';
const RESPONSE_HEADER_CACHECONTROL = 'Cache-Control';
const RESPONSE_HEADER_CONTENTTYPE = 'Content-Type';
const RESPONSE_HEADER_CONTENTLENGTH = 'Content-Length';
const CONTENTTYPE_TEXTPLAIN = 'text/plain';
const CONTENTTYPE_TEXTHTML = 'text/html';
const REQUEST_COMPRESS_CONTENTTYPE = { 
	'text/plain': true, 
	'text/javascript': true, 
	'text/css': true, 
	'text/jsx': true, 
	'application/x-javascript': true, 
	'application/json': true, 
	'text/xml': true, 
	'image/svg+xml': true, 
	'text/x-markdown': true, 
	'text/html': true 
};
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
const EMPTYREQUEST = { uri: {} };
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

var HEADERS = {};

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



//if (!global.framework)
//	global.framework = exports;


function Framework() {
    
	//constructor(setting) {
		this.id = null;
		this.version = 1000;
		this.version_header = '1.0.0';
		this.version_node = process.version.toString().replace('v', '').replace(/\./g, '').parseFloat();

		this.config = {
			debug: false,
			trace: true,
			'trace-console': true,

			name: 'anything.js',
			version: '1.0.0',
			author: '',
			secret: Os.hostname() + '-' + Os.platform() + '-' + Os.arch(),

			// all directory alias
			'default-xpoweredby': 'anything.js',
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
			'static-accepts': { 
				'flac': true, 
				'jpg': true, 
				'png': true, 
				'gif': true, 
				'ico': true, 
				'js': true, 
				'css': true, 
				'txt': true, 
				'xml': true, 
				'woff': true, 
				'woff2': true, 
				'otf': true, 
				'ttf': true, 
				'eot': true, 
				'svg': true, 
				'zip': true, 
				'rar': true, 
				'pdf': true, 
				'docx': true, 
				'xlsx': true, 
				'doc': true, 
				'xls': true, 
				'html': true, 
				'htm': true, 
				'appcache': true, 
				'manifest': true, 
				'map': true, 
				'ogv': true, 
				'ogg': true, 
				'mp4': true, 
				'mp3': true, 
				'webp': true, 
				'webm': true, 
				'swf': true, 
				'package': true, 
				'json': true, 
				'md': true, 
				'm4v': true, 
				'jsx': true 			
			},
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
			'default-image-converter': '',	//'gm'
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
		this.components = { 
			has: false, 
			css: false, 
			js: false, 
			views: {}, 
			instances: {}, 
			version: null 
		};
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
		//this.cache = new FrameworkCache();
		//this.path = new FrameworkPath();

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
	//}
}

// ======================================================
// PROTOTYPES
// ======================================================

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



module.exports = Framework;