var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");

var options = {
};

test("Sourcemaps", function (t) {
	// var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream = gulp.src("style*.css")
		.pipe(sourcemaps.init())
		.pipe(plugin(options))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("./~dst"))
	collect(stream, function (err, vinyls) {
		data = vinyls[0].contents.toString();
		t.notEqual(data.indexOf('# sourceMappingURL'), -1);
		t.end();
	});

});