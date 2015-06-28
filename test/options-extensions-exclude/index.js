/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");

var options = {
	extensions: ["!sass", "!less"]
}

test("Options extensions exclude", function (t) {
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream = fs.createReadStream("style.css", { encoding: "utf8" })
		.pipe(plugin(options));
	collect(stream, function (err, data) {
		//fs.writeFileSync("x.css", data);
		t.equal(data, result);
		t.end();
	});
});

