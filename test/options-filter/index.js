var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
	filter: /^http:\/\//gi
};

test("Options filter http", function (t) {
	t.plan(1);
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream;
	var stream = gulp.src("style.css")
		.pipe(plugin(options));
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.equal(data, result);
	});
});
