var wru = require("wru");
var gulp = require("gulp");
var gulpCssImport = require("../");
var path = require("path");
var es = require('event-stream');
var Stream = require('stream');
var fs = require('fs');

var testfile = path.join(__dirname, './fixture/style.css');

wru.test(function() {

	var inputFunction = wru.async(function(file, callback) {
		// console.log(file);
		var source = fs.readFileSync(testfile);
		wru.assert(true);
	});

	gulp
		.src(testfile)
		.pipe(gulpCssImport())
		.pipe(es.map(inputFunction));
});