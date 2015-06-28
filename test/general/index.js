/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");

test("General", function(t) {
	var result = fs.readFileSync("result.css", {
		encoding: "utf8"
	});
	var stream = fs.createReadStream("style.css", {
			encoding: "utf8"
		})
		.pipe(plugin());
	collect(stream, function(err, data) {
		t.equal(data, result);
		t.end();
	});
});