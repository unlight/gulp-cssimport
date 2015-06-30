/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");

var options = {
	filter: /^http:\/\//gi
};

test("Options filter http", function (t) {
	t.plan(1);
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream;
	stream = fs.createReadStream("style.css", { encoding: "utf8" })
		.pipe(plugin(options));
	collect(stream, function (err, data) {
		t.equal(data, result);
	});
});
