function Chunk(data) {
	if (data.vinyl) {
		this.vinyl = data.vinyl;
		return;
	}
	if (data.directory) this.directory = data.directory;
	if (data.contents) this.contents = data.contents;
}

Object.defineProperty(Chunk.prototype, "isVinyl", {
	get: function () {
		return Boolean(this.vinyl);
	}
});

Chunk.create = function (data, options) {
	options = options || {};
	var result = null;
	if (data == null) {
		throw "Passed null or undefined argument.";
	}
	if (data.isBuffer && data.isBuffer()) {
		result = new Chunk({
			vinyl: data
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
	if (options.directory && result.getDirectory() == null) result.directory = options.directory;
	return result;
};

Chunk.prototype.getDirectory = function () {
	if (this.vinyl) {
		return this.vinyl.base;
	}
	return this.directory;
};

Chunk.prototype.getContents = function () {
	if (this.contents) {
		return this.contents;
	}
	if (this.vinyl) {
		return this.vinyl.contents.toString();
	}
	throw "Uknown type.";
};

module.exports = Chunk;