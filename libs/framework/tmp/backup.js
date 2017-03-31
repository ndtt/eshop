'use strict';


function Backup() {
	this.file = [];
	this.directory = [];
	this.path = '';
	this.read = { key: U.createBufferSize(), value: U.createBufferSize(), status: 0 };
	this.pending = 0;
	this.cache = {};
	this.complete = NOOP;
	this.filter = () => true;
	this.bufKey = U.createBuffer(':');
	this.bufNew = U.createBuffer('\n');
}

Backup.prototype.restoreKey = function(data) {

	var self = this;
	var read = self.read;

	if (read.status === 1) {
		self.restoreValue(data);
		return;
	}

	var index = -1;
	var tmp = data;

	if (read.status === 2) {
		tmp = Buffer.concat([read.key, tmp]);
		index = tmp.indexOf(self.bufKey);
	} else
		index = tmp.indexOf(self.bufKey);

	if (index === -1) {
		read.key = Buffer.concat([read.key, data]);
		read.status = 2;
		return;
	}

	read.status = 1;
	read.key = tmp.slice(0, index);
	self.restoreValue(tmp.slice(index + 1));
	tmp = null;
};

Backup.prototype.restoreValue = function(data) {

	var self = this;
	var read = self.read;

	if (read.status !== 1) {
		self.restoreKey(data);
		return;
	}

	var index = data.indexOf(self.bufNew);
	if (index === -1) {
		read.value = Buffer.concat([read.value, data]);
		return;
	}

	read.value = Buffer.concat([read.value, data.slice(0, index)]);
	self.restoreFile(read.key.toString('utf8').replace(REG_EMPTY, ''), read.value.toString('utf8').replace(REG_EMPTY, ''));

	read.status = 0;
	read.value = U.createBufferSize();
	read.key = U.createBufferSize();

	self.restoreKey(data.slice(index + 1));
};

Backup.prototype.restore = function(filename, path, callback, filter) {

	if (!existsSync(filename)) {
		callback && callback(new Error('Package not found.'), path);
		return;
	}

	var self = this;

	self.filter = filter;
	self.cache = {};
	self.createDirectory(path, true);
	self.path = path;

	var stream = Fs.createReadStream(filename);
	stream.on('data', buffer => self.restoreKey(buffer));

	if (!callback) {
		stream.resume();
		return;
	}

	callback.path = path;

	stream.on('end', function() {
		self.callback(callback);
		stream = null;
	});

	stream.resume();
};

Backup.prototype.callback = function(cb) {
	var self = this;
	if (self.pending <= 0)
		return cb(null, cb.path);
	setTimeout(() => self.callback(cb), 100);
};

Backup.prototype.restoreFile = function(key, value) {
	var self = this;

	if (typeof(self.filter) === 'function' && !self.filter(key))
		return;

	if (value === '#') {
		self.createDirectory(key);
		return;
	}

	var p = key;
	var index = key.lastIndexOf('/');

	if (index !== -1) {
		p = key.substring(0, index).trim();
		p && self.createDirectory(p);
	}

	var buffer = U.createBuffer(value, 'base64');
	self.pending++;

	Zlib.gunzip(buffer, function(err, data) {
		Fs.writeFile(Path.join(self.path, key), data, () => self.pending--);
		buffer = null;
	});
};

Backup.prototype.createDirectory = function(p, root) {

	var self = this;
	if (self.cache[p])
		return;

	self.cache[p] = true;

	if (p[0] === '/')
		p = p.substring(1);

	var is = F.isWindows;

	if (is) {
		if (p[p.length - 1] === '\\')
			p = p.substring(0, p.length - 1);
	} else {
		if (p[p.length - 1] === '/')
			p = p.substring(0, p.length - 1);
	}

	var arr = is ? p.replace(/\//g, '\\').split('\\') : p.split('/');
	var directory = '';

	if (is && arr[0].indexOf(':') !== -1)
		arr.shift();

	for (var i = 0, length = arr.length; i < length; i++) {
		var name = arr[i];
		if (is)
			directory += (directory ? '\\' : '') + name;
		else
			directory += (directory ? '/' : '') + name;

		var dir = Path.join(self.path, directory);
		if (root)
			dir = (is ? '\\' : '/') + dir;

		!existsSync(dir) && Fs.mkdirSync(dir);
	}
};
