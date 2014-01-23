// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulp-css-import';

function prefixStream(prefixText) {
	var stream = through();
	stream.write(prefixText);
	return stream;
}

// Plugin level function (dealing with files)
function gulpPrefixer(prefixText) {

	//console.log(require("util").inspect(prefixText));

	if (!prefixText) {
		throw PluginError(PLUGIN_NAME, "Missing prefix text!");
	}
	prefixText = new Buffer(prefixText); // allocate ahead of time

	// Creating a stream through which each file will pass
	var stream = through.obj(function (file, enc, callback) {
		if (file.isNull()) {
			this.push(file); // Do nothing if no contents
			return callback();
		}

		if (file.isBuffer()) {
			file.contents = Buffer.concat([prefixText, file.contents]);
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			file.contents = file.contents.pipe(prefixStream(prefixText));
			this.push(file);
			return callback();
		}
	});

	// returning the file stream
	return stream;
};

// Exporting the plugin main function
module.exports = gulpPrefixer;