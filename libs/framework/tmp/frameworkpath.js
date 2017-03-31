'use strict';

const Fs = require('fs');

// *********************************************************************************
// =================================================================================
// Framework path
// =================================================================================
// *********************************************************************************

function FrameworkPath() {}

FrameworkPath.prototype.verify = function(name) {
	var prop = '$directory-' + name;
	if (F.temporary.path[prop])
		return F;
	var directory = F.config['directory-' + name] || name;
	var dir = U.combine(directory);
	!existsSync(dir) && Fs.mkdirSync(dir);
	F.temporary.path[prop] = true;
	return F;
};

FrameworkPath.prototype.exists = function(path, callback) {
	Fs.lstat(path, (err, stats) => callback(err ? false : true, stats ? stats.size : 0, stats ? stats.isFile() : false));
	return F;
};

FrameworkPath.prototype.public = function(filename) {
	return U.combine(F.config['directory-public'], filename);
};

FrameworkPath.prototype.public_cache = function(filename) {
	var key = 'public_' + filename;
	var item = F.temporary.other[key];
	return item ? item : F.temporary.other[key] = U.combine(F.config['directory-public'], filename);
};

FrameworkPath.prototype.private = function(filename) {
	return U.combine(F.config['directory-private'], filename);
};

FrameworkPath.prototype.isomorphic = function(filename) {
	return U.combine(F.config['directory-isomorphic'], filename);
};

FrameworkPath.prototype.configs = function(filename) {
	return U.combine(F.config['directory-configs'], filename);
};

FrameworkPath.prototype.virtual = function(filename) {
	return U.combine(F.config['directory-public-virtual'], filename);
};

FrameworkPath.prototype.logs = function(filename) {
	this.verify('logs');
	return U.combine(F.config['directory-logs'], filename);
};

FrameworkPath.prototype.models = function(filename) {
	return U.combine(F.config['directory-models'], filename);
};

FrameworkPath.prototype.temp = function(filename) {
	this.verify('temp');
	return U.combine(F.config['directory-temp'], filename);
};

FrameworkPath.prototype.temporary = function(filename) {
	return this.temp(filename);
};

FrameworkPath.prototype.views = function(filename) {
	return U.combine(F.config['directory-views'], filename);
};

FrameworkPath.prototype.workers = function(filename) {
	return U.combine(F.config['directory-workers'], filename);
};

FrameworkPath.prototype.databases = function(filename) {
	this.verify('databases');
	return U.combine(F.config['directory-databases'], filename);
};

FrameworkPath.prototype.modules = function(filename) {
	return U.combine(F.config['directory-modules'], filename);
};

FrameworkPath.prototype.controllers = function(filename) {
	return U.combine(F.config['directory-controllers'], filename);
};

FrameworkPath.prototype.definitions = function(filename) {
	return U.combine(F.config['directory-definitions'], filename);
};

FrameworkPath.prototype.tests = function(filename) {
	return U.combine(F.config['directory-tests'], filename);
};

FrameworkPath.prototype.resources = function(filename) {
	return U.combine(F.config['directory-resources'], filename);
};

FrameworkPath.prototype.services = function(filename) {
	return U.combine(F.config['directory-services'], filename);
};

FrameworkPath.prototype.packages = function(filename) {
	return U.combine(F.config['directory-packages'], filename);
};

FrameworkPath.prototype.themes = function(filename) {
	return U.combine(F.config['directory-themes'], filename);
};

FrameworkPath.prototype.root = function(filename) {
	var p = Path.join(directory, filename || '');
	return F.isWindows ? p.replace(/\\/g, '/') : p;
};

FrameworkPath.prototype.package = function(name, filename) {

	if (filename === undefined) {
		var index = name.indexOf('/');
		if (index !== -1) {
			filename = name.substring(index + 1);
			name = name.substring(0, index);
		}
	}

	var tmp = F.config['directory-temp'];
	var p = tmp[0] === '~' ? Path.join(tmp.substring(1), name + '.package', filename || '') : Path.join(directory, tmp, name + '.package', filename || '');
	return F.isWindows ? p.replace(REG_WINDOWSPATH, '/') : p;
};


function existsSync(filename, file) {
	try {
		var val = Fs.statSync(filename);
		return val ? (file ? val.isFile() : true) : false;
	} catch (e) {
		return false;
	}
}

module.exports = FrameworkPath;