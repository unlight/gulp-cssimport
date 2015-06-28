[
	"urls",
	"general",
	"minified",
	"recursive",
].forEach(function (name) {
	process.chdir(__dirname + "/" + name);
	require("./" + name);
});