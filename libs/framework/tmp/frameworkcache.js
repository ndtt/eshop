'use strict';
// *********************************************************************************
// =================================================================================
// Cache declaration
// =================================================================================
// *********************************************************************************

function FrameworkCache() {
	this.items = {};
	this.count = 1;
	this.interval;
}

FrameworkCache.prototype.init = function() {
	clearInterval(this.interval);
	this.interval = setInterval(() => F.cache.recycle(), 1000 * 60);
	F.config['allow-cache-snapshot'] && this.load();
	return this;
};

FrameworkCache.prototype.save = function() {
	Fs.writeFile(F.path.temp((F.id ? 'i-' + F.id + '_' : '') + 'F.jsoncache'), JSON.stringify(this.items), NOOP);
	return this;
};

FrameworkCache.prototype.load = function() {
	var self = this;
	Fs.readFile(F.path.temp((F.id ? 'i-' + F.id + '_' : '') + 'F.jsoncache'), function(err, data) {
		if (err)
			return;

		try {
			data = JSON.parse(data.toString('utf8'), (key, value) => typeof(value) === 'string' && value.isJSONDate() ? new Date(value) : value);
			self.items = data;
		} catch (e) {}
	});
	return self;
};

FrameworkCache.prototype.stop = function() {
	clearInterval(this.interval);
	return this;
};

FrameworkCache.prototype.clear = function() {
	this.items = {};
	return this;
};

FrameworkCache.prototype.recycle = function() {

	var items = this.items;
	F.datetime = new Date();

	this.count++;

	for (var o in items) {
		var value = items[o];
		if (!value)
			delete items[o];
		else if (value.expire < F.datetime) {
			F.emit('cache-expire', o, value.value);
			delete items[o];
		}
	}

	F.config['allow-cache-snapshot'] && this.save();
	F._service(this.count);
	return this;
};

FrameworkCache.prototype.set = FrameworkCache.prototype.add = function(name, value, expire, sync) {
	var type = typeof(expire);

	switch (type) {
		case 'string':
			expire = expire.parseDateExpiration();
			break;
		case 'undefined':
			expire = F.datetime.add('m', 5);
			break;
	}

	this.items[name] = { value: value, expire: expire };
	F.emit('cache-set', name, value, expire, sync);
	return value;
};

FrameworkCache.prototype.read = FrameworkCache.prototype.get = function(key, def) {

	var value = this.items[key];
	if (!value)
		return def;

	F.datetime = new Date();

	if (value.expire < F.datetime) {
		this.items[key] = undefined;
		F.emit('cache-expire', key, value.value);
		return def;
	}

	return value.value;
};

FrameworkCache.prototype.read2 = FrameworkCache.prototype.get2 = function(key, def) {
	var value = this.items[key];

	if (!value)
		return def;

	if (value.expire < F.datetime) {
		this.items[key] = undefined;
		F.emit('cache-expire', key, value.value);
		return def;
	}

	return value.value;
};

FrameworkCache.prototype.setExpire = function(name, expire) {
	var obj = this.items[name];
	if (obj)
		obj.expire = typeof(expire) === 'string' ? expire.parseDateExpiration() : expire;
	return this;
};

FrameworkCache.prototype.remove = function(name) {
	var value = this.items[name];
	if (value)
		this.items[name] = undefined;
	return value;
};

FrameworkCache.prototype.removeAll = function(search) {
	var count = 0;
	var isReg = U.isRegExp(search);

	for (var key in this.items) {

		if (isReg) {
			if (!search.test(key))
				continue;
		} else {
			if (key.indexOf(search) === -1)
				continue;
		}

		this.remove(key);
		count++;
	}

	return count;
};

FrameworkCache.prototype.fn = function(name, fnCache, fnCallback) {

	var self = this;
	var value = self.read2(name);

	if (value) {
		fnCallback && fnCallback(value, true);
		return self;
	}

	fnCache(function(value, expire) {
		self.add(name, value, expire);
		fnCallback && fnCallback(value, false);
	});

	return self;
};

module.exports = FrameworkCache;