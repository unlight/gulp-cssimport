/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");

var options = {
	extensions: ["css"]
};

var options2 = {
	matchPattern: "*.css",
	filter: /^[^(http)]/gi
};


test("Options extensions only", function (t) {
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	t.plan(2);
	var stream = fs.createReadStream("style.css", { encoding: "utf8" })
		.pipe(plugin(options));
	collect(stream, function (err, data) {
		t.equal(data, result);
	});

	stream = fs.createReadStream("style.css", { encoding: "utf8" })
		.pipe(plugin(options2));
	collect(stream, function (err, data) {
		t.equal(data, result, "options2");
	});

});

