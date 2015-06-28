/// <reference path="typings/node/node.d.ts" />
"use strict";
var through = require("through2");
var format = require("util").format;
var trim = require("phpjs/build/npm").trim;
//var resolvePath = require("./helper").resolvePath;
// var PLUGIN_NAME = "gulp-cssimport";
var path = require("path");
var merge = require("deepmerge");
var isIgnored = require("./helper").isIgnored;
var PathObject = require("./pathObject");
var Chunk = require("./chunk");

var defaults = {
	extensions: null,
	filter: null,
	directory: process.cwd()
};

module.exports = function cssImport(options) {

	options = merge(defaults, options || {});

	if (options.extensions && !Array.isArray(options.extensions)) {
		options.extensions = options.extensions.toString().split(",").map(function (x) {
			return x.trim();
		});
	}

	function fileContents(data, encoding, callback) {
		// todo: get directory from settings
		var chunk = Chunk.create(data, { directory: options.directory });
		// https://github.com/kevva/import-regex/
		var regex = '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)';
		var importRe = new RegExp(regex, "gi");
		var match;
		var fileArray = [];
		var lastPos = 0;
		var count = 0;
		var contents = chunk.getContents();
		while ((match = importRe.exec(contents)) !== null) {
			var match2 = /@import\s+(?:url\()?(.+(?=['"\)]))(?:\))?.*/ig.exec(match[0]);
			var filePath = trim(match2[1], "'\"");
			if (isIgnored(filePath, options)) {
				continue;
			}
			fileArray[fileArray.length] = contents.slice(lastPos, match.index);
			var index = fileArray.length;
			var pathObject = new PathObject({
				index: index,
				path: filePath,
				directory: chunk.getDirectory()
			});
			fileArray[index] = format("importing file %j", pathObject);
			lastPos = importRe.lastIndex;
			// Start resolving.
			count++;
			// todo: this is not object of pathObject. 
			pathObject.resolvePath(onResolvePath);
		}

		function onResolvePath(err, data, pathObject) {
			if (err) {
				console.trace(err);
				throw err;
				// todo: Make more realiable.
				// callback(err);
				// return;
			}
			fileArray[pathObject.index] = data;
			count--;
			if (count === 0) {
				var state = {};
				if (!pathObject.isUrl()) {
					var importedFile = path.join(pathObject.directory, pathObject.path);
					importedFile = path.normalize(importedFile);
					state.directory = path.dirname(importedFile);
				}
				fileReady(state);
			}
		}
		// No import statements.
		if (count === 0) {
			fileReady({ done: true });
			return;
		}
		// Adding trailing piece.
		fileArray[fileArray.length] = contents.slice(lastPos);

		// todo: optimize do not scan all contents.
		function fileReady(state) {
			state = state || {};
			if (fileArray.length > 0) {
				contents = fileArray.join("");
			}
			// todo: options for max recursive
			if (!state.done) {
				var nextChunk = Chunk.create({
					contents: contents,
					directory: state.directory
				});
				fileContents(nextChunk, null, callback);
				return;
			}
			// todo: pass vinyl file 
			// if (isVinylFile) {
			// 	contents = new gutil.File({
			// 		cwd: data.cwd,
			// 		base: data.base,
			// 		path: data.path,
			// 		contents: new Buffer(contents)
			// 	});
			// }
			callback(null, contents);
		}

	}

	return through.obj(fileContents);
};