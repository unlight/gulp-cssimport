var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
	extensions: ["!sass", "!less"]
};
var options2 = {
	matchPattern: "!*.{less,sass}" // all except less and sass
};

test("Options extensions exclude", function (t) {
	t.plan(2);
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream = gulp.src("style.css")
		.pipe(plugin(options));
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.equal(data, result);
	});

	var stream = gulp.src("style.css")
		.pipe(plugin(options2));
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.equal(data, result);
	});
});

