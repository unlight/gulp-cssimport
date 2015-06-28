function Chunk(data) {
	if (data.vfile) this.vfile = data.vfile;
	if (data.path) this.path = data.path;
	if (data.directory) this.directory = data.directory;
	if (data.contents) this.contents = data.contents;
}

Chunk.create = function (data, options) {
	options = options || {};
	var result = null;
	if (data == null) {
		throw "Passed null or undefined argument.";
	}
	if (data.isBuffer && data.isBuffer()) {
		result = new Chunk({
			vfile: data
		});
	} else if (data instanceof Buffer) {
		result = new Chunk({
			contents: data.toString()
		});
	} else if (typeof data === "string") {
		result = new Chunk({ contents: data });
	} else if (typeof data === "object" && data.constructor === Object) {
		result = new Chunk(data);
	} else if (data instanceof Chunk) {
		result = data;
	} else {
		throw "Passed unknown object.";
	}
	// Add additional properties.
	if (result.directory == null && options.directory) result.directory = options.directory;
	return result;
};

Chunk.prototype.getDirectory = function () {
	return this.directory;
};

Chunk.prototype.getContents = function () {
	if (this.contents) {
		return this.contents;
	}
	if (this.vfile) {
		return this.vfile.contents.toString();
	}
	throw "Uknown type.";
};

module.exports = Chunk;