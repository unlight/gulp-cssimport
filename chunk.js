var merge = require("deepmerge"); 

function Chunk(data, options) {
	options = options || {};
	if (data == null) {
		throw "Passed null or undefined argument.";
	}
	this.directory = null;
	if (data instanceof Chunk) {
		return data;
	} else if (data.isBuffer && data.isBuffer()) {
		this.vfile = data;
	} else if (data instanceof Buffer) {
		this.contents = data.toString();
	} else if (typeof data === "string") {
		this.contents = data;
	} else if (typeof data === "object" && data.constructor === Object) {
		options = merge(data, options);
	} else {
		throw "Passed unknown object.";
	}
	
	if (options.path) this.path = options.path;
	if (options.directory) this.directory = options.directory;
	if (options.contents) this.contents = options.contents;
}

Chunk.prototype.getCwd = function () {
	if (this.vfile) {
		return this.vfile.base;
	}
	if (this.directory) {
		return this.directory;
	}
	throw "W?";
};

Chunk.prototype.getContents = function () {
	if (this.contents) {
		return this.contents;
	}
	if (this.vfile) {
		return this.vfile.contents.toString();
	}
	throw "Uknowkn type.";
};

module.exports = Chunk;