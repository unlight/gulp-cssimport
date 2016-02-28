var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

test("Urls", function(t) {
	var stream = gulp.src("style.css")
		.pipe(plugin());
	collect(stream, function(err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.notEqual(data.indexOf("font-family: 'Tangerine'"), -1);
		t.notEqual(data.indexOf("fonts.gstatic.com"), -1);
		t.end();
	});
});