"use strict";
var through = require("through2");
var path = require("path");
var deepExtend = require("deep-extend");
var fs = require("fs");
var pify = require("pify");
var gutil = require("gulp-util");
var collect = require("collect-stream");
var hh = require("http-https");
var minimatch = require("minimatch");
var phpfn = require("phpfn");

var PLUGIN_NAME = "gulp-cssimport";
var readFile = pify(fs.readFile);
var trim = phpfn("trim");
var format = require("util").format;

var defaults = {
	extensions: null,
	filter: null,
	matchPattern: null,
	matchOptions: {
		matchBase: true
	},
	limit: 5000
};

module.exports = function cssImport(options) {

	options = deepExtend({}, defaults, options || {});

	if (options.extensions && !Array.isArray(options.extensions)) {
		options.extensions = options.extensions.toString().split(",").map(function (x) {
			return x.trim();
		});
	}
	
	var stream;
	var cssCount = 0;
	
	function fileContents(vinyl, encoding, callback) {
		// console.log('fileContents ' , vinyl.path);

		if (!stream) {
			stream = this;
		}
		// https://github.com/kevva/import-regex/
		var regex = '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)'; // eslint-disable-line
		var importRe = new RegExp(regex, "gi");
		var match;
		var file = [];
		var lastpos = 0;
		var promises = [];
		var contents = vinyl.contents.toString();
		while ((match = importRe.exec(contents)) !== null) {
			var match2 = /@import\s+(?:url\()?(.+(?=['"\)]))(?:\))?.*/ig.exec(match[0]);
			var importPath = trim(match2[1], "'\"");
			if (!isMatch(importPath, options)) {
				continue;
			}
			file[file.length] = contents.slice(lastpos, match.index);
			var index = file.length;
			file[index] = format("importing file %s from %s", importPath, vinyl.relative);
			lastpos = importRe.lastIndex;
			// Start resolving.
			if (++cssCount > options.limit) {
				stream.emit("error", new Error("Exceed limit. Recursive include?"));
				return;
			}

			(function(index) {
				if (!isUrl(importPath)) {
					var importFile = path.resolve(path.dirname(vinyl.path), importPath);
					// console.log('importFile %s from %s' , importFile, vinyl.path);
					promises.push(readFile(importFile, "utf8").then(function(data) {
						return {index: index, importFile: importFile, data: data};
					}));
				} else {
					promises[promises.length] = new Promise(function(resolve, reject) {
						var req = hh.request(importPath, function (res) {
							collect(res, function (err, data) {
								if (err) return reject(err);
								resolve({index: index, data: data.toString()});
							});
						});
						req.on("error", reject);
						req.end();
					});
				}
			})(index);
		}
		// Nothing to import.
		if (promises.length === 0) {
			callback(null, vinyl);
			return;
		}
		// Adding trailing piece.
		file[file.length] = contents.slice(lastpos);
		// Waiting promises.
		Promise.all(promises).then(function(results) {
			for (var i = 0; i < results.length; i++) {
				var item = results[i];
				// file[item.index] = item.data;
				var vfile = new gutil.File({
					path: item.importFile,
					contents: new Buffer(item.data)
				});
				(function(item) {
					results[i] = pify(fileContents)(vfile, null).then(function(vfile) {
						return {index: item.index, data: vfile.contents.toString()};
					});
				})(item);
			}
			return Promise.all(results);
		})
		.then(function(results) {
			for (var i = 0; i < results.length; i++) {
				var index = results[i].index;
				file[index] = results[i].data;
			}
			vinyl.contents = new Buffer(file.join(""));
			callback(null, vinyl);
		})
		.catch(callback);
	}

	return through.obj(fileContents);
};

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
}

function isUrl(s) {
	var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
}

function getExtension(p) {
	p = String(p);
	return p.substr(p.lastIndexOf(".") + 1);
}