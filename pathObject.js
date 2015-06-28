var isUrl = require("./helper").isUrl;
var collect = require("collect-stream");
var hh = require("http-https");
var fs = require("fs");
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

PathObject.prototype.resolvePath = function (callback) {
	var self = this;
	var filePath = this.path;
	if (this.isUrl()) {
		var req = hh.request(filePath, function (res) {
			collect(res, function (err, data) {
				var content = data.toString();
				callback(err, content, self);
			});
		});
		req.end();
		return;
	}
	
	filePath = path.join(this.directory, this.path);
	filePath = path.normalize(filePath);
	
	fs.readFile(filePath, { encoding: "utf8" }, function (err, data) {
		callback(err, data, self);
	});
};

module.exports = PathObject;
