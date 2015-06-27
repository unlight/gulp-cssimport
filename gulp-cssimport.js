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

module.exports = function (options) {

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

		var importRegExp = /@import\s+(?:url\()?(.+(?=['"\)]))(?:\))?.*/ig;
		var match;
		var fileArray = [];
		var lastPos = 0;
		var count = 0;
		while ((match = importRegExp.exec(contents)) !== null) {
			fileArray[fileArray.length] = contents.slice(lastPos, match.index);
			var pathObject = {
				index: fileArray.length,
				path: trim(match[1], "'\"")
			};
			fileArray[fileArray.length] = format("importing file %j", pathObject);
			lastPos = importRegExp.lastIndex;
			// Start resolving.
			count++;
			resolvePath(pathObject, onResolvePath);
		}

		function onResolvePath(err, data, pathObject) {
			
			fileArray[pathObject.index] = data;
			count--;
			if (count === 0) {
				fileReady();
			}
		}

		if (count === 0) {
			callback(null, file);
			return;
		}
		
		// Adding trailing piece.
		fileArray[fileArray.length] = contents.slice(lastPos);

		function fileReady() {
			var newContents = fileArray.join("");
			// todo: need check this for other imports... recursive
			if (isVinylFile) {
				newContents = new gutil.File({
					cwd: file.cwd,
					base: file.base,
					path: file.path,
					contents: new Buffer(newContents)
				});
			}
			callback(null, newContents);
		}

	}

	return through.obj(fileContents);
};