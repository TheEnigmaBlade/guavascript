var parser = require("../src/parser").parser
var generate = require("escodegen").generate
var x = module.exports = {}

fun transpile(input) {
	var parsed = parser.parse(input)
	return generate(parsed, {
		format: {
			indent: {style: " "},
			newline: "\n",
			quotes: "single",
			compact: true,
			escapeless: false
		},
		comment: false
	})
}

x.run = fun(input, expected) {
	var output = transpile(input)
	if output != expected {
		throw Error("Output did not match expected.\n\nInput\n----------\n"+input+"\n----------\n\nOutput\n----------\n"+output+"\n----------\n\nExpected\n----------\n"+expected+"\n----------")
	}
}

x.run_fail = fun(input) {
	var output
	try output = transpile(input)
	catch e {
		// Failure success
		return
	}
	throw Error("Transpilation was expected to fail but didn't.\n\nInput\n----------\n"+input+"\n----------\n\nOutput\n----------\n"+output+"\n----------")
}
