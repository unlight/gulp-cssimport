gulp-cssimport
==============
Parses css files and insert file contents instead of `@import` directives.

USAGE
-----
```js
var gulp = require("gulp");
var cssimport = require("gulp-cssimport");
var options = {};
gulp.task("import", function() {
	gulp.src("src/*.css")
		.pipe(cssimport(options))
		.pipe(gulp.dest("dist/"));
}); 
```

OPTIONS
-------
**extensions**  
String or Array, default: null (process all).
Case insensitive list of extension allowed to process.
Any other non-matched lines will be leaved as is.  
Examples:
```js
var options = {
	extensions: ["css"] // process only css
};
var options = {
	extensions: ["!less", "!sass"] // all except less and sass
};
```
**filter**  
Process only files which match to regexp.
RegExp, default: null (no filter).
Any other non-matched lines will be leaved as is.  
Example:
```js
var options = {
	filter: /^http:\/\//gi // process only http urls
};
```

KNOWN ISSUES
------------
- Cannot process minified files (will be fixed later)

CHANGELOG
---------
1.0 [12 Feb 2014]
- first release

1.1 [15 Feb 2014]
- switched to through2
- process files asynchronously

1.2 [15 Feb 2014]
- fixed processing urls

1.3 [14 Nov 2014]
- added option 'extensions'
- added option 'filter'

TODO
----
- recursive import, using css-parse https://github.com/unlight/gulp-cssimport/issues/6