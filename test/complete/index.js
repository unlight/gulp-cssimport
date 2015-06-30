/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");

var options = {
};

test("Complete", function (t) {
	var result = fs.readFileSync("result.css", { encoding: "utf8" });
	var stream = fs.createReadStream("style.css", {
		encoding: "utf8"
	})
		.pipe(plugin(options));
	collect(stream, function (err, data) {
		// fs.writeFileSync("x.css", data);
		t.equal(data, result);
		t.end();
	});
});