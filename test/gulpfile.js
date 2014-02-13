var gulp = require("gulp"),
	plugin = require("..");

gulp.task("fixture2", function() {
	gulp.src("fixture2/*")
		.pipe(plugin())
		.pipe(gulp.dest("./fixture2_dest/"));
});

// Run tests
gulp.task("test", ["fixture2"]);