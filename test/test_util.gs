var parser = require("../src/parser").parser
var generate = require("escodegen").generate
var x = module.exports = {}

x.run = fun(input, expected) {
	var parsed = parser.parse(input)
	var output = generate(parsed, {
		format: {
			indent: {style: " "},
			newline: "\n",
			quotes: "single",
			compact: true,
			escapeless: false
		},
		comment: false
	})
	if output != expected {
		throw Error("Output did not match expected.\n\nInput\n----------\n"+input+"\n----------\n\nOutput\n----------\n"+output+"\n----------\n\nExpected\n----------\n"+expected+"\n----------")
	}
}
