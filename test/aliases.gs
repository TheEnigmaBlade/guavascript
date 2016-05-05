var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("aliases", {{
	it("should become console.log", {{
		test("print()", "console.log();")
		test("print('test')", "console.log('test');")
	}})
	
	it("should become console.error", {{
		test("error()", "console.error();")
		test("error('test')", "console.error('test');")
	}})
}})
