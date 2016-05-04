var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("functions", {{
	describe("declaration", {{
		it("should be declared", {{
			test("function a(){}", "function a(){}")
			test("func a(){}", "function a(){}")
			test("fun a(){}", "function a(){}")
			for n in 1..5 {
				var indent = "\n".repeat(n)
				test("fun a()"+indent+"{}", "function a(){}")
				test("fun a("+indent+"){}", "function a(){}")
			}
		}})
		it("should not be declared", {{
			fail("fun")
			fail("fun a")
			fail("fun a(")
			fail("fun a()")
			fail("fun a(){")
			fail("fun a()j")
			fail("fun\na(){}")
			fail("fun a\n(){}")
		}})
	}})
	
	describe("normal call", {{
		it("should be executed", {{
			test("test()", "test();")
			test("test(arg)", "test(arg);")
			for n in 1..10 {
				var args = ",args".repeat(n)
				test("test(arg"+args+")", "test(arg"+args+");")
			}
		}})
		it("should not be executed", {{
			fail("test(,)")
			fail("test(arg1,")
			for n in 1..10 {
				var args = "args,".repeat(n)
				fail("test(arg1,"+args)
			}
		}})
	}})
	
	describe("object call", {{
		it("should be executed", {{
			test("obj.test()", "obj.test();")
			test("obj.test(arg)", "obj.test(arg);")
			for n in 1..10 {
				var args = ",args".repeat(n)
				test("obj.test(arg"+args+")", "obj.test(arg"+args+");")
			}
		}})
		it("should not be executed", {{
			fail("obj.test(,)")
			fail("obj.test(arg1,")
			for n in 1..10 {
				var args = "obj.args,".repeat(n)
				fail("obj.test(arg1,"+args)
			}
		}})
	}})
}})

describe("anonymous functions", {{
	describe("top-level execution", {{
		it("should be wrapped", {{
			test("{{}}", "(function(){}());")
			test("{{test()}}", "(function(){test();}());")
		}})
		
		it("should be wrapped as argument", {{
			test("${{}}", "$(function(){})();")
			test("${{test()}}", "$(function(){test();})();")
		}})
		
		it("should be wrapped and executed with arguments", {{
			test("|arg|{{test(arg)}}(val)", "(function(arg){test(arg);}(val));")
			test("|arg, arg2|{{test(arg, arg2)}}(val, val2)", "(function(arg,arg2){test(arg,arg2);}(val,val2));")
		}})
	}})
}})
