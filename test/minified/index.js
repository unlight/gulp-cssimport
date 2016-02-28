var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

test("Minified", function (t) {
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream = gulp.src("style.css")
		.pipe(plugin());
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.equal(data, result);
		t.end();
	});
});