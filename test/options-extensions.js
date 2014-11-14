"use strict";
var test = require("tape");
var basename = require("path").basename;
var name = ["", basename(__filename)].join(" ").trim();
var gulp = require("gulp");
var plugin = require("..");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;

var options = {
	extensions: ["css"]
}

test(name, function (t) {
	var emitter = new EventEmitter();
	var file = {};
	var stream = gulp.src("./fixture-extensions/style.css")
		.pipe(plugin(options))
		.pipe(gulp.dest("./tmp/fixture-extensions-dest/"));
	stream.on("end", function() {
		fs.readFile("./fixture-extensions/result.css", {encoding: "utf8"}, function(err, expectedContents) {
			if (err) throw err;
			file.expected = expectedContents;
			emitter.emit("file", file);
		});
		fs.readFile("./tmp/fixture-extensions-dest/style.css", {encoding: "utf8"}, function(err, actualContents) {
			if (err) throw err;
			file.actual = actualContents;
			emitter.emit("file", file);
		});
	});
	emitter.on("file", function(file) {
		if (Object.keys(file).length >= 2) {
			t.equal(file.actual, file.expected);
			t.end();
		}
	});
});
