const gutil = require("gulp-util");
const fs = require("fs");
const path = require("path");
const File = gutil.File;
const PluginError = gutil.PluginError;
const through = require("through");
const format = require("util").format;
const trim = require("useful-functions").trim;
const extend = require("useful-functions").extend;

const PLUGIN_NAME = "gulp-css-import";

function ok() {
	var args = Array.prototype.slice.call(arguments);
	var message = format.apply(null, args)
	gutil.log(PLUGIN_NAME, gutil.colors.green("✔ " + message));
}

function fail() {
	var args = Array.prototype.slice.call(arguments);
	var message = format.apply(null, args)
	gutil.log(PLUGIN_NAME, gutil.colors.red("✘ " + message));
}

var defaults = {};

module.exports = function (options) {
	
	options = options || {};
	var parsedFiles = {};
	var buffer = [];

	function parseLineFactory(filePath) {
		var fileDirectory = path.dirname(filePath);
		return function parseLine(line, index, array) {
			var match = line.match(/(@import\s+url\(((.+?)\)).*)/i);
			var importFile = match && trim(match[3], "'\"");

			if (importFile) {
				var importFilePath = path.normalize(path.join(fileDirectory, importFile));
				var exists = fs.existsSync(importFilePath);
				if (exists) {
					var contents = fs.readFileSync(importFilePath);
					line = contents;
					parsedFiles[importFilePath] = true;
				}
			}

			return line;
		};
	}

	return through(function(file, encoding, callback) {

		if (file.path === null) {
			throw new Error("File.path is null.");
		}

		if (!file.isBuffer()) {
			throw new PluginError(PLUGIN_NAME, "Only buffer is supported.");
		}

		var contents = file.contents.toString();
		var lines = contents.split("\n");
		var newContents = lines.map(parseLineFactory(file.path)).join("\n");

		if (contents != newContents) {
			file = new File({
				cwd: file.cwd,
				base: file.base,
				path: file.path,
				contents: new Buffer(newContents)
			});
		}

		buffer.push(file);

	}, function() {
		for (var i = 0, count = buffer.length; i < count; i++) {
			var file = buffer[i];
			var filePath = path.normalize(file.path);
			if (parsedFiles[filePath] === true) {
				continue;
			}
			this.emit('data', file);
		}
    	this.emit('end');
	});
};