#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var parser = require("./src/parser").parser;
var generate = require("escodegen").generate;

program.arguments("<input_file> <output_file>")
	.option("-t, --tab-style <tab_style>", "The type of tab to use, either 'tab' or 'space'.")
	.option("-q, --quote-style <tab_style>", "The type of quote to use, either 'single' or 'double'.")
	.action(function(input_file, output_file) {
		var tab = "\t";
		if(program.tab_style === "space") {
			tab = "    ";
		}
		transpile(input_file, output_file, tab);
	})
	.parse(process.argv);

function transpile(input_file, output_file, tab_style) {
	fs.readFile(input_file, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		
		var parsed = parser.parse(data);
		//console.log(JSON.stringify(parsed, null, 2));
		
		var output = generate(parsed, {format: {indent: {style: tab_style}, quotes: "double", escapeless: false}, comment: true, verbatim: "_verbatim"});
		//console.log("---------------");
		//console.log(output);
		
		fs.writeFile(output_file, output, function(err) {
			if(err) {
				console.log(err);
			}
		});
	});
}
