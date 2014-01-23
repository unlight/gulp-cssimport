var through = require('through2');
var gutil = require('gulp-util');
var es = require('event-stream');
var fs = require("fs");
var Stream = require("stream");
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-css-import';

module.exports = function(options) {
	'use strict';
	
	options = options || {};

	function mapFunction(file, callback) {

		var lines = String(file.contents).split("\n");
		console.log(lines);

		// // Split Strings
		// file.pipe(es.split("\n"))
		//   .pipe(es.mapSync(function(data) {
  //       	console.log(data);
  //   		}))
		// // Replace
		// // .pipe(es.replace("John", "Bob"))
		// // Join Strings
		// .pipe(es.join("\n"));

		callback(null, file);
	}

	return es.map(mapFunction);
}