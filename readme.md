gulp-cssimport
==============
Parses a CSS file, finds imports, grabs the content of the linked file and replaces the import statement with it.

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

TIPS AND TRICKS
---------------
** Be more precise and do not add to src importing file without necessary: **  
```css
// main.css
@import "a.css";
@import "b.css";
```
If you will do `gulp.src("*.css")` gulp will read `a.css` and `b.css`,
and plugin also will try to read these files. It is double job.  
Do instead: `gulp.src("main.css")`

SIMILAR PROJECTS
----------------
https://npmjs.org/package/gulp-coimport/  
https://npmjs.org/package/gulp-concat-css/  
https://github.com/yuguo/gulp-import-css/  
https://github.com/postcss/postcss-import  
https://www.npmjs.com/package/combine-css/  
https://github.com/suisho/gulp-cssjoin  
https://github.com/jfromaniello/css-import  


KNOWN ISSUES
------------
- Cannot resolve `@import 'foo.css' (min-width: 25em);`

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

1.4 [27 Jun 2015]
- changed parse algorithm
- can handle recursive import