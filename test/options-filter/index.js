var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
	filter: /^http:\/\//gi
};

test("Options filter http", function (t) {
	var stream;
	var stream = gulp.src("style.css")
		.pipe(plugin(options));
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.assert(data.indexOf('@import url("a.css")') !== -1);
		t.assert(data.indexOf("@import 'b.sass'") !== -1);
		t.assert(data.indexOf("@import 'c.less'") !== -1);
		t.assert(data.indexOf("src: local('Tangerine Regular'), local('Tangerine-Regular')") !== -1);
		t.end();
	});
});
