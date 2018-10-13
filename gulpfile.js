var gulp = require("gulp");
var gutil = require("gulp-util");
var g = require("gulp-load-plugins")();
var argv = require('minimist')(process.argv.slice(2));

gulp.task("watch-eslint", ["eslint"], function() {
	gulp.watch(["./gulp-cssimport.js"], ["eslint"]);
});

gulp.task("eslint", function() {
	var eslint = g.eslint;
	gulp.src(["./gulp-cssimport.js"])
		.pipe(eslint())
		// .pipe(eslint.failOnError())
		.pipe(eslint.formatEach("stylish", process.stdout));
});

gulp.task("bump", function() {
	var options = {
		type: "patch"
	};
	if (argv.type) options.type = argv.type;
	if (argv.version) options.version = argv.version;
	gulp.task("bump", function() {
		gulp.src("./package.json")
			.pipe(g.bump(options))
			.pipe(gulp.dest("./"));
	});
});
