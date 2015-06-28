var fs = require("fs");
var gutil = require("gulp-util");
var PLUGIN_NAME = "gulp-cssimport";

function getExtension(p) {
	p = String(p);
	return p.substr(p.lastIndexOf(".") + 1);
};

exports.getExtension = getExtension;

exports.trim = require("phpjs/build/npm").trim;

function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
};

exports.isUrl = isUrl;

exports.resolvePath = function (pathObject, callback) {
	var path = pathObject.path;
	if (pathObject.isUrl()) {
		var collect = require("collect-stream");
		var hh = require("http-https");
		var req = hh.request(path, function (res) {
			collect(res, function (err, data) {
				var content = data.toString();
				callback(err, content, pathObject);
			});
		});
		req.end();
		return;
	}
	fs.readFile(path, { encoding: "utf8" }, function (err, data) {
		callback(err, data, pathObject);
	});
};

function isIgnored(path, options) {
	if (!options) {
		return false;
	}
	if (!path) {
		return true;
	}
	var extensions = (options || {}).extensions;
	if (extensions) {
		var fileExt = getExtension(path);
		for (var k = 0; k < extensions.length; k++) {
			var extension = extensions[k];
			var isInverse = extension.charAt(0) === "!";
			if (isInverse) {
				extension = extension.slice(1);
			}
			if (isInverse && fileExt === extension) { // !sass , sass === css
				return true;
			} else if (!isInverse && fileExt !== extension) {
				return true;
			}
		}
	}
	var filter = (options || {}).filter;
	if (filter instanceof RegExp) {
		var result = filter.test(path);
		if (!result) {
			return true;
		}
	}
	return false;
};

exports.isIgnored = isIgnored;
