"use strict";
var through = require("through2");
var path = require("path");
var deepExtend = require("deep-extend");
var fs = require("fs");
var pify = require("pify");
var Vinyl = require("vinyl");
var PluginError = require("plugin-error");
var collect = require("collect-stream");
var hh = require("http-https");
var minimatch = require("minimatch");
var applySourceMap = require("vinyl-sourcemaps-apply");
var MagicString = require("magic-string");
var lookupPath = require("lookup-path");

var PLUGIN_NAME = "gulp-cssimport";
var readFile = pify(fs.readFile);
var trim = require("lodash.trim");
var format = require("util").format;
var stripBom = require("strip-bom");

var defaults = {
    skipComments: true,
    extensions: null,
    includePaths: [],
    filter: null,
    matchPattern: null,
    matchOptions: {
        matchBase: true
    },
    limit: 5000,
    transform: null
};

module.exports = function cssImport(options) {

    options = deepExtend({}, defaults, options || {});

    if (options.extensions && !Array.isArray(options.extensions)) {
        options.extensions = options.extensions.toString().split(",").map(function(x) {
            return x.trim();
        });
    }

    var stream;
    var cssCount = 0;
    var transform = (options.transform && typeof options.transform === 'function') ? options.transform : null;

    function fileContents(vinyl, encoding, callback) {

        if (!stream) {
            stream = this;
        }
        // https://github.com/kevva/import-regex/
        var regex = '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)'; // eslint-disable-line
        var importRe = new RegExp(regex, "gi");
        var match;
        var file = [];
        var lastpos = 0;
        var promises = [];
        var contents = vinyl.contents.toString();
        while ((match = importRe.exec(contents)) !== null) {
            if (options.skipComments) {
                var matchIndex = match.index;
                // Check comment symbols 1.
                var startCommentPosition = contents.lastIndexOf('/*', matchIndex);
                var endCommentPosition = contents.lastIndexOf('*/', matchIndex);
                if (!(endCommentPosition > startCommentPosition) && startCommentPosition !== -1) {
                    continue;
                }
                // Check comment symbols 2.
                var startCommentPosition2 = contents.lastIndexOf('//', matchIndex);
                var endCommentPosition2 = contents.lastIndexOf('\n', matchIndex);
                if (startCommentPosition2 > endCommentPosition2 && startCommentPosition2 !== -1) {
                    continue;
                }
            }
            var match2 = /@import\s+(?:url\()?(.+(?=['")]))(?:\))?.*/ig.exec(match[0]);
            var importPath = trim(match2[1], "'\"");
            if (transform) {
                importPath = transform(importPath, { match: match[0] });
            }
            var isMatched = isMatch(importPath, options);
            if (!isMatched) {
                continue;
            }
            file[file.length] = contents.slice(lastpos, match.index);
            var index = file.length;
            file[index] = format("importing file %s from %s", importPath, vinyl.relative);
            lastpos = importRe.lastIndex;
            // Start resolving.
            if (++cssCount > options.limit) {
                stream.emit("error", new Error("Exceed limit. Recursive include?"));
                return;
            }

            (function(index) {
                var result = { index: index, importPath: importPath };
                if (!isUrl(importPath)) {
                    var pathDirectory = path.dirname(vinyl.path);
                    var importFile = resolveImportFile(pathDirectory, importPath, options.includePaths);
                    if (!importFile) {
                        var err = new Error("Cannot find file '" + importPath + "' from '" + pathDirectory + "' (includePaths: " + options.includePaths + ")");
                        callback(new PluginError(PLUGIN_NAME, err));
                    }
                    promises[promises.length] = readFile(importFile, "utf8").then(function(contents) {
                        result.importFile = importFile;
                        result.contents = contents;
                        return result;
                    });
                } else {
                    promises[promises.length] = new Promise(function(resolve, reject) {
                        var req = hh.request(importPath, function(res) {
                            collect(res, function(err, data) {
                                if (err) {
                                    return reject(err);
                                }
                                result.contents = data.toString();
                                resolve(result);
                            });
                        });
                        req.on("error", reject);
                        req.end();
                    });
                }
            })(index);
        }
        // Nothing to import.
        if (promises.length === 0) {
            callback(null, vinyl);
            return;
        }
        // Adding trailing piece.
        file[file.length] = contents.slice(lastpos);
        // Waiting promises.
        Promise.all(promises)
            .then(function(results) {
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    // Strip BOM.
                    result.contents = stripBom(result.contents);
                    var vfile = new Vinyl({
                        path: result.importFile,
                        contents: new Buffer(result.contents)
                    });
                    (function(result) {
                        results[i] = pify(fileContents)(vfile, null).then(function(vfile) {
                            result.contents = vfile.contents.toString();
                            return result;
                        });
                    })(result);
                }
                return Promise.all(results);
            })
            .then(function(results) {
                var iterator = function() { };
                if (vinyl.sourceMap) {
                    var bundle = new MagicString.Bundle();
                    iterator = function(file, result) {
                        bundle.addSource({
                            filename: result.importPath,
                            content: new MagicString(result.contents)
                        });
                    };
                }
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var index = result.index;
                    var contents = result.contents;
                    file[index] = contents;
                    iterator(file, result);
                }
                vinyl.contents = new Buffer(file.join(""));
                if (vinyl.sourceMap) {
                    var map = bundle.generateMap({
                        file: vinyl.relative,
                        includeContent: true,
                        hires: true
                    });
                    applySourceMap(vinyl, map);
                }
                callback(null, vinyl);
            })
            .catch(function(err) {
                callback(new PluginError(PLUGIN_NAME, err));
            });
    }

    return through.obj(fileContents);
};

function resolveImportFile(pathDirectory, importPath, includePaths) {
    var result = lookupPath(importPath, pathDirectory);
    if (result) {
        return result;
    }
    for (var i = 0; i < includePaths.length; i++) {
        var includePath = includePaths[i];

        var d1 = path.resolve(pathDirectory, includePath);
        if (d1 === pathDirectory) {
            continue;
        }
        result = lookupPath(importPath, d1);
        if (result) {
            return result;
        }

        var d2 = path.resolve(includePath);
        if (d2 === d1) {
            continue;
        }
        result = lookupPath(importPath, d2);
        if (result) {
            return result;
        }
    }
    return null;
}

function isMatch(path, options) {
    if (!options) {
        return true;
    }
    if (!path) {
        return false;
    }
    options = options || {};
    var result;
    if (options.filter instanceof RegExp) {
        var filter = options.filter;
        filter.lastIndex = 0;
        result = filter.test(path);
    }
    if (options.matchPattern && !isUrl(path)) {
        var matchPattern = options.matchPattern;
        result = minimatch(path, matchPattern, options.matchOptions);
    }
    if (options.extensions) {
        var extensions = options.extensions;
        var fileExt = getExtension(path);
        for (var k = 0; k < extensions.length; k++) {
            var extension = extensions[k];
            var isInverse = extension.charAt(0) === '!';
            if (isInverse) {
                extension = extension.slice(1);
            }
            if (isInverse && fileExt === extension) { // !sass , sass === css
                return false;
            } else if (!isInverse && fileExt !== extension) {
                return false;
            }
        }
    }
    if (typeof result === 'undefined') {
        result = true;
    }
    return result;
}

function isUrl(s) {
    return /^(http|https):\/\//.test(s);
}

function getExtension(p) {
    p = String(p);
    return p.substr(p.lastIndexOf('.') + 1);
}
