var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");
var options = {};

test("Recursive", function (t) {
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream;
	var p = plugin(options);
	stream = gulp.src("design/style.css")
		.pipe(p);
	collect(stream, function(err, data) {
		var file = data[0];
		data = file.contents.toString();
		// fs.writeFileSync("x.css", data);
		t.equal(data, result);
		t.end();
	});
});