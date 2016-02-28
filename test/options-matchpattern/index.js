var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");
var gulp = require("gulp");

var options = {
    matchPattern: '*.css',
};

test("Parent", function(t) {
    var stream;
    t.plan(1);
    var result = fs.readFileSync("result.css", {
        encoding: "utf8"
    });
    stream = gulp.src("design/style/css/main/style.css")
        .pipe(plugin(options));
    collect(stream, function(err, data) {
        var file = data[0];
        data = file.contents.toString();
        // fs.writeFileSync("x.css", data);
        t.equal(data, result);
        t.end();
    });

});
