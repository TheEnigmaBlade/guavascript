var test = require("./test_util").run,
	fail = require("./test_util").run_fail,
	exec = require("./test_util").run_exec

describe("variables", {{
	describe("declaration", {{
		it("should have no value", {{
			test("var x", "var x;")
			for x, args in 1..10 with ",x".repeat(x) {
				test("var x"+args, "var x"+args+";")
			}
		}})
		it("should have value", {{
			test("var x = 1", "var x=1;")
			test("var x = 'test'", "var x='test';")
			test("var x = 'test', y = 13", "var x='test',y=13;")
		}})
		it("should have mixed declarations", {{
			test("let x = true, y", "let x=true,y;")
			test("let x, y = false", "let x,y=false;")
		}})
		it("should accept variations", {{
			test("let x", "let x;")
			test("let x = 0", "let x=0;")
			test("let x, y", "let x,y;")
		}})
	}})
}})
