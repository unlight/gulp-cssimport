var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
};

test("Gulp complete", {timeout: 5000}, function (t) {
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream = gulp.src("design/style.css")
		.pipe(plugin(options))
		.pipe(gulp.dest("/dev/null"));
	collect(stream, function (err, data) {
		var file = data[0];
		data = file.contents.toString();
		// require('fs').writeFileSync('x.css', data);
		t.equal(data, result);
		t.end();
	});

});