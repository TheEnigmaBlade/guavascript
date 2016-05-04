var parser = require("./src/parser").parser;
//https://github.com/babel/babel/tree/master/packages/babel-generator
var generate = require("escodegen").generate;

var fs = require('fs');

process.chdir(__dirname);

var inputFile = "examples/sandbox.gs";
var outputFile = "examples/sandbox.js";

fs.readFile(inputFile, 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	
	var parsed = parser.parse(data);
	console.log(JSON.stringify(parsed, null, 2));
	
	var output = generate(parsed, {format: {indent: {style: "\t"}, quotes: "double", escapeless: false}, comment: false, verbatim: "_verbatim"});
	console.log("---------------");
	console.log(output);
	
	fs.writeFile(outputFile, output, function(err) {
		if(err) {
			console.log(err);
		}
	});
});
