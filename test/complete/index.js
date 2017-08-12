var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
};

test("Complete", {timeout: 5000}, function (t) {
	var stream = gulp.src("design/style.css")
		.pipe(plugin(options));
	collect(stream, function (err, data) {
		var file = data[0];
		data = file.contents.toString();
		t.assert(data.indexOf('/* a.css */' !== -1));
		t.assert(data.indexOf('/* b.css */' !== -1));
		t.assert(data.indexOf('/* b1.css */' !== -1));
		t.assert(data.indexOf('/* b2.css */' !== -1));
		t.assert(data.indexOf('a {color: white }' !== -1));
		t.assert(data.indexOf('strong {font-weight: bold}' !== -1));
		t.assert(data.indexOf("src: local('Tangerine Regular'), local('Tangerine-Regular')") !== -1);
		t.end();
	});

});