var isUrl = require("./helper").isUrl;
var path = require("path");

function PathObject(data) {
	this.index = data.index;
	this.path = data.path;
	this.directory = data.directory;
};

PathObject.prototype.isUrl = function () {
	var result = isUrl(this.path);
	return result;
};

PathObject.prototype.getPathDirectory = function () {
	var file = path.join(this.directory, this.path);
	var result = path.dirname(file);
	return result;
};

module.exports = PathObject;
