var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
};

test("Strip bom", function(t) {
	var stream = gulp.src("design/root.css")
		.pipe(plugin(options));
	collect(stream, function(err, data) {
		var file = data[0];
		var boms = file.contents.toString()
			.split('')
			.map(a => a.charCodeAt())
			.filter(char => char === 0xFEFF)
		t.assert(boms.length === 0);
		t.end();
	});

});