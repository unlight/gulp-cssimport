"use strict";
var gutil = require("gulp-util");
var fs = require("fs");
var path = require("path");
var File = gutil.File;
var PluginError = gutil.PluginError;
var through = require("through2");
var format = require("util").format;
var trim = require("useful-functions.js").trim;
var getExtension = require("useful-functions.js").getExtension;
var url = require("url");
var EventEmitter = require("events").EventEmitter;

var PLUGIN_NAME = "gulp-cssimport";

function fail() {
	var args = Array.prototype.slice.call(arguments);
	var message = format.apply(null, args);
	gutil.log(PLUGIN_NAME, gutil.colors.red("✘ " + message));
}

function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
}

var defaults = {
	extensions: null,
	filter: null
};

module.exports = function(options) {

	options = options || {};
	var parsedFiles = {};
	var buffer = [];

	var extensions = options.extensions;
	if (extensions) {
		if (!Array.isArray(extensions)) {
			extensions = extensions.toString().split(",").map(function(x) {
				return x.trim();
			});
		}
	}

	function parseLineFactory(filePath, callback) {
		var fileDirectory = path.dirname(filePath);
		return function parseLine(line) {

			var args = Array.prototype.slice.call(arguments);
			line = args.shift();

			var match = line.match(/@import\s+(?:url\()?(.+(?=['"\)]))(?:\))?.*/i);
			var importFile = match && trim(match[1], "'\"");

			start:
			if (importFile) {
				// Check extensions.
				if (extensions) {
					for (var k = 0; k < extensions.length; k++) {
						var extension = extensions[k];
						var isInverse = extension.charAt(0) === "!";
						if (isInverse) {
							extension = extension.slice(1);
						}
						var fileExt = getExtension(importFile);
						if (isInverse && fileExt === extension) { // !sass , sass === css
							break start;
						} else if (!isInverse && fileExt !== extension) {
							break start;
						}
					}
				}

				if (options.filter instanceof RegExp) {
					var result = options.filter.test(importFile);
					if (!result) {
						break start;
					}
				}

				if (isUrl(importFile)) {

					var components = url.parse(importFile) || {};
					var protocol = trim(components.protocol, ":");
					if (["http", "https"].indexOf(protocol) === -1) {
						fail("Cannot process file %j, unknown protocol %j.", importFile, protocol);
						break start;
					}
					var http = require(protocol);
					http.get(importFile, function(response) {
						var body = "";
						response.on("data", function(chunk) {
							body += chunk;
						});
						response.on("end", function() {
							callback.apply(null, [null, body].concat(args));
						});
						response.on("error", function(error) {
							callback.apply(null, [error]);
						});
					});
					return;
				}

				var importFilePath = path.normalize(path.join(fileDirectory, importFile));
				fs.readFile(importFilePath, function readFileEnd(error, buffer) {
					if (error) {
						callback.apply(null, [error]);
						return;
					}
					line = buffer.toString();
					parsedFiles[importFilePath] = true;
					callback.apply(null, [null, line].concat(args));
				});
				return;
			}

			callback.apply(null, [null, line].concat(args));
		};
	}

	function fileContents(file, encoding, callback) {

		if (file.path === null) {
			throw new Error("File.path is null.");
		}

		if (!file.isBuffer()) {
			throw new PluginError(PLUGIN_NAME, "Only buffer is supported.");
		}

		// TODO: Bug... Cannot process minified files.
		var contents = file.contents.toString();
		var lines = contents.split("\n");
		var linesCount = lines.length;
		var fileParse = new EventEmitter();

		fileParse.on("ready", function(newLines) {
			var newContents = newLines.join("\n");
			if (contents !== newContents) {
				file = new File({
					cwd: file.cwd,
					base: file.base,
					path: file.path,
					contents: new Buffer(newContents)
				});
			}
			buffer.push(file);
			callback();
		});

		// lines.forEach(parseLineFactory(file.path, parseLineEnd));
		lines.forEach(function() {
			var args = Array.prototype.slice.call(arguments);
			parseLineFactory(file.path, parseFileEnd).apply(this, args);
		});

		function parseFileEnd(error, data, index, array) {
			if (error) {
				fileParse.emit("error", error);
				return;
			}
			array[index] = data;
			if (--linesCount === 0) {
				fileParse.emit("ready", array);
			}
		}
	}

	function endStream() {
		for (var i = 0, count = buffer.length; i < count; i++) {
			var file = buffer[i];
			var filePath = path.normalize(file.path);
			if (parsedFiles[filePath] === true) {
				continue;
			}
			this.push(file);
		}
		this.emit("end");
	}

	return through.obj(fileContents, endStream);
};