/// <reference path="typings/node/node.d.ts" />
"use strict";
var gutil = require("gulp-util");
var through = require("through2");
var format = require("util").format;
var trim = require("phpjs/build/npm").trim;
var resolvePath = require("./helper").resolvePath;
var PLUGIN_NAME = "gulp-cssimport";

var defaults = {
	extensions: null,
	filter: null
};

module.exports = function cssImport(options) {

	options = options || {};

	function fileContents(file, encoding, callback) {
		if (file.path === null) {
			throw new gutil.PluginError(PLUGIN_NAME, "File.path is null.");
		}
		var contents = "";
		var isVinylFile = false;
		if (file.isBuffer && file.isBuffer()) {
			isVinylFile = true;
			contents = file.contents.toString();
		} else if (file instanceof Buffer) {
			contents = file.toString();
		} else if (typeof file === "string") {
			contents = file;
		} else {
			throw new gutil.PluginError(PLUGIN_NAME, "Passed unknown object.");
		}
		// https://github.com/kevva/import-regex/
		var regex = '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)';
		var importRe = new RegExp(regex, "gi");
		var match;
		var fileArray = [];
		var lastPos = 0;
		var count = 0;
		while ((match = importRe.exec(contents)) !== null) {
			fileArray[fileArray.length] = contents.slice(lastPos, match.index);
			var match2 = /@import\s+(?:url\()?(.+(?=['"\)]))(?:\))?.*/ig.exec(match[0]);
			var pathObject = {
				index: fileArray.length,
				path: trim(match2[1], "'\"")
			};
			fileArray[fileArray.length] = format("importing file %j", pathObject);
			lastPos = importRe.lastIndex;
			// Start resolving.
			count++;
			resolvePath(pathObject, onResolvePath);
		}
		
		function onResolvePath(err, data, pathObject) {
			if (err) {
				callback(err);
				return;
			}
			fileArray[pathObject.index] = data;
			count--;
			if (count === 0) {
				fileReady();
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
			if (!state.done) {
				fileContents(contents, null, callback);
				return;
			}
			if (isVinylFile) {
				contents = new gutil.File({
					cwd: file.cwd,
					base: file.base,
					path: file.path,
					contents: new Buffer(contents)
				});
			}
			callback(null, contents);
		}

	}

	return through.obj(fileContents);
};