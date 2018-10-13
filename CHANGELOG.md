## 7.0.0 (2018-10-13)

* docs: Moved changelog ([6584733](https://github.com/unlight/gulp-cssimport/commit/6584733))
* feat: Removed gulp-util ([180a775](https://github.com/unlight/gulp-cssimport/commit/180a775)), closes [#28](https://github.com/unlight/gulp-cssimport/issues/28) [#29](https://github.com/unlight/gulp-cssimport/issues/29)
* 6.0.1 ([1e49903](https://github.com/unlight/gulp-cssimport/commit/1e49903))
* Broken url test ([36ea40a](https://github.com/unlight/gulp-cssimport/commit/36ea40a))
* Fixed potential catastrophic backtracking vulnerability ([b354458](https://github.com/unlight/gulp-cssimport/commit/b354458))
* Merge remote-tracking branch 'prog1dev/master' ([2e19116](https://github.com/unlight/gulp-cssimport/commit/2e19116))
* Replace deprecated gulp-util ([d29729e](https://github.com/unlight/gulp-cssimport/commit/d29729e))
* Updated some dependencies ([5ec88e2](https://github.com/unlight/gulp-cssimport/commit/5ec88e2))


### BREAKING CHANGE

* Removed deprecated gulp-util

## 6.0.1 [23 Feb 2018]
* fixed potential catastrophic backtracking vulnerability

## 6.0.0 [01 Sep 2017]
* remove byte order mask from imported files

## 5.1.0 [13 Aug 2017]
* added option 'transform'

## 5.0.0 [20 Nov 2016]
* added option 'skipComments'

## 4.0.0 [06 Oct 2016]
* added option 'includePaths'

## 3.0.0 [28 Feb 2016]
* removed node streams support, now only gulp
* removed directory option
* added sourcemaps support
* fixed bogus destination bugs

## 2.0.0 [30 Jun 2015]
* changed parse algorithm
* can handle recursive import
* can handle minified css files
* added option 'matchPattern'

## 1.3.0 [14 Nov 2014]
* added option 'extensions'
* added option 'filter'

## 1.2.0 [15 Feb 2014]
* fixed processing urls

## 1.1.0 [15 Feb 2014]
* switched to through2
* process files asynchronously

## 1.0.0 [12 Feb 2014]
* first release
