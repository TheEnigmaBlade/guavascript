var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("initialization", {{
	describe("new", {{
		it("should be converted", {{
			test("new Thing()", "new Thing();")
			test("new Thing(arg1)", "new Thing(arg1);")
			test("new Thing(arg1, arg2)", "new Thing(arg1,arg2);")
		}})
	}})
}})
