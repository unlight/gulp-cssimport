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

	var stream = gulp.src("style.css")
		.pipe(plugin(options));
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.assert(data.indexOf("/* a.css */") !== -1);
		t.assert(data.indexOf("@import 'b.sass'") !== -1);
		t.assert(data.indexOf("@import 'c.less'") !== -1);
		t.assert(data.indexOf("src: local('Tangerine Regular'), local('Tangerine-Regular')") !== -1);
		t.assert(data.indexOf("font-size: 13px") !== -1);
	});

	var stream = gulp.src("style.css")
		.pipe(plugin(options2));
	collect(stream, function (err, vinyls) {
		var data = vinyls[0].contents.toString();
		t.assert(data.indexOf("/* a.css */") !== -1);
		t.assert(data.indexOf("@import 'b.sass'") !== -1);
		t.assert(data.indexOf("@import 'c.less'") !== -1);
		t.assert(data.indexOf("src: local('Tangerine Regular'), local('Tangerine-Regular')") !== -1);
		t.assert(data.indexOf("font-size: 13px") !== -1);
		t.end();
	});
});

