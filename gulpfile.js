var gulp = require("gulp");
var gutil = require("gulp-util");
var g = require("gulp-load-plugins")();

gulp.task("watch-eslint", ["eslint"], function() {
	gulp.watch(["./gulp-cssimport.js"], ["eslint"]);
});

gulp.task("eslint", function() {
	var eslint = g.eslint;
	var conf = {
		rules: {
			"no-use-before-define": [0, "nofunc"],
			"curly": 1,
			"no-comma-dangle": 1,
			"no-debugger": 1,
			"eol-last": 0,
			"new-cap": 1,
			"no-underscore-dangle": 0
		},
		env: {
			node: true
		}
	};
	gulp.src(["./gulp-cssimport.js"])
		.pipe(eslint(conf))
		// .pipe(eslint.failOnError())
		.pipe(eslint.formatEach("stylish", process.stdout));
});

gulp.task("bump", function() {
	var argv = gutil.env;
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