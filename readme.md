gulp-cssimport
==============

Parses css files, finds `@import` directive and includes these external files.

USAGE
-----
```javascript
var gulp = require("gulp");
var cssimport = require("gulp-cssimport");

gulp.task("fixture2", function() {
	gulp.src("src/*.css")
		.pipe(plugin())
		.pipe(gulp.dest("dist/"));
}); 
```

KNOWN ISSUES
------------
1. Cannot process minified files