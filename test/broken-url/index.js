var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

test('Broken urls', function(t) {
	var stream = gulp.src("style.css")
		.pipe(plugin());
	collect(stream, function(err, vinyls) {
		t.assert(err);
		t.end();
	});
});