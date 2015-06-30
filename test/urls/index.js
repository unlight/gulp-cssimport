/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/tape/tape.d.ts" />
var test = require("tape");
var fs = require("fs");
var collect = require("collect-stream");
var plugin = require("../..");

test("Urls", function(t) {
	var stream = fs.createReadStream("style.css", {
			encoding: "utf8"
		})
		.pipe(plugin());
	collect(stream, function(err, data) {
		var pos = data.indexOf("font-family: 'Tangerine'");
		t.notEqual(pos, -1);
		t.end();
	});
});