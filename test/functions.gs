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
		
		it("should be declared with arguments", {{
			test("fun a(arg){}", "function a(arg){}")
			test("fun a(arg\n){}", "function a(arg){}")
			test("fun a(\narg){}", "function a(arg){}")
			
			for n in 1..5 {
				var arg = ",arg".repeat(n),
					argi = ",\narg".repeat(n)
				test("fun a(arg"+arg+"){}", "function a(arg"+arg+"){}")
				test("fun a(arg"+arg+"){}", "function a(arg"+arg+"){}")
			}
		}})
		it("should not be declared with arguments", {{
			fail("fun a arg {}")
			fail("fun a(arg{}")
			fail("fun a arg){}")
			fail("fun a(arg,){}")
			fail("fun a(arg, arg2,){}")
		}})
	}})
	
	describe("assignment", {{
		it("should be created", {{
			test("f = fun {}", "f=function(){};")
			test("f = fun() {}", "f=function(){};")
			test("f = fun(test) {}", "f=function(test){};")
			
			test("f = fun a {}", "f=function a(){};")
			test("f = fun a() {}", "f=function a(){};")
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
	describe("within expressions", {{
		it("should be created", {{
			test("f = {{}}", "f=function(){};")
			test("f = {{test()}}", "f=function(){test();};")
			for n, indent in 1..5 with "\n".repeat(n) {
				test("f = {{"+indent+"}}", "f=function(){};")
			}
		}})
		it("should not be created", {{
			fail("f = {}}")
			fail("f = {{}")
			for n, indent in 1..5 with "\n".repeat(n) {
				fail("f = {"+indent+"{}}")
				fail("f = {{}"+indent+"}")
			}
		}})
		
		it("should be created with arguments", {{
			test("f = |arg|{{}}", "f=function(arg){};")
			for n in 1..10 {
				var args = ",args".repeat(n)
				test("f = |arg"+args+"|{{}}", "f=function(arg"+args+"){};")
			}
		}})
		it("should not be created with arguments", {{
			fail("f = ||{{}}")
			fail("f = |arg{{}}") 
			fail("f = arg|{{}}")
			for n, indent in 1..5 with "\n".repeat(n) {
				fail("f = |"+indent+"arg|{{}}")
				fail("f = |arg"+indent+"|{{}}")
			}
		}})
	}})
	
	describe("top-level execution", {{
		it("should be wrapped", {{
			test("fun {}", "(function(){}());")
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
