var test = require("./test_util").run,
	fail = require("./test_util").run_fail,
	exec = require("./test_util").run_exec

describe("templates", {{
	describe("declaration", {{
		it("should be a template", {{
			test("``", "``;")
			test("`test`", "`test`;")
			test("`test${test2}test3`", "`test${test2}test3`;")
			test("`test${test2}`", "`test${test2}`;")
			test("`${test}`", "`${test}`;")
			test("`${test}test2`", "`${test}test2`;")
			test("`${test}${test2}`", "`${test}${test2}`;")
		}})
		it("should not be a template", {{
			fail("`test")
			fail("`test\\`")
			fail("\\`test`")
		}})
		
		it("should format", {{
			exec("var test = 'not test'\n`test`", "test")
			exec("var b = 'd'\n`a${b}c`", "adc")
			exec("var a = 1, b = 2, c = 3\n`${a}${b}${c}`", "123")
		}})
	}})
}})
