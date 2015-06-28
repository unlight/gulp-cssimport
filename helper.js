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
