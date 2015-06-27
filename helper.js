var fs = require("fs");
var gutil = require("gulp-util");
var PLUGIN_NAME = "gulp-cssimport";

exports.getExtension = function (s) {
	s += "";
	return s.substr(s.lastIndexOf(".") + 1);
};

exports.trim = require("phpjs/build/npm").trim;

function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
};

exports.isUrl = isUrl;

exports.resolvePath = function (pathObject, callback) {
	var path = pathObject.path;
	if (isUrl(path)) {
		throw "Not implemented.";
	}
	fs.readFile(path, { encoding: "utf8" }, function(err, data) {
		callback(err, data, pathObject);
	});
};