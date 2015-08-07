"use strict";
var fs = require("fs");
var gutil = require("gulp-util");
var collect = require("collect-stream");
var hh = require("http-https");
var fs = require("fs");
var path = require("path");
var minimatch = require("minimatch");
var phpfn = require("phpfn");
var PLUGIN_NAME = "gulp-cssimport";

function getExtension(p) {
	p = String(p);
	return p.substr(p.lastIndexOf(".") + 1);
};

exports.getExtension = getExtension;

exports.trim = phpfn("trim");

function isUrl(s) {
	var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
};

exports.isUrl = isUrl;

function isMatch(path, options) {
	if (!options) {
		return true;
	}
	if (!path) {
		return false;
	}
	options = options || {};
	var result;
	if (options.filter instanceof RegExp) {
		var filter = options.filter;
		filter.lastIndex = 0;
		result = filter.test(path);
	}
	if (options.matchPattern && !isUrl(path)) {
		var matchPattern = options.matchPattern;
		result = minimatch(path, matchPattern, options.matchOptions);
	}
	if (options.extensions) {
		var extensions = options.extensions;
		var fileExt = getExtension(path);
		for (var k = 0; k < extensions.length; k++) {
			var extension = extensions[k];
			var isInverse = extension.charAt(0) === "!";
			if (isInverse) {
				extension = extension.slice(1);
			}
			if (isInverse && fileExt === extension) { // !sass , sass === css
				return false;
			} else if (!isInverse && fileExt !== extension) {
				return false;
			}
		}
	}
	if (typeof result === "undefined") {
		result = true;
	}
	return result;
};

exports.isMatch = isMatch;

exports.resolvePath = function (po, callback) {
	if (po.isUrl()) {
		var req = hh.request(po.path, function (res) {
			collect(res, function (err, data) {
				var content = data.toString();
				callback(err, content, po);
			});
		});
		req.end();
		return;
	}

	var filePath;
	filePath = path.join(po.directory, po.path);
	filePath = path.normalize(filePath);

	fs.readFile(filePath, { encoding: "utf8" }, function (err, data) {
		callback(err, data, po);
	});
};