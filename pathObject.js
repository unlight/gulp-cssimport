var isUrl = require("./helper").isUrl;

function PathObject(data) {
	this.index = data.index;
	this.path = data.path;
};

PathObject.prototype.isUrl = function () {
	var result = isUrl(this.path);
	return result;
};

module.exports = PathObject;
