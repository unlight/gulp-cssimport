/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
	limit: 100
};

test("Recursive", function (t) {
	var stream;
	t.plan(1);
	var p = plugin(options);
	stream = gulp.src("design/style.css")
		.pipe(p)
		.pipe(gulp.dest("/dev/null"));
	p.on("error", function (err) {
		t.ok(err.message.indexOf("Recursive include") != -1, "Emit error");
	});
});