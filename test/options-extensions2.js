"use strict";
var test = require("tape");
var basename = require("path").basename;
var name = ["", basename(__filename)].join(" ").trim();
var gulp = require("gulp");
var plugin = require("..");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;

var options = {
	extensions: ["!sass", "!less"]
}

test(name, function (t) {
	var emitter = new EventEmitter();
	var file = {};
	var stream = gulp.src("./fixture-extensions2/style.css")
		.pipe(plugin(options))
		.pipe(gulp.dest("./tmp/fixture-extensions2-dest/"));
	stream.on("end", function() {
		fs.readFile("./fixture-extensions2/result.css", {encoding: "utf8"}, function(err, expectedContents) {
			if (err) throw err;
			file.expected = expectedContents;
			emitter.emit("file", file);
		});
		fs.readFile("./tmp/fixture-extensions2-dest/style.css", {encoding: "utf8"}, function(err, actualContents) {
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
