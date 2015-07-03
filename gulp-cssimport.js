/// <reference path="typings/node/node.d.ts" />
"use strict";
var gutil = require("gulp-util");
var through = require("through2");
var format = require("util").format;
var path = require("path");
var deepExtend = require('deep-extend');
var isMatch = require("./helper").isMatch;
var resolvePath = require("./helper").resolvePath;
var trim = require("./helper").trim;
var PathObject = require("./pathObject");
var Chunk = require("./chunk");

var defaults = {
	extensions: null,
	filter: null,
	matchPattern: null,
	matchOptions: {
		matchBase: true
	},
	limit: 5000
};
Object.defineProperty(defaults, "directory", {
	enumerable: true,
	get: function () {
		return process.cwd();
	}
});

module.exports = function cssImport(options) {

	options = deepExtend({}, defaults, options || {});

	if (options.extensions && !Array.isArray(options.extensions)) {
		options.extensions = options.extensions.toString().split(",").map(function (x) {
			return x.trim();
		});
	}
	
	var stream;
	var cssCount = 0;
	
	function fileContents(data, encoding, callback) {
		if (!stream) {
			stream = this;
		}
		var chunk = Chunk.create(data, { directory: options.directory });
		//console.log("chunk.isVinyl", chunk.isVinyl);
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
			//console.log(filePath, isMatch(filePath, options));
			if (!isMatch(filePath, options)) {
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
			// console.log("Start resolving", cssCount++, pathObject);
			if (++cssCount > options.limit) {
				stream.emit("error", new Error("Exceed limit. Recursive include?"));
				return;
			}
			count++;
			resolvePath(pathObject, onResolvePath);
		}

		function onResolvePath(err, data, pathObject) {
			if (err) {
				console.trace(err);
				throw err;
				// todo: Make it more realiable.
				// callback(err);
				// return;
			}
			fileArray[pathObject.index] = data;
			count--;
			if (count === 0) {
				var state = { directory: pathObject.directory };
				if (!pathObject.isUrl()) {
					state.directory = pathObject.getPathDirectory();
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
			//console.log("fileReady.state", state);
			state = state || {};
			if (fileArray.length > 0) {
				contents = fileArray.join("");
			}
			if (!state.done) {
				//console.log("chunk.isVinyl", chunk.isVinyl);
				var nextChunk;
				if (chunk.isVinyl) {
					chunk.vinyl.contents = new Buffer(contents);
					chunk.vinyl.base = state.directory;
					nextChunk = chunk.vinyl;
				} else {
					nextChunk = Chunk.create({
						contents: contents,
						directory: state.directory
					});
				}
				//console.log("state", state);
				fileContents(nextChunk, null, callback);
				return;
			}
			//console.log("chunk.isVinyl", chunk.isVinyl);
			if (chunk.isVinyl) {
				contents = new gutil.File({
					cwd: data.cwd,
					base: data.base,
					path: data.path,
					contents: new Buffer(contents)
				});
			}
			callback(null, contents);
		}

	}

	return through.obj(fileContents);
};